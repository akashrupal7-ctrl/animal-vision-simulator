import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Zap, Pause, Play, Trophy, Clock } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface SlidingPuzzleProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

type Difficulty = '3x3' | '4x4';

export const SlidingPuzzleGame: React.FC<SlidingPuzzleProps> = ({ onGameEnd, onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('3x3');
  const size = difficulty === '3x3' ? 3 : 4;
  const totalTiles = size * size;

  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Generate Solvable Board by taking solved board and making valid random moves
  const generateSolvableBoard = () => {
    let tiles = Array.from({ length: totalTiles }, (_, i) => (i + 1) % totalTiles);
    let blankIdx = totalTiles - 1;

    // Perform random valid moves to shuffle guaranteed solvability
    for (let i = 0; i < 80; i++) {
      const row = Math.floor(blankIdx / size);
      const col = blankIdx % size;
      const neighbors: number[] = [];

      if (row > 0) neighbors.push(blankIdx - size);
      if (row < size - 1) neighbors.push(blankIdx + size);
      if (col > 0) neighbors.push(blankIdx - 1);
      if (col < size - 1) neighbors.push(blankIdx + 1);

      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      tiles[blankIdx] = tiles[chosen];
      tiles[chosen] = 0;
      blankIdx = chosen;
    }

    setBoard(tiles);
    setMoves(0);
    setTimeElapsed(0);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
  };

  useEffect(() => {
    generateSolvableBoard();
  }, [difficulty]);

  // Stopwatch Ticker
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused]);

  const handleTileClick = (idx: number) => {
    if (isGameOver || isPaused) return;

    const zeroIdx = board.indexOf(0);
    const r1 = Math.floor(idx / size);
    const c1 = idx % size;
    const r2 = Math.floor(zeroIdx / size);
    const c2 = zeroIdx % size;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

    if (isAdjacent) {
      soundManager.playClick();
      const newBoard = [...board];
      newBoard[zeroIdx] = newBoard[idx];
      newBoard[idx] = 0;

      setBoard(newBoard);
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // Check Win Condition: 1..N, 0
      const solved = Array.from({ length: totalTiles }, (_, i) => (i + 1) % totalTiles).join(',');
      if (newBoard.join(',') === solved) {
        soundManager.playWin();
        setIsWin(true);
        setIsGameOver(true);
      }
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const calculatedScore = Math.max(50, 400 - moves * 3 - timeElapsed * 2);
    const earnedCoins = Math.round(calculatedScore / 5);
    onGameEnd(calculatedScore, earnedCoins, calculatedScore);
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
          <h2 className="text-base font-black text-white">Compound Eye Sliding Puzzle</h2>
          <p className="text-[10px] text-slate-400">Slide tiles into numerical order</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={generateSolvableBoard}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Mode Selector */}
      <div className="flex justify-center gap-2">
        {(['3x3', '4x4'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
              difficulty === d
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {d} Grid
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Moves: {moves}
        </div>
        <div className="text-cyan-400 flex items-center gap-1 font-extrabold">
          <Clock className="w-4 h-4" /> {timeElapsed}s
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      {/* Sliding Puzzle Canvas */}
      <div
        className={`grid gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl select-none ${
          size === 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}
      >
        {board.map((num, idx) => (
          <button
            key={idx}
            onClick={() => handleTileClick(idx)}
            className={`aspect-square rounded-2xl border font-black text-xl sm:text-2xl flex items-center justify-center transition cursor-pointer select-none ${
              num === 0
                ? 'bg-slate-950 border-slate-900 shadow-inner'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 border-slate-700 hover:border-emerald-500 text-white shadow-md active:scale-95'
            }`}
          >
            {num > 0 ? num : ''}
          </button>
        ))}
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
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center p-6 space-y-4 text-center border border-emerald-500/40">
          <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
          <div>
            <h3 className="text-2xl font-black text-white">🎉 Puzzle Solved!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Solved in {moves} moves & {timeElapsed} seconds!
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Calculated Score: {Math.max(50, 400 - moves * 3 - timeElapsed * 2)} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(Math.max(50, 400 - moves * 3 - timeElapsed * 2) / 5)} Coins</div>
            <div className="text-teal-300 font-bold">+ {Math.max(50, 400 - moves * 3 - timeElapsed * 2)} XP</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={generateSolvableBoard}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Play Again
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
