import * as THREE from 'three';

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  z: number;
  duration: number;
  timeAlive: number;
  isCrit?: boolean;
}

export interface Particle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export class VisualEffectsManager {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Spawns a brilliant golden-white spark shower for successful weapon/shield parries
   */
  public triggerParryBurst(pos: THREE.Vector3) {
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfff176 });
    const sparkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.14);

    for (let i = 0; i < 24; i++) {
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.position.copy(pos);

      // Radial conical burst outward
      const angle = Math.random() * Math.PI * 2;
      const speed = 4.0 + Math.random() * 5.0;
      const vy = (Math.random() - 0.2) * 4.0;
      const vx = Math.cos(angle) * speed;
      const vz = Math.sin(angle) * speed;

      this.scene.add(spark);
      this.particles.push({
        mesh: spark,
        vx,
        vy,
        vz,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
      });
    }

    // Expanding golden shockwave ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.4, 24), ringMat);
    ring.position.copy(pos);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);

    this.particles.push({
      mesh: ring,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.3,
    });
  }

  /**
   * Spawns Fireball impact blast with burning embers
   */
  public triggerFireballExplosion(pos: THREE.Vector3) {
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 });

    for (let i = 0; i < 20; i++) {
      const isSmoke = i % 2 === 0;
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(isSmoke ? 0.2 : 0.08, 6, 6),
        isSmoke ? smokeMat : emberMat
      );
      p.position.copy(pos);

      const vx = (Math.random() - 0.5) * 6;
      const vy = Math.random() * 5 + 1;
      const vz = (Math.random() - 0.5) * 6;

      this.scene.add(p);
      this.particles.push({
        mesh: p,
        vx,
        vy,
        vz,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.3,
      });
    }
  }

  /**
   * Spawns Frost Nova icy blast
   */
  public triggerFrostNova(pos: THREE.Vector3) {
    const iceMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.0, 5), iceMat);
      spike.position.set(pos.x + Math.cos(angle) * 2.5, pos.y + 0.5, pos.z + Math.sin(angle) * 2.5);
      spike.rotation.y = angle;
      this.scene.add(spike);

      this.particles.push({
        mesh: spike,
        vx: 0,
        vy: 0.5,
        vz: 0,
        life: 0,
        maxLife: 0.6,
      });
    }
  }

  /**
   * Mining rock chip burst
   */
  public triggerMiningHit(pos: THREE.Vector3, isRareOre: boolean) {
    const rockMat = new THREE.MeshBasicMaterial({ color: isRareOre ? 0x60a5fa : 0x78716c });
    for (let i = 0; i < 10; i++) {
      const chip = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), rockMat);
      chip.position.copy(pos);
      const vx = (Math.random() - 0.5) * 4;
      const vy = Math.random() * 4 + 1;
      const vz = (Math.random() - 0.5) * 4;

      this.scene.add(chip);
      this.particles.push({
        mesh: chip,
        vx,
        vy,
        vz,
        life: 0,
        maxLife: 0.4,
      });
    }
  }

  /**
   * Level Up ascending golden pillar
   */
  public triggerLevelUp(pos: THREE.Vector3) {
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 14, 16), beamMat);
    beam.position.set(pos.x, pos.y + 7, pos.z);
    this.scene.add(beam);

    this.particles.push({
      mesh: beam,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 1.2,
    });
  }

  /**
   * Add floating damage or prompt text
   */
  public addFloatingText(text: string, pos: THREE.Vector3, color = '#ffffff', isCrit = false) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      color,
      x: pos.x,
      y: pos.y + 1.8,
      z: pos.z,
      duration: isCrit ? 1.4 : 0.9,
      timeAlive: 0,
      isCrit,
    });
  }

  public update(delta: number) {
    // Update 3D particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((m) => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      // Physics integration
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.vy -= 9.8 * delta; // gravity

      // Scale fade
      const scaleFactor = 1 - p.life / p.maxLife;
      p.mesh.scale.setScalar(Math.max(0.01, scaleFactor));
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.timeAlive += delta;
      ft.y += delta * 1.5; // float upward
      if (ft.timeAlive >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public dispose() {
    this.particles.forEach((p) => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
    });
    this.particles = [];
    this.floatingTexts = [];
  }
}
