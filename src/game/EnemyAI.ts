import * as THREE from 'three';
import { EnemyState, EnemyData } from '../types/game';
import { audio } from '../audio/AudioManager';

export class EnemyInstance {
  public data: EnemyData;
  public group: THREE.Group;
  public visionConeMesh: THREE.Mesh;
  public statusBillboard: THREE.Sprite;
  public weaponMesh: THREE.Mesh;

  private swordPivot: THREE.Group;
  private currentPatrolTarget = 0;
  private stateTimer = 0;
  private attackCooldown = 0;
  private initialPos: THREE.Vector3;
  private moveSpeed = 2.4;
  private runSpeed = 4.2;
  private isDead = false;

  constructor(data: EnemyData) {
    this.data = { ...data };
    this.initialPos = new THREE.Vector3(data.x, data.y, data.z);
    this.group = new THREE.Group();
    this.group.position.copy(this.initialPos);

    // 1. Build Guard 3D Model
    // Body / Cuirass (Dark bronze / Iron armor)
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.6,
    });
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Crimson uniform
      roughness: 0.8,
    });

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.85, 8);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.95;
    torso.castShadow = true;
    this.group.add(torso);

    // Head with Iron Helm
    const helmGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.35, 8);
    const helm = new THREE.Mesh(helmGeo, armorMat);
    helm.position.y = 1.55;
    helm.castShadow = true;
    this.group.add(helm);

    // Helmet Crest (Red feather plume)
    const plumeGeo = new THREE.BoxGeometry(0.08, 0.22, 0.35);
    const plume = new THREE.Mesh(plumeGeo, clothMat);
    plume.position.set(0, 1.75, 0);
    this.group.add(plume);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 6);
    const legL = new THREE.Mesh(legGeo, armorMat);
    legL.position.set(-0.16, 0.35, 0);
    legL.castShadow = true;
    this.group.add(legL);

    const legR = legL.clone();
    legR.position.x = 0.16;
    this.group.add(legR);

    // Shield (Left arm)
    const shieldGeo = new THREE.BoxGeometry(0.1, 0.6, 0.4);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.3, roughness: 0.6 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-0.42, 1.0, 0.15);
    this.group.add(shield);

    // Sword & Right Arm Pivot
    this.swordPivot = new THREE.Group();
    this.swordPivot.position.set(0.42, 1.1, 0);

    const bladeGeo = new THREE.BoxGeometry(0.06, 0.9, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
    this.weaponMesh = new THREE.Mesh(bladeGeo, bladeMat);
    this.weaponMesh.position.set(0, -0.3, 0.2);
    this.weaponMesh.castShadow = true;
    this.swordPivot.add(this.weaponMesh);
    this.group.add(this.swordPivot);

    // 2. Vision Cone Visualizer (Translucent forward arc on ground)
    const coneGeo = new THREE.ConeGeometry(8, 12, 16, 1, true, -Math.PI / 4, Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.visionConeMesh = new THREE.Mesh(coneGeo, coneMat);
    this.visionConeMesh.rotation.x = Math.PI / 2;
    this.visionConeMesh.position.set(0, 0.05, 6);
    this.group.add(this.visionConeMesh);

    // 3. Overhead Status Billboard (Alert / Question Icon)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const spriteMap = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, transparent: true });
    this.statusBillboard = new THREE.Sprite(spriteMat);
    this.statusBillboard.position.set(0, 2.2, 0);
    this.statusBillboard.scale.set(0.7, 0.7, 0.7);
    this.statusBillboard.visible = false;
    this.group.add(this.statusBillboard);
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead) return false;
    this.data.hp -= amount;

    // Immediately alert enemy upon taking damage
    this.data.state = 'alert';
    this.data.detectionLevel = 100;
    this.updateStatusBillboard('!');

    if (this.data.hp <= 0) {
      this.die();
      return true; // Enemy died
    }
    return false;
  }

  public die() {
    this.isDead = true;
    this.data.state = 'dead';
    this.statusBillboard.visible = false;
    this.visionConeMesh.visible = false;

    // Fall to ground
    this.group.rotation.x = -Math.PI / 2;
    this.group.position.y = 0.2;
  }

  private updateStatusBillboard(symbol: '?' | '!') {
    const canvas = (this.statusBillboard.material.map as THREE.CanvasTexture).image as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 64, 64);
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = symbol === '!' ? '#ef4444' : '#eab308';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 32, 34);

    (this.statusBillboard.material.map as THREE.CanvasTexture).needsUpdate = true;
    this.statusBillboard.visible = true;
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    isPlayerCrouched: boolean,
    isPlayerHiddenInShadow: boolean,
    onEnemyAttackPlayer: (damage: number) => void
  ) {
    if (this.isDead) return;

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.stateTimer += delta;

    const toPlayer = new THREE.Vector3().subVectors(playerPos, this.group.position);
    const distToPlayer = toPlayer.length();

    // Calculate facing forward vector
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion);
    const angleToPlayer = forward.angleTo(toPlayer.clone().normalize());

    // --- STEALTH & DETECTION LOGIC ---
    let maxDetectDist = 12.0;
    if (isPlayerCrouched) maxDetectDist = 5.5;
    if (isPlayerHiddenInShadow) maxDetectDist = 1.8;

    const inVisionField = distToPlayer <= maxDetectDist && angleToPlayer < Math.PI * 0.35;
    const isVeryCloseNoise = distToPlayer < 2.5 && !isPlayerCrouched;

    if (this.data.state !== 'alert' && this.data.state !== 'chase' && this.data.state !== 'attack') {
      if (inVisionField || isVeryCloseNoise) {
        // Increase detection meter
        const fillRate = isPlayerCrouched ? 50 : 120;
        this.data.detectionLevel = Math.min(100, this.data.detectionLevel + fillRate * delta);

        if (this.data.detectionLevel > 30 && this.data.detectionLevel < 100) {
          if (this.data.state !== 'suspicious') {
            this.data.state = 'suspicious';
            this.updateStatusBillboard('?');
            audio.playFootstep(true);
          }
          // Turn to inspect suspicious direction
          const targetRot = Math.atan2(toPlayer.x, toPlayer.z);
          this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRot, delta * 3);
        } else if (this.data.detectionLevel >= 100) {
          this.data.state = 'alert';
          this.updateStatusBillboard('!');
          audio.playAlert();
          audio.setAlertState(true);
          (this.visionConeMesh.material as THREE.MeshBasicMaterial).color.setHex(0xef4444);
        }
      } else {
        // Slowly drain suspicion when not in sight
        this.data.detectionLevel = Math.max(0, this.data.detectionLevel - 35 * delta);
        if (this.data.detectionLevel === 0 && this.data.state === 'suspicious') {
          this.data.state = 'patrol';
          this.statusBillboard.visible = false;
        }
      }
    }

    // --- STATE MACHINE BEHAVIOR ---
    switch (this.data.state) {
      case 'idle':
        if (this.stateTimer > 4.0 && this.data.patrolPoints.length > 0) {
          this.data.state = 'patrol';
          this.stateTimer = 0;
        }
        break;

      case 'patrol': {
        if (this.data.patrolPoints.length === 0) break;
        const targetPt = this.data.patrolPoints[this.currentPatrolTarget];
        const targetVec = new THREE.Vector3(targetPt[0], targetPt[1], targetPt[2]);
        const toTarget = new THREE.Vector3().subVectors(targetVec, this.group.position);
        toTarget.y = 0;

        if (toTarget.length() < 0.5) {
          this.currentPatrolTarget = (this.currentPatrolTarget + 1) % this.data.patrolPoints.length;
          this.data.state = 'idle';
          this.stateTimer = 0;
        } else {
          toTarget.normalize();
          this.group.position.addScaledVector(toTarget, this.moveSpeed * delta);
          const targetYaw = Math.atan2(toTarget.x, toTarget.z);
          this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetYaw, delta * 4);
        }
        break;
      }

      case 'alert':
      case 'chase': {
        // Look at player and run toward them
        const chaseDir = toPlayer.clone();
        chaseDir.y = 0;
        if (chaseDir.length() > 1.6) {
          chaseDir.normalize();
          this.group.position.addScaledVector(chaseDir, this.runSpeed * delta);
          const yaw = Math.atan2(chaseDir.x, chaseDir.z);
          this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, yaw, delta * 6);
        } else {
          // In melee attack range
          this.data.state = 'attack';
          this.stateTimer = 0;
        }

        // If player successfully hid in a shadow spot and gained distance
        if (isPlayerHiddenInShadow && distToPlayer > 8.0) {
          this.data.state = 'search';
          this.stateTimer = 0;
          this.updateStatusBillboard('?');
          audio.setAlertState(false);
        }
        break;
      }

      case 'attack': {
        const yaw = Math.atan2(toPlayer.x, toPlayer.z);
        this.group.rotation.y = yaw;

        // Swing sword animation
        const swing = Math.sin(this.stateTimer * 10);
        this.swordPivot.rotation.x = swing * 0.8;

        if (this.attackCooldown <= 0 && distToPlayer < 2.2) {
          this.attackCooldown = 1.2;
          audio.playSlash(true);
          onEnemyAttackPlayer(15);
        }

        if (distToPlayer > 2.4) {
          this.data.state = 'chase';
        }
        break;
      }

      case 'search': {
        // Search area in confusion for 5 seconds then return
        this.group.rotation.y += delta * 1.5;
        if (this.stateTimer > 5.0) {
          this.data.state = 'return';
          this.data.detectionLevel = 0;
          this.statusBillboard.visible = false;
          (this.visionConeMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
        }
        break;
      }

      case 'return': {
        const toHome = new THREE.Vector3().subVectors(this.initialPos, this.group.position);
        toHome.y = 0;
        if (toHome.length() < 0.5) {
          this.data.state = 'patrol';
        } else {
          toHome.normalize();
          this.group.position.addScaledVector(toHome, this.moveSpeed * delta);
          const yaw = Math.atan2(toHome.x, toHome.z);
          this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, yaw, delta * 4);
        }
        break;
      }
    }
  }
}
