import * as THREE from 'three';
import { Player } from './Player';
import { WorldBuilder } from './WorldBuilder';
import { ParkourSystem } from './ParkourSystem';
import { CombatSystem } from './CombatSystem';
import { EnemyInstance } from './EnemyAI';
import { NPCInstance, GAME_NPCS } from './NPCManager';
import { GameSettings, SaveData, EnemyData } from '../types/game';
import { audio } from '../audio/AudioManager';
import { telegram } from '../telegram/TelegramManager';

export interface InteractionTarget {
  type: 'npc' | 'enemy_takedown' | 'collectible' | 'hiding_spot';
  id: string;
  name: string;
  nameFa: string;
  distance: number;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public canvas: HTMLCanvasElement;

  public world: WorldBuilder;
  public player: Player;
  public parkour: ParkourSystem;
  public combat: CombatSystem;
  public enemies: EnemyInstance[] = [];
  public npcs: NPCInstance[] = [];

  // Camera Orbit Controls
  public camYaw = 0;
  public camPitch = 0.28; // slightly looking down
  private camDistance = 4.2;
  private camRaycaster = new THREE.Raycaster();

  // Input states
  public inputDir = new THREE.Vector2();
  public isSprinting = false;
  public activeInteraction: InteractionTarget | null = null;

  // Loop & timing
  private lastTime = 0;
  private animationFrameId: number | null = null;
  private isPaused = false;
  private isDestroyed = false;

  // Callbacks to UI
  public onHealthChange?: (hp: number, maxHp: number) => void;
  public onStaminaChange?: (stamina: number, maxStamina: number) => void;
  public onStealthChange?: (visibility: number, isHidden: boolean) => void;
  public onInteractionPrompt?: (target: InteractionTarget | null) => void;
  public onPlayerDeath?: () => void;
  public onObjectiveProgress?: (type: string, id?: string) => void;

  constructor(canvas: HTMLCanvasElement, saveData: SaveData, settings: GameSettings) {
    this.canvas = canvas;

    // 1. Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1117);
    this.scene.fog = new THREE.FogExp2(0x0d1117, 0.024);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 120);

    // 3. Renderer with Quality Settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: settings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'high' ? 2 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    if (settings.graphicsQuality !== 'low') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 4. Lighting (Dusk / Golden Hour Mystical Sun)
    const ambientLight = new THREE.AmbientLight(0x2d3748, 0.9);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.8);
    sunLight.position.set(25, 35, 20);
    if (settings.graphicsQuality !== 'low') {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = settings.graphicsQuality === 'high' ? 2048 : 1024;
      sunLight.shadow.mapSize.height = settings.graphicsQuality === 'high' ? 2048 : 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 100;
      sunLight.shadow.camera.left = -30;
      sunLight.shadow.camera.right = 30;
      sunLight.shadow.camera.top = 30;
      sunLight.shadow.camera.bottom = -30;
    }
    this.scene.add(sunLight);

    // 5. World Builder
    this.world = new WorldBuilder(this.scene);
    this.world.buildWorld();

    // 6. Player
    this.player = new Player(saveData.playerStats, saveData.playerPos || [0, 0.5, 12]);
    this.scene.add(this.player.group);

    // 7. Parkour & Combat
    this.parkour = new ParkourSystem();
    this.combat = new CombatSystem();

    // 8. NPCs
    GAME_NPCS.forEach((npcData) => {
      const npc = new NPCInstance(npcData);
      this.npcs.push(npc);
      this.scene.add(npc.group);
    });

    // 9. Enemies Setup
    this.spawnEnemies();

    // Start Audio Ambient
    audio.startAmbient();

    // Start Main Game Loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private spawnEnemies() {
    const enemyConfigs: EnemyData[] = [
      {
        id: 'enemy_gate_guard_1',
        name: 'Gate Guard Aldous',
        type: 'guard',
        x: -3.5,
        y: 0,
        z: -14,
        patrolPoints: [
          [-3.5, 0, -14],
          [3.5, 0, -14],
        ],
        currentPatrolIndex: 0,
        state: 'patrol',
        hp: 60,
        maxHp: 60,
        detectionLevel: 0,
        alertTime: 0,
      },
      {
        id: 'enemy_market_patrol_2',
        name: 'Market Patrol Boros',
        type: 'guard',
        x: -12,
        y: 0,
        z: 8,
        patrolPoints: [
          [-12, 0, 8],
          [-12, 0, -2],
          [-4, 0, -2],
        ],
        currentPatrolIndex: 0,
        state: 'patrol',
        hp: 50,
        maxHp: 50,
        detectionLevel: 0,
        alertTime: 0,
      },
      {
        id: 'enemy_citadel_sentinel_3',
        name: 'Courtyard Sentinel Kael',
        type: 'sentinel',
        x: 4,
        y: 0,
        z: -24,
        patrolPoints: [
          [4, 0, -24],
          [-4, 0, -24],
          [-4, 0, -32],
          [4, 0, -32],
        ],
        currentPatrolIndex: 0,
        state: 'patrol',
        hp: 90,
        maxHp: 90,
        detectionLevel: 0,
        alertTime: 0,
      },
      {
        id: 'enemy_vault_warden_4',
        name: 'Sanctuary Warden Thorne',
        type: 'warden',
        x: 0,
        y: 0,
        z: -26,
        patrolPoints: [
          [-2, 0, -26],
          [2, 0, -26],
        ],
        currentPatrolIndex: 0,
        state: 'patrol',
        hp: 120,
        maxHp: 120,
        detectionLevel: 0,
        alertTime: 0,
      },
      {
        id: 'enemy_rooftop_scout_5',
        name: 'Rooftop Archer Vane',
        type: 'archer',
        x: -14,
        y: 6.2,
        z: -6,
        patrolPoints: [
          [-14, 6.2, -6],
          [-14, 6.2, -12],
        ],
        currentPatrolIndex: 0,
        state: 'patrol',
        hp: 45,
        maxHp: 45,
        detectionLevel: 0,
        alertTime: 0,
      },
    ];

    enemyConfigs.forEach((cfg) => {
      const enemy = new EnemyInstance(cfg);
      this.enemies.push(enemy);
      this.scene.add(enemy.group);
    });
  }

  public rotateCamera(deltaX: number, deltaY: number, sensitivity = 1.0) {
    this.camYaw -= deltaX * 0.004 * sensitivity;
    this.camPitch = Math.max(-0.2, Math.min(1.2, this.camPitch - deltaY * 0.004 * sensitivity));
  }

  public handleJump() {
    if (this.parkour.activeAction) return;

    // Check parkour vault / ledge grab first
    const action = this.parkour.checkObstacle(
      this.player.group.position,
      this.player.moveDir,
      this.world.climbableMeshes
    );

    if (action) {
      this.parkour.activeAction = action;
      audio.playSlash(false);
      telegram.triggerHaptic('medium');
    } else {
      this.player.jump();
    }
  }

  public handleCrouchToggle() {
    this.player.setCrouched(!this.player.isCrouched);
    telegram.triggerHaptic('light');
  }

  public handleAttack(isHeavy = false) {
    if (isHeavy) {
      this.combat.triggerHeavyAttack(30, this.player.stats.stamina);
    } else {
      this.combat.triggerLightAttack(15, this.player.stats.stamina);
    }

    // Melee attack hit registration on nearby enemies
    this.enemies.forEach((enemy) => {
      if (enemy.data.state === 'dead') return;
      const dist = enemy.group.position.distanceTo(this.player.group.position);
      if (dist < 2.5) {
        // Check facing angle
        const toEnemy = new THREE.Vector3().subVectors(enemy.group.position, this.player.group.position);
        toEnemy.y = 0;
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.group.quaternion);

        if (forward.angleTo(toEnemy.normalize()) < Math.PI * 0.5) {
          const baseDmg = this.player.stats.damage * (isHeavy ? 1.8 : 1.0);
          const isCrit = Math.random() < 0.2;
          const finalDmg = Math.round(baseDmg * (isCrit ? 1.5 : 1.0));

          const killed = enemy.takeDamage(finalDmg);
          this.combat.addDamageText(enemy.group.position, finalDmg, isCrit, false);
          audio.playHit();
          telegram.triggerHaptic('medium');

          if (killed) {
            audio.playPickup();
            this.player.stats.xp += 35;
            this.onObjectiveProgress?.('defeat_enemy', enemy.data.id);
          }
        }
      }
    });
  }

  public handleDodge() {
    this.combat.triggerDodge(this.player.moveDir, 20, this.player.stats.stamina);
  }

  public handleInteract(): boolean {
    if (!this.activeInteraction) return false;

    if (this.activeInteraction.type === 'enemy_takedown') {
      const enemy = this.enemies.find((e) => e.data.id === this.activeInteraction?.id);
      if (enemy && enemy.data.state !== 'dead') {
        enemy.die();
        this.combat.addDamageText(enemy.group.position, 'ELIMINATED', false, true);
        audio.playStealthTakedown();
        telegram.triggerNotificationHaptic('success');
        this.player.stats.xp += 60;
        this.onObjectiveProgress?.('stealth_takedown', enemy.data.id);
        return true;
      }
    } else if (this.activeInteraction.type === 'collectible') {
      const item = this.world.collectibles.find((c) => c.id === this.activeInteraction?.id);
      if (item && !item.collected) {
        item.collected = true;
        this.world.removeCollectibleMesh(item.id);
        audio.playPickup();
        telegram.triggerNotificationHaptic('success');
        this.combat.addDamageText(this.player.group.position, `+${item.valueGold} GOLD`, true);
        this.onObjectiveProgress?.('collect_item', item.id);
        return true;
      }
    }
    return false;
  }

  private updateInteractions() {
    const playerPos = this.player.group.position;
    let closestTarget: InteractionTarget | null = null;
    let closestDist = 999;

    // 1. Check Stealth Takedown on unalerted enemies
    for (const enemy of this.enemies) {
      if (enemy.data.state === 'dead' || enemy.data.state === 'alert' || enemy.data.state === 'chase') continue;
      const toEnemy = new THREE.Vector3().subVectors(enemy.group.position, playerPos);
      const dist = toEnemy.length();

      if (dist < 2.2) {
        // Player must be behind the guard (guard facing away)
        const guardForward = new THREE.Vector3(0, 0, 1).applyQuaternion(enemy.group.quaternion);
        toEnemy.y = 0;
        const angle = guardForward.angleTo(toEnemy.normalize());

        if (angle > Math.PI * 0.6) {
          closestTarget = {
            type: 'enemy_takedown',
            id: enemy.data.id,
            name: 'Stealth Takedown',
            nameFa: 'حمله مخفیانه',
            distance: dist,
          };
          closestDist = dist;
          break;
        }
      }
    }

    // 2. Check Collectibles
    if (!closestTarget) {
      for (const col of this.world.collectibles) {
        if (col.collected) continue;
        const colPos = new THREE.Vector3(col.x, col.y, col.z);
        const dist = playerPos.distanceTo(colPos);
        if (dist < 2.5 && dist < closestDist) {
          closestTarget = {
            type: 'collectible',
            id: col.id,
            name: `Take ${col.name}`,
            nameFa: `برداشتن ${col.nameFa}`,
            distance: dist,
          };
          closestDist = dist;
        }
      }
    }

    // 3. Check NPCs
    if (!closestTarget) {
      for (const npc of this.npcs) {
        const dist = playerPos.distanceTo(npc.group.position);
        if (dist < 3.2 && dist < closestDist) {
          closestTarget = {
            type: 'npc',
            id: npc.data.id,
            name: `Talk to ${npc.data.name}`,
            nameFa: `گفتگو با ${npc.data.nameFa}`,
            distance: dist,
          };
          closestDist = dist;
        }
      }
    }

    this.activeInteraction = closestTarget;
    this.onInteractionPrompt?.(this.activeInteraction);
  }

  private updateHidingZones() {
    const playerPos = this.player.group.position;
    let isInsideShadow = false;

    for (const zone of this.world.hidingZones) {
      if (zone.box.containsPoint(playerPos)) {
        isInsideShadow = true;
        break;
      }
    }

    this.player.isHiddenInShadow = isInsideShadow;
  }

  private updateCamera(delta: number) {
    const playerHead = this.player.group.position.clone().add(new THREE.Vector3(0, 1.5, 0));

    // Desired camera position on spherical coordinate offset
    const cosPitch = Math.cos(this.camPitch);
    const sinPitch = Math.sin(this.camPitch);
    const sinYaw = Math.sin(this.camYaw);
    const cosYaw = Math.cos(this.camYaw);

    const camOffset = new THREE.Vector3(
      sinYaw * cosPitch * this.camDistance,
      sinPitch * this.camDistance,
      cosYaw * cosPitch * this.camDistance
    );

    const targetCamPos = playerHead.clone().add(camOffset);

    // Collision Avoidance: raycast from player to targetCamPos to prevent wall clipping
    const rayDir = new THREE.Vector3().subVectors(targetCamPos, playerHead);
    const maxDist = rayDir.length();
    rayDir.normalize();

    this.camRaycaster.set(playerHead, rayDir);
    this.camRaycaster.far = maxDist;
    const hits = this.camRaycaster.intersectObjects(this.world.collisionMeshes, false);

    if (hits.length > 0) {
      // Pull camera in front of wall hit point with a 0.2m safety margin
      const safeDist = Math.max(0.8, hits[0].distance - 0.2);
      this.camera.position.copy(playerHead).addScaledVector(rayDir, safeDist);
    } else {
      this.camera.position.lerp(targetCamPos, 0.25);
    }

    this.camera.lookAt(playerHead.x, playerHead.y + 0.3, playerHead.z);
  }

  private loop(currentTime: number) {
    if (this.isDestroyed) return;

    this.animationFrameId = requestAnimationFrame(this.loop);
    if (this.isPaused) return;

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // 1. Parkour Update
    const isDoingParkour = this.parkour.update(delta, this.player.group.position);

    // 2. Combat Update
    this.combat.update(delta);

    // 3. Player Movement & Physics
    if (!isDoingParkour) {
      this.player.update(
        delta,
        this.inputDir,
        this.camYaw,
        this.isSprinting,
        this.world.collisionMeshes,
        this.combat.isAttacking,
        this.combat.isBlocking,
        this.combat.isDodging,
        this.combat.dodgeDirection
      );
    }

    // 4. Check Hiding Spots & Environmental Interactions
    this.updateHidingZones();
    this.updateInteractions();

    // 5. Update NPCs
    this.npcs.forEach((npc) => npc.update(this.player.group.position));

    // 6. Update Enemies AI
    this.enemies.forEach((enemy) => {
      enemy.update(
        delta,
        this.player.group.position,
        this.player.isCrouched,
        this.player.isHiddenInShadow,
        (damage) => {
          // Player damaged by enemy
          let finalDamage = damage;
          if (this.combat.isBlocking) {
            finalDamage = Math.round(damage * 0.2);
            audio.playParry();
            telegram.triggerHaptic('rigid');
          }
          if (!this.combat.isDodging) {
            const isDead = this.player.takeDamage(finalDamage);
            this.combat.addDamageText(this.player.group.position, `-${finalDamage}`, false);
            telegram.triggerNotificationHaptic('warning');
            if (isDead) {
              this.onPlayerDeath?.();
            }
          }
        }
      );
    });

    // 7. World Ambient Animation (Torches, particles, floating items)
    this.world.update(delta, currentTime * 0.001);

    // 8. Third-Person Camera follow
    this.updateCamera(delta);

    // 9. Render Scene
    this.renderer.render(this.scene, this.camera);

    // 10. Notify UI state
    this.onHealthChange?.(this.player.stats.hp, this.player.stats.maxHp);
    this.onStaminaChange?.(this.player.stats.stamina, this.player.stats.maxStamina);
    this.onStealthChange?.(this.player.stealthVisibility, this.player.isHiddenInShadow);
  }

  public setQuality(quality: GameSettings['graphicsQuality']) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5));
    this.renderer.shadowMap.enabled = quality !== 'low';
  }

  public handleResize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    audio.stopAmbient();
    this.renderer.dispose();
  }
}
