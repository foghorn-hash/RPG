import React from 'react';
import { Quest } from '../types/game';
import { X, CheckCircle2, Circle, Award, Compass } from 'lucide-react';

interface QuestModalProps {
  quests: Quest[];
  activeQuestId: string;
  onSelectQuest: (id: string) => void;
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  quests,
  activeQuestId,
  onSelectQuest,
  onClose,
}) => {
  const selectedQuest = quests.find((q) => q.id === activeQuestId) || quests[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[85vh] bg-slate-900 border-2 border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-amber-400 p-1 rounded-lg bg-slate-800/80 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sidebar: Quest List */}
        <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-500/30">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-cinzel text-amber-300">Quest Journal</h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {quests.map((quest) => {
              const isDone = quest.objectives.every((o) => o.completed);
              const isSelected = quest.id === selectedQuest?.id;

              return (
                <button
                  key={quest.id}
                  onClick={() => onSelectQuest(quest.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm line-clamp-1">{quest.title}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-amber-500/60 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex justify-between">
                    <span>Giver: {quest.giver}</span>
                    {quest.recommendedClass && (
                      <span className="text-amber-400/80 capitalize">{quest.recommendedClass}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quest Details Panel */}
        {selectedQuest && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-2xl font-bold font-cinzel text-amber-200">
                    {selectedQuest.title}
                  </h3>
                  <p className="text-xs text-amber-500/80 mt-1">
                    Contracted by: <span className="text-slate-200 font-semibold">{selectedQuest.giver}</span>
                  </p>
                </div>
              </div>

              <div className="my-5 p-4 rounded-lg bg-slate-950/50 border border-slate-800 text-sm text-slate-300 leading-relaxed italic">
                "{selectedQuest.description}"
              </div>

              {/* Objectives List */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 font-cinzel">
                  Current Objectives
                </h4>
                <div className="space-y-3">
                  {selectedQuest.objectives.map((obj) => (
                    <div
                      key={obj.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        obj.completed
                          ? 'bg-emerald-950/20 border-emerald-600/40 text-emerald-300'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {obj.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-amber-400 shrink-0" />
                        )}
                        <span className="text-sm font-medium">{obj.text}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700">
                        {obj.current} / {obj.required}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Location */}
              {selectedQuest.targetLocation && (
                <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>Target Zone: <strong className="text-sky-300">{selectedQuest.targetLocation.name}</strong></span>
                </div>
              )}
            </div>

            {/* Rewards */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-amber-400 text-sm font-bold">
                  <Award className="w-4 h-4" />
                  <span>+{selectedQuest.rewards.xp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-300 text-sm font-bold">
                  <span>🪙</span>
                  <span>+{selectedQuest.rewards.gold} Gold</span>
                </div>
              </div>

              <div className="text-xs font-semibold px-3 py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Tracked on Compass
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
