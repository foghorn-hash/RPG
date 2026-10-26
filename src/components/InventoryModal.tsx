import React from 'react';
import { Equipment, Item } from '../types/game';
import { X, Shield, Sword, Heart, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface InventoryModalProps {
  equipment: Equipment;
  inventory: Item[];
  gold: number;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: keyof Equipment) => void;
  onUseItem: (item: Item) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  equipment,
  inventory,
  gold,
  onEquipItem,
  onUnequipItem,
  onUseItem,
  onClose,
}) => {
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(inventory[0] || null);

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 border-amber-500/50 bg-amber-950/40';
      case 'epic':
        return 'text-purple-400 border-purple-500/50 bg-purple-950/40';
      case 'rare':
        return 'text-sky-400 border-sky-500/50 bg-sky-950/40';
      case 'uncommon':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900';
    }
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
            <h2 className="text-2xl font-bold font-cinzel text-amber-200">Equipment & Satchel</h2>
            <p className="text-xs text-slate-400 mt-1">Manage weapons, armor, mined mineral veins, and potions.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-yellow-500/40 text-yellow-300 font-bold text-sm">
            <span>🪙</span>
            <span>{gold} Gold</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          {/* Equipment Paperdoll (5 Cols) */}
          <div className="md:col-span-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cinzel mb-3">
              Equipped Loadout
            </h3>

            <div className="space-y-2.5">
              {/* Main Hand */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                    {equipment.mainHand?.icon || '⚔️'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Main Hand</span>
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">
                      {equipment.mainHand?.name || 'Empty'}
                    </span>
                    {equipment.mainHand?.damage && (
                      <span className="text-[10px] text-amber-400">+{equipment.mainHand.damage} ATK</span>
                    )}
                  </div>
                </div>
                {equipment.mainHand && (
                  <button
                    onClick={() => onUnequipItem('mainHand')}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Unequip
                  </button>
                )}
              </div>

              {/* Off Hand */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                    {equipment.offHand?.icon || '🛡️'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Off Hand (Shield/Focus)</span>
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">
                      {equipment.offHand?.name || 'Empty'}
                    </span>
                    {equipment.offHand?.defense && (
                      <span className="text-[10px] text-sky-400">+{equipment.offHand.defense} DEF</span>
                    )}
                  </div>
                </div>
                {equipment.offHand && (
                  <button
                    onClick={() => onUnequipItem('offHand')}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Unequip
                  </button>
                )}
              </div>

              {/* Chest Armor */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                    {equipment.chest?.icon || '🥋'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Body Armor</span>
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">
                      {equipment.chest?.name || 'Standard Tunic'}
                    </span>
                    {equipment.chest?.defense && (
                      <span className="text-[10px] text-sky-400">+{equipment.chest.defense} DEF</span>
                    )}
                  </div>
                </div>
                {equipment.chest && (
                  <button
                    onClick={() => onUnequipItem('chest')}
                    className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Unequip
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 leading-tight">
              Tip: Equipping heavy shields improves block defense and parry windows against elite foes.
            </div>
          </div>

          {/* Satchel Grid (7 Cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cinzel mb-3">
                Satchel Storage ({inventory.length} items)
              </h3>

              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                {inventory.map((item, idx) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => setSelectedItem(item)}
                      className={`relative aspect-square rounded-lg p-1.5 flex flex-col items-center justify-center border transition ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/40 shadow-md ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      {item.quantity && item.quantity > 1 && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-bold px-1 rounded bg-slate-900 border border-slate-700 text-amber-300">
                          {item.quantity}
                        </span>
                      )}
                      {item.upgradeLevel !== undefined && item.upgradeLevel > 0 && (
                        <span className="absolute top-0.5 right-0.5 text-[9px] font-bold text-amber-400">
                          +{item.upgradeLevel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Item Detail Inspector */}
            {selectedItem && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{selectedItem.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 font-cinzel">
                        {selectedItem.name}
                        {selectedItem.upgradeLevel ? ` (+${selectedItem.upgradeLevel})` : ''}
                      </h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRarityBadge(selectedItem.rarity)}`}>
                        {selectedItem.rarity} {selectedItem.type}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-yellow-300">
                    🪙 {selectedItem.value} Gold
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 italic">
                  "{selectedItem.description}"
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                  <div className="flex gap-3 text-xs">
                    {selectedItem.damage && (
                      <span className="text-amber-400 font-semibold">Damage: +{selectedItem.damage}</span>
                    )}
                    {selectedItem.defense && (
                      <span className="text-sky-400 font-semibold">Defense: +{selectedItem.defense}</span>
                    )}
                    {selectedItem.critBonus && (
                      <span className="text-emerald-400 font-semibold">Crit: +{selectedItem.critBonus}%</span>
                    )}
                  </div>

                  {selectedItem.usable ? (
                    <button
                      onClick={() => {
                        onUseItem(selectedItem);
                        soundEngine.playPotion();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase transition shadow"
                    >
                      Consume / Drink
                    </button>
                  ) : ['weapon', 'shield', 'armor', 'helmet', 'accessory'].includes(selectedItem.type) ? (
                    <button
                      onClick={() => {
                        onEquipItem(selectedItem);
                        soundEngine.playSlash();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase transition shadow"
                    >
                      Equip Item
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
