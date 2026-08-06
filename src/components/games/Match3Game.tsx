import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Zap, ArrowLeft, Pause, Play, Trophy, Sparkles, Star, Flame, Clock } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface Match3Props {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const ANIMAL_ITEMS = ['🐶', '🦅', '🦐', '🦉', '🐍', '🦈'];
const BOMB = '💣';
const RAINBOW = '🌈';

export const Match3Game: React.FC<Match3Props> = ({ onGameEnd, onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const size = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8;
  const targetScore = difficulty === 'easy' ? 400 : difficulty === 'medium' ? 800 : 1200;
  
  const [board, setBoard] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(20);
  const [combo, setCombo] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [stars, setStars] = useState(0);

  // Initialize board with no starting 3-matches
  const createBoard = () => {
    let newBoard: string[] = [];
    const totalCells = size * size;
    for (let i = 0; i < totalCells; i++) {
      let randomAnimal = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
      // avoid instant 3 in a row
      while (
        (i >= 2 && i % size >= 2 && newBoard[i - 1] === randomAnimal && newBoard[i - 2] === randomAnimal) ||
        (i >= size * 2 && newBoard[i - size] === randomAnimal && newBoard[i - size * 2] === randomAnimal)
      ) {
        randomAnimal = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
      }
      newBoard.push(randomAnimal);
    }
    setBoard(newBoard);
    setScore(0);
    setMovesLeft(difficulty === 'easy' ? 25 : difficulty === 'medium' ? 20 : 15);
    setCombo(1);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
    setSelectedIdx(null);
  };

  useEffect(() => {
    createBoard();
  }, [difficulty]);

  // Run Cascade Matching Logic
  const processCascade = async (currentBoard: string[], currentCombo = 1): Promise<{ board: string[]; addedScore: number }> => {
    let matchedIndices = new Set<number>();
    let specialCreated: { idx: number; type: string }[] = [];

    // Horizontal check
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 2; c++) {
        const i1 = r * size + c;
        const i2 = i1 + 1;
        const i3 = i1 + 2;
        if (
          currentBoard[i1] &&
          currentBoard[i1] !== BOMB &&
          currentBoard[i1] !== RAINBOW &&
          currentBoard[i1] === currentBoard[i2] &&
          currentBoard[i1] === currentBoard[i3]
        ) {
          matchedIndices.add(i1);
          matchedIndices.add(i2);
          matchedIndices.add(i3);

          // 4 match check
          if (c < size - 3 && currentBoard[i1] === currentBoard[i1 + 3]) {
            matchedIndices.add(i1 + 3);
            specialCreated.push({ idx: i1 + 1, type: BOMB });
          }
          // 5 match check
          if (c < size - 4 && currentBoard[i1] === currentBoard[i1 + 3] && currentBoard[i1] === currentBoard[i1 + 4]) {
            matchedIndices.add(i1 + 4);
            specialCreated.push({ idx: i1 + 2, type: RAINBOW });
          }
        }
      }
    }

    // Vertical check
    for (let c = 0; c < size; c++) {
      for (let r = 0; r < size - 2; r++) {
        const i1 = r * size + c;
        const i2 = i1 + size;
        const i3 = i1 + size * 2;
        if (
          currentBoard[i1] &&
          currentBoard[i1] !== BOMB &&
          currentBoard[i1] !== RAINBOW &&
          currentBoard[i1] === currentBoard[i2] &&
          currentBoard[i1] === currentBoard[i3]
        ) {
          matchedIndices.add(i1);
          matchedIndices.add(i2);
          matchedIndices.add(i3);

          if (r < size - 3 && currentBoard[i1] === currentBoard[i1 + size * 3]) {
            matchedIndices.add(i1 + size * 3);
            specialCreated.push({ idx: i1 + size, type: BOMB });
          }
        }
      }
    }

    if (matchedIndices.size === 0) {
      return { board: currentBoard, addedScore: 0 };
    }

    soundManager.playMatch();
    const points = matchedIndices.size * 20 * currentCombo;
    setCombo(currentCombo);

    // Create copy & clear matched
    const tempBoard = [...currentBoard];
    matchedIndices.forEach((idx) => {
      tempBoard[idx] = '';
    });

    // Place special items
    specialCreated.forEach(({ idx, type }) => {
      tempBoard[idx] = type;
    });

    // Gravity fall logic
    for (let col = 0; col < size; col++) {
      let emptySlots = 0;
      for (let row = size - 1; row >= 0; row--) {
        const idx = row * size + col;
        if (tempBoard[idx] === '') {
          emptySlots++;
        } else if (emptySlots > 0) {
          tempBoard[(row + emptySlots) * size + col] = tempBoard[idx];
          tempBoard[idx] = '';
        }
      }
      // Fill top empty slots with new random animals
      for (let row = 0; row < emptySlots; row++) {
        const idx = row * size + col;
        tempBoard[idx] = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
      }
    }

    setBoard(tempBoard);

    // Recursive cascade step
    const nextCascade = await processCascade(tempBoard, currentCombo + 1);
    return {
      board: nextCascade.board,
      addedScore: points + nextCascade.addedScore,
    };
  };

  const handleTileClick = async (idx: number) => {
    if (isGameOver || isPaused || movesLeft <= 0) return;

    if (selectedIdx === null) {
      soundManager.playClick();
      setSelectedIdx(idx);
      return;
    }

    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }

    const r1 = Math.floor(selectedIdx / size);
    const c1 = selectedIdx % size;
    const r2 = Math.floor(idx / size);
    const c2 = idx % size;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

    if (!isAdjacent) {
      setSelectedIdx(idx);
      return;
    }

    soundManager.playClick();
    const newBoard = [...board];
    const item1 = newBoard[selectedIdx];
    const item2 = newBoard[idx];

    // Special item triggers
    if (item1 === RAINBOW || item2 === RAINBOW) {
      const targetColor = item1 === RAINBOW ? item2 : item1;
      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === targetColor || newBoard[i] === RAINBOW) {
          newBoard[i] = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
        }
      }
      soundManager.playMatch();
      setBoard(newBoard);
      setSelectedIdx(null);
      setMovesLeft((m) => m - 1);
      setScore((s) => s + 200);
      return;
    }

    if (item1 === BOMB || item2 === BOMB) {
      const bombIdx = item1 === BOMB ? selectedIdx : idx;
      const bRow = Math.floor(bombIdx / size);
      const bCol = bombIdx % size;
      for (let i = 0; i < size; i++) {
        newBoard[bRow * size + i] = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
        newBoard[i * size + bCol] = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
      }
      soundManager.playMatch();
      setBoard(newBoard);
      setSelectedIdx(null);
      setMovesLeft((m) => m - 1);
      setScore((s) => s + 150);
      return;
    }

    // Swap items
    newBoard[selectedIdx] = item2;
    newBoard[idx] = item1;
    setSelectedIdx(null);

    const nextMoves = movesLeft - 1;
    setMovesLeft(nextMoves);

    // Process cascade
    const result = await processCascade(newBoard, 1);
    const newScore = score + result.addedScore;
    setScore(newScore);

    // Check Win/Lose
    if (newScore >= targetScore) {
      const starRating = nextMoves >= 10 ? 3 : nextMoves >= 5 ? 2 : 1;
      setStars(starRating);
      setIsWin(true);
      setIsGameOver(true);
      soundManager.playWin();
    } else if (nextMoves <= 0) {
      setIsWin(false);
      setIsGameOver(true);
      soundManager.playLose();
    }
  };

  const handleFinishRewards = () => {
    const coins = Math.round(score / 5) + (isWin ? 50 : 10);
    const xp = score + (isWin ? 100 : 20);
    onGameEnd(score, coins, xp);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto animate-fade-in relative">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white flex items-center justify-center gap-1">
            Animal Match-3 <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-[10px] text-slate-400">Target: {targetScore} Pts | Align 3+ matching vision icons</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={createBoard}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="flex justify-center gap-2">
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
              difficulty === d
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Score & Moves Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Score: {score}
        </div>
        {combo > 1 && (
          <div className="text-orange-400 font-extrabold flex items-center gap-1 animate-bounce">
            <Flame className="w-4 h-4" /> {combo}x COMBO!
          </div>
        )}
        <div className="text-emerald-400 font-black">Moves: {movesLeft}</div>
      </div>

      {/* Grid Canvas */}
      <div
        className={`grid gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl transition-all ${
          size === 6 ? 'grid-cols-6' : size === 7 ? 'grid-cols-7' : 'grid-cols-8'
        }`}
      >
        {board.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTileClick(idx)}
            className={`aspect-square rounded-2xl text-xl sm:text-2xl flex items-center justify-center transition cursor-pointer border select-none ${
              selectedIdx === idx
                ? 'bg-emerald-500/40 border-emerald-400 scale-105 shadow-lg ring-2 ring-emerald-400'
                : item === BOMB || item === RAINBOW
                ? 'bg-gradient-to-tr from-purple-900 to-indigo-900 border-purple-400 animate-pulse'
                : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {item}
          </motion.button>
        ))}
      </div>

      {/* Pause Overlay */}
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
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center p-6 space-y-4 text-center animate-fade-in border border-emerald-500/40">
          <Trophy className={`w-16 h-16 ${isWin ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <div>
            <h3 className="text-2xl font-black text-white">{isWin ? '🎉 Victory!' : '💔 Game Over'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isWin ? `You passed the ${difficulty} target of ${targetScore} Pts!` : 'Out of moves! Try again.'}
            </p>
          </div>

          {/* Star Rating */}
          {isWin && (
            <div className="flex gap-2">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Final Score: {score} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(score / 5) + (isWin ? 50 : 10)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score + (isWin ? 100 : 20)} XP</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={createBoard}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Play Again
            </button>
            <button
              onClick={handleFinishRewards}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
            >
              Claim & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
