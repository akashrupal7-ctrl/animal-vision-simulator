import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface JigsawProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const JigsawGame: React.FC<JigsawProps> = ({ onGameEnd, onBack }) => {
  const [pieces, setPieces] = useState<number[]>([3, 1, 4, 2, 0, 8, 6, 5, 7]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handlePieceClick = (idx: number) => {
    soundManager.playClick();
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      const newPieces = [...pieces];
      const temp = newPieces[selectedIdx];
      newPieces[selectedIdx] = newPieces[idx];
      newPieces[idx] = temp;
      setPieces(newPieces);
      setSelectedIdx(null);

      if (newPieces.every((val, i) => val === i)) {
        soundManager.playWin();
      }
    }
  };

  const handleFinish = () => {
    const isSolved = pieces.every((val, i) => val === i);
    const score = isSolved ? 500 : 150;
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
          <h2 className="text-base font-black text-white">Animal Vision Jigsaw Puzzle</h2>
          <p className="text-[10px] text-slate-400">Swap tiles to reconstruct animal optics photo</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-emerald-400">
          Status: {pieces.every((val, i) => val === i) ? '🎉 Solved!' : 'In Progress'}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Reward
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {pieces.map((pieceNum, idx) => (
          <button
            key={idx}
            onClick={() => handlePieceClick(idx)}
            className={`w-24 h-24 rounded-2xl border flex items-center justify-center text-3xl font-black transition cursor-pointer ${
              selectedIdx === idx
                ? 'bg-emerald-500/40 border-emerald-400 scale-105'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            {['🦅', '🦁', '🦉', '🦐', '🐍', '🐺', '🦈', '🐝', '🦊'][pieceNum]}
          </button>
        ))}
      </div>
    </div>
  );
};
