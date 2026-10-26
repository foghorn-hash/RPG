import * as THREE from 'three';
import { createPbrMaterial } from './characterModels';
import { OreNodeData, NPCData } from '../../types/game';

/**
 * Procedural heightmap calculation for the open world
 */
export function getTerrainHeight(x: number, z: number): number {
  // Check if player is inside the Subterranean Cavern zone
  // Cavern entry is around x: -60 to -40, z: -80 to -120
  const caveDist = Math.hypot(x - (-50), z - (-100));
  if (caveDist < 35) {
    // Smooth ramp descending down into deep cavern floor
    const factor = Math.min(1, Math.max(0, (caveDist - 10) / 25));
    const surfaceH = 2.0;
    const cavernFloorH = -15.0;
    return cavernFloorH + factor * (surfaceH - cavernFloorH);
  }

  // Outpost settlement is flat
  const outpostDist = Math.hypot(x, z);
  if (outpostDist < 25) {
    return 0.2;
  }

  // Rolling terrain outside
  const h1 = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3.5;
  const h2 = Math.sin(x * 0.09 + 1.2) * Math.cos(z * 0.08) * 1.5;

  // Mountain boundaries
  const borderDist = Math.hypot(x, z);
  let mountainBorder = 0;
  if (borderDist > 110) {
    mountainBorder = Math.pow((borderDist - 110) * 0.4, 1.8);
  }

  return Math.max(-0.5, h1 + h2 + mountainBorder);
}

export interface WorldBuildResult {
  terrainMesh: THREE.Mesh;
  oreNodes: OreNodeData[];
  oreMeshes: Map<string, THREE.Group>;
  npcs: NPCData[];
  npcMeshes: Map<string, THREE.Group>;
  cavernEntranceCoords: { x: number; y: number; z: number };
  waterMesh?: THREE.Mesh;
}

/**
 * Builds the complete 3D open world with Outpost, Forest, Subterranean Cavern, and Runic Ruins
 */
export function buildOpenWorld(scene: THREE.Scene): WorldBuildResult {
  // 1. Terrain Buffer Geometry
  const terrainSize = 280;
  const terrainSegments = 120;
  const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
  terrainGeo.rotateX(-Math.PI / 2);

  const posAttr = terrainGeo.attributes.position;
  const vertex = new THREE.Vector3();
  const colors: number[] = [];
  const colorObj = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i);
    const h = getTerrainHeight(vertex.x, vertex.z);
    posAttr.setY(i, h);

    // Color grading based on height and zone
    if (h < -5) {
      // Deep subterranean cavern stone
      colorObj.setHex(0x1e293b);
    } else if (Math.hypot(vertex.x, vertex.z) < 22) {
      // Outpost dirt / packed gravel
      colorObj.setHex(0x785338);
    } else if (h > 12) {
      // Mountain snow / slate rock
      colorObj.setHex(0x94a3b8);
    } else {
      // Verdant lush meadow
      const variation = (Math.sin(vertex.x * 0.2) + Math.cos(vertex.z * 0.2)) * 0.05;
      colorObj.setRGB(0.18 + variation, 0.45 + variation, 0.16 + variation);
    }

    colors.push(colorObj.r, colorObj.g, colorObj.b);
  }

  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  terrainGeo.computeVertexNormals();

  const terrainMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.receiveShadow = true;
  terrainMesh.name = 'WorldTerrain';
  scene.add(terrainMesh);

  // 2. Water Stream in Forest
  const waterGeo = new THREE.PlaneGeometry(240, 24);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.75,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.set(0, 0.05, 35);
  scene.add(waterMesh);

  // Stone Bridge crossing the water stream
  const bridgeMat = createPbrMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.3 });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 30), bridgeMat);
  bridge.position.set(0, 0.8, 35);
  bridge.castShadow = true;
  bridge.receiveShadow = true;
  scene.add(bridge);

  // 3. Multi-Part Trees in the Forest (Group of 3-12 parts)
  const treeGroup = new THREE.Group();
  treeGroup.name = 'ForestTrees';

  const trunkMat = createPbrMaterial({ color: 0x451a03, roughness: 0.9 });
  const foliageMat1 = createPbrMaterial({ color: 0x166534, roughness: 0.8 });
  const foliageMat2 = createPbrMaterial({ color: 0x15803d, roughness: 0.85 });

  // Place trees in random natural clusters avoiding the outpost center and cavern
  const treePositions: [number, number][] = [];
  for (let i = 0; i < 90; i++) {
    const angle = (i / 90) * Math.PI * 2 + Math.sin(i * 3) * 0.5;
    const r = 26 + (i % 7) * 9 + Math.cos(i) * 8;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r;

    // Skip cavern pit area
    if (Math.hypot(tx - (-50), tz - (-100)) < 30) continue;
    // Skip water stream unless at bridge
    if (Math.abs(tz - 35) < 10 && Math.abs(tx) > 5) continue;

    treePositions.push([tx, tz]);
  }

  treePositions.forEach(([tx, tz], idx) => {
    const ty = getTerrainHeight(tx, tz);
    const tree = new THREE.Group();
    tree.position.set(tx, ty, tz);

    const trunkH = 2.5 + (idx % 3) * 0.8;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, trunkH, 8), trunkMat);
    trunk.position.set(0, trunkH / 2, 0);
    trunk.castShadow = true;
    tree.add(trunk);

    // Multi-tier foliage canopies
    const mat = idx % 2 === 0 ? foliageMat1 : foliageMat2;
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.2, 7), mat);
    c1.position.set(0, trunkH + 0.6, 0);
    c1.castShadow = true;

    const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 7), mat);
    c2.position.set(0, trunkH + 1.6, 0);
    c2.castShadow = true;

    const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 7), mat);
    c3.position.set(0, trunkH + 2.4, 0);
    c3.castShadow = true;

    tree.add(c1, c2, c3);
    treeGroup.add(tree);
  });
  scene.add(treeGroup);

  // 4. Outpost Settlement Buildings & Blacksmith Forge
  const outpostGroup = new THREE.Group();
  outpostGroup.name = 'OutpostSettlement';

  // Blacksmith Forge & Anvil
  const forgeStoneMat = createPbrMaterial({ color: 0x334155, roughness: 0.8, metalness: 0.2 });
  const coalsMat = createPbrMaterial({ color: 0xef4444, emissive: 0xf97316, emissiveIntensity: 2.2 });
  const ironAnvilMat = createPbrMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.9 });

  const forgeStructure = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 3.5), forgeStoneMat);
  forgeStructure.position.set(10, 1.6, -10);
  forgeStructure.castShadow = true;
  outpostGroup.add(forgeStructure);

  const forgeChimney = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.5, 8), forgeStoneMat);
  forgeChimney.position.set(11, 4.0, -10);
  outpostGroup.add(forgeChimney);

  const coals = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.2), coalsMat);
  coals.position.set(8.5, 1.2, -10);
  outpostGroup.add(coals);

  // Anvil
  const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.5), ironAnvilMat);
  anvil.position.set(6.8, 0.4, -9.5);
  anvil.castShadow = true;
  outpostGroup.add(anvil);

  // Village Campfire in center
  const woodLogMat = createPbrMaterial({ color: 0x3f2e1e, roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 6), woodLogMat);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i * Math.PI) / 4;
    log.position.set(0, 0.1, 0);
    outpostGroup.add(log);
  }
  const fireFlame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 8), coalsMat);
  fireFlame.position.set(0, 0.5, 0);
  outpostGroup.add(fireFlame);

  // Training Arena Dummy
  const dummyWood = createPbrMaterial({ color: 0xb45309, roughness: 0.7 });
  const dummyPost = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.8, 8), dummyWood);
  dummyPost.position.set(-8, 0.9, 8);
  const dummyBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.25), dummyWood);
  dummyBar.position.set(-8, 1.4, 8);
  outpostGroup.add(dummyPost, dummyBar);

  scene.add(outpostGroup);

  // 5. Subterranean Cavern & Cavern Entrance Arch
  // Rocky archway over cave entrance at (-50, -100)
  const caveArchMat = createPbrMaterial({ color: 0x1e293b, roughness: 0.95 });
  const caveArchL = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 10, 8), caveArchMat);
  caveArchL.position.set(-58, 4, -80);
  const caveArchR = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 10, 8), caveArchMat);
  caveArchR.position.set(-42, 4, -80);
  const caveKeystone = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 6), caveArchMat);
  caveKeystone.position.set(-50, 9, -80);
  scene.add(caveArchL, caveArchR, caveKeystone);

  // In the deep cavern: Stalactites, Bioluminescent Giant Crystals & Mushrooms
  const cavernGroup = new THREE.Group();
  cavernGroup.name = 'SubterraneanCavernDetails';

  const crystalMats = [
    createPbrMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.5 }), // Cyan Crystal
    createPbrMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 2.8 }), // Purple Mithril Crystal
    createPbrMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 2.0 }), // Glowing Emerald
    createPbrMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 2.2 }), // Radiant Gold
  ];

  const caveNodes = [
    { x: -52, z: -95, y: -14.5, matIdx: 1 },
    { x: -44, z: -108, y: -15.0, matIdx: 0 },
    { x: -62, z: -105, y: -14.8, matIdx: 2 },
    { x: -55, z: -116, y: -15.0, matIdx: 3 },
    { x: -38, z: -98, y: -14.2, matIdx: 1 },
  ];

  caveNodes.forEach((node, i) => {
    // Cluster of 4-6 crystals
    for (let c = 0; c < 5; c++) {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.45 + (c % 3) * 0.25, 0), crystalMats[node.matIdx]);
      crystal.position.set(
        node.x + Math.sin(c * 1.5) * 1.2,
        node.y + 0.6 + (c % 2) * 0.4,
        node.z + Math.cos(c * 1.5) * 1.2
      );
      crystal.rotation.set(0.2 * c, 0.4 * c, 0.1 * c);
      crystal.scale.set(0.7, 1.8, 0.7);
      cavernGroup.add(crystal);
    }
  });
  scene.add(cavernGroup);

  // 6. Ancient Sunken Ruins (Colossus Boss Arena)
  const ruinsGroup = new THREE.Group();
  ruinsGroup.name = 'AncientRuins';
  const runePillarMat = createPbrMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 });
  const runicGlowMat = createPbrMaterial({ color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 2.0 });

  // 6 surrounding runic pillars in circle at (x: 65, z: -65)
  const bossArenaCenter = { x: 65, z: -65 };
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const px = bossArenaCenter.x + Math.cos(angle) * 16;
    const pz = bossArenaCenter.z + Math.sin(angle) * 16;
    const py = getTerrainHeight(px, pz);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 7, 8), runePillarMat);
    pillar.position.set(px, py + 3.5, pz);
    pillar.castShadow = true;
    ruinsGroup.add(pillar);

    // Glowing runic ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.1, 8, 16), runicGlowMat);
    ring.position.set(px, py + 4.5, pz);
    ring.rotation.x = Math.PI / 2;
    ruinsGroup.add(ring);
  }

  // Ancient Altar at center
  const altarPy = getTerrainHeight(bossArenaCenter.x, bossArenaCenter.z);
  const altar = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 1.2, 12), runePillarMat);
  altar.position.set(bossArenaCenter.x, altarPy + 0.6, bossArenaCenter.z);
  ruinsGroup.add(altar);
  scene.add(ruinsGroup);

  // 7. Interactive Ore Nodes in the World & Caverns (for Mining mechanics)
  const oreNodes: OreNodeData[] = [
    // Outpost & Forest Surface Veins (Iron & Quartz)
    { id: 'ore_iron_1', name: 'Iron Vein', oreType: 'iron', x: -14, y: getTerrainHeight(-14, 18), z: 18, health: 3, maxHealth: 3, respawnTimer: 0, gemChance: 0.1 },
    { id: 'ore_iron_2', name: 'Iron Vein', oreType: 'iron', x: 22, y: getTerrainHeight(22, -18), z: -18, health: 3, maxHealth: 3, respawnTimer: 0, gemChance: 0.1 },
    { id: 'ore_crystal_1', name: 'Quartz Crystal Spire', oreType: 'crystal', x: -32, y: getTerrainHeight(-32, 28), z: 28, health: 4, maxHealth: 4, respawnTimer: 0, gemChance: 0.4 },

    // Deep Subterranean Cavern Veins (Mithril, Gold, Adamantite) - Dwarf & Hobbit hotspot
    { id: 'ore_mithril_1', name: 'Deep Mithril Deposit', oreType: 'mithril', x: -46, y: -14.8, z: -98, health: 5, maxHealth: 5, respawnTimer: 0, gemChance: 0.6 },
    { id: 'ore_mithril_2', name: 'Deep Mithril Deposit', oreType: 'mithril', x: -58, y: -14.7, z: -108, health: 5, maxHealth: 5, respawnTimer: 0, gemChance: 0.6 },
    { id: 'ore_gold_1', name: 'Sun-Gold Vein', oreType: 'gold', x: -42, y: -14.6, z: -112, health: 4, maxHealth: 4, respawnTimer: 0, gemChance: 0.5 },
    { id: 'ore_adamantite_1', name: 'Abyssal Adamantite', oreType: 'adamantite', x: -62, y: -14.9, z: -118, health: 6, maxHealth: 6, respawnTimer: 0, gemChance: 0.8 },

    // Ruins perimeter vein
    { id: 'ore_gold_2', name: 'Forgotten Gold Vein', oreType: 'gold', x: 50, y: getTerrainHeight(50, -48), z: -48, health: 4, maxHealth: 4, respawnTimer: 0, gemChance: 0.5 },
  ];

  const oreMeshes = new Map<string, THREE.Group>();
  oreNodes.forEach((node) => {
    const oreGroup = new THREE.Group();
    oreGroup.name = `OreNode_${node.id}`;
    oreGroup.position.set(node.x, node.y, node.z);

    // Dark rock host
    const rockMat = createPbrMaterial({ color: 0x334155, roughness: 0.95 });
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), rockMat);
    rock.castShadow = true;
    oreGroup.add(rock);

    // Vein crystal color based on ore type
    let oreColor = 0x94a3b8;
    let emissiveColor = 0x64748b;
    let emissiveInt = 0.5;
    if (node.oreType === 'mithril') {
      oreColor = 0x60a5fa;
      emissiveColor = 0x2563eb;
      emissiveInt = 2.0;
    } else if (node.oreType === 'gold') {
      oreColor = 0xfacc15;
      emissiveColor = 0xd97706;
      emissiveInt = 1.8;
    } else if (node.oreType === 'adamantite') {
      oreColor = 0xf43f5e;
      emissiveColor = 0xbe123c;
      emissiveInt = 2.5;
    } else if (node.oreType === 'crystal') {
      oreColor = 0x38bdf8;
      emissiveColor = 0x0284c7;
      emissiveInt = 2.0;
    }

    const crystalMat = createPbrMaterial({
      color: oreColor,
      roughness: 0.2,
      metalness: 0.8,
      emissive: emissiveColor,
      emissiveIntensity: emissiveInt,
    });

    for (let c = 0; c < 5; c++) {
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), crystalMat);
      gem.position.set(
        Math.sin(c * 1.3) * 0.65,
        0.3 + (c % 3) * 0.25,
        Math.cos(c * 1.3) * 0.65
      );
      gem.rotation.set(c * 0.5, c * 0.3, 0);
      oreGroup.add(gem);
    }

    scene.add(oreGroup);
    oreMeshes.set(node.id, oreGroup);
  });

  // 8. NPCs in the World
  const npcs: NPCData[] = [
    {
      id: 'npc_cedric',
      name: 'Elder Cedric',
      title: 'Keeper of Sunfall Outpost',
      role: 'quest',
      x: 0,
      y: getTerrainHeight(0, -6),
      z: -6,
      dialogue: [
        'Greetings, adventurer! Dark shadows stir in the Whispering Forest and the hollow ruins to the east.',
        'Wizards invoke arcane powers, Elves move unseen with unmatched agility, and Warriors defend the realm with heavy strikes and masterful parrying.',
        'Speak with Master Torvin at the forge if you seek mining and crafting, or seek Pip for hidden cavern routes.',
      ],
    },
    {
      id: 'npc_torvin',
      name: 'Master Torvin',
      title: 'Grand Dwarven Blacksmith',
      role: 'blacksmith',
      x: 6.0,
      y: getTerrainHeight(6, -8),
      z: -8,
      dialogue: [
        'By my beard! An adventurer with steel in their heart!',
        'Dwarves have unmatched eyes for ore prospecting and hands made for the forge! Bring me raw Mithril and Gold from the deep caverns and I shall hone your blades to perfection.',
      ],
    },
    {
      id: 'npc_barnaby',
      name: 'Barnaby Swiftfoot',
      title: 'Hobbit Cavern Merchant',
      role: 'merchant',
      x: -5.5,
      y: getTerrainHeight(-5.5, -4),
      z: -4,
      dialogue: [
        'Well met, friend! Looking for bargains or cavern supplies? Hobbits know all the quiet passages in the grotto.',
        'If you move in stealth, the beasts will walk right past you! And I give the finest trading rates this side of the mountain.',
      ],
    },
    {
      id: 'npc_lyra',
      name: 'Ranger Lyra',
      title: 'Elven Blademaster & Scout',
      role: 'trainer',
      x: -7,
      y: getTerrainHeight(-7, 6),
      z: 6,
      dialogue: [
        'Precision and timing determine life or death. When an enemy winds up their strike, raise your guard at that exact instant to deflect their blade!',
        'A perfect parry leaves the fiercest fiend staggered and helpless before your blade.',
      ],
    },
  ];

  const npcMeshes = new Map<string, THREE.Group>();
  // We'll attach the meshes during characterModels assembly in GameEngine

  return {
    terrainMesh,
    oreNodes,
    oreMeshes,
    npcs,
    npcMeshes,
    cavernEntranceCoords: { x: -50, y: -15, z: -100 },
    waterMesh,
  };
}
