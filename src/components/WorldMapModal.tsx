import React from 'react';
import { X, MapPin, Compass } from 'lucide-react';

interface WorldMapModalProps {
  playerPos: { x: number; z: number };
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({ playerPos, onClose }) => {
  // World bounds: approx -140 to 140
  const mapWidth = 560;
  const mapHeight = 560;

  const toMapCoord = (x: number, z: number) => {
    const px = ((x + 130) / 260) * mapWidth;
    const py = ((z + 130) / 260) * mapHeight;
    return { px: Math.max(10, Math.min(mapWidth - 10, px)), py: Math.max(10, Math.min(mapHeight - 10, py)) };
  };

  const landmarks = [
    { name: 'Sunfall Outpost (Settlement & Forge)', x: 0, z: 0, color: '#f59e0b', icon: '🏰' },
    { name: 'Whispering Forest (Goblin Encampment)', x: -15, z: 25, color: '#22c55e', icon: '🌲' },
    { name: 'Stone Bridge River Crossing', x: 0, z: 35, color: '#38bdf8', icon: '🌉' },
    { name: 'The Deep Grotto (Subterranean Cavern & Mithril)', x: -50, z: -100, color: '#c084fc', icon: '🕳️' },
    { name: 'Runic Sunken Ruins (Colossus Boss Arena)', x: 65, z: -65, color: '#ef4444', icon: '🏛️' },
  ];

  const playerCoord = toMapCoord(playerPos.x, playerPos.z);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-600/50 rounded-xl shadow-2xl overflow-hidden text-slate-200 p-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 p-1 rounded-lg bg-slate-800/80 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-cinzel text-amber-200">
              Cartography of Eldoria
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Player: X: {Math.round(playerPos.x)}, Z: {Math.round(playerPos.z)}
          </span>
        </div>

        {/* Map Canvas Visual */}
        <div className="relative mt-4 w-full aspect-square max-w-[500px] bg-gradient-to-br from-stone-900 via-slate-950 to-stone-900 border-2 border-amber-900/60 rounded-xl overflow-hidden shadow-inner p-2">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

          {/* Biome circles */}
          <div className="absolute top-[6%] left-[18%] w-32 h-32 rounded-full bg-purple-950/30 border border-purple-500/20 blur-sm" />
          <div className="absolute top-[18%] right-[16%] w-36 h-36 rounded-full bg-red-950/30 border border-red-500/20 blur-sm" />
          <div className="absolute bottom-[20%] left-[25%] w-48 h-48 rounded-full bg-emerald-950/30 border border-emerald-500/20 blur-sm" />

          {/* River Stream */}
          <div className="absolute bottom-[28%] left-0 right-0 h-4 bg-sky-900/40 border-y border-sky-500/20" />

          {/* Landmarks */}
          {landmarks.map((lm, idx) => {
            const pos = toMapCoord(lm.x, lm.z);
            return (
              <div
                key={idx}
                className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(pos.px / mapWidth) * 100}%`, top: `${(pos.py / mapHeight) * 100}%` }}
              >
                <span className="text-xl drop-shadow">{lm.icon}</span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 border whitespace-nowrap mt-0.5 font-cinzel"
                  style={{ color: lm.color, borderColor: `${lm.color}66` }}
                >
                  {lm.name}
                </span>
              </div>
            );
          })}

          {/* Live Player Marker */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center"
            style={{
              left: `${(playerCoord.px / mapWidth) * 100}%`,
              top: `${(playerCoord.py / mapHeight) * 100}%`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-lg relative flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
            <span className="text-[10px] font-bold text-amber-300 bg-slate-950 px-1 rounded border border-amber-400/50 mt-1 whitespace-nowrap">
              You
            </span>
          </div>
        </div>

        <div className="w-full mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <span>Explore deep into <strong>The Deep Grotto</strong> (North) for rare Mithril veins.</span>
          <span className="text-amber-400 font-semibold">Press [M] to toggle map</span>
        </div>
      </div>
    </div>
  );
};
