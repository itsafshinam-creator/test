import * as THREE from 'three';

export interface ParkourAction {
  type: 'vault' | 'climb' | 'ledge_hang' | 'none';
  targetY: number;
  progress: number;
  duration: number;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
}

export class ParkourSystem {
  private raycaster = new THREE.Raycaster();
  public activeAction: ParkourAction | null = null;

  public checkObstacle(
    playerPos: THREE.Vector3,
    moveDir: THREE.Vector3,
    collisionMeshes: THREE.Object3D[]
  ): ParkourAction | null {
    if (this.activeAction) return null;
    if (moveDir.lengthSq() < 0.01) return null;

    const normalizedDir = moveDir.clone().normalize();

    // 1. Raycast forward at knee height (0.4m)
    const kneeOrigin = playerPos.clone().add(new THREE.Vector3(0, 0.4, 0));
    this.raycaster.set(kneeOrigin, normalizedDir);
    this.raycaster.far = 1.3;
    const kneeHits = this.raycaster.intersectObjects(collisionMeshes, false);

    if (kneeHits.length === 0) return null;
    const hit = kneeHits[0];

    // 2. Raycast forward at eye height (1.7m)
    const eyeOrigin = playerPos.clone().add(new THREE.Vector3(0, 1.7, 0));
    this.raycaster.set(eyeOrigin, normalizedDir);
    this.raycaster.far = 1.3;
    const eyeHits = this.raycaster.intersectObjects(collisionMeshes, false);

    // 3. Scan downward from above the obstacle to locate top ledge surface
    const scanHeight = 3.6;
    const overOrigin = hit.point.clone().add(normalizedDir.clone().multiplyScalar(0.4));
    overOrigin.y = playerPos.y + scanHeight;

    this.raycaster.set(overOrigin, new THREE.Vector3(0, -1, 0));
    this.raycaster.far = scanHeight + 0.5;
    const downHits = this.raycaster.intersectObjects(collisionMeshes, false);

    if (downHits.length > 0) {
      const topSurfaceY = downHits[0].point.y;
      const heightDiff = topSurfaceY - playerPos.y;

      // Vaulting low obstacle (0.4m - 1.25m)
      if (heightDiff > 0.35 && heightDiff <= 1.25 && eyeHits.length === 0) {
        const dest = hit.point.clone().add(normalizedDir.clone().multiplyScalar(0.8));
        dest.y = topSurfaceY;
        return {
          type: 'vault',
          targetY: topSurfaceY,
          progress: 0,
          duration: 0.32,
          startPos: playerPos.clone(),
          endPos: dest,
        };
      }

      // Climbing tall ledge / wall (1.25m - 3.2m)
      if (heightDiff > 1.25 && heightDiff <= 3.2) {
        const dest = hit.point.clone().add(normalizedDir.clone().multiplyScalar(0.5));
        dest.y = topSurfaceY;
        return {
          type: 'climb',
          targetY: topSurfaceY,
          progress: 0,
          duration: 0.55,
          startPos: playerPos.clone(),
          endPos: dest,
        };
      }
    }

    return null;
  }

  public update(delta: number, playerPos: THREE.Vector3): boolean {
    if (!this.activeAction) return false;

    this.activeAction.progress += delta / this.activeAction.duration;

    if (this.activeAction.progress >= 1.0) {
      playerPos.copy(this.activeAction.endPos);
      this.activeAction = null;
      return false; // Action finished
    }

    const t = this.activeAction.progress;
    // Parabolic smooth trajectory
    const heightArch = Math.sin(t * Math.PI) * (this.activeAction.type === 'vault' ? 0.3 : 0.15);

    playerPos.lerpVectors(this.activeAction.startPos, this.activeAction.endPos, t);
    playerPos.y += heightArch;
    return true; // Still performing parkour action
  }
}
