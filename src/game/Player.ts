import * as THREE from 'three';
import { PlayerStats } from '../types/game';
import { audio } from '../audio/AudioManager';

export class Player {
  public group: THREE.Group;
  public stats: PlayerStats;
  public isCrouched = false;
  public isRunning = false;
  public isGrounded = true;
  public isHiddenInShadow = false;
  public stealthVisibility = 0.5; // 0 to 1

  public velocity = new THREE.Vector3();
  public moveDir = new THREE.Vector3();
  public rotationY = 0;

  private bodyMesh: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private hoodMesh: THREE.Mesh;
  private cloakMesh: THREE.Mesh;
  private leftBlade: THREE.Mesh;
  private rightBlade: THREE.Mesh;
  private bladePivotR: THREE.Group;
  private bladePivotL: THREE.Group;

  private footstepTimer = 0;
  private staminaRegenTimer = 0;
  private raycaster = new THREE.Raycaster();

  constructor(initialStats: PlayerStats, startPos: [number, number, number]) {
    this.stats = { ...initialStats };
    this.group = new THREE.Group();
    this.group.position.set(startPos[0], startPos[1], startPos[2]);

    // 1. Build Stylized 3D Rogue Adventurer Model
    const darkLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });
    const cloakMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const aetherGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const bladeSteelMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Torso / Tunic
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.8, 8);
    this.bodyMesh = new THREE.Mesh(torsoGeo, darkLeatherMat);
    this.bodyMesh.position.y = 0.9;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
    this.headMesh = new THREE.Mesh(headGeo, darkLeatherMat);
    this.headMesh.position.y = 1.45;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // Assassin Hood / Cowl
    const hoodGeo = new THREE.ConeGeometry(0.26, 0.38, 8);
    this.hoodMesh = new THREE.Mesh(hoodGeo, cloakMat);
    this.hoodMesh.position.set(0, 1.56, -0.04);
    this.hoodMesh.rotation.x = -0.15;
    this.group.add(this.hoodMesh);

    // Flowing Cloak (Hangs behind back)
    const cloakGeo = new THREE.PlaneGeometry(0.6, 0.9, 2, 2);
    this.cloakMesh = new THREE.Mesh(cloakGeo, cloakMat);
    this.cloakMesh.position.set(0, 0.85, -0.22);
    this.cloakMesh.castShadow = true;
    this.group.add(this.cloakMesh);

    // Aether Glowing Bracers (Wrists)
    const bracerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 6);
    const bracerR = new THREE.Mesh(bracerGeo, aetherGlowMat);
    bracerR.position.set(0.32, 0.85, 0.05);
    this.group.add(bracerR);

    const bracerL = bracerR.clone();
    bracerL.position.x = -0.32;
    this.group.add(bracerL);

    // Dual Blades & Arm Pivots
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.7, 0.06);

    this.bladePivotR = new THREE.Group();
    this.bladePivotR.position.set(0.35, 0.95, 0.1);
    this.rightBlade = new THREE.Mesh(bladeGeo, bladeSteelMat);
    this.rightBlade.position.set(0, -0.2, 0.15);
    this.rightBlade.rotation.x = Math.PI / 4;
    this.rightBlade.castShadow = true;
    this.bladePivotR.add(this.rightBlade);
    this.group.add(this.bladePivotR);

    this.bladePivotL = new THREE.Group();
    this.bladePivotL.position.set(-0.35, 0.95, 0.1);
    this.leftBlade = new THREE.Mesh(bladeGeo, bladeSteelMat);
    this.leftBlade.position.set(0, -0.2, 0.15);
    this.leftBlade.rotation.x = Math.PI / 4;
    this.leftBlade.castShadow = true;
    this.bladePivotL.add(this.leftBlade);
    this.group.add(this.bladePivotL);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.65, 6);
    const legL = new THREE.Mesh(legGeo, darkLeatherMat);
    legL.position.set(-0.14, 0.32, 0);
    legL.castShadow = true;
    this.group.add(legL);

    const legR = legL.clone();
    legR.position.x = 0.14;
    this.group.add(legR);
  }

  public setCrouched(crouched: boolean) {
    this.isCrouched = crouched;
    // Animate character height / stance
    const targetScaleY = crouched ? 0.68 : 1.0;
    this.group.scale.y = targetScaleY;
  }

  public jump(jumpForce = 6.8): boolean {
    if (!this.isGrounded || this.stats.stamina < 15) return false;
    this.velocity.y = jumpForce;
    this.isGrounded = false;
    this.stats.stamina -= 15;
    audio.playSlash(false);
    return true;
  }

  public update(
    delta: number,
    inputDir: THREE.Vector2,
    camEulerY: number,
    isSprinting: boolean,
    collisionMeshes: THREE.Object3D[],
    isCombatAttacking: boolean,
    isCombatBlocking: boolean,
    isCombatDodging: boolean,
    dodgeDir: THREE.Vector3
  ) {
    // 1. Stamina Regeneration
    if (!isSprinting && !isCombatDodging && !isCombatAttacking) {
      this.staminaRegenTimer += delta;
      if (this.staminaRegenTimer > 0.4) {
        this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 25 * delta);
      }
    } else {
      this.staminaRegenTimer = 0;
    }

    // 2. Sprinting condition
    this.isRunning = isSprinting && !this.isCrouched && inputDir.lengthSq() > 0.1 && this.stats.stamina > 5;
    if (this.isRunning) {
      this.stats.stamina = Math.max(0, this.stats.stamina - 18 * delta);
      if (this.stats.stamina <= 0) this.isRunning = false;
    }

    // 3. Movement direction relative to camera angle
    if (isCombatDodging) {
      // Rapid dodge burst
      this.moveDir.copy(dodgeDir);
      const dodgeSpeed = 11.0;
      this.group.position.addScaledVector(this.moveDir, dodgeSpeed * delta);
    } else if (inputDir.lengthSq() > 0.05 && !isCombatBlocking) {
      // Rotate input by camera yaw
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), camEulerY);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), camEulerY);

      this.moveDir.set(0, 0, 0);
      this.moveDir.addScaledVector(forward, -inputDir.y);
      this.moveDir.addScaledVector(right, inputDir.x);
      this.moveDir.y = 0;
      this.moveDir.normalize();

      let currentSpeed = this.stats.movementSpeed;
      if (this.isCrouched) currentSpeed *= 0.55;
      else if (this.isRunning) currentSpeed *= 1.6;

      const deltaMove = this.moveDir.clone().multiplyScalar(currentSpeed * delta);

      // Simple cylinder obstacle collision test
      const testPos = this.group.position.clone().add(deltaMove);
      let canMove = true;

      // Raycast forward to prevent walking through walls
      const rayOrigin = this.group.position.clone().add(new THREE.Vector3(0, 0.6, 0));
      this.raycaster.set(rayOrigin, this.moveDir);
      this.raycaster.far = 0.5;
      const wallHits = this.raycaster.intersectObjects(collisionMeshes, false);
      if (wallHits.length > 0) {
        canMove = false;
      }

      if (canMove) {
        this.group.position.add(deltaMove);
      }

      // Smooth rotate player mesh towards move direction
      const targetRotation = Math.atan2(this.moveDir.x, this.moveDir.z);
      this.rotationY = THREE.MathUtils.lerp(this.rotationY, targetRotation, delta * 12);
      this.group.rotation.y = this.rotationY;

      // Footstep audio
      this.footstepTimer += delta * (this.isRunning ? 2.2 : this.isCrouched ? 0.9 : 1.4);
      if (this.footstepTimer >= 0.5) {
        this.footstepTimer = 0;
        if (this.isGrounded) {
          audio.playFootstep(this.isCrouched);
        }
      }

      // Subtle cloak sway
      this.cloakMesh.rotation.x = Math.sin(Date.now() * 0.015) * 0.25 + (this.isRunning ? 0.4 : 0.15);
    } else {
      this.moveDir.set(0, 0, 0);
      this.cloakMesh.rotation.x = 0;
    }

    // 4. Gravity & Ground Collision
    const downOrigin = this.group.position.clone().add(new THREE.Vector3(0, 0.8, 0));
    this.raycaster.set(downOrigin, new THREE.Vector3(0, -1, 0));
    this.raycaster.far = 1.4;
    const groundHits = this.raycaster.intersectObjects(collisionMeshes, false);

    if (groundHits.length > 0) {
      const groundY = groundHits[0].point.y;
      if (this.group.position.y <= groundY + 0.15 && this.velocity.y <= 0) {
        this.group.position.y = groundY;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else {
        this.velocity.y -= 18.0 * delta; // Gravity
        this.group.position.y += this.velocity.y * delta;
        this.isGrounded = false;
      }
    } else {
      this.velocity.y -= 18.0 * delta;
      this.group.position.y += this.velocity.y * delta;
      this.isGrounded = false;
      // Safety net to prevent falling through bottom void
      if (this.group.position.y < 0) {
        this.group.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    // 5. Combat Animation Posing
    if (isCombatAttacking) {
      const swingR = Math.sin(Date.now() * 0.04) * 1.4;
      this.bladePivotR.rotation.x = swingR;
      this.bladePivotL.rotation.x = -swingR * 0.7;
    } else if (isCombatBlocking) {
      // Cross blades defensively in front of chest
      this.bladePivotR.rotation.set(0.6, 0.4, -0.4);
      this.bladePivotL.rotation.set(0.6, -0.4, 0.4);
    } else {
      // Idle / Running blade sway
      const idleSway = Math.sin(Date.now() * 0.005) * 0.08;
      this.bladePivotR.rotation.set(idleSway, 0, 0);
      this.bladePivotL.rotation.set(-idleSway, 0, 0);
    }

    // 6. Stealth Visibility Computation
    if (this.isHiddenInShadow) {
      this.stealthVisibility = 0.05; // Almost undetectable in shadows / hay wagon
    } else if (this.isCrouched) {
      this.stealthVisibility = 0.35;
    } else if (this.isRunning) {
      this.stealthVisibility = 0.95;
    } else {
      this.stealthVisibility = 0.65;
    }
  }

  public heal(amount: number) {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  public takeDamage(amount: number): boolean {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    audio.playHit();
    return this.stats.hp <= 0;
  }
}
