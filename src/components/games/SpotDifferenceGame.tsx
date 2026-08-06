import React, { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SpotDifferenceProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const SpotDifferenceGame: React.FC<SpotDifferenceProps> = ({ onGameEnd, onBack }) => {
  const [foundDiffs, setFoundDiffs] = useState<number[]>([]);
  const DIFF_COORDS = [1, 3, 5];

  const handleSpotClick = (id: number) => {
    if (DIFF_COORDS.includes(id) && !foundDiffs.includes(id)) {
      soundManager.playMatch();
      const updated = [...foundDiffs, id];
      setFoundDiffs(updated);

      if (updated.length === DIFF_COORDS.length) {
        soundManager.playWin();
      }
    } else {
      soundManager.playClick();
    }
  };

  const handleFinish = () => {
    const score = foundDiffs.length * 150;
    onGameEnd(score, Math.round(score / 5), score);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white">Eagle Eye Spot the Difference</h2>
          <p className="text-[10px] text-slate-400">Spot 3 subtle dichromatic optical anomalies</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400">Found: {foundDiffs.length} / 3</div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {[0, 1, 2, 3, 4, 5].map((id) => {
          const isFound = foundDiffs.includes(id);
          return (
            <button
              key={id}
              onClick={() => handleSpotClick(id)}
              className={`w-24 h-24 rounded-2xl border flex items-center justify-center text-3xl font-black transition cursor-pointer ${
                isFound
                  ? 'bg-emerald-500/40 border-emerald-400'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {id === 1 && !isFound ? '👁️' : id === 3 && !isFound ? '🦐' : id === 5 && !isFound ? '🐍' : '🦅'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
