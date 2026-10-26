import * as THREE from 'three';
import { CharacterClass } from '../../types/game';

// Helper to create shared PBR materials with varied roughness/metalness
export function createPbrMaterial(params: {
  color: number | string;
  roughness?: number;
  metalness?: number;
  emissive?: number | string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  return new THREE.MeshStandardMaterial({
    color: params.color,
    roughness: params.roughness ?? 0.6,
    metalness: params.metalness ?? 0.1,
    emissive: params.emissive ?? 0x000000,
    emissiveIntensity: params.emissiveIntensity ?? 0,
    transparent: params.transparent ?? false,
    opacity: params.opacity ?? 1.0,
  });
}

/**
 * Creates 3-12 part procedural player character model based on chosen class
 */
export function createPlayerMesh(characterClass: CharacterClass): THREE.Group {
  const root = new THREE.Group();
  root.name = 'PlayerCharacter';

  // Base proportions adjust by class
  let scaleY = 1.0;
  let scaleXZ = 1.0;
  if (characterClass === 'dwarf') {
    scaleY = 0.75;
    scaleXZ = 1.25;
  } else if (characterClass === 'hobbit') {
    scaleY = 0.6;
    scaleXZ = 0.85;
  } else if (characterClass === 'elf') {
    scaleY = 1.1;
    scaleXZ = 0.9;
  }

  const modelGroup = new THREE.Group();
  modelGroup.scale.set(scaleXZ, scaleY, scaleXZ);

  // 1. Lower Body / Legs
  const legMat = createPbrMaterial({
    color: characterClass === 'warrior' ? 0x475569 : characterClass === 'wizard' ? 0x1e1b4b : 0x3f2e1e,
    roughness: characterClass === 'warrior' ? 0.35 : 0.8,
    metalness: characterClass === 'warrior' ? 0.75 : 0.05,
  });
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), legMat);
  leftLeg.position.set(-0.2, 0.35, 0);
  leftLeg.castShadow = true;
  modelGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8), legMat);
  rightLeg.position.set(0.2, 0.35, 0);
  rightLeg.castShadow = true;
  modelGroup.add(rightLeg);

  // Boots
  const bootMat = createPbrMaterial({ color: 0x1c1917, roughness: 0.9, metalness: 0.1 });
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.3), bootMat);
  leftBoot.position.set(-0.2, 0.08, 0.05);
  modelGroup.add(leftBoot);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.3), bootMat);
  rightBoot.position.set(0.2, 0.08, 0.05);
  modelGroup.add(rightBoot);

  // 2. Torso / Main Body Silhouette
  let torsoColor = 0x334155;
  let torsoRoughness = 0.5;
  let torsoMetalness = 0.2;
  if (characterClass === 'warrior') {
    torsoColor = 0x64748b; // Steel plate
    torsoRoughness = 0.25;
    torsoMetalness = 0.85;
  } else if (characterClass === 'wizard') {
    torsoColor = 0x312e81; // Arcane Robe
    torsoRoughness = 0.85;
    torsoMetalness = 0.05;
  } else if (characterClass === 'elf') {
    torsoColor = 0x166534; // Forest Tunic
    torsoRoughness = 0.7;
    torsoMetalness = 0.1;
  } else if (characterClass === 'dwarf') {
    torsoColor = 0x78350f; // Sturdy Leather & Iron
    torsoRoughness = 0.45;
    torsoMetalness = 0.6;
  } else if (characterClass === 'hobbit') {
    torsoColor = 0x854d0e; // Merchant / Rogue vest
    torsoRoughness = 0.8;
    torsoMetalness = 0.05;
  }

  const torsoMat = createPbrMaterial({ color: torsoColor, roughness: torsoRoughness, metalness: torsoMetalness });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.75, 0.36), torsoMat);
  torso.position.set(0, 1.05, 0);
  torso.castShadow = true;
  modelGroup.add(torso);

  // Belt & Buckle
  const beltMat = createPbrMaterial({ color: 0x1e293b, roughness: 0.8 });
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.4), beltMat);
  belt.position.set(0, 0.72, 0);
  modelGroup.add(belt);

  const buckleMat = createPbrMaterial({ color: 0xeab308, roughness: 0.2, metalness: 0.9 });
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.42), buckleMat);
  buckle.position.set(0, 0.72, 0.02);
  modelGroup.add(buckle);

  // 3. Head & Face
  const skinMat = createPbrMaterial({ color: 0xfbcfe8, roughness: 0.7 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), skinMat);
  head.position.set(0, 1.6, 0);
  head.castShadow = true;
  modelGroup.add(head);

  // Class-specific Headwear / Hair
  if (characterClass === 'wizard') {
    // Pointed Wizard Hat
    const hatMat = createPbrMaterial({ color: 0x1e1b4b, roughness: 0.85 });
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, 16), hatMat);
    hatBrim.position.set(0, 1.74, 0);
    modelGroup.add(hatBrim);

    const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 16), hatMat);
    hatCone.position.set(0, 2.1, -0.05);
    hatCone.rotation.x = -0.15;
    modelGroup.add(hatCone);

    // Glowing hat jewel
    const jewelMat = createPbrMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 });
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), jewelMat);
    jewel.position.set(0, 1.82, 0.3);
    modelGroup.add(jewel);
  } else if (characterClass === 'warrior') {
    // Steel Helm with Horns
    const helmMat = createPbrMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.9 });
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 0.48), helmMat);
    helm.position.set(0, 1.65, 0);
    modelGroup.add(helm);

    const hornMat = createPbrMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 });
    const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), hornMat);
    leftHorn.position.set(-0.28, 1.85, 0);
    leftHorn.rotation.z = 0.5;
    modelGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 8), hornMat);
    rightHorn.position.set(0.28, 1.85, 0);
    rightHorn.rotation.z = -0.5;
    modelGroup.add(rightHorn);
  } else if (characterClass === 'dwarf') {
    // Braided Dwarf Beard & Iron Sallet
    const beardMat = createPbrMaterial({ color: 0x9a3412, roughness: 0.9 });
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.55, 8), beardMat);
    beard.position.set(0, 1.35, 0.18);
    beard.rotation.x = 0.2;
    modelGroup.add(beard);

    const helmMat = createPbrMaterial({ color: 0x78716c, roughness: 0.3, metalness: 0.8 });
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.25, 12), helmMat);
    helm.position.set(0, 1.75, 0);
    modelGroup.add(helm);
  } else if (characterClass === 'elf') {
    // Circlet & Long Hair
    const hairMat = createPbrMaterial({ color: 0xfef08a, roughness: 0.7 });
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.45, 0.46), hairMat);
    hair.position.set(0, 1.65, -0.06);
    modelGroup.add(hair);

    const circletMat = createPbrMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });
    const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 16), circletMat);
    circlet.position.set(0, 1.68, 0);
    circlet.rotation.x = Math.PI / 2;
    modelGroup.add(circlet);
  } else if (characterClass === 'hobbit') {
    // Curly Hair & Cloak Hood
    const hairMat = createPbrMaterial({ color: 0x451a03, roughness: 0.85 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), hairMat);
    hair.position.set(0, 1.65, 0);
    modelGroup.add(hair);

    // Green Cloak
    const cloakMat = createPbrMaterial({ color: 0x14532d, roughness: 0.9 });
    const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.1), cloakMat);
    cloak.position.set(0, 1.0, -0.22);
    modelGroup.add(cloak);
  }

  // 4. Arms
  const armMat = torsoMat;
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.38, 1.35, 0);
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8), armMat);
  leftArm.position.set(0, -0.3, 0);
  leftArmGroup.add(leftArm);
  leftArmGroup.name = 'LeftArm';
  modelGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.38, 1.35, 0);
  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8), armMat);
  rightArm.position.set(0, -0.3, 0);
  rightArmGroup.add(rightArm);
  rightArmGroup.name = 'RightArm';
  modelGroup.add(rightArmGroup);

  // 5. Weapon and Offhand in Hands
  if (characterClass === 'warrior') {
    // Steel Sword
    const bladeMat = createPbrMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.9 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.03), bladeMat);
    blade.position.set(0, -0.6, 0.35);
    blade.rotation.x = Math.PI / 4;
    rightArmGroup.add(blade);

    // Kite Shield (parrying shield)
    const shieldMat = createPbrMaterial({ color: 0x1e3a8a, roughness: 0.3, metalness: 0.6 });
    const shieldBorderMat = createPbrMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
    const shieldGroup = new THREE.Group();
    shieldGroup.name = 'PlayerShield';
    const shieldBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.7, 0.06), shieldMat);
    const shieldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.74, 0.04), shieldBorderMat);
    shieldTrim.position.z = -0.02;
    shieldGroup.add(shieldBody, shieldTrim);
    shieldGroup.position.set(0, -0.35, 0.25);
    leftArmGroup.add(shieldGroup);
  } else if (characterClass === 'wizard') {
    // Arcane Staff with Glowing Crystal
    const woodMat = createPbrMaterial({ color: 0x5c3d24, roughness: 0.85 });
    const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.4, 8), woodMat);
    staffPole.position.set(0, -0.2, 0.25);
    rightArmGroup.add(staffPole);

    const orbMat = createPbrMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), orbMat);
    orb.position.set(0, 0.55, 0.25);
    rightArmGroup.add(orb);
  } else if (characterClass === 'dwarf') {
    // Master Pickaxe & Warhammer
    const ironMat = createPbrMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.85 });
    const handleMat = createPbrMaterial({ color: 0x451a03, roughness: 0.9 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), handleMat);
    handle.position.set(0, -0.4, 0.2);
    handle.rotation.x = Math.PI / 3;
    rightArmGroup.add(handle);

    // Pickaxe head
    const pickHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 6), ironMat);
    pickHead.position.set(0, -0.15, 0.6);
    pickHead.rotation.x = -Math.PI / 2;
    rightArmGroup.add(pickHead);
  } else if (characterClass === 'elf') {
    // Curved Elven Bow
    const bowMat = createPbrMaterial({ color: 0x854d0e, roughness: 0.6 });
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.03, 6, 12, Math.PI), bowMat);
    bow.position.set(0, -0.3, 0.2);
    bow.rotation.y = Math.PI / 2;
    leftArmGroup.add(bow);

    // Dagger in right hand
    const daggerMat = createPbrMaterial({ color: 0xcfd8dc, roughness: 0.1, metalness: 0.95 });
    const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.02), daggerMat);
    dagger.position.set(0, -0.4, 0.2);
    rightArmGroup.add(dagger);
  } else if (characterClass === 'hobbit') {
    // Dual Rogue Daggers
    const daggerMat = createPbrMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 });
    const d1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.02), daggerMat);
    d1.position.set(0, -0.4, 0.2);
    rightArmGroup.add(d1);

    const d2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.02), daggerMat);
    d2.position.set(0, -0.4, 0.2);
    leftArmGroup.add(d2);
  }

  root.add(modelGroup);
  return root;
}

/**
 * Creates 3-12 part procedural Enemy models
 */
export function createEnemyMesh(type: string): THREE.Group {
  const root = new THREE.Group();
  root.name = `Enemy_${type}`;

  if (type === 'goblin') {
    const skinMat = createPbrMaterial({ color: 0x4d7c0f, roughness: 0.7 });
    const leatherMat = createPbrMaterial({ color: 0x78350f, roughness: 0.85 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.3), leatherMat);
    body.position.set(0, 0.6, 0);
    body.castShadow = true;
    root.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
    head.position.set(0, 1.0, 0);
    root.add(head);

    // Big pointed ears
    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), skinMat);
    ear1.position.set(-0.25, 1.05, 0);
    ear1.rotation.z = 1.2;
    const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), skinMat);
    ear2.position.set(0.25, 1.05, 0);
    ear2.rotation.z = -1.2;
    root.add(ear1, ear2);

    // Spiked Club
    const clubMat = createPbrMaterial({ color: 0x3f2e1e, roughness: 0.9 });
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.65, 6), clubMat);
    club.position.set(0.35, 0.6, 0.2);
    club.rotation.x = Math.PI / 4;
    root.add(club);

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.2), leatherMat);
    legs.position.set(0, 0.2, 0);
    root.add(legs);
  } else if (type === 'skeleton') {
    const boneMat = createPbrMaterial({ color: 0xe2e8f0, roughness: 0.7, metalness: 0.1 });
    const rustMat = createPbrMaterial({ color: 0x9a3412, roughness: 0.5, metalness: 0.7 });

    // Ribcage & spine
    const ribcage = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.5, 8), boneMat);
    ribcage.position.set(0, 0.95, 0);
    ribcage.castShadow = true;
    root.add(ribcage);

    // Skull with glowing eyes
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.28, 0.26), boneMat);
    skull.position.set(0, 1.45, 0);
    root.add(skull);

    const eyeMat = createPbrMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 2.0 });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
    eye1.position.set(-0.06, 1.45, 0.14);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
    eye2.position.set(0.06, 1.45, 0.14);
    root.add(eye1, eye2);

    // Rusted Falchion
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.02), rustMat);
    sword.position.set(0.35, 0.7, 0.25);
    sword.rotation.x = Math.PI / 5;
    root.add(sword);

    // Legs
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 6), boneMat);
    leg1.position.set(-0.15, 0.35, 0);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 6), boneMat);
    leg2.position.set(0.15, 0.35, 0);
    root.add(leg1, leg2);
  } else if (type === 'cave_golem') {
    // Chiseled stone golem with glowing purple crystals
    const stoneMat = createPbrMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.2 });
    const crystalMat = createPbrMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 2.5 });

    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), stoneMat);
    torso.position.set(0, 1.1, 0);
    torso.castShadow = true;
    root.add(torso);

    // Embedded glowing crystals
    for (let i = 0; i < 3; i++) {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), crystalMat);
      crystal.position.set((i - 1) * 0.25, 1.1 + (i % 2) * 0.15, 0.5);
      root.add(crystal);
    }

    // Heavy Boulder Fists
    const fist1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), stoneMat);
    fist1.position.set(-0.7, 0.8, 0.2);
    const fist2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), stoneMat);
    fist2.position.set(0.7, 0.8, 0.2);
    root.add(fist1, fist2);

    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 6), stoneMat);
    legs.position.set(0, 0.3, 0);
    root.add(legs);
  } else if (type === 'dire_wolf') {
    const furMat = createPbrMaterial({ color: 0x1e293b, roughness: 0.9 });
    const eyeMat = createPbrMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.5 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.1), furMat);
    body.position.set(0, 0.6, 0);
    body.castShadow = true;
    root.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), furMat);
    head.position.set(0, 0.85, 0.6);
    root.add(head);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.3), furMat);
    snout.position.set(0, 0.78, 0.9);
    root.add(snout);

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
    eyeL.position.set(-0.12, 0.9, 0.75);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
    eyeR.position.set(0.12, 0.9, 0.75);
    root.add(eyeL, eyeR);

    // 4 legs
    const legMat = furMat;
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 6), legMat);
    l1.position.set(-0.2, 0.25, 0.35);
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 6), legMat);
    l2.position.set(0.2, 0.25, 0.35);
    const l3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 6), legMat);
    l3.position.set(-0.2, 0.25, -0.35);
    const l4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 6), legMat);
    l4.position.set(0.2, 0.25, -0.35);
    root.add(l1, l2, l3, l4);
  } else if (type === 'boss_colossus') {
    // Huge Runic Hollow Colossus
    root.scale.set(2.2, 2.2, 2.2);

    const darkPlateMat = createPbrMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 });
    const runicMat = createPbrMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 3.0 });
    const goldMat = createPbrMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.9 });

    // Colossal Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.8), darkPlateMat);
    torso.position.set(0, 1.8, 0);
    torso.castShadow = true;
    root.add(torso);

    // Runic Chest Heart Core
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 1), runicMat);
    core.position.set(0, 1.9, 0.42);
    root.add(core);

    // Crowned Helm
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), darkPlateMat);
    helm.position.set(0, 2.8, 0);
    root.add(helm);

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 0.25, 6), goldMat);
    crown.position.set(0, 3.2, 0);
    root.add(crown);

    // Giant Colossus Greatsword
    const greatsword = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 0.08), darkPlateMat);
    greatsword.position.set(1.0, 1.6, 0.5);
    greatsword.rotation.z = -0.2;
    root.add(greatsword);

    // Massive Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 1.2, 8), darkPlateMat);
    legL.position.set(-0.4, 0.6, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 1.2, 8), darkPlateMat);
    legR.position.set(0.4, 0.6, 0);
    root.add(legL, legR);
  }

  // Health bar above head (sprites/planes)
  const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
  const hpBarMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.12), hpBgMat);
  const hpBar = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.1), hpBarMat);
  hpBar.name = 'HpBarFill';
  hpBar.position.z = 0.01;

  const hpGroup = new THREE.Group();
  hpGroup.name = 'HpBarGroup';
  hpGroup.add(hpBg, hpBar);
  hpGroup.position.set(0, type === 'boss_colossus' ? 7.5 : 2.2, 0);
  root.add(hpGroup);

  // Telegraph circle for parrying (red glow disc on ground during wind-up)
  const telegraphMat = new THREE.MeshBasicMaterial({
    color: 0xff0033,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const telegraphDisc = new THREE.Mesh(new THREE.RingGeometry(0.3, 1.5, 32), telegraphMat);
  telegraphDisc.rotation.x = -Math.PI / 2;
  telegraphDisc.position.y = 0.05;
  telegraphDisc.name = 'TelegraphDisc';
  root.add(telegraphDisc);

  return root;
}

/**
 * Creates 3-12 part procedural NPC models
 */
export function createNpcMesh(role: string): THREE.Group {
  const root = new THREE.Group();
  root.name = `NPC_${role}`;

  let robeColor = 0x1e3a8a;
  if (role === 'blacksmith') robeColor = 0x78350f;
  else if (role === 'merchant') robeColor = 0x15803d;
  else if (role === 'trainer') robeColor = 0x475569;

  const mat = createPbrMaterial({ color: robeColor, roughness: 0.8 });
  const skin = createPbrMaterial({ color: 0xfbcfe8, roughness: 0.7 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 1.1, 10), mat);
  body.position.set(0, 0.75, 0);
  body.castShadow = true;
  root.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), skin);
  head.position.set(0, 1.5, 0);
  root.add(head);

  if (role === 'blacksmith') {
    // Apron + Blacksmith Hammer
    const apronMat = createPbrMaterial({ color: 0x451a03, roughness: 0.9 });
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.1), apronMat);
    apron.position.set(0, 0.7, 0.18);
    root.add(apron);

    const hammerHeadMat = createPbrMaterial({ color: 0x64748b, roughness: 0.25, metalness: 0.8 });
    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.3), hammerHeadMat);
    hammer.position.set(0.4, 0.6, 0.3);
    root.add(hammer);
  } else if (role === 'quest') {
    // Elder Cedric's Long White Beard & Wizard Staff
    const beardMat = createPbrMaterial({ color: 0xf8fafc, roughness: 0.95 });
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), beardMat);
    beard.position.set(0, 1.3, 0.15);
    beard.rotation.x = 0.2;
    root.add(beard);
  }

  // Floating quest / talk indicator icon
  const iconMat = createPbrMaterial({
    color: role === 'quest' ? 0xfacc15 : 0x38bdf8,
    emissive: role === 'quest' ? 0xeab308 : 0x0284c7,
    emissiveIntensity: 1.8,
  });
  const indicator = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), iconMat);
  indicator.position.set(0, 2.1, 0);
  indicator.name = 'NpcIndicator';
  root.add(indicator);

  return root;
}
