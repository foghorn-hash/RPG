import React from 'react';
import { CharacterStats, CharacterClass } from '../types/game';
import { X, Shield, Zap, Sparkles, Plus, Dumbbell, Wind, Brain, Heart, Clover } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface CharacterModalProps {
  stats: CharacterStats;
  characterClass: CharacterClass;
  onAllocateAttribute: (attr: 'strength' | 'agility' | 'intelligence' | 'endurance' | 'luck') => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  stats,
  characterClass,
  onAllocateAttribute,
  onClose,
}) => {
  const classTitles: Record<CharacterClass, { title: string; desc: string; icon: string }> = {
    wizard: {
      title: 'Arcane Elementalist',
      desc: 'Master of explosive Fireballs, Frost Nova, and spatial teleportation.',
      icon: '🧙‍♂️',
    },
    warrior: {
      title: 'Champion Bulwark',
      desc: 'Devastating brute force, heavy cleaves, and masterful weapon/shield parrying.',
      icon: '⚔️',
    },
    elf: {
      title: 'Windrunner Ranger',
      desc: 'Unmatched agility, rapid blade flurries, evasive dashes, and lethal critical strikes.',
      icon: '🧝',
    },
    dwarf: {
      title: 'Mountain Runesmith',
      desc: 'Unrivaled mining prowess, unearths rare Mithril/Adamantite gems, and masterwork forging.',
      icon: '⛏️',
    },
    hobbit: {
      title: 'Shadow Cavernier',
      desc: 'Supreme stealth sneak attacks (3.5x crit), secret cavern discovery, and 50% merchant trade discount.',
      icon: '🥷',
    },
  };

  const info = classTitles[characterClass];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-slate-200 p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 p-1 rounded-lg bg-slate-800/80 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-600/40 to-slate-800 border border-amber-500/50 flex items-center justify-center text-3xl shadow-inner">
            {info.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-cinzel text-amber-200">
                Level {stats.level} {info.title}
              </h2>
              <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                {characterClass}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">{info.desc}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-400">Experience Points (XP)</span>
            <span className="text-amber-400">{stats.xp} / {stats.xpToNextLevel} XP</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (stats.xp / stats.xpToNextLevel) * 100)}%` }}
            />
          </div>
        </div>

        {/* Attribute Allocation Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-cinzel flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Core Attributes
            </h3>
            {stats.attributePoints > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 animate-bounce">
                {stats.attributePoints} Points Available!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Strength */}
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-sm font-bold text-slate-200">Strength</div>
                  <div className="text-[10px] text-slate-400">Melee damage & cleave</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{stats.strength}</span>
                {stats.attributePoints > 0 && (
                  <button
                    onClick={() => {
                      onAllocateAttribute('strength');
                      soundEngine.playLevelUp();
                    }}
                    className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Agility */}
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wind className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-slate-200">Agility</div>
                  <div className="text-[10px] text-slate-400">Move speed, evasion & crit</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{stats.agility}</span>
                {stats.attributePoints > 0 && (
                  <button
                    onClick={() => {
                      onAllocateAttribute('agility');
                      soundEngine.playLevelUp();
                    }}
                    className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Intelligence */}
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-sm font-bold text-slate-200">Intelligence</div>
                  <div className="text-[10px] text-slate-400">Spell damage & mana pool</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{stats.intelligence}</span>
                {stats.attributePoints > 0 && (
                  <button
                    onClick={() => {
                      onAllocateAttribute('intelligence');
                      soundEngine.playLevelUp();
                    }}
                    className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Endurance */}
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-sm font-bold text-slate-200">Endurance</div>
                  <div className="text-[10px] text-slate-400">Max Health & physical armor</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{stats.endurance}</span>
                {stats.attributePoints > 0 && (
                  <button
                    onClick={() => {
                      onAllocateAttribute('endurance');
                      soundEngine.playLevelUp();
                    }}
                    className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Luck */}
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <Clover className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-sm font-bold text-slate-200">Luck</div>
                  <div className="text-[10px] text-slate-400">Rare cavern gem unearthing, merchant barter & criticals</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{stats.luck}</span>
                {stats.attributePoints > 0 && (
                  <button
                    onClick={() => {
                      onAllocateAttribute('luck');
                      soundEngine.playLevelUp();
                    }}
                    className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Combat & Profession Ratings */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-cinzel">
            Combat & Profession Ratings
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950/30 border border-slate-800">
              <span className="text-slate-400 block">Health</span>
              <span className="text-rose-400 font-bold text-sm">{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/30 border border-slate-800">
              <span className="text-slate-400 block">Mana</span>
              <span className="text-sky-400 font-bold text-sm">{Math.floor(stats.mana)} / {stats.maxMana}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/30 border border-slate-800">
              <span className="text-slate-400 block">Mining Level</span>
              <span className="text-amber-300 font-bold text-sm">Tier {stats.miningMastery} {characterClass === 'dwarf' ? '(+2x Boost)' : ''}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/30 border border-slate-800">
              <span className="text-slate-400 block">Stealth Skill</span>
              <span className="text-purple-300 font-bold text-sm">Tier {stats.stealthLevel} {characterClass === 'hobbit' ? '(Master)' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
