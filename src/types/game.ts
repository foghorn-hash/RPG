export type CharacterClass = 'wizard' | 'elf' | 'warrior' | 'dwarf' | 'hobbit';

export interface CharacterStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  attributePoints: number;
  skillPoints: number;
  
  // Base attributes
  strength: number;      // Warrior & physical melee bonus
  agility: number;       // Elf & move speed, evasion, crit
  intelligence: number;  // Wizard & spell damage, max mana
  endurance: number;     // Max HP, stamina regen, armor
  luck: number;          // Hobbit & drop rates, crit, trade prices, mining rare gems

  // Secondary dynamic stats
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;

  gold: number;
  miningMastery: number;
  stealthLevel: number;
  craftingMastery: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemType = 'weapon' | 'shield' | 'armor' | 'helmet' | 'accessory' | 'ore' | 'gem' | 'potion' | 'quest';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  icon: string;
  value: number;
  damage?: number;
  defense?: number;
  critBonus?: number;
  spellPower?: number;
  upgradeLevel?: number; // +0 to +5
  usable?: boolean;
  effect?: {
    healHp?: number;
    healMana?: number;
    buff?: string;
  };
  quantity?: number;
}

export interface Equipment {
  mainHand: Item | null;
  offHand: Item | null;
  chest: Item | null;
  head: Item | null;
  accessory: Item | null;
}

export interface SkillNode {
  id: string;
  name: string;
  classReq: CharacterClass | 'all';
  tier: number;
  description: string;
  icon: string;
  unlocked: boolean;
  cooldown?: number;
  manaCost?: number;
  passive?: boolean;
  effect: string;
}

export interface QuestObjective {
  id: string;
  text: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;
  description: string;
  recommendedClass?: CharacterClass;
  status: 'available' | 'active' | 'completed';
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    gold: number;
    items?: Item[];
  };
  targetLocation?: {
    x: number;
    z: number;
    name: string;
  };
}

export interface OreNodeData {
  id: string;
  name: string;
  oreType: 'iron' | 'mithril' | 'gold' | 'adamantite' | 'crystal';
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  respawnTimer: number;
  gemChance: number;
}

export interface EnemyData {
  id: string;
  name: string;
  type: 'goblin' | 'skeleton' | 'cave_golem' | 'dire_wolf' | 'boss_colossus';
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  isStaggered: boolean;
  staggerTimer: number;
  attackCooldown: number;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'staggered' | 'dead';
  telegraphTimer: number; // Shows red warning circle before attacking so player can parry!
}

export interface CraftingRecipe {
  id: string;
  result: Item;
  requiredMaterials: { itemId: string; name: string; count: number }[];
  goldCost: number;
  dwarfBonusDescription: string;
}

export interface NPCData {
  id: string;
  name: string;
  title: string;
  role: 'quest' | 'blacksmith' | 'merchant' | 'trainer';
  x: number;
  y: number;
  z: number;
  dialogue: string[];
}
