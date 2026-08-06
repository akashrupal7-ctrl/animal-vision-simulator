import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Zap, Trophy, Pause, Play, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SnakeProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

const GRID = 16;

type Point = { x: number; y: number };

export const SnakeGame: React.FC<SnakeProps> = ({ onGameEnd, onBack }) => {
  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
  ]);
  const [dir, setDir] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 4, y: 4 });
  const [specialFood, setSpecialFood] = useState<Point | null>({ x: 12, y: 12 });
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(160);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Touch Swipe Handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const initGame = () => {
    setSnake([
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ]);
    setDir({ x: 0, y: -1 });
    setScore(0);
    setSpeed(160);
    setIsPaused(false);
    setIsGameOver(false);
    spawnFood();
  };

  const spawnFood = () => {
    setFood({
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    });
    if (Math.random() < 0.4) {
      setSpecialFood({
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      });
    } else {
      setSpecialFood(null);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dir.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && dir.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && dir.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && dir.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir]);

  // Main Loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };

        // Wall Collision
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
          soundManager.playLose();
          setIsGameOver(true);
          return prev;
        }

        // Self Collision
        if (prev.some((segment) => segment.x === head.x && segment.y === head.y)) {
          soundManager.playLose();
          setIsGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        // Eat Normal Food
        if (head.x === food.x && head.y === food.y) {
          soundManager.playMatch();
          setScore((s) => s + 10);
          setSpeed((sp) => Math.max(70, sp - 3));
          spawnFood();
        } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
          // Eat Special Food
          soundManager.playMatch();
          setScore((s) => s + 30);
          setSpecialFood(null);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [dir, food, specialFood, speed, isGameOver, isPaused]);

  const handleDirChange = (newDir: Point) => {
    if (isGameOver || isPaused) return;
    if (newDir.x === -dir.x && newDir.y === -dir.y) return; // prevent 180 flip
    soundManager.playClick();
    setDir(newDir);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) handleDirChange({ x: 1, y: 0 });
      else if (dx < -30) handleDirChange({ x: -1, y: 0 });
    } else {
      if (dy > 30) handleDirChange({ x: 0, y: 1 });
      else if (dy < -30) handleDirChange({ x: 0, y: -1 });
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(score / 5);
    const earnedXP = score * 5;
    onGameEnd(score, earnedCoins, earnedXP);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto animate-fade-in relative">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white">Pit Viper Thermal Snake</h2>
          <p className="text-[10px] text-slate-400">Track heat prey with thermal infrared vision</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={initGame}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Prey Caught: {score}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      {/* Snake Canvas Grid */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid grid-cols-16 gap-0.5 p-2 bg-slate-950 border border-red-500/30 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {Array(GRID)
          .fill(null)
          .map((_, r) =>
            Array(GRID)
              .fill(null)
              .map((_, c) => {
                const isSnake = snake.some((s) => s.x === c && s.y === r);
                const isHead = snake[0].x === c && snake[0].y === r;
                const isFood = food.x === c && food.y === r;
                const isSpecial = specialFood && specialFood.x === c && specialFood.y === r;

                let cellStyle = 'bg-slate-900/60';
                if (isHead) cellStyle = 'bg-gradient-to-tr from-red-500 to-amber-400 rounded-full shadow-lg scale-110';
                else if (isSnake) cellStyle = 'bg-red-600/80 rounded-md';
                else if (isSpecial) cellStyle = 'bg-amber-300 rounded-full animate-bounce shadow-lg ring-2 ring-amber-400';
                else if (isFood) cellStyle = 'bg-amber-500 rounded-full animate-ping';

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square transition-all ${cellStyle}`}
                  />
                );
              })
          )}
      </div>

      {/* Touch D-Pad */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          onClick={() => handleDirChange({ x: 0, y: -1 })}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black cursor-pointer shadow-md active:scale-95"
        >
          ▲ UP
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => handleDirChange({ x: -1, y: 0 })}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black cursor-pointer shadow-md active:scale-95"
          >
            ◀ LEFT
          </button>
          <button
            onClick={() => handleDirChange({ x: 1, y: 0 })}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black cursor-pointer shadow-md active:scale-95"
          >
            RIGHT ▶
          </button>
        </div>
        <button
          onClick={() => handleDirChange({ x: 0, y: 1 })}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black cursor-pointer shadow-md active:scale-95"
        >
          ▼ DOWN
        </button>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 space-y-4">
          <Pause className="w-12 h-12 text-amber-400 animate-pulse" />
          <h3 className="text-xl font-black text-white">Game Paused</h3>
          <button
            onClick={() => setIsPaused(false)}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-xl"
          >
            Resume Game
          </button>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center p-6 space-y-4 text-center border border-red-500/40">
          <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">Viper Hunt Ended!</h3>
            <p className="text-xs text-slate-400 mt-1">Snake collided with wall or itself.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Score: {score} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(score / 5)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score * 5} XP</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
