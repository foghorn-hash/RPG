import React from 'react';
import { CharacterClass } from '../types/game';
import { X, CheckCircle2, Shield, Wand2, Wind, Hammer, Footprints } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface ClassSelectModalProps {
  currentClass: CharacterClass;
  onSelectClass: (c: CharacterClass) => void;
  onClose: () => void;
}

export const ClassSelectModal: React.FC<ClassSelectModalProps> = ({
  currentClass,
  onSelectClass,
  onClose,
}) => {
  const classes: {
    id: CharacterClass;
    name: string;
    archetype: string;
    icon: string;
    perks: string[];
    description: string;
  }[] = [
    {
      id: 'warrior',
      name: 'Warrior / Fighter',
      archetype: 'Brute Strength & Master of the Parry',
      icon: '⚔️',
      perks: [
        'Parry Technique: Right Click / [Q] raises shield to deflect attacks & stagger foes',
        'Brute Cleave: Sweeping two-handed arcs knocking back enemy hordes',
        'Titan Armor: Highest physical damage mitigation and max health',
      ],
      description: 'Disciplined defenders and brutal combatants who master the rhythm of enemy strikes, staggering giants with split-second parries.',
    },
    {
      id: 'wizard',
      name: 'Wizard',
      archetype: 'Arcane Spells & Elemental Devastation',
      icon: '🧙‍♂️',
      perks: [
        'Fireball [1]: Explosive area of effect flame blast with lingering burn',
        'Frost Nova [2]: Freezes all surrounding enemies in crystalline ice',
        'Aether Blink [3]: Spatial warp evading dangerous strikes instantly',
      ],
      description: 'Scholars of the ancient leylines capable of raining apocalyptic fire, freezing entire packs of monsters, and manipulating space itself.',
    },
    {
      id: 'elf',
      name: 'Elf',
      archetype: 'Unmatched Agility & Lethal Precision',
      icon: '🧝',
      perks: [
        'Zephyr Dash: Rapid invulnerable forward burst with zero stamina cost',
        'Tempest Flurry: Blinding triple strike with high armor penetration',
        'Eagle Eye: Innate +25% critical strike chance and bonus sprint speed',
      ],
      description: 'Forest dwellers whose graceful movements make them nearly impossible to corner, turning battle into a deadly dance.',
    },
    {
      id: 'dwarf',
      name: 'Dwarf',
      archetype: 'Deep Mining & Masterwork Forge Enhancement',
      icon: '⛏️',
      perks: [
        'Master Prospector: Mines mineral veins 2x faster with 3x rare gem unearthing',
        'Forge Master: 50% discount at the Blacksmith Forge & +25% crafted stats',
        'Mountain Tremor Slam: Earth-shattering pickaxe ground shockwave',
      ],
      description: 'Stalwart mountain dwellers who read stone like an open book, uncovering deep Mithril and forging legendary armaments at the anvil.',
    },
    {
      id: 'hobbit',
      name: 'Hobbit',
      archetype: 'Stealth Infiltration, Caverns & Merchant Trade',
      icon: '🥷',
      perks: [
        'Shadowcloak [C]: Crouch into stealth; enemies cannot see you past 4.5m',
        'Sneak Backstab: Guaranteed 3.5x critical damage when striking from shadows',
        'Silver Tongue: 50% merchant store discount and 2x gold on all sales',
      ],
      description: 'Quiet wanderers of hidden caverns who turn stealth into an art form and secure the greatest treasures with quick wit and nimble feet.',
    },
  ];

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
        <div className="pb-4 border-b border-slate-800">
          <h2 className="text-2xl font-bold font-cinzel text-amber-200">
            Choose Character Archetype
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Switch your active class anytime to experience distinct 3D models, spells, parry mechanics, mining bonuses, and stealth playstyles.
          </p>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {classes.map((cls) => {
            const isSelected = cls.id === currentClass;

            return (
              <div
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls.id);
                  soundEngine.playLevelUp();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 shadow-xl ring-2 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cls.icon}</span>
                      <div>
                        <h3 className="font-bold text-base text-slate-100 font-cinzel">
                          {cls.name}
                        </h3>
                        <span className="text-xs text-amber-400 font-semibold block">
                          {cls.archetype}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed italic">
                    "{cls.description}"
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {cls.perks.map((perk, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold shrink-0">✦</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-cinzel uppercase transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold cursor-default'
                        : 'bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : 'Switch Class'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
