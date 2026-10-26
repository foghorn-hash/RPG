import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/three/GameEngine';
import { CharacterClass, CharacterStats, Equipment, Item, Quest, CraftingRecipe, NPCData } from './types/game';
import { INITIAL_ITEMS, CRAFTING_RECIPES } from './game/itemsData';
import { INITIAL_QUESTS, SKILL_NODES } from './game/progressionData';
import { HUD } from './components/HUD';
import { QuestModal } from './components/QuestModal';
import { CharacterModal } from './components/CharacterModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { InventoryModal } from './components/InventoryModal';
import { CraftingModal } from './components/CraftingModal';
import { ClassSelectModal } from './components/ClassSelectModal';
import { WorldMapModal } from './components/WorldMapModal';
import { DialogueModal } from './components/DialogueModal';
import { WordPressPluginModal } from './components/WordPressPluginModal';
import { soundEngine } from './audio/soundEngine';

const DEFAULT_STATS: CharacterStats = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  attributePoints: 3,
  skillPoints: 1,
  strength: 14,
  agility: 10,
  intelligence: 8,
  endurance: 12,
  luck: 9,
  hp: 120,
  maxHp: 120,
  mana: 80,
  maxMana: 80,
  stamina: 100,
  maxStamina: 100,
  gold: 60,
  miningMastery: 1,
  stealthLevel: 1,
  craftingMastery: 1,
};

const DEFAULT_EQUIPMENT: Equipment = {
  mainHand: INITIAL_ITEMS.sword_iron,
  offHand: INITIAL_ITEMS.shield_iron,
  chest: INITIAL_ITEMS.armor_plate,
  head: null,
  accessory: null,
};

const DEFAULT_INVENTORY: Item[] = [
  { ...INITIAL_ITEMS.potion_health, quantity: 3 },
  { ...INITIAL_ITEMS.potion_mana, quantity: 2 },
  { ...INITIAL_ITEMS.ore_iron, quantity: 2 },
  { ...INITIAL_ITEMS.pickaxe_dwarf },
  { ...INITIAL_ITEMS.staff_arcane },
  { ...INITIAL_ITEMS.bow_elven },
  { ...INITIAL_ITEMS.dagger_hobbit },
];

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Core Game State
  const [characterClass, setCharacterClass] = useState<CharacterClass>('warrior');
  const [stats, setStats] = useState<CharacterStats>(DEFAULT_STATS);
  const [equipment, setEquipment] = useState<Equipment>(DEFAULT_EQUIPMENT);
  const [inventory, setInventory] = useState<Item[]>(DEFAULT_INVENTORY);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activeQuestId, setActiveQuestId] = useState<string>('quest_blade_bulwark');

  // Real-time HUD states
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [isStealth, setIsStealth] = useState<boolean>(false);
  const [isParryActive, setIsParryActive] = useState<boolean>(false);
  const [bossHp, setBossHp] = useState<{ hp: number; maxHp: number; name: string } | null>(null);
  const [playerCoord, setPlayerCoord] = useState<{ x: number; z: number }>({ x: 0, z: 0 });

  // Modal Dialogs
  const [activeModal, setActiveModal] = useState<
    'quests' | 'character' | 'skills' | 'inventory' | 'forge' | 'map' | 'classSelect' | 'dialogue' | 'wpPlugin' | null
  >(null);
  const [activeNpc, setActiveNpc] = useState<NPCData | null>(null);

  // Load saved progression from localStorage if available
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('eldoria_stats');
      const savedClass = localStorage.getItem('eldoria_class');
      const savedEquip = localStorage.getItem('eldoria_equipment');
      const savedInv = localStorage.getItem('eldoria_inventory');
      const savedQuests = localStorage.getItem('eldoria_quests');

      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedClass) setCharacterClass(JSON.parse(savedClass));
      if (savedEquip) setEquipment(JSON.parse(savedEquip));
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedQuests) setQuests(JSON.parse(savedQuests));
    } catch {
      // LocalStorage disabled or fresh session
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eldoria_stats', JSON.stringify(stats));
      localStorage.setItem('eldoria_class', JSON.stringify(characterClass));
      localStorage.setItem('eldoria_equipment', JSON.stringify(equipment));
      localStorage.setItem('eldoria_inventory', JSON.stringify(inventory));
      localStorage.setItem('eldoria_quests', JSON.stringify(quests));
    } catch {
      // Ignore
    }
  }, [stats, characterClass, equipment, inventory, quests]);

  // Handle Quest Objectives
  const handleQuestUpdate = useCallback((questId: string, objectiveId: string, amount: number) => {
    setQuests((prevQuests) => {
      let questJustFinished = false;

      const nextQuests = prevQuests.map((q) => {
        if (q.id !== questId) return q;

        const updatedObjectives = q.objectives.map((obj) => {
          if (obj.id !== objectiveId) return obj;
          const nextVal = Math.min(obj.required, obj.current + amount);
          const completed = nextVal >= obj.required;
          return { ...obj, current: nextVal, completed };
        });

        const allCompleted = updatedObjectives.every((o) => o.completed);
        if (allCompleted && q.status !== 'completed') {
          questJustFinished = true;
          return { ...q, objectives: updatedObjectives, status: 'completed' as const };
        }

        return { ...q, objectives: updatedObjectives };
      });

      if (questJustFinished) {
        const targetQ = prevQuests.find((q) => q.id === questId);
        if (targetQ) {
          soundEngine.playQuestComplete();
          setStats((prev) => ({
            ...prev,
            xp: prev.xp + targetQ.rewards.xp,
            gold: prev.gold + targetQ.rewards.gold,
          }));
        }
      }

      return nextQuests;
    });
  }, []);

  // Handle Inventory Item Add
  const handleInventoryAdd = useCallback((item: Item, quantity: number = 1) => {
    setInventory((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing && (item.type === 'ore' || item.type === 'potion' || item.type === 'gem')) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: (i.quantity || 1) + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  // Handle NPC Dialogue Open
  const handleOpenNpcDialogue = useCallback((npcId: string) => {
    const npcList: Record<string, NPCData> = {
      npc_cedric: {
        id: 'npc_cedric',
        name: 'Elder Cedric',
        title: 'Keeper of Sunfall Outpost',
        role: 'quest',
        x: 0,
        y: 0,
        z: -6,
        dialogue: [
          'Welcome to Sunfall Outpost, brave champion. The realm is on the precipice of ruin!',
          'Wizards must harness primal spellcraft, Elves their agile grace, and Warriors must master the art of the timed parry to turn back the darkness.',
          'Explore the Subterranean Cavern to the north for Mithril, or prepare your blades for the Hollow Colossus at the ancient sunken ruins to the east.',
        ],
      },
      npc_torvin: {
        id: 'npc_torvin',
        name: 'Master Torvin',
        title: 'Grand Dwarven Blacksmith',
        role: 'blacksmith',
        x: 6,
        y: 0,
        z: -8,
        dialogue: [
          'Hail, traveler! Need your steel quenched in the fires of the forge?',
          'Dwarves hold the secret of working deep Mithril and Adamantite ore. Bring raw veins from the deep grotto and I will craft weapons that shatter stone!',
        ],
      },
      npc_barnaby: {
        id: 'npc_barnaby',
        name: 'Barnaby Swiftfoot',
        title: 'Hobbit Cavern Merchant',
        role: 'merchant',
        x: -5.5,
        y: 0,
        z: -4,
        dialogue: [
          'Looking for trade, traveler? Hobbits know every quiet nook in the cavern.',
          'Crouch into stealth to slip past beast dens undetected. And I sell the finest restorative elixirs in the land!',
        ],
      },
      npc_lyra: {
        id: 'npc_lyra',
        name: 'Ranger Lyra',
        title: 'Elven Blademaster & Scout',
        role: 'trainer',
        x: -7,
        y: 0,
        z: 6,
        dialogue: [
          'Listen closely to the wind. Combat is not merely about strength—it is about timing.',
          'When an enemy winds up their attack and the red ring warns of incoming danger, raise your shield or blade at that precise heartbeat!',
          'A successful parry deflects 100% of the damage and leaves your enemy staggered, ripe for a devastating riposte.',
        ],
      },
    };

    const targetNpc = npcList[npcId];
    if (targetNpc) {
      setActiveNpc(targetNpc);
      setActiveModal('dialogue');
    }
  }, []);

  // Initialize Three.js Game Engine once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(
      mountRef.current,
      stats,
      characterClass,
      equipment,
      {
        onStatsChange: (newStats) => setStats({ ...newStats }),
        onInventoryAdd: handleInventoryAdd,
        onQuestUpdate: handleQuestUpdate,
        onInteractPrompt: (prompt) => setInteractPrompt(prompt),
        onOpenNpcDialogue: handleOpenNpcDialogue,
        onStealthChange: (stealth) => setIsStealth(stealth),
        onParryWindowStatus: (active) => setIsParryActive(active),
        onBossHpUpdate: (hp, maxHp, name) => setBossHp({ hp, maxHp, name }),
      }
    );

    engineRef.current = engine;

    // Interval to poll player coordinates for map
    const coordInterval = setInterval(() => {
      if (engineRef.current) {
        const p = engineRef.current.getPlayerPosition();
        setPlayerCoord({ x: p.x, z: p.z });
      }
    }, 250);

    return () => {
      clearInterval(coordInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run once

  // Sync class changes to engine
  const handleSelectClass = (newClass: CharacterClass) => {
    setCharacterClass(newClass);
    if (engineRef.current) {
      engineRef.current.setCharacterClass(newClass);
    }

    // Adjust starter equipment flavor by class
    let newWeapon = equipment.mainHand;
    let newArmor = equipment.chest;

    if (newClass === 'wizard') {
      newWeapon = INITIAL_ITEMS.staff_arcane;
      newArmor = INITIAL_ITEMS.robe_wizard;
    } else if (newClass === 'elf') {
      newWeapon = INITIAL_ITEMS.bow_elven;
      newArmor = INITIAL_ITEMS.cloak_elven;
    } else if (newClass === 'warrior') {
      newWeapon = INITIAL_ITEMS.sword_iron;
      newArmor = INITIAL_ITEMS.armor_plate;
    } else if (newClass === 'dwarf') {
      newWeapon = INITIAL_ITEMS.pickaxe_dwarf;
      newArmor = INITIAL_ITEMS.armor_plate;
    } else if (newClass === 'hobbit') {
      newWeapon = INITIAL_ITEMS.dagger_hobbit;
      newArmor = INITIAL_ITEMS.cloak_elven;
    }

    const updatedEquip: Equipment = {
      ...equipment,
      mainHand: newWeapon,
      chest: newArmor,
    };
    setEquipment(updatedEquip);
    if (engineRef.current) {
      engineRef.current.updateEquipment(updatedEquip);
    }

    setActiveModal(null);
  };

  // Keyboard Shortcuts for Modals
  useEffect(() => {
    const handleKeyNav = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyJ') {
        setActiveModal((m) => (m === 'quests' ? null : 'quests'));
      } else if (e.code === 'KeyM') {
        setActiveModal((m) => (m === 'map' ? null : 'map'));
      } else if (e.code === 'KeyI') {
        setActiveModal((m) => (m === 'inventory' ? null : 'inventory'));
      } else if (e.code === 'KeyK') {
        setActiveModal((m) => (m === 'skills' ? null : 'skills'));
      } else if (e.code === 'KeyH') {
        setActiveModal((m) => (m === 'classSelect' ? null : 'classSelect'));
      } else if (e.code === 'KeyP') {
        setActiveModal((m) => (m === 'wpPlugin' ? null : 'wpPlugin'));
      } else if (e.code === 'Escape') {
        setActiveModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, []);

  // Attribute allocation
  const handleAllocateAttribute = (attr: 'strength' | 'agility' | 'intelligence' | 'endurance' | 'luck') => {
    if (stats.attributePoints <= 0) return;

    setStats((prev) => {
      const next = {
        ...prev,
        attributePoints: prev.attributePoints - 1,
        [attr]: prev[attr] + 1,
      };

      if (attr === 'endurance') {
        next.maxHp += 15;
        next.hp += 15;
      } else if (attr === 'intelligence') {
        next.maxMana += 12;
        next.mana += 12;
      }
      if (engineRef.current) {
        engineRef.current.updateStats(next);
      }
      return next;
    });
  };

  // Skill unlock
  const handleUnlockSkill = (skillId: string) => {
    if (stats.skillPoints <= 0) return;

    const classSkills = SKILL_NODES[characterClass];
    const skill = classSkills.find((s) => s.id === skillId);
    if (!skill || skill.unlocked) return;

    skill.unlocked = true;
    setStats((prev) => ({
      ...prev,
      skillPoints: prev.skillPoints - 1,
    }));
  };

  // Equip item
  const handleEquipItem = (item: Item) => {
    setEquipment((prev) => {
      const next = { ...prev };
      if (item.type === 'weapon') next.mainHand = item;
      else if (item.type === 'shield') next.offHand = item;
      else if (item.type === 'armor') next.chest = item;

      if (engineRef.current) {
        engineRef.current.updateEquipment(next);
      }
      return next;
    });
  };

  // Unequip item
  const handleUnequipItem = (slot: keyof Equipment) => {
    setEquipment((prev) => {
      const next = { ...prev, [slot]: null };
      if (engineRef.current) {
        engineRef.current.updateEquipment(next);
      }
      return next;
    });
  };

  // Use consumable item
  const handleUseItem = (item: Item) => {
    if (!item.usable) return;

    setStats((prev) => {
      const next = { ...prev };
      if (item.effect?.healHp) {
        next.hp = Math.min(next.maxHp, next.hp + item.effect.healHp);
      }
      if (item.effect?.healMana) {
        next.mana = Math.min(next.maxMana, next.mana + item.effect.healMana);
      }
      if (engineRef.current) {
        engineRef.current.updateStats(next);
      }
      return next;
    });

    // Reduce quantity
    setInventory((prev) => {
      return prev
        .map((i) => (i.id === item.id ? { ...i, quantity: (i.quantity || 1) - 1 } : i))
        .filter((i) => (i.quantity ?? 1) > 0);
    });
  };

  // Craft Blueprint at Forge
  const handleCraftRecipe = (recipe: CraftingRecipe) => {
    const isDwarf = characterClass === 'dwarf';
    const adjustedGold = isDwarf ? Math.floor(recipe.goldCost * 0.5) : recipe.goldCost;

    if (stats.gold < adjustedGold) return;

    // Deduct gold
    setStats((prev) => ({ ...prev, gold: prev.gold - adjustedGold }));

    // Deduct materials
    setInventory((prev) => {
      const next = [...prev];
      recipe.requiredMaterials.forEach((mat) => {
        const reqCount = isDwarf ? Math.max(1, Math.floor(mat.count * 0.7)) : mat.count;
        const idx = next.findIndex((i) => i.id === mat.itemId);
        if (idx !== -1) {
          const item = next[idx];
          const rem = (item.quantity || 1) - reqCount;
          if (rem <= 0) next.splice(idx, 1);
          else next[idx] = { ...item, quantity: rem };
        }
      });

      // Add forged item with Dwarf bonus
      const bonusDamage = isDwarf ? Math.floor((recipe.result.damage || 20) * 1.25) : recipe.result.damage;
      const forgedItem: Item = {
        ...recipe.result,
        damage: bonusDamage,
        upgradeLevel: isDwarf ? 2 : 1,
      };

      return [...next, forgedItem];
    });

    // Quest progression
    handleQuestUpdate('quest_veins_deep', 'visit_forge', 1);
  };

  // Upgrade gear (+1 to +5)
  const handleUpgradeEquipment = (slot: keyof Equipment) => {
    const item = equipment[slot];
    if (!item) return;

    const currentLvl = item.upgradeLevel || 0;
    if (currentLvl >= 5) return;

    const isDwarf = characterClass === 'dwarf';
    const cost = isDwarf ? Math.floor((currentLvl + 1) * 18) : (currentLvl + 1) * 35;
    if (stats.gold < cost) return;

    setStats((prev) => ({ ...prev, gold: prev.gold - cost }));

    const upgradedItem: Item = {
      ...item,
      upgradeLevel: currentLvl + 1,
      damage: item.damage ? item.damage + 8 : undefined,
      defense: item.defense ? item.defense + 6 : undefined,
    };

    setEquipment((prev) => {
      const next = { ...prev, [slot]: upgradedItem };
      if (engineRef.current) {
        engineRef.current.updateEquipment(next);
      }
      return next;
    });
  };

  // Trigger actions from HUD
  const handleTriggerAction = (action: string) => {
    if (!engineRef.current) return;

    if (action === 'attack') {
      engineRef.current.performMeleeAttack();
    } else if (action === 'parry') {
      engineRef.current.triggerParry();
    } else if (action === 'skill1') {
      engineRef.current.castSpell(1);
    } else if (action === 'skill2') {
      engineRef.current.castSpell(2);
    } else if (action === 'stealth') {
      engineRef.current.toggleStealth();
    } else if (action === 'potion') {
      const flask = inventory.find((i) => i.id === 'potion_health');
      if (flask) {
        handleUseItem(flask);
        soundEngine.playPotion();
      }
    }
  };

  // Purchase supplies from Barnaby
  const handleBuySupplies = () => {
    const isHobbit = characterClass === 'hobbit';
    const cost = isHobbit ? 7 : 15; // 50% discount for Hobbit!
    if (stats.gold < cost) return;

    setStats((prev) => ({ ...prev, gold: prev.gold - cost }));
    handleInventoryAdd({ ...INITIAL_ITEMS.potion_health, quantity: 1 }, 1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-crosshair" />

      {/* Primary HUD Overlay */}
      <HUD
        stats={stats}
        characterClass={characterClass}
        interactPrompt={interactPrompt}
        isStealth={isStealth}
        isParryActive={isParryActive}
        bossHp={bossHp}
        onOpenQuests={() => setActiveModal('quests')}
        onOpenCharacter={() => setActiveModal('character')}
        onOpenSkills={() => setActiveModal('skills')}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenForge={() => setActiveModal('forge')}
        onOpenMap={() => setActiveModal('map')}
        onOpenClassSelect={() => setActiveModal('classSelect')}
        onOpenWordPressPlugin={() => setActiveModal('wpPlugin')}
        onTriggerAction={handleTriggerAction}
      />

      {/* Modal Dialogs */}
      {activeModal === 'quests' && (
        <QuestModal
          quests={quests}
          activeQuestId={activeQuestId}
          onSelectQuest={(id) => setActiveQuestId(id)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'character' && (
        <CharacterModal
          stats={stats}
          characterClass={characterClass}
          onAllocateAttribute={handleAllocateAttribute}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'skills' && (
        <SkillTreeModal
          characterClass={characterClass}
          skills={SKILL_NODES[characterClass]}
          skillPoints={stats.skillPoints}
          onUnlockSkill={handleUnlockSkill}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          equipment={equipment}
          inventory={inventory}
          gold={stats.gold}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onUseItem={handleUseItem}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'forge' && (
        <CraftingModal
          characterClass={characterClass}
          inventory={inventory}
          equipment={equipment}
          gold={stats.gold}
          onCraftRecipe={handleCraftRecipe}
          onUpgradeEquipment={handleUpgradeEquipment}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'map' && (
        <WorldMapModal
          playerPos={playerCoord}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'classSelect' && (
        <ClassSelectModal
          currentClass={characterClass}
          onSelectClass={handleSelectClass}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'dialogue' && activeNpc && (
        <DialogueModal
          npc={activeNpc}
          characterClass={characterClass}
          onOpenQuests={() => setActiveModal('quests')}
          onOpenForge={() => setActiveModal('forge')}
          onBuySupplies={handleBuySupplies}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'wpPlugin' && (
        <WordPressPluginModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
