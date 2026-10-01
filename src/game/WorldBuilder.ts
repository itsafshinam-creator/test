import * as THREE from 'three';
import { CollectibleData } from '../types/game';

export interface HidingZone {
  box: THREE.Box3;
  type: 'hay_wagon' | 'dark_alcove';
}

export class WorldBuilder {
  public scene: THREE.Scene;
  public collisionMeshes: THREE.Object3D[] = [];
  public climbableMeshes: THREE.Object3D[] = [];
  public hidingZones: HidingZone[] = [];
  public collectibles: CollectibleData[] = [];
  public collectibleMeshes: Map<string, THREE.Group> = new Map();
  public torchLights: THREE.PointLight[] = [];
  public dustParticles: THREE.Points | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initCollectibles();
  }

  private initCollectibles() {
    this.collectibles = [
      {
        id: 'col_scarab_bazaar',
        name: 'Golden Aether Scarab',
        nameFa: 'اسکاراب طلایی اثیر',
        type: 'scarab',
        x: -8,
        y: 1.2,
        z: 8,
        collected: false,
        valueGold: 50,
        valueAeth: 15,
      },
      {
        id: 'col_spire_scroll',
        name: 'Encrypted Courier Dispatch',
        nameFa: 'طومار پیام‌رسان رمزگذاری‌شده',
        type: 'tome',
        x: 10,
        y: 10.4,
        z: -8,
        collected: false,
        valueGold: 80,
        valueAeth: 25,
      },
      {
        id: 'col_citadel_relic',
        name: 'Ancient Aether Relic',
        nameFa: 'عتیقه باستانی اثیر',
        type: 'relic',
        x: 0,
        y: 1.2,
        z: -28,
        collected: false,
        valueGold: 150,
        valueAeth: 50,
      },
      {
        id: 'col_catacomb_scarab',
        name: 'Catacomb Scarab',
        nameFa: 'اسکاراب دخمه',
        type: 'scarab',
        x: -16,
        y: 0.5,
        z: -18,
        collected: false,
        valueGold: 40,
        valueAeth: 10,
      },
    ];
  }

  public buildWorld() {
    // --- MATERIALS (Low-poly stylized aesthetic) ---
    const stoneWallMat = new THREE.MeshStandardMaterial({
      color: 0x94826b,
      roughness: 0.85,
      metalness: 0.05,
    });
    const darkStoneMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
      metalness: 0.2,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.9,
    });
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x786b59,
      roughness: 0.9,
    });
    const awningRedMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const awningTealMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const hayMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.95,
    });

    // 1. MAIN GROUND & STREETS
    const groundGeo = new THREE.PlaneGeometry(120, 120, 16, 16);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.collisionMeshes.push(ground);

    // City Perimeter Outer Walls
    this.createWall(-35, 5, 0, 2, 10, 80, stoneWallMat);
    this.createWall(35, 5, 0, 2, 10, 80, stoneWallMat);
    this.createWall(0, 5, 35, 70, 10, 2, stoneWallMat);

    // 2. BAZAAR DISTRICT (South-West)
    // Merchant Stall 1 (Darius)
    this.createStall(-6, 0, 4, awningRedMat, woodMat);
    // Merchant Stall 2
    this.createStall(-10, 0, 7, awningTealMat, woodMat);
    // Crates & Barrels around Bazaar
    this.createCrate(-7.5, 0.4, 5.5, 0.8, woodMat);
    this.createCrate(-7.5, 1.2, 5.5, 0.7, woodMat);
    this.createCrate(-5, 0.5, 2.5, 1.0, woodMat);
    this.createCrate(-8.5, 0.4, 3, 0.8, woodMat);

    // Straw Hay Wagon (Stealth Hiding Zone 1)
    const hayWagon = this.createHayWagon(-3, 0, 7, hayMat, woodMat);
    this.hidingZones.push({
      box: new THREE.Box3().setFromObject(hayWagon),
      type: 'hay_wagon',
    });

    // 3. BUILDINGS & ROOFTOPS (Central Street & Alleys)
    // Building West 1 (Two-story with rooftop terrace)
    this.createBuilding(-14, 0, 4, 8, 6, 12, stoneWallMat, woodMat);
    // Building West 2 (Three-story with climbable balconies)
    this.createBuilding(-14, 0, -10, 8, 8, 14, stoneWallMat, woodMat);

    // Wooden Bridge connecting West Buildings
    const bridgeGeo = new THREE.BoxGeometry(3, 0.25, 4);
    const bridge = new THREE.Mesh(bridgeGeo, woodMat);
    bridge.position.set(-14, 5.8, -2);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    this.scene.add(bridge);
    this.collisionMeshes.push(bridge);
    this.climbableMeshes.push(bridge);

    // Building East 1 (Residential)
    this.createBuilding(14, 0, 6, 8, 5, 12, stoneWallMat, woodMat);
    // Building East 2 (Temple library)
    this.createBuilding(14, 0, -8, 8, 7, 12, stoneWallMat, woodMat);

    // 4. THE GREAT SPIRE (Assassin Vantage Point & Quest 2 Goal)
    this.createSpire(10, 0, -8, stoneWallMat, woodMat);

    // 5. FORTIFIED CITADEL (North Area, z = -20 to -35)
    // Massive Citadel Gatehouse Wall
    this.createWall(-12, 6, -18, 16, 12, 4, darkStoneMat);
    this.createWall(12, 6, -18, 16, 12, 4, darkStoneMat);
    // Central Portcullis Gate Archway
    this.createArchGate(0, 0, -18, darkStoneMat, woodMat);

    // Citadel Side Walls & Courtyard
    this.createWall(-20, 6, -28, 4, 12, 20, darkStoneMat);
    this.createWall(20, 6, -28, 4, 12, 20, darkStoneMat);
    this.createWall(0, 6, -38, 40, 12, 4, darkStoneMat);

    // Inner Sanctuary Vault Platform (Holds the Relic Chest)
    const vaultPlatGeo = new THREE.BoxGeometry(8, 0.8, 8);
    const vaultPlat = new THREE.Mesh(vaultPlatGeo, darkStoneMat);
    vaultPlat.position.set(0, 0.4, -28);
    vaultPlat.receiveShadow = true;
    this.scene.add(vaultPlat);
    this.collisionMeshes.push(vaultPlat);

    // Vault Pillars
    for (const [px, pz] of [[-3, -31], [3, -31], [-3, -25], [3, -25]]) {
      const colGeo = new THREE.CylinderGeometry(0.35, 0.4, 5, 8);
      const col = new THREE.Mesh(colGeo, darkStoneMat);
      col.position.set(px, 2.5, pz);
      col.castShadow = true;
      this.scene.add(col);
      this.collisionMeshes.push(col);
    }

    // Ancient Relic Altar
    const altarGeo = new THREE.BoxGeometry(1.6, 1.0, 1.2);
    const altarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const altar = new THREE.Mesh(altarGeo, altarMat);
    altar.position.set(0, 1.3, -28);
    altar.castShadow = true;
    this.scene.add(altar);
    this.collisionMeshes.push(altar);

    // 6. UNDERGROUND TUNNEL / CATACOMBS ENTRANCE
    this.createCatacombEntrance(-16, 0, -16, darkStoneMat);

    // Dark Alcove (Stealth Hiding Zone 2)
    const alcoveZone = new THREE.Box3(
      new THREE.Vector3(-19, 0, -18),
      new THREE.Vector3(-15, 3, -14)
    );
    this.hidingZones.push({ box: alcoveZone, type: 'dark_alcove' });

    // 7. TORCHES & LANTERNS WITH FLICKER LIGHTS
    this.addTorch(-1.8, 3.2, -16);
    this.addTorch(1.8, 3.2, -16);
    this.addTorch(0, 3.5, -26, 0x38bdf8); // Glowing mystical blue vault torch
    this.addTorch(-5.5, 2.5, 3.5, 0xf59e0b); // Bazaar warm lantern
    this.addTorch(9.5, 2.5, -6.5, 0xf59e0b); // Spire lantern

    // 8. SPAWN COLLECTIBLES
    this.spawnCollectibles();

    // 9. AMBIENT AETHER DUST PARTICLES
    this.createAmbientParticles();
  }

  private createBuilding(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    wallMat: THREE.Material,
    woodMat: THREE.Material
  ) {
    const group = new THREE.Group();
    group.position.set(x, y + h / 2, z);

    // Main stone block
    const bGeo = new THREE.BoxGeometry(w, h, d);
    const bMesh = new THREE.Mesh(bGeo, wallMat);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    group.add(bMesh);

    // Rooftop parapet edge
    const parapetGeo = new THREE.BoxGeometry(w + 0.2, 0.6, d + 0.2);
    const parapet = new THREE.Mesh(parapetGeo, wallMat);
    parapet.position.y = h / 2 + 0.2;
    group.add(parapet);

    // Wooden Balcony on side
    const balcGeo = new THREE.BoxGeometry(w * 0.4, 0.2, 1.6);
    const balc = new THREE.Mesh(balcGeo, woodMat);
    balc.position.set(0, 0, d / 2 + 0.8);
    balc.castShadow = true;
    group.add(balc);
    this.climbableMeshes.push(balc);

    // Wooden climbing ladder / beam
    const ladderGeo = new THREE.BoxGeometry(0.8, h - 1, 0.15);
    const ladder = new THREE.Mesh(ladderGeo, woodMat);
    ladder.position.set(w / 2 + 0.1, 0, 0);
    group.add(ladder);
    this.climbableMeshes.push(ladder);

    this.scene.add(group);
    this.collisionMeshes.push(bMesh);
    this.climbableMeshes.push(bMesh);
  }

  private createSpire(x: number, y: number, z: number, wallMat: THREE.Material, woodMat: THREE.Material) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Spire Tower Base
    const baseGeo = new THREE.CylinderGeometry(2.5, 3.2, 10, 8);
    const base = new THREE.Mesh(baseGeo, wallMat);
    base.position.y = 5;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);
    this.collisionMeshes.push(base);

    // Observation platform at y = 10
    const platGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.5, 8);
    const plat = new THREE.Mesh(platGeo, woodMat);
    plat.position.y = 10;
    plat.receiveShadow = true;
    group.add(plat);
    this.collisionMeshes.push(plat);
    this.climbableMeshes.push(plat);

    // Wooden spiral climbable steps
    for (let i = 0; i < 6; i++) {
      const stepGeo = new THREE.BoxGeometry(1.4, 0.2, 0.8);
      const step = new THREE.Mesh(stepGeo, woodMat);
      const angle = (i * Math.PI) / 3;
      step.position.set(Math.cos(angle) * 2.8, 1.6 * (i + 1), Math.sin(angle) * 2.8);
      step.rotation.y = -angle;
      step.castShadow = true;
      group.add(step);
      this.collisionMeshes.push(step);
      this.climbableMeshes.push(step);
    }

    // Top Spire Needle
    const needleGeo = new THREE.ConeGeometry(2.0, 5, 8);
    const needle = new THREE.Mesh(needleGeo, wallMat);
    needle.position.y = 13;
    needle.castShadow = true;
    group.add(needle);

    // Glowing Aether Crest at Peak
    const crystalGeo = new THREE.OctahedronGeometry(0.4);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0, 16, 0);
    group.add(crystal);

    this.scene.add(group);
  }

  private createWall(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material
  ) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.collisionMeshes.push(mesh);
    this.climbableMeshes.push(mesh);
  }

  private createArchGate(x: number, y: number, z: number, stoneMat: THREE.Material, woodMat: THREE.Material) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Left Arch Pillar
    const pGeo = new THREE.BoxGeometry(1.6, 9, 3);
    const pL = new THREE.Mesh(pGeo, stoneMat);
    pL.position.set(-3.2, 4.5, 0);
    pL.castShadow = true;
    group.add(pL);
    this.collisionMeshes.push(pL);

    // Right Arch Pillar
    const pR = pL.clone();
    pR.position.x = 3.2;
    group.add(pR);
    this.collisionMeshes.push(pR);

    // Top Lintel
    const lGeo = new THREE.BoxGeometry(8, 2.5, 3.2);
    const lintel = new THREE.Mesh(lGeo, stoneMat);
    lintel.position.set(0, 8.5, 0);
    lintel.castShadow = true;
    group.add(lintel);
    this.collisionMeshes.push(lintel);

    // Raised Portcullis Grate (allows player to sneak through under it)
    const grateGeo = new THREE.BoxGeometry(4.8, 3.5, 0.2);
    const grateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const grate = new THREE.Mesh(grateGeo, grateMat);
    grate.position.set(0, 5.8, 0);
    group.add(grate);

    this.scene.add(group);
  }

  private createStall(
    x: number,
    y: number,
    z: number,
    awningMat: THREE.Material,
    woodMat: THREE.Material
  ) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Table
    const tableGeo = new THREE.BoxGeometry(2.6, 0.9, 1.2);
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.set(0, 0.45, 0);
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);
    this.collisionMeshes.push(table);

    // 4 Corner Posts
    for (const [px, pz] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.5], [1.2, 0.5]]) {
      const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6);
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(px, 1.2, pz);
      post.castShadow = true;
      group.add(post);
    }

    // Fabric Awning Canopy (Slanted)
    const awningGeo = new THREE.PlaneGeometry(2.8, 1.6);
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.4, 0);
    awning.rotation.x = Math.PI / 8;
    awning.castShadow = true;
    group.add(awning);

    this.scene.add(group);
  }

  private createCrate(x: number, y: number, z: number, size: number, woodMat: THREE.Material) {
    const geo = new THREE.BoxGeometry(size, size, size);
    const crate = new THREE.Mesh(geo, woodMat);
    crate.position.set(x, y, z);
    crate.castShadow = true;
    crate.receiveShadow = true;
    this.scene.add(crate);
    this.collisionMeshes.push(crate);
    this.climbableMeshes.push(crate);
  }

  private createHayWagon(
    x: number,
    y: number,
    z: number,
    hayMat: THREE.Material,
    woodMat: THREE.Material
  ): THREE.Mesh {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Wagon Cart Base
    const wagonGeo = new THREE.BoxGeometry(2.5, 0.5, 3.8);
    const wagon = new THREE.Mesh(wagonGeo, woodMat);
    wagon.position.y = 0.4;
    wagon.castShadow = true;
    group.add(wagon);

    // Hay Mound (Soft mound of straw)
    const hayGeo = new THREE.BoxGeometry(2.2, 0.9, 3.4);
    const hay = new THREE.Mesh(hayGeo, hayMat);
    hay.position.y = 0.85;
    hay.castShadow = true;
    group.add(hay);

    // Overhead indicator label
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 36;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.roundRect(2, 2, 124, 32, 6);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HIDING SPOT', 64, 18);
    }
    const spriteMap = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, transparent: true });
    const sign = new THREE.Sprite(spriteMat);
    sign.position.set(0, 1.8, 0);
    sign.scale.set(1.2, 0.35, 1);
    group.add(sign);

    this.scene.add(group);
    return hay;
  }

  private createCatacombEntrance(x: number, y: number, z: number, stoneMat: THREE.Material) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Archway
    const archGeo = new THREE.BoxGeometry(3, 4, 1.2);
    const arch = new THREE.Mesh(archGeo, stoneMat);
    arch.position.y = 2;
    group.add(arch);

    // Dark underground void portal
    const portalGeo = new THREE.PlaneGeometry(2, 3);
    const portalMat = new THREE.MeshBasicMaterial({ color: 0x030712 });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.position.set(0, 1.5, 0.61);
    group.add(portal);

    this.scene.add(group);
  }

  private addTorch(x: number, y: number, z: number, color = 0xf59e0b) {
    const torchSconceGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.5, 6);
    const sconceMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
    const sconce = new THREE.Mesh(torchSconceGeo, sconceMat);
    sconce.position.set(x, y, z);
    this.scene.add(sconce);

    // Flickering Point Light
    const light = new THREE.PointLight(color, 2.5, 12, 1.5);
    light.position.set(x, y + 0.3, z);
    light.castShadow = true;
    light.shadow.bias = -0.002;
    this.scene.add(light);
    this.torchLights.push(light);

    // Flame Core Glow
    const flameGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(x, y + 0.28, z);
    this.scene.add(flame);
  }

  private spawnCollectibles() {
    this.collectibles.forEach((item) => {
      const group = new THREE.Group();
      group.position.set(item.x, item.y, item.z);

      if (item.type === 'relic') {
        // Glowing Ancient Aether Relic
        const geo = new THREE.DodecahedronGeometry(0.35);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.8,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        group.add(mesh);

        // Rotating bronze ring
        const ringGeo = new THREE.TorusGeometry(0.5, 0.04, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        group.add(ring);
      } else if (item.type === 'scarab') {
        // Golden Scarab
        const geo = new THREE.OctahedronGeometry(0.25);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xd97706,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.9,
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
      } else {
        // Ancient Scroll
        const rollGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8);
        const rollMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
        const mesh = new THREE.Mesh(rollGeo, rollMat);
        mesh.rotation.z = Math.PI / 4;
        group.add(mesh);
      }

      this.scene.add(group);
      this.collectibleMeshes.set(item.id, group);
    });
  }

  private createAmbientParticles() {
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 12 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.dustParticles = new THREE.Points(geometry, material);
    this.scene.add(this.dustParticles);
  }

  public update(delta: number, time: number) {
    // 1. Torch light flickering effect
    this.torchLights.forEach((light, i) => {
      const flicker = Math.sin(time * 8 + i * 2) * 0.25 + (Math.random() - 0.5) * 0.15;
      light.intensity = 2.4 + flicker;
    });

    // 2. Animate and rotate floating collectibles
    this.collectibleMeshes.forEach((mesh) => {
      mesh.rotation.y += delta * 1.5;
      mesh.position.y += Math.sin(time * 3) * 0.003;
    });

    // 3. Ambient dust floating motion
    if (this.dustParticles) {
      const posAttr = this.dustParticles.geometry.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      for (let i = 1; i < array.length; i += 3) {
        array[i] += delta * 0.2;
        if (array[i] > 14) array[i] = 0.5;
      }
      posAttr.needsUpdate = true;
    }
  }

  public removeCollectibleMesh(id: string) {
    const mesh = this.collectibleMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.collectibleMeshes.delete(id);
    }
  }
}
