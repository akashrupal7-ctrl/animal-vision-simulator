import React, { useState } from 'react';
import { RotateCcw, ArrowLeft, Trophy, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface BlockPuzzleProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

const GRID_SIZE = 8;

export const BlockPuzzleGame: React.FC<BlockPuzzleProps> = ({ onGameEnd, onBack }) => {
  const [grid, setGrid] = useState<boolean[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
  );
  const [score, setScore] = useState(0);

  const BLOCKS = [
    [[true, true], [true, true]], // 2x2
    [[true, true, true]],         // 1x3
    [[true], [true], [true]],     // 3x1
    [[true, false], [true, true]], // L shape
  ];

  const handleCellClick = (r: number, c: number) => {
    soundManager.playClick();
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = !newGrid[r][c];

    // Check full rows or cols
    let clearedLines = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (newGrid[row].every((cell) => cell)) {
        clearedLines++;
        newGrid[row] = Array(GRID_SIZE).fill(false);
      }
    }

    if (clearedLines > 0) {
      soundManager.playMatch();
      setScore((s) => s + clearedLines * 100);
    } else {
      setScore((s) => s + 10);
    }

    setGrid(newGrid);
  };

  const handleReset = () => {
    soundManager.playClick();
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)));
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
          <h2 className="text-base font-black text-white">Block Blast Puzzle</h2>
          <p className="text-[10px] text-slate-400">Fill rows & columns to blast blocks!</p>
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

      <div className="grid grid-cols-8 gap-1 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {grid.map((row, r) =>
          row.map((filled, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`w-9 h-9 rounded-lg transition cursor-pointer border ${
                filled
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-300 shadow-md scale-95'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
};
