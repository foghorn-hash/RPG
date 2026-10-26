import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterClass, CharacterStats, Equipment, Item, Quest, OreNodeData } from '../../types/game';
import { createPlayerMesh, createEnemyMesh, createNpcMesh } from './characterModels';
import { buildOpenWorld, getTerrainHeight, WorldBuildResult } from './worldBuilder';
import { VisualEffectsManager } from './vfx';
import { soundEngine } from '../../audio/soundEngine';

export interface GameEngineCallbacks {
  onStatsChange: (stats: CharacterStats) => void;
  onInventoryAdd: (item: Item, quantity?: number) => void;
  onQuestUpdate: (questId: string, objectiveId: string, amount: number) => void;
  onInteractPrompt: (prompt: string | null) => void;
  onOpenNpcDialogue: (npcId: string) => void;
  onStealthChange: (isStealth: boolean, detected: boolean) => void;
  onParryWindowStatus: (active: boolean) => void;
  onBossHpUpdate: (hp: number, maxHp: number, name: string) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private vfx: VisualEffectsManager;
  private callbacks: GameEngineCallbacks;

  // World Data
  private worldData: WorldBuildResult | null = null;

  // Player Entity
  private playerGroup: THREE.Group | null = null;
  private playerPos = new THREE.Vector3(0, 0.2, 0);
  private playerVelocity = new THREE.Vector3();
  private playerRotation = 0;
  private isGrounded = true;

  // Camera Orbit
  private cameraAngleH = 0;
  private cameraAngleV = 0.35;
  private cameraDistance = 6.5;
  private isMouseDown = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  // Player Stats & State
  private stats: CharacterStats;
  private currentClass: CharacterClass = 'warrior';
  private equipment: Equipment;
  private isStealth = false;
  private isParrying = false;
  private parryTimer = 0;
  private attackCooldown = 0;
  private isAttacking = false;
  private attackAnimTimer = 0;

  // Enemies
  private enemies: {
    id: string;
    name: string;
    type: 'goblin' | 'skeleton' | 'cave_golem' | 'dire_wolf' | 'boss_colossus';
    mesh: THREE.Group;
    pos: THREE.Vector3;
    hp: number;
    maxHp: number;
    damage: number;
    state: 'idle' | 'patrol' | 'chase' | 'telegraph' | 'attack' | 'staggered' | 'dead';
    telegraphTimer: number;
    staggerTimer: number;
    attackCooldown: number;
    basePos: THREE.Vector3;
  }[] = [];

  // Key States
  private keys: Record<string, boolean> = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false,
    KeyC: false,
    KeyE: false,
    KeyQ: false,
  };

  // Loop control
  private frameId: number = 0;
  private lastTime: number = 0;
  private isDestroyed: boolean = false;

  constructor(
    container: HTMLElement,
    initialStats: CharacterStats,
    initialClass: CharacterClass,
    initialEquipment: Equipment,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.stats = { ...initialStats };
    this.currentClass = initialClass;
    this.equipment = { ...initialEquipment };
    this.callbacks = callbacks;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      400
    );

    // 2. Renderer setup with software GL guard per instructions
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Studio Environment Map (PMREM + RoomEnvironment)
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // safe fallback
    }

    // 4. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x334155, 0.85);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    sunLight.position.set(45, 60, 30);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 140;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // 5. Visual Effects Manager
    this.vfx = new VisualEffectsManager(this.scene);

    // 6. Build World Geometry & Entities
    this.worldData = buildOpenWorld(this.scene);

    // 7. Spawn Player Mesh
    this.rebuildPlayerMesh();

    // 8. Spawn NPCs with custom meshes
    this.worldData.npcs.forEach((npc) => {
      const npcMesh = createNpcMesh(npc.role);
      npcMesh.position.set(npc.x, npc.y, npc.z);
      this.scene.add(npcMesh);
      this.worldData?.npcMeshes.set(npc.id, npcMesh);
    });

    // 9. Spawn Enemies
    this.spawnEnemies();

    // 10. Register Event Listeners
    this.initInputListeners();

    // 11. Start Loop
    this.lastTime = performance.now();
    this.tick = this.tick.bind(this);
    this.frameId = requestAnimationFrame(this.tick);
  }

  public rebuildPlayerMesh() {
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
    }
    this.playerGroup = createPlayerMesh(this.currentClass);
    this.playerGroup.position.copy(this.playerPos);
    this.scene.add(this.playerGroup);
  }

  public setCharacterClass(newClass: CharacterClass) {
    this.currentClass = newClass;
    this.rebuildPlayerMesh();
  }

  public updateStats(newStats: CharacterStats) {
    this.stats = { ...newStats };
  }

  public updateEquipment(newEquip: Equipment) {
    this.equipment = { ...newEquip };
  }

  private spawnEnemies() {
    const enemySpawns = [
      // Whispering Forest Goblins
      { id: 'goblin_1', name: 'Goblin Marauder', type: 'goblin' as const, x: -14, z: 24, hp: 60, dmg: 14 },
      { id: 'goblin_2', name: 'Goblin Scout', type: 'goblin' as const, x: 12, z: 38, hp: 55, dmg: 12 },
      { id: 'goblin_3', name: 'Goblin Ambush', type: 'goblin' as const, x: -25, z: 42, hp: 65, dmg: 15 },

      // Dire Wolves
      { id: 'wolf_1', name: 'Elder Dire Wolf', type: 'dire_wolf' as const, x: -28, z: 12, hp: 75, dmg: 18 },
      { id: 'wolf_2', name: 'Pack Wolf', type: 'dire_wolf' as const, x: 26, z: 22, hp: 70, dmg: 16 },

      // Northern Hills & Barrow Skeletons
      { id: 'skeleton_1', name: 'Skeleton Vanguard', type: 'skeleton' as const, x: 34, z: -38, hp: 90, dmg: 22 },
      { id: 'skeleton_2', name: 'Risen Swordsman', type: 'skeleton' as const, x: 42, z: -46, hp: 85, dmg: 20 },

      // Subterranean Cavern Golems (Lurking in deep grotto)
      { id: 'golem_1', name: 'Deep Grotto Golem', type: 'cave_golem' as const, x: -48, z: -104, hp: 150, dmg: 28 },
      { id: 'golem_2', name: 'Crystal Bedrock Golem', type: 'cave_golem' as const, x: -58, z: -114, hp: 160, dmg: 30 },

      // Runic Sunken Ruins Hollow Colossus Boss
      { id: 'boss_colossus', name: 'Hollow Colossus of Sunfall', type: 'boss_colossus' as const, x: 65, z: -65, hp: 450, dmg: 40 },
    ];

    enemySpawns.forEach((spawn) => {
      const y = getTerrainHeight(spawn.x, spawn.z);
      const mesh = createEnemyMesh(spawn.type);
      mesh.position.set(spawn.x, y, spawn.z);
      this.scene.add(mesh);

      this.enemies.push({
        id: spawn.id,
        name: spawn.name,
        type: spawn.type,
        mesh,
        pos: new THREE.Vector3(spawn.x, y, spawn.z),
        hp: spawn.hp,
        maxHp: spawn.hp,
        damage: spawn.dmg,
        state: 'idle',
        telegraphTimer: 0,
        staggerTimer: 0,
        attackCooldown: 1.5 + Math.random(),
        basePos: new THREE.Vector3(spawn.x, y, spawn.z),
      });
    });
  }

  private initInputListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);

    const el = this.renderer.domElement;
    el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code in this.keys) {
      this.keys[e.code] = true;
    }

    // Stealth Toggle [C]
    if (e.code === 'KeyC') {
      this.toggleStealth();
    }

    // Parry [Q] or Right Click
    if (e.code === 'KeyQ') {
      this.triggerParry();
    }

    // Interact [E]
    if (e.code === 'KeyE') {
      this.interactNearby();
    }

    // Spells: [Digit1], [Digit2], [Digit3]
    if (e.code === 'Digit1') {
      this.castSpell(1);
    } else if (e.code === 'Digit2') {
      this.castSpell(2);
    } else if (e.code === 'Digit3') {
      this.castSpell(3);
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code in this.keys) {
      this.keys[e.code] = false;
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      // Left Click -> Melee Attack
      this.performMeleeAttack();
    } else if (e.button === 2) {
      // Right Click -> Parry / Block
      this.triggerParry();
    }

    this.isMouseDown = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isMouseDown) return;
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.cameraAngleH -= dx * 0.005;
    this.cameraAngleV = Math.max(0.1, Math.min(1.2, this.cameraAngleV + dy * 0.005));
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Toggles crouching stealth mode
   */
  public toggleStealth() {
    this.isStealth = !this.isStealth;
    soundEngine.playStealthToggle(this.isStealth);
    this.callbacks.onStealthChange(this.isStealth, false);

    if (this.isStealth) {
      this.vfx.addFloatingText('STEALTH ACTIVE', this.playerPos, '#a855f7');
      this.callbacks.onQuestUpdate('quest_shadows_wood', 'enter_stealth', 1);
    }
  }

  /**
   * CRITICAL COMBAT: Timely Parry Technique
   */
  public triggerParry() {
    if (this.isParrying) return;
    this.isParrying = true;
    this.parryTimer = 0.55; // 0.55s parry window
    this.callbacks.onParryWindowStatus(true);

    // Raise shield animation on player
    const leftArm = this.playerGroup?.getObjectByName('LeftArm');
    if (leftArm) {
      leftArm.rotation.x = Math.PI / 2.5;
    }

    this.vfx.addFloatingText('PARRY READY', this.playerPos, '#38bdf8');
  }

  /**
   * Normal primary weapon attack
   */
  public performMeleeAttack() {
    if (this.attackCooldown > 0) return;
    this.isAttacking = true;
    this.attackAnimTimer = 0.25;
    this.attackCooldown = 0.45;

    soundEngine.playSlash();

    // Animate weapon arm swing
    const rightArm = this.playerGroup?.getObjectByName('RightArm');
    if (rightArm) {
      rightArm.rotation.x = -Math.PI / 3;
    }

    // Check hit against nearby enemies in front
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation);
    const attackRange = 3.2;

    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      const dist = enemy.pos.distanceTo(this.playerPos);
      if (dist <= attackRange) {
        const toEnemy = new THREE.Vector3().subVectors(enemy.pos, this.playerPos).normalize();
        const dot = forward.dot(toEnemy);

        if (dot > 0.25) {
          // HIT!
          let baseDamage = (this.equipment.mainHand?.damage || 20) + Math.floor(this.stats.strength * 1.5);

          // Class bonuses
          if (this.currentClass === 'warrior') {
            baseDamage = Math.floor(baseDamage * 1.35); // Warrior brute strength
          }

          // Check if stealth backstab
          let isCrit = false;
          if (this.isStealth) {
            baseDamage = Math.floor(baseDamage * 3.5); // Hobbit & Rogue stealth multiplier
            isCrit = true;
            this.vfx.addFloatingText(`STEALTH BACKSTAB! ${baseDamage}`, enemy.pos, '#f43f5e', true);
            this.callbacks.onQuestUpdate('quest_shadows_wood', 'sneak_kill_or_pass', 1);
          } else if (enemy.state === 'staggered') {
            baseDamage = Math.floor(baseDamage * 2.5); // Parry riposte critical
            isCrit = true;
            this.vfx.addFloatingText(`RIPOSTE CRITICAL! ${baseDamage}`, enemy.pos, '#facc15', true);
          } else {
            // Normal crit roll based on agility / luck
            const critChance = (this.stats.agility * 0.02) + (this.stats.luck * 0.015);
            if (Math.random() < critChance) {
              baseDamage = Math.floor(baseDamage * 2.0);
              isCrit = true;
              this.vfx.addFloatingText(`CRITICAL! ${baseDamage}`, enemy.pos, '#fbbf24', true);
            } else {
              this.vfx.addFloatingText(`${baseDamage}`, enemy.pos, '#ffffff');
            }
          }

          soundEngine.playHit();
          enemy.hp -= baseDamage;
          this.applyEnemyDamage(enemy);
        }
      }
    });
  }

  /**
   * Cast class-specific spells
   */
  public castSpell(slot: number) {
    if (this.currentClass === 'wizard') {
      if (slot === 1) {
        // Fireball
        if (this.stats.mana < 25) {
          this.vfx.addFloatingText('NOT ENOUGH MANA', this.playerPos, '#93c5fd');
          return;
        }
        this.stats.mana -= 25;
        this.callbacks.onStatsChange(this.stats);

        soundEngine.playFireball();
        const targetPos = this.playerPos.clone().add(
          new THREE.Vector3(0, 0, 8).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation)
        );
        this.vfx.triggerFireballExplosion(targetPos);
        this.vfx.addFloatingText('FIREBALL BLAST', targetPos, '#f97316', true);

        // AoE damage
        this.enemies.forEach((enemy) => {
          if (enemy.hp <= 0) return;
          if (enemy.pos.distanceTo(targetPos) < 6.0) {
            const dmg = 55 + Math.floor(this.stats.intelligence * 2.0);
            enemy.hp -= dmg;
            this.vfx.addFloatingText(`-${dmg}`, enemy.pos, '#ef4444');
            this.applyEnemyDamage(enemy);
          }
        });

        this.callbacks.onQuestUpdate('quest_arcane_anomalies', 'cast_spells', 1);
      } else if (slot === 2) {
        // Frost Nova
        if (this.stats.mana < 35) {
          this.vfx.addFloatingText('NOT ENOUGH MANA', this.playerPos, '#93c5fd');
          return;
        }
        this.stats.mana -= 35;
        this.callbacks.onStatsChange(this.stats);

        soundEngine.playFrostNova();
        this.vfx.triggerFrostNova(this.playerPos);
        this.vfx.addFloatingText('GLACIAL NOVA', this.playerPos, '#38bdf8', true);

        this.enemies.forEach((enemy) => {
          if (enemy.hp <= 0) return;
          if (enemy.pos.distanceTo(this.playerPos) < 7.5) {
            enemy.state = 'staggered';
            enemy.staggerTimer = 3.0; // frozen
            const dmg = 40 + Math.floor(this.stats.intelligence * 1.5);
            enemy.hp -= dmg;
            this.vfx.addFloatingText(`FROZEN! -${dmg}`, enemy.pos, '#38bdf8');
            this.applyEnemyDamage(enemy);
          }
        });

        this.callbacks.onQuestUpdate('quest_arcane_anomalies', 'cast_spells', 1);
      } else if (slot === 3) {
        // Blink
        soundEngine.playDash();
        const blinkVec = new THREE.Vector3(0, 0, 12).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation);
        this.playerPos.add(blinkVec);
        this.playerPos.y = getTerrainHeight(this.playerPos.x, this.playerPos.z);
        this.vfx.triggerParryBurst(this.playerPos);
        this.vfx.addFloatingText('BLINK', this.playerPos, '#c084fc');
      }
    } else if (this.currentClass === 'warrior') {
      if (slot === 1) {
        // Titan Cleave
        soundEngine.playSlash();
        this.vfx.triggerParryBurst(this.playerPos);
        this.vfx.addFloatingText('TITAN CLEAVE', this.playerPos, '#f59e0b', true);
        this.enemies.forEach((enemy) => {
          if (enemy.hp <= 0) return;
          if (enemy.pos.distanceTo(this.playerPos) < 4.5) {
            const dmg = 70 + Math.floor(this.stats.strength * 2.2);
            enemy.hp -= dmg;
            enemy.state = 'staggered';
            enemy.staggerTimer = 1.5;
            this.vfx.addFloatingText(`CLEAVED! -${dmg}`, enemy.pos, '#f59e0b');
            this.applyEnemyDamage(enemy);
          }
        });
      }
    } else if (this.currentClass === 'elf') {
      if (slot === 1) {
        // Zephyr Dash
        soundEngine.playDash();
        const dashVec = new THREE.Vector3(0, 0, 10).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotation);
        this.playerPos.add(dashVec);
        this.playerPos.y = getTerrainHeight(this.playerPos.x, this.playerPos.z);
        this.vfx.addFloatingText('ZEPHYR DASH', this.playerPos, '#4ade80');
      }
    } else if (this.currentClass === 'dwarf') {
      if (slot === 1) {
        // Mountain Tremor Slam
        soundEngine.playHit();
        this.vfx.triggerParryBurst(this.playerPos);
        this.vfx.addFloatingText('MOUNTAIN SLAM', this.playerPos, '#d97706', true);
        this.enemies.forEach((enemy) => {
          if (enemy.hp <= 0) return;
          if (enemy.pos.distanceTo(this.playerPos) < 6.0) {
            enemy.hp -= 65;
            enemy.state = 'staggered';
            enemy.staggerTimer = 2.5;
            this.applyEnemyDamage(enemy);
          }
        });
      }
    }
  }

  private applyEnemyDamage(enemy: typeof this.enemies[0]) {
    // Update HP bar
    const hpFill = enemy.mesh.getObjectByName('HpBarFill') as THREE.Mesh;
    if (hpFill) {
      const pct = Math.max(0, enemy.hp / enemy.maxHp);
      hpFill.scale.x = pct;
      hpFill.position.x = -(1 - pct) * 0.58;
    }

    if (enemy.type === 'boss_colossus') {
      this.callbacks.onBossHpUpdate(enemy.hp, enemy.maxHp, enemy.name);
    }

    // Check Death
    if (enemy.hp <= 0 && enemy.state !== 'dead') {
      enemy.state = 'dead';
      this.vfx.triggerParryBurst(enemy.pos);
      this.vfx.addFloatingText(`DEFEATED! +${enemy.type === 'boss_colossus' ? 500 : 80} XP`, enemy.pos, '#facc15');

      // Rewards
      const xpGained = enemy.type === 'boss_colossus' ? 500 : 70;
      const goldGained = enemy.type === 'boss_colossus' ? 250 : 25;
      this.gainXp(xpGained);
      this.stats.gold += goldGained;
      this.callbacks.onStatsChange(this.stats);

      // Quest completions
      if (enemy.type === 'goblin') {
        this.callbacks.onQuestUpdate('quest_blade_bulwark', 'defeat_goblins', 1);
      } else if (enemy.type === 'skeleton') {
        this.callbacks.onQuestUpdate('quest_arcane_anomalies', 'defeat_skeletons', 1);
      } else if (enemy.type === 'boss_colossus') {
        this.callbacks.onQuestUpdate('quest_slayer_colossus', 'slay_colossus', 1);
        soundEngine.playQuestComplete();
      }

      // Hide mesh
      enemy.mesh.visible = false;

      // Respawn timer (except boss)
      if (enemy.type !== 'boss_colossus') {
        setTimeout(() => {
          enemy.hp = enemy.maxHp;
          enemy.state = 'idle';
          enemy.pos.copy(enemy.basePos);
          enemy.mesh.position.copy(enemy.basePos);
          enemy.mesh.visible = true;
          if (hpFill) hpFill.scale.x = 1.0;
        }, 12000);
      }
    }
  }

  /**
   * Interact with nearby NPCs, Ore Nodes, or Ancient Ruin Altars
   */
  public interactNearby() {
    // 1. Check Ore Nodes (Mining)
    if (this.worldData) {
      for (const node of this.worldData.oreNodes) {
        const dist = Math.hypot(this.playerPos.x - node.x, this.playerPos.z - node.z);
        if (dist < 4.0) {
          this.mineOreNode(node);
          return;
        }
      }

      // 2. Check NPCs (Dialogue / Quests)
      for (const npc of this.worldData.npcs) {
        const dist = Math.hypot(this.playerPos.x - npc.x, this.playerPos.z - npc.z);
        if (dist < 4.0) {
          this.callbacks.onOpenNpcDialogue(npc.id);
          return;
        }
      }

      // 3. Check Stone Bridge Quest Ledger
      const ledgerDist = Math.hypot(this.playerPos.x - 0, this.playerPos.z - 35);
      if (ledgerDist < 5.0) {
        this.callbacks.onQuestUpdate('quest_shadows_wood', 'recover_ledger', 1);
        this.vfx.addFloatingText('STOLEN LEDGER RECOVERED!', this.playerPos, '#facc15', true);
        soundEngine.playQuestComplete();
        return;
      }
    }
  }

  private mineOreNode(node: OreNodeData) {
    const isDwarf = this.currentClass === 'dwarf';
    const isRare = node.oreType === 'mithril' || node.oreType === 'adamantite';

    // Sound and particles
    soundEngine.playPickaxe(isRare);
    this.vfx.triggerMiningHit(new THREE.Vector3(node.x, node.y + 0.5, node.z), isRare);

    // Pickaxe swing animation
    const rightArm = this.playerGroup?.getObjectByName('RightArm');
    if (rightArm) {
      rightArm.rotation.x = -Math.PI / 2.2;
    }

    node.health -= isDwarf ? 2 : 1; // Dwarf mines twice as fast!

    if (node.health <= 0) {
      node.health = node.maxHealth; // reset

      // Reward item
      let itemId = 'ore_iron';
      let itemName = 'Iron Ore';
      if (node.oreType === 'mithril') {
        itemId = 'ore_mithril';
        itemName = 'Mithril Ore';
      } else if (node.oreType === 'gold') {
        itemId = 'ore_gold';
        itemName = 'Sun-Gold Nugget';
      } else if (node.oreType === 'adamantite') {
        itemId = 'ore_adamantite';
        itemName = 'Abyssal Adamantite';
      } else if (node.oreType === 'crystal') {
        itemId = 'ore_gold';
        itemName = 'Quartz Crystal';
      }

      const yieldAmount = isDwarf ? 2 : 1;
      this.callbacks.onInventoryAdd({
        id: itemId,
        name: itemName,
        type: 'ore',
        rarity: isRare ? 'rare' : 'common',
        description: `Mined from ${node.name}.`,
        icon: isRare ? '💠' : '🪨',
        value: isRare ? 35 : 10,
        quantity: yieldAmount,
      }, yieldAmount);

      this.vfx.addFloatingText(`+${yieldAmount} ${itemName}!`, new THREE.Vector3(node.x, node.y + 1.2, node.z), '#38bdf8');
      this.gainXp(35);

      // Gem chance (Dwarf has 3x chance!)
      const gemRoll = Math.random();
      const gemThreshold = isDwarf ? node.gemChance * 2.5 : node.gemChance;
      if (gemRoll < gemThreshold) {
        const gemId = Math.random() > 0.5 ? 'gem_sapphire' : 'gem_ruby';
        const gemName = gemId === 'gem_sapphire' ? 'Gleaming Blue Sapphire' : 'Blazing Forge Ruby';
        this.callbacks.onInventoryAdd({
          id: gemId,
          name: gemName,
          type: 'gem',
          rarity: 'rare',
          description: 'A brilliant gem discovered while mining.',
          icon: gemId === 'gem_sapphire' ? '🔷' : '♦️',
          value: 60,
          quantity: 1,
        }, 1);
        this.vfx.addFloatingText(`RARE GEM UNEARTHED: ${gemName}!`, this.playerPos, '#facc15', true);
      }

      // Quest updates
      this.callbacks.onQuestUpdate('quest_veins_deep', 'mine_ores', 1);
    } else {
      this.vfx.addFloatingText(`MINING (${node.health}/${node.maxHealth})`, new THREE.Vector3(node.x, node.y + 1.0, node.z), '#94a3b8');
    }
  }

  public gainXp(amount: number) {
    this.stats.xp += amount;
    if (this.stats.xp >= this.stats.xpToNextLevel) {
      this.stats.level += 1;
      this.stats.xp -= this.stats.xpToNextLevel;
      this.stats.xpToNextLevel = Math.floor(this.stats.xpToNextLevel * 1.5);
      this.stats.attributePoints += 3;
      this.stats.skillPoints += 1;
      this.stats.maxHp += 20;
      this.stats.hp = this.stats.maxHp;
      this.stats.maxMana += 15;
      this.stats.mana = this.stats.maxMana;

      soundEngine.playLevelUp();
      this.vfx.triggerLevelUp(this.playerPos);
      this.vfx.addFloatingText(`LEVEL UP! REACHED LEVEL ${this.stats.level}!`, this.playerPos, '#facc15', true);
    }
    this.callbacks.onStatsChange(this.stats);
  }

  /**
   * Main Game Loop
   */
  private tick = (currentTime: number) => {
    if (this.isDestroyed) return;

    const delta = Math.min(0.08, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // 1. Player Movement & Physics
    this.updatePlayerMovement(delta);

    // 2. Parry Window & Combat Timers
    if (this.isParrying) {
      this.parryTimer -= delta;
      if (this.parryTimer <= 0) {
        this.isParrying = false;
        this.callbacks.onParryWindowStatus(false);
        const leftArm = this.playerGroup?.getObjectByName('LeftArm');
        if (leftArm) leftArm.rotation.x = 0;
      }
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    if (this.isAttacking) {
      this.attackAnimTimer -= delta;
      if (this.attackAnimTimer <= 0) {
        this.isAttacking = false;
        const rightArm = this.playerGroup?.getObjectByName('RightArm');
        if (rightArm) rightArm.rotation.x = 0;
      }
    }

    // 3. Enemy AI & Telegraph Attacks (Window for Player to Parry!)
    this.updateEnemiesAI(delta);

    // 4. Update Camera Orbit
    this.updateCamera();

    // 5. Update VFX Particles
    this.vfx.update(delta);

    // 6. Check Proximity Interaction Prompts
    this.checkInteractionPrompts();

    // 7. Passive Resource Regen
    if (this.stats.mana < this.stats.maxMana) {
      this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + delta * 5);
      this.callbacks.onStatsChange(this.stats);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.tick);
  };

  private updatePlayerMovement(delta: number) {
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.KeyW) moveZ += 1;
    if (this.keys.KeyS) moveZ -= 1;
    if (this.keys.KeyA) moveX += 1;
    if (this.keys.KeyD) moveX -= 1;

    let speed = 7.0;
    if (this.keys.ShiftLeft) speed = 12.0; // Sprint
    if (this.isStealth) speed = 4.0;       // Stealth crawl
    if (this.currentClass === 'elf') speed *= 1.25; // Elf Agility bonus

    if (moveX !== 0 || moveZ !== 0) {
      // Calculate movement relative to camera angle
      const forwardAngle = this.cameraAngleH;
      const moveAngle = Math.atan2(moveX, moveZ);
      const targetAngle = forwardAngle + moveAngle;

      this.playerRotation = targetAngle;
      if (this.playerGroup) {
        this.playerGroup.rotation.y = this.playerRotation;
      }

      const dx = Math.sin(targetAngle) * speed * delta;
      const dz = Math.cos(targetAngle) * speed * delta;

      this.playerPos.x += dx;
      this.playerPos.z += dz;

      // Leg animation
      const leftLeg = this.playerGroup?.children[0]?.children?.find((c) => c.position.x < -0.1);
      const rightLeg = this.playerGroup?.children[0]?.children?.find((c) => c.position.x > 0.1);
      if (leftLeg && rightLeg) {
        const legSwing = Math.sin(performance.now() * 0.012) * 0.45;
        leftLeg.rotation.x = legSwing;
        rightLeg.rotation.x = -legSwing;
      }
    }

    // Keep player grounded on terrain heightmap
    const terrainY = getTerrainHeight(this.playerPos.x, this.playerPos.z);
    this.playerPos.y = terrainY;

    if (this.playerGroup) {
      this.playerGroup.position.copy(this.playerPos);
    }

    // Cavern entry check for quest
    if (this.playerPos.y < -10) {
      this.callbacks.onQuestUpdate('quest_veins_deep', 'find_cavern', 1);
    }
  }

  private updateEnemiesAI(delta: number) {
    const playerDetectionRange = this.isStealth ? 4.5 : 18.0;

    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || enemy.state === 'dead') return;

      const distToPlayer = enemy.pos.distanceTo(this.playerPos);

      // Handle Stagger state (triggered by Parry!)
      if (enemy.state === 'staggered') {
        enemy.staggerTimer -= delta;
        enemy.mesh.rotation.z = Math.sin(performance.now() * 0.02) * 0.3; // wobbly dizzy stagger
        if (enemy.staggerTimer <= 0) {
          enemy.state = 'idle';
          enemy.mesh.rotation.z = 0;
        }
        return;
      }

      // Telegraph attack disc handling
      const telegraphDisc = enemy.mesh.getObjectByName('TelegraphDisc') as THREE.Mesh;

      if (distToPlayer <= playerDetectionRange) {
        // Chase player
        if (enemy.state !== 'telegraph') {
          enemy.state = 'chase';
          const dir = new THREE.Vector3().subVectors(this.playerPos, enemy.pos).normalize();
          const speed = enemy.type === 'boss_colossus' ? 2.5 : 3.5;
          enemy.pos.addScaledVector(dir, speed * delta);
          enemy.pos.y = getTerrainHeight(enemy.pos.x, enemy.pos.z);
          enemy.mesh.position.copy(enemy.pos);

          // Face player
          enemy.mesh.rotation.y = Math.atan2(dir.x, dir.z);
        }

        // Within attack range -> Start Attack Telegraph!
        const attackThreshold = enemy.type === 'boss_colossus' ? 5.5 : 2.5;
        if (distToPlayer <= attackThreshold) {
          enemy.attackCooldown -= delta;

          if (enemy.attackCooldown <= 0 && enemy.state !== 'telegraph') {
            // Start telegraph (red circle glows, enemy winds up weapon)
            enemy.state = 'telegraph';
            enemy.telegraphTimer = 0.75; // 0.75s windup warning window!
          }

          if (enemy.state === 'telegraph') {
            enemy.telegraphTimer -= delta;

            // Flash red telegraph ring on ground
            if (telegraphDisc) {
              const mat = telegraphDisc.material as THREE.MeshBasicMaterial;
              mat.opacity = 0.8;
            }

            // PARRY WINDOW IS OPEN RIGHT NOW!
            if (enemy.telegraphTimer <= 0) {
              // EXECUTE THE ENEMY STRIKE!
              if (telegraphDisc) {
                const mat = telegraphDisc.material as THREE.MeshBasicMaterial;
                mat.opacity = 0;
              }

              enemy.state = 'chase';
              enemy.attackCooldown = 2.0;

              // Check if player successfully PARRIED!
              if (this.isParrying) {
                // SUCCESSFUL PARRY!
                soundEngine.playParry();
                this.vfx.triggerParryBurst(this.playerPos);
                this.vfx.addFloatingText('PERFECT PARRY! ENEMY STAGGERED!', enemy.pos, '#facc15', true);

                enemy.state = 'staggered';
                enemy.staggerTimer = 2.5; // Staggered for 2.5s!

                // Fighter quest progress
                this.callbacks.onQuestUpdate('quest_blade_bulwark', 'parry_deflect', 1);
              } else {
                // Player took the hit!
                let incomingDmg = enemy.damage;
                const defense = this.equipment.chest?.defense || 10;
                incomingDmg = Math.max(5, incomingDmg - Math.floor(defense * 0.3));

                soundEngine.playHit();
                this.stats.hp = Math.max(0, this.stats.hp - incomingDmg);
                this.vfx.addFloatingText(`-${incomingDmg}`, this.playerPos, '#ef4444');
                this.callbacks.onStatsChange(this.stats);

                if (this.stats.hp <= 0) {
                  // Respawn at Sunfall Outpost
                  this.vfx.addFloatingText('FALLEN IN BATTLE - RESPAWNING AT SUNFALL', this.playerPos, '#ef4444', true);
                  this.playerPos.set(0, 0.2, 0);
                  this.stats.hp = this.stats.maxHp;
                  this.callbacks.onStatsChange(this.stats);
                }
              }
            }
          }
        }
      } else {
        if (telegraphDisc) {
          (telegraphDisc.material as THREE.MeshBasicMaterial).opacity = 0;
        }
        enemy.state = 'idle';
      }
    });
  }

  private updateCamera() {
    const cx = this.playerPos.x - Math.sin(this.cameraAngleH) * Math.cos(this.cameraAngleV) * this.cameraDistance;
    const cy = this.playerPos.y + Math.sin(this.cameraAngleV) * this.cameraDistance + 1.2;
    const cz = this.playerPos.z - Math.cos(this.cameraAngleH) * Math.cos(this.cameraAngleV) * this.cameraDistance;

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.4, this.playerPos.z);
  }

  private checkInteractionPrompts() {
    if (!this.worldData) return;

    // Check ore nodes
    for (const node of this.worldData.oreNodes) {
      if (Math.hypot(this.playerPos.x - node.x, this.playerPos.z - node.z) < 3.8) {
        this.callbacks.onInteractPrompt(`[E] Mine ${node.name}`);
        return;
      }
    }

    // Check NPCs
    for (const npc of this.worldData.npcs) {
      if (Math.hypot(this.playerPos.x - npc.x, this.playerPos.z - npc.z) < 3.8) {
        this.callbacks.onInteractPrompt(`[E] Speak with ${npc.name} (${npc.title})`);
        return;
      }
    }

    // Check Stone Bridge Quest Ledger
    if (Math.hypot(this.playerPos.x - 0, this.playerPos.z - 35) < 5.0) {
      this.callbacks.onInteractPrompt(`[E] Recover Stolen Trade Ledger`);
      return;
    }

    this.callbacks.onInteractPrompt(null);
  }

  public getPlayerPosition() {
    return this.playerPos;
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    this.vfx.dispose();
    this.renderer.dispose();
  }
}
