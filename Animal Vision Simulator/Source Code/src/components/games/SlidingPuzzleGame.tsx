import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SlidingPuzzleProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const SlidingPuzzleGame: React.FC<SlidingPuzzleProps> = ({ onGameEnd, onBack }) => {
  const [board, setBoard] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 0, 8]);
  const [moves, setMoves] = useState(0);

  const handleTileClick = (idx: number) => {
    const zeroIdx = board.indexOf(0);
    const validMoves = [zeroIdx - 1, zeroIdx + 1, zeroIdx - 3, zeroIdx + 3];

    if (validMoves.includes(idx)) {
      soundManager.playClick();
      const newBoard = [...board];
      newBoard[zeroIdx] = newBoard[idx];
      newBoard[idx] = 0;
      setBoard(newBoard);
      setMoves((m) => m + 1);

      if (newBoard.join('') === '123456780') {
        soundManager.playWin();
      }
    }
  };

  const resetGame = () => {
    setBoard([1, 2, 3, 4, 5, 6, 7, 0, 8].sort(() => Math.random() - 0.5));
    setMoves(0);
  };

  const handleFinish = () => {
    const score = Math.max(50, 300 - moves * 5);
    const earnedCoins = Math.round(score / 5);
    onGameEnd(score, earnedCoins, score);
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
          <h2 className="text-base font-black text-white">Compound Eye Sliding Puzzle</h2>
          <p className="text-[10px] text-slate-400">Slide tiles into order 1 through 8</p>
        </div>
        <button
          onClick={resetGame}
          className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4" /> Moves: {moves}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {board.map((num, idx) => (
          <button
            key={idx}
            onClick={() => handleTileClick(idx)}
            className={`w-24 h-24 rounded-2xl border font-black text-2xl flex items-center justify-center transition cursor-pointer ${
              num === 0
                ? 'bg-slate-950 border-slate-900'
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500 text-white shadow-md'
            }`}
          >
            {num > 0 ? num : ''}
          </button>
        ))}
      </div>
    </div>
  );
};
