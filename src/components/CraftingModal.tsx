import React from 'react';
import { CharacterClass, CraftingRecipe, Equipment, Item } from '../types/game';
import { CRAFTING_RECIPES } from '../game/itemsData';
import { X, Hammer, Sparkles, Shield, ArrowUpCircle } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface CraftingModalProps {
  characterClass: CharacterClass;
  inventory: Item[];
  equipment: Equipment;
  gold: number;
  onCraftRecipe: (recipe: CraftingRecipe) => void;
  onUpgradeEquipment: (slot: keyof Equipment) => void;
  onClose: () => void;
}

export const CraftingModal: React.FC<CraftingModalProps> = ({
  characterClass,
  inventory,
  equipment,
  gold,
  onCraftRecipe,
  onUpgradeEquipment,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<'forge' | 'upgrade'>('forge');
  const isDwarf = characterClass === 'dwarf';

  const getMaterialCount = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    return item?.quantity || 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-slate-200 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 p-1 rounded-lg bg-slate-800/80 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Hammer className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold font-cinzel text-amber-200">
                Master Torvin's Blacksmith Forge
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Smelt deep cavern ores (Mithril, Gold, Adamantite) into masterwork gear and enhance equipment.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 font-bold text-sm">
            <span>🪙</span>
            <span>{gold} Gold</span>
          </div>
        </div>

        {/* Dwarf Racial Perk Banner */}
        {isDwarf ? (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center gap-3">
            <span className="text-2xl">⛏️</span>
            <div>
              <div className="text-xs font-bold text-amber-300 font-cinzel">
                Dwarven Forge Master Advantage Active!
              </div>
              <div className="text-[11px] text-amber-200/90">
                You receive 50% discount on gold/ore crafting costs, and all crafted armaments gain bonus +25% stats!
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <span>💡</span>
            <span>Switching to Dwarf grants unique mining speed and crafting enhancements at this forge.</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-5 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('forge')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase font-cinzel transition ${
              activeTab === 'forge'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Forge Masterwork Blueprints
          </button>
          <button
            onClick={() => setActiveTab('upgrade')}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase font-cinzel transition ${
              activeTab === 'upgrade'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Enhance Equipped Gear (+1 to +5)
          </button>
        </div>

        {/* Tab 1: Blueprint Forging */}
        {activeTab === 'forge' && (
          <div className="mt-4 space-y-3.5">
            {CRAFTING_RECIPES.map((recipe) => {
              const adjustedGold = isDwarf ? Math.floor(recipe.goldCost * 0.5) : recipe.goldCost;
              const hasGold = gold >= adjustedGold;
              const hasMaterials = recipe.requiredMaterials.every(
                (mat) => getMaterialCount(mat.itemId) >= (isDwarf ? Math.max(1, Math.floor(mat.count * 0.7)) : mat.count)
              );
              const canCraft = hasGold && hasMaterials;

              return (
                <div
                  key={recipe.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-3xl shrink-0 border border-amber-500/40">
                      {recipe.result.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 font-cinzel">
                          {recipe.result.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-amber-500/40 text-amber-400 bg-amber-950/30">
                          {recipe.result.rarity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 max-w-md">
                        {recipe.result.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {recipe.requiredMaterials.map((mat) => {
                          const req = isDwarf ? Math.max(1, Math.floor(mat.count * 0.7)) : mat.count;
                          const current = getMaterialCount(mat.itemId);
                          const met = current >= req;

                          return (
                            <span
                              key={mat.itemId}
                              className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${
                                met
                                  ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                                  : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                              }`}
                            >
                              {mat.name}: {current}/{req}
                            </span>
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-amber-400 mt-2 font-semibold">
                        {recipe.dwarfBonusDescription}
                      </div>
                    </div>
                  </div>

                  {/* Craft Action */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="text-xs font-bold text-yellow-300">
                      Cost: 🪙 {adjustedGold} Gold
                    </span>

                    <button
                      disabled={!canCraft}
                      onClick={() => {
                        onCraftRecipe(recipe);
                        soundEngine.playForge();
                      }}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase font-cinzel transition shadow ${
                        canCraft
                          ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      Forge Blueprint
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Gear Enhancement (+1 to +5) */}
        {activeTab === 'upgrade' && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-400">
              Temper and hone your equipped weapon or shield. Upgrades increase attack power, parry stagger bonus, and armor defense.
            </p>

            {(['mainHand', 'offHand', 'chest'] as (keyof Equipment)[]).map((slot) => {
              const item = equipment[slot];
              if (!item) return null;

              const currentLvl = item.upgradeLevel || 0;
              const isMax = currentLvl >= 5;
              const upgradeCost = (currentLvl + 1) * 35;
              const adjustedCost = isDwarf ? Math.floor(upgradeCost * 0.5) : upgradeCost;
              const canUpgrade = !isMax && gold >= adjustedCost;

              return (
                <div
                  key={slot}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-100 font-cinzel">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          +{currentLvl}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Slot: {slot.toUpperCase()} • {item.damage ? `Damage: ${item.damage}` : ''} {item.defense ? `Defense: ${item.defense}` : ''}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isMax ? (
                      <span className="text-xs font-bold text-amber-400">MAX ENHANCEMENT (+5)</span>
                    ) : (
                      <button
                        disabled={!canUpgrade}
                        onClick={() => {
                          onUpgradeEquipment(slot);
                          soundEngine.playForge();
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs uppercase font-cinzel transition shadow ${
                          canUpgrade
                            ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        <span>Enhance (+{currentLvl + 1}) • 🪙 {adjustedCost}g</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
