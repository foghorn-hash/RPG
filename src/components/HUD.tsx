import React from 'react';
import { CharacterClass, CharacterStats } from '../types/game';
import {
  Shield,
  Sword,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Compass,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Map,
  BookOpen,
  User,
  Hammer,
  RotateCcw,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HUDProps {
  stats: CharacterStats;
  characterClass: CharacterClass;
  interactPrompt: string | null;
  isStealth: boolean;
  isParryActive: boolean;
  bossHp: { hp: number; maxHp: number; name: string } | null;
  onOpenQuests: () => void;
  onOpenCharacter: () => void;
  onOpenSkills: () => void;
  onOpenInventory: () => void;
  onOpenForge: () => void;
  onOpenMap: () => void;
  onOpenClassSelect: () => void;
  onTriggerAction: (action: string) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  characterClass,
  interactPrompt,
  isStealth,
  isParryActive,
  bossHp,
  onOpenQuests,
  onOpenCharacter,
  onOpenSkills,
  onOpenInventory,
  onOpenForge,
  onOpenMap,
  onOpenClassSelect,
  onTriggerAction,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(soundEngine.getMuted());

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const classBadges: Record<CharacterClass, { label: string; icon: string; skill1: string; skill2: string }> = {
    warrior: {
      label: 'Warrior',
      icon: '⚔️',
      skill1: '[1] Titan Cleave',
      skill2: '[2] Battle Roar',
    },
    wizard: {
      label: 'Wizard',
      icon: '🧙‍♂️',
      skill1: '[1] Fireball',
      skill2: '[2] Frost Nova',
    },
    elf: {
      label: 'Elf',
      icon: '🧝',
      skill1: '[1] Zephyr Dash',
      skill2: '[2] Tempest Flurry',
    },
    dwarf: {
      label: 'Dwarf',
      icon: '⛏️',
      skill1: '[1] Mountain Slam',
      skill2: '[Passive] 2x Mining',
    },
    hobbit: {
      label: 'Hobbit',
      icon: '🥷',
      skill1: '[1] Smoke Bomb',
      skill2: '[C] 3.5x Sneak',
    },
  };

  const badge = classBadges[characterClass];

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-4">
      {/* Top Bar: Minimal Character Status & Compass Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
        {/* Left: Player Vital Gauges */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-amber-600/40 shadow-xl pointer-events-auto">
          <button
            onClick={onOpenClassSelect}
            title="Click to switch class"
            className="w-12 h-12 rounded-lg bg-slate-800 border border-amber-500/50 flex items-center justify-center text-2xl hover:scale-105 transition cursor-pointer"
          >
            {badge.icon}
          </button>

          <div className="w-48 sm:w-56 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold font-cinzel text-amber-200">
                Lv.{stats.level} {badge.label}
              </span>
              <span className="font-bold text-yellow-300">🪙 {stats.gold}g</span>
            </div>

            {/* Health Bar */}
            <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-200"
                style={{ width: `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                {stats.hp} / {stats.maxHp} HP
              </span>
            </div>

            {/* Mana Bar */}
            <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-blue-400 transition-all duration-200"
                style={{ width: `${Math.max(0, (stats.mana / stats.maxMana) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow">
                {Math.floor(stats.mana)} / {stats.maxMana} MP
              </span>
            </div>
          </div>
        </div>

        {/* Center Top: World Cardinal Compass */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 pointer-events-auto shadow-md text-xs font-cinzel">
          <span className="text-amber-400 font-bold">N</span>
          <span className="text-slate-500">•</span>
          <span className="text-sky-400 font-semibold">The Deep Grotto [North]</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold">E</span>
          <span className="text-rose-400 font-semibold">Ancient Ruins [East]</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-400 font-bold">S</span>
          <span className="text-emerald-400 font-semibold">Whispering Forest [South]</span>
        </div>

        {/* Right Top Quick Nav Pills */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-400 transition shadow"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 hover:text-amber-400 font-bold text-xs font-cinzel transition shadow"
          >
            <Map className="w-3.5 h-3.5 text-sky-400" />
            <span>Map [M]</span>
          </button>
          <button
            onClick={onOpenQuests}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/90 border border-amber-600/40 text-amber-300 font-bold text-xs font-cinzel transition shadow hover:bg-slate-800"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Quests [J]</span>
          </button>
        </div>
      </div>

      {/* Boss HP Bar (if Hollow Colossus Boss is engaged) */}
      {bossHp && bossHp.hp > 0 && (
        <div className="self-center w-full max-w-xl p-3 rounded-xl bg-slate-950/90 border-2 border-red-600/80 shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-center text-xs font-cinzel font-bold mb-1">
            <span className="text-red-400">{bossHp.name}</span>
            <span className="text-slate-300">{bossHp.hp} / {bossHp.maxHp} HP</span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-red-950">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-150"
              style={{ width: `${Math.max(0, (bossHp.hp / bossHp.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Center Screen: Interactive Prompts & Combat Alert */}
      <div className="self-center flex flex-col items-center gap-2 pointer-events-none">
        {/* Stealth Indicator */}
        {isStealth && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 text-purple-300 font-bold text-xs shadow-lg animate-fade-in">
            <EyeOff className="w-4 h-4 text-purple-400" />
            <span>STEALTH MODE ACTIVE • ENEMY DETECTION MINIMAL • 3.5X SNEAK ATTACK</span>
          </div>
        )}

        {/* Parry Timing Window Alert */}
        {isParryActive && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/90 border-2 border-sky-400 text-sky-200 font-bold text-xs shadow-lg">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>GUARD RAISED: PARRY WINDOW READY TO DEFLECT!</span>
          </div>
        )}

        {/* Proximity Interaction Prompt */}
        {interactPrompt && (
          <div className="px-4 py-2 rounded-xl bg-slate-950/90 border-2 border-amber-500 text-amber-300 font-bold text-sm shadow-2xl font-cinzel animate-bounce pointer-events-auto">
            {interactPrompt}
          </div>
        )}
      </div>

      {/* Ergonomic Bottom Control Dock (Collapsible, Zero Viewport Occlusion) */}
      <div className="self-center w-full max-w-[940px] flex flex-col items-center pointer-events-auto transition-transform duration-300">
        {/* Collapse / Expand Toggle Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900/90 border-t border-x border-amber-600/40 text-[11px] font-bold text-slate-300 hover:text-amber-300 transition shadow"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isDockCollapsed ? 'Show Controls Dock' : 'Hide Controls Dock'}</span>
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-slate-900/95 border-2 border-amber-600/50 rounded-xl p-3 shadow-2xl backdrop-blur-none text-slate-200">
            {/* Top row: Combat & Action Hotbar Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {/* Attack [L-Click] */}
                <button
                  onClick={() => onTriggerAction('attack')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold text-xs transition"
                  title="Primary Attack (Left Mouse Click)"
                >
                  <Sword className="w-3.5 h-3.5 text-amber-400" />
                  <span>Strike [L-Click]</span>
                </button>

                {/* Parry [R-Click / Q] */}
                <button
                  onClick={() => onTriggerAction('parry')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border transition ${
                    isParryActive
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                      : 'bg-slate-800 hover:bg-sky-950/60 border-slate-700 text-sky-300'
                  }`}
                  title="Parry Deflection (Right Click or Key Q)"
                >
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Parry / Guard [Q]</span>
                </button>

                {/* Class Skill 1 */}
                <button
                  onClick={() => onTriggerAction('skill1')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/40 text-amber-200 font-bold text-xs transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{badge.skill1}</span>
                </button>

                {/* Class Skill 2 */}
                <button
                  onClick={() => onTriggerAction('skill2')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-600/40 text-purple-200 font-bold text-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{badge.skill2}</span>
                </button>

                {/* Stealth Toggle [C] */}
                <button
                  onClick={() => onTriggerAction('stealth')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border transition ${
                    isStealth
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                      : 'bg-slate-800 hover:bg-purple-950/50 border-slate-700 text-purple-300'
                  }`}
                  title="Toggle Stealth Mode (Key C)"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Stealth [C]</span>
                </button>

                {/* Potion Drink [4] */}
                <button
                  onClick={() => onTriggerAction('potion')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-200 font-bold text-xs transition"
                  title="Quick Heal Flask"
                >
                  <span>🧪</span>
                  <span>Flask [4]</span>
                </button>
              </div>

              {/* Character Class Tag */}
              <button
                onClick={onOpenClassSelect}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-400 border border-slate-700 transition"
              >
                Switch Class Archetype
              </button>
            </div>

            {/* Bottom row: System Modals Nav */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-xs font-cinzel">
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCharacter}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Character Sheet</span>
                  {stats.attributePoints > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>

                <button
                  onClick={onOpenSkills}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Mastery Tree</span>
                  {stats.skillPoints > 0 && (
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  )}
                </button>

                <button
                  onClick={onOpenInventory}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5"
                >
                  <span>🎒</span>
                  <span>Satchel & Gear</span>
                </button>

                <button
                  onClick={onOpenForge}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center gap-1.5"
                >
                  <Hammer className="w-3.5 h-3.5 text-orange-400" />
                  <span>Blacksmith Forge</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 hidden sm:block">
                Movement: <strong className="text-slate-200">WASD</strong> • Sprint: <strong className="text-slate-200">Shift</strong> • Parry: <strong className="text-slate-200">Q / R-Click</strong> • Mine: <strong className="text-slate-200">E</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
