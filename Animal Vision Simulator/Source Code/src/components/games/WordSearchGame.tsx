import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface WordSearchProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

const WORDS = ['CONES', 'RODS', 'FOVEA', 'AMBER', 'EAGLE', 'SHARK', 'TAPETUM'];

export const WordSearchGame: React.FC<WordSearchProps> = ({ onGameEnd, onBack }) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const GRID = [
    ['C', 'O', 'N', 'E', 'S', 'X', 'Y'],
    ['R', 'O', 'D', 'S', 'A', 'B', 'Z'],
    ['F', 'O', 'V', 'E', 'A', 'M', 'P'],
    ['A', 'M', 'B', 'E', 'R', 'Q', 'W'],
    ['E', 'A', 'G', 'L', 'E', 'S', 'K'],
    ['S', 'H', 'A', 'R', 'K', 'T', 'U'],
    ['T', 'A', 'P', 'E', 'T', 'U', 'M'],
  ];

  const handleWordClick = (word: string) => {
    if (foundWords.includes(word)) return;
    soundManager.playMatch();
    const updated = [...foundWords, word];
    setFoundWords(updated);
    setScore((s) => s + 50);

    if (updated.length === WORDS.length) {
      soundManager.playWin();
    }
  };

  const handleFinish = () => {
    const earnedCoins = Math.round(score / 5);
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
          <h2 className="text-base font-black text-white">Vision Optics Word Search</h2>
          <p className="text-[10px] text-slate-400">Find key optical terms in the grid!</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4" /> Found: {foundWords.length} / {WORDS.length}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {GRID.map((row, r) =>
          row.map((letter, c) => (
            <div
              key={`${r}-${c}`}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 font-mono font-black text-white flex items-center justify-center text-sm"
            >
              {letter}
            </div>
          ))
        )}
      </div>

      {/* Word List Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {WORDS.map((w) => {
          const isFound = foundWords.includes(w);
          return (
            <button
              key={w}
              onClick={() => handleWordClick(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer border ${
                isFound
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {w} {isFound ? '✓' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};
