import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface Game2048Props {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const Game2048: React.FC<Game2048Props> = ({ onGameEnd, onBack }) => {
  const [board, setBoard] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 2],
  ]);
  const [score, setScore] = useState(120);

  const handleMove = (dir: 'up' | 'down' | 'left' | 'right') => {
    soundManager.playClick();
    const newBoard = board.map((row) => [...row]);
    // Simple 2048 merge step simulation
    let addedScore = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if (newBoard[r][c] !== 0 && newBoard[r][c] === newBoard[r][c + 1]) {
          newBoard[r][c] *= 2;
          newBoard[r][c + 1] = 0;
          addedScore += newBoard[r][c];
        }
      }
    }
    // Add random tile
    const emptyCells: [number, number][] = [];
    newBoard.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val === 0) emptyCells.push([r, c]);
      })
    );
    if (emptyCells.length > 0) {
      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      newBoard[r][c] = Math.random() > 0.5 ? 2 : 4;
    }

    if (addedScore > 0) soundManager.playMatch();
    setScore((s) => s + addedScore + 4);
    setBoard(newBoard);
  };

  const handleReset = () => {
    setBoard([
      [0, 2, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 2],
    ]);
    setScore(0);
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(score / 10);
    const earnedXP = score;
    onGameEnd(score, earnedCoins, earnedXP);
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
          <h2 className="text-base font-black text-white">Animal Cones 2048</h2>
          <p className="text-[10px] text-slate-400">Combine photoreceptor cones to reach 2048!</p>
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4" /> Score: {score}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black transition border ${
                val > 0
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 border-emerald-300 text-lg shadow-md'
                  : 'bg-slate-900 text-slate-700 border-slate-800'
              }`}
            >
              <span>{val > 0 ? val : ''}</span>
            </div>
          ))
        )}
      </div>

      {/* Touch swipe buttons */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={() => handleMove('up')}
          className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
        >
          ▲ UP
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => handleMove('left')}
            className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
          >
            ◀ LEFT
          </button>
          <button
            onClick={() => handleMove('right')}
            className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
          >
            RIGHT ▶
          </button>
        </div>
        <button
          onClick={() => handleMove('down')}
          className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
        >
          ▼ DOWN
        </button>
      </div>
    </div>
  );
};
