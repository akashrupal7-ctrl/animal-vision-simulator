import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Zap, Trophy } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SnakeProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

const GRID = 16;

export const SnakeGame: React.FC<SnakeProps> = ({ onGameEnd, onBack }) => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 4, y: 4 });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };

        // Collision check
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
          setIsGameOver(true);
          soundManager.playLose();
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          soundManager.playMatch();
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID),
            y: Math.floor(Math.random() * GRID),
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [dir, food, isGameOver]);

  const handleDirChange = (newDir: { x: number; y: number }) => {
    soundManager.playClick();
    setDir(newDir);
  };

  const resetGame = () => {
    setSnake([{ x: 8, y: 8 }, { x: 8, y: 9 }]);
    setScore(0);
    setIsGameOver(false);
    setDir({ x: 0, y: -1 });
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(score / 5);
    const earnedXP = score * 10;
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
          <h2 className="text-base font-black text-white">Pit Viper Thermal Snake</h2>
          <p className="text-[10px] text-slate-400">Hunt heat signatures in dark terrain</p>
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
          <Zap className="w-4 h-4" /> Prey Caught: {score}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Finish Game
        </button>
      </div>

      <div className="grid grid-cols-16 gap-0.5 p-2 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {Array(GRID)
          .fill(null)
          .map((_, r) =>
            Array(GRID)
              .fill(null)
              .map((_, c) => {
                const isSnake = snake.some((s) => s.x === c && s.y === r);
                const isHead = snake[0].x === c && snake[0].y === r;
                const isFood = food.x === c && food.y === r;

                let cellStyle = 'bg-slate-900/60';
                if (isHead) cellStyle = 'bg-emerald-400 rounded-full shadow-lg';
                else if (isSnake) cellStyle = 'bg-emerald-600/80 rounded-md';
                else if (isFood) cellStyle = 'bg-red-500 rounded-full animate-ping';

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-5 h-5 transition-all ${cellStyle}`}
                  />
                );
              })
          )}
      </div>

      {/* Touch Controls */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={() => handleDirChange({ x: 0, y: -1 })}
          className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
        >
          ▲
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => handleDirChange({ x: -1, y: 0 })}
            className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
          >
            ◀
          </button>
          <button
            onClick={() => handleDirChange({ x: 1, y: 0 })}
            className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
          >
            ▶
          </button>
        </div>
        <button
          onClick={() => handleDirChange({ x: 0, y: 1 })}
          className="p-3 rounded-2xl bg-slate-800 text-white font-black cursor-pointer"
        >
          ▼
        </button>
      </div>
    </div>
  );
};
