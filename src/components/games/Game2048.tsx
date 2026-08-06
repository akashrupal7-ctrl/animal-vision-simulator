import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Zap, Pause, Play, Trophy, Sparkles } from 'lucide-react';
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
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const initGame = () => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    spawnRandomTile(newBoard);
    spawnRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const spawnRandomTile = (grid: number[][]) => {
    const emptyCells: [number, number][] = [];
    grid.forEach((row, r) =>
      row.forEach((val, c) => {
        if (val === 0) emptyCells.push([r, c]);
      })
    );
    if (emptyCells.length > 0) {
      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  // Full 2048 Merge Logic
  const slideRowLeft = (row: number[]): { newRow: number[]; gainedScore: number; merged: boolean } => {
    // 1. Filter zeros
    let nonZeros = row.filter((v) => v !== 0);
    let gainedScore = 0;
    let merged = false;

    // 2. Merge adjacent identicals
    let i = 0;
    while (i < nonZeros.length - 1) {
      if (nonZeros[i] === nonZeros[i + 1]) {
        nonZeros[i] *= 2;
        gainedScore += nonZeros[i];
        nonZeros[i + 1] = 0;
        merged = true;
        i += 2;
      } else {
        i++;
      }
    }

    // 3. Filter zeros again & pad up to 4
    const mergedRow = nonZeros.filter((v) => v !== 0);
    while (mergedRow.length < 4) {
      mergedRow.push(0);
    }

    return { newRow: mergedRow, gainedScore, merged };
  };

  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver || isPaused) return;

    let currentBoard = board.map((row) => [...row]);
    let totalScoreGained = 0;
    let changed = false;

    if (direction === 'left' || direction === 'right') {
      for (let r = 0; r < 4; r++) {
        let row = currentBoard[r];
        if (direction === 'right') row = row.reverse();

        const { newRow, gainedScore } = slideRowLeft(row);
        let finalRow = direction === 'right' ? newRow.reverse() : newRow;

        if (finalRow.join(',') !== currentBoard[r].join(',')) {
          changed = true;
        }

        currentBoard[r] = finalRow;
        totalScoreGained += gainedScore;
      }
    } else {
      // Up or Down
      for (let c = 0; c < 4; c++) {
        let column = [currentBoard[0][c], currentBoard[1][c], currentBoard[2][c], currentBoard[3][c]];
        if (direction === 'down') column = column.reverse();

        const { newRow, gainedScore } = slideRowLeft(column);
        let finalCol = direction === 'down' ? newRow.reverse() : newRow;

        for (let r = 0; r < 4; r++) {
          if (currentBoard[r][c] !== finalCol[r]) {
            changed = true;
          }
          currentBoard[r][c] = finalCol[r];
        }
        totalScoreGained += gainedScore;
      }
    }

    if (changed) {
      soundManager.playClick();
      spawnRandomTile(currentBoard);
      setBoard(currentBoard);
      setScore((s) => s + totalScoreGained);

      // Check Win (2048 tile reached)
      if (!isWin && currentBoard.some((row) => row.includes(2048))) {
        setIsWin(true);
        soundManager.playWin();
      }

      // Check Lose (No moves left)
      if (checkIsGameOver(currentBoard)) {
        setIsGameOver(true);
        soundManager.playLose();
      }
    }
  };

  const checkIsGameOver = (grid: number[][]): boolean => {
    // 1. Check empty cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    // 2. Check adjacent identicals
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = grid[r][c];
        if (r < 3 && grid[r + 1][c] === val) return false;
        if (c < 3 && grid[r][c + 1] === val) return false;
      }
    }
    return true; // Full & no valid merges
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleMove('left');
      if (e.key === 'ArrowRight') handleMove('right');
      if (e.key === 'ArrowUp') handleMove('up');
      if (e.key === 'ArrowDown') handleMove('down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, isGameOver, isPaused]);

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
      if (dx > 30) handleMove('right');
      else if (dx < -30) handleMove('left');
    } else {
      if (dy > 30) handleMove('down');
      else if (dy < -30) handleMove('up');
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(score / 10);
    const earnedXP = score;
    onGameEnd(score, earnedCoins, earnedXP);
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-slate-800 text-slate-200 border-slate-700';
      case 4:
        return 'bg-teal-900 text-teal-200 border-teal-700';
      case 8:
        return 'bg-emerald-800 text-emerald-100 border-emerald-600';
      case 16:
        return 'bg-cyan-700 text-white border-cyan-500 font-black';
      case 32:
        return 'bg-blue-600 text-white border-blue-400 font-black';
      case 64:
        return 'bg-indigo-600 text-white border-indigo-400 font-black';
      case 128:
        return 'bg-purple-600 text-white border-purple-400 font-black shadow-lg';
      case 256:
        return 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-xl';
      case 512:
        return 'bg-orange-500 text-slate-950 border-orange-300 font-black shadow-2xl';
      case 1024:
        return 'bg-rose-500 text-white border-rose-300 font-black ring-2 ring-rose-400';
      case 2048:
        return 'bg-emerald-400 text-slate-950 border-emerald-200 font-black ring-4 ring-emerald-300 animate-pulse';
      default:
        return 'bg-slate-900 border-slate-800/80';
    }
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
          <h2 className="text-base font-black text-white">Photoreceptor 2048</h2>
          <p className="text-[10px] text-slate-400">Merge cone cells to evolve 2048 vision!</p>
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
          <Zap className="w-4 h-4 fill-amber-400" /> Score: {score}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      {/* Grid Canvas */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid grid-cols-4 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl select-none"
      >
        {board.map((row, r) =>
          row.map((val, c) => (
            <motion.div
              key={`${r}-${c}`}
              layout
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-black transition border text-lg sm:text-xl shadow-md ${getTileColor(
                val
              )}`}
            >
              <span>{val > 0 ? val : ''}</span>
            </motion.div>
          ))
        )}
      </div>

      {/* Touch Swipe D-Pad */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          onClick={() => handleMove('up')}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
        >
          ▲ UP
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => handleMove('left')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
          >
            ◀ LEFT
          </button>
          <button
            onClick={() => handleMove('right')}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
          >
            RIGHT ▶
          </button>
        </div>
        <button
          onClick={() => handleMove('down')}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer shadow-md active:scale-95"
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

      {/* Game Over / Win Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center p-6 space-y-4 text-center border border-amber-500/40">
          <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">{isWin ? '🏆 2048 Reached!' : 'No Moves Left!'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isWin ? 'Congratulations! You evolved 2048 photoreceptor vision!' : 'Grid is locked with no valid merges.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Final Score: {score} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(score / 10)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score} XP</div>
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
