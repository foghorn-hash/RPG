import React from 'react';
import { CharacterClass, SkillNode } from '../types/game';
import { X, Lock, CheckCircle2, Zap } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface SkillTreeModalProps {
  characterClass: CharacterClass;
  skills: SkillNode[];
  skillPoints: number;
  onUnlockSkill: (skillId: string) => void;
  onClose: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  characterClass,
  skills,
  skillPoints,
  onUnlockSkill,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-slate-200 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 p-1 rounded-lg bg-slate-800/80 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold font-cinzel text-amber-200 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              {characterClass.toUpperCase()} Class Mastery Tree
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Unlock potent combat techniques, spell incantations, and racial passives.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold">Skill Points</span>
            <span className="text-xl font-bold text-amber-400">{skillPoints}</span>
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div className="mt-6 space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                skill.unlocked
                  ? 'bg-slate-950/70 border-amber-500/50 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 border ${
                    skill.unlocked
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-inner'
                      : 'bg-slate-800/50 border-slate-700 text-slate-500'
                  }`}
                >
                  {skill.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-slate-100 font-cinzel">{skill.name}</h3>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Tier {skill.tier} {skill.passive ? '• Passive' : '• Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                    {skill.description}
                  </p>

                  <div className="text-[11px] font-semibold text-amber-400/90 mt-2">
                    {skill.effect}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center">
                {skill.unlocked ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unlocked</span>
                  </div>
                ) : (
                  <button
                    disabled={skillPoints <= 0}
                    onClick={() => {
                      onUnlockSkill(skill.id);
                      soundEngine.playLevelUp();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase transition ${
                      skillPoints > 0
                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer shadow-lg'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Learn (1 Point)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
