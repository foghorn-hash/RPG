import React from 'react';
import { NPCData, CharacterClass } from '../types/game';
import { X, MessageSquare, Compass, Hammer, ShoppingBag, Sword } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface DialogueModalProps {
  npc: NPCData;
  characterClass: CharacterClass;
  onOpenQuests: () => void;
  onOpenForge: () => void;
  onBuySupplies: () => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  characterClass,
  onOpenQuests,
  onOpenForge,
  onBuySupplies,
  onClose,
}) => {
  const [dialogueIdx, setDialogueIdx] = React.useState(0);

  const getNpcAvatar = () => {
    switch (npc.role) {
      case 'blacksmith':
        return '🔨';
      case 'merchant':
        return '🎒';
      case 'trainer':
        return '🗡️';
      default:
        return '📜';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-slate-200 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 p-1 rounded-lg bg-slate-800/80 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* NPC Profile */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
            {getNpcAvatar()}
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-amber-200">{npc.name}</h3>
            <span className="text-xs text-amber-400 font-semibold">{npc.title}</span>
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 min-h-[90px] flex items-center">
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{npc.dialogue[dialogueIdx] || npc.dialogue[0]}"
          </p>
        </div>

        {/* Next Line or Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          {npc.dialogue.length > 1 && dialogueIdx < npc.dialogue.length - 1 && (
            <button
              onClick={() => setDialogueIdx(dialogueIdx + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Continue Listening...
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenQuests();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase font-cinzel transition shadow"
          >
            <Compass className="w-4 h-4" />
            <span>Open Quest Journal</span>
          </button>

          {npc.role === 'blacksmith' && (
            <button
              onClick={() => {
                onClose();
                onOpenForge();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs uppercase font-cinzel transition shadow"
            >
              <Hammer className="w-4 h-4" />
              <span>Use Blacksmith Forge</span>
            </button>
          )}

          {npc.role === 'merchant' && (
            <button
              onClick={() => {
                onBuySupplies();
                soundEngine.playPotion();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase font-cinzel transition shadow"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase Health Flasks (15g)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
