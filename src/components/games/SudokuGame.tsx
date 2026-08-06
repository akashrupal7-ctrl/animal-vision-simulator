import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SudokuProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const SudokuGame: React.FC<SudokuProps> = ({ onGameEnd, onBack }) => {
  const [grid, setGrid] = useState<number[][]>([
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 3, 4, 1],
    [4, 1, 2, 3],
  ]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const handleCellClick = (r: number, c: number) => {
    soundManager.playClick();
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    soundManager.playMatch();
    const [r, c] = selectedCell;
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);
  };

  const handleFinish = () => {
    soundManager.playWin();
    onGameEnd(400, 80, 400);
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
          <h2 className="text-base font-black text-white">4x4 Optics Mini Sudoku</h2>
          <p className="text-[10px] text-slate-400">Fill numbers 1 to 4 without repetition</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-emerald-400">4x4 Brain Puzzle</div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {grid.map((row, r) =>
          row.map((val, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`w-16 h-16 rounded-2xl border font-black text-2xl flex items-center justify-center transition cursor-pointer ${
                selectedCell && selectedCell[0] === r && selectedCell[1] === c
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              {val}
            </button>
          ))
        )}
      </div>

      {/* Number pad */}
      <div className="flex gap-2 justify-center pt-2">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg cursor-pointer border border-slate-700"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};
