import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Zap, HelpCircle, Clock, Pause, Play, Trophy } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface WordSearchProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const WORD_BANK = [
  'CONES', 'RODS', 'FOVEA', 'AMBER', 'EAGLE', 'SHARK', 'TAPETUM',
  'VIPER', 'SPECTRUM', 'RETINA', 'OPTIC', 'HAWK', 'OCTOPUS', 'CORNEA'
];

interface PlacedWord {
  word: string;
  coords: [number, number][]; // [row, col]
}

export const WordSearchGame: React.FC<WordSearchProps> = ({ onGameEnd, onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const gridSize = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 9 : 10;
  const targetWordCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;

  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number][]>([]);
  const [highlightedCoords, setHighlightedCoords] = useState<Set<string>>(new Set());
  
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [hintCoords, setHintCoords] = useState<[number, number] | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Generate Board
  const generateGrid = () => {
    const size = gridSize;
    const newGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const shuffleWords = [...WORD_BANK].sort(() => Math.random() - 0.5).slice(0, targetWordCount);

    const placed: PlacedWord[] = [];

    const directions = [
      [0, 1],   // Horizontal
      [1, 0],   // Vertical
      [1, 1],   // Diagonal Down-Right
      [-1, 1],  // Diagonal Up-Right
    ];

    for (const word of shuffleWords) {
      let wordPlaced = false;
      let attempts = 0;

      while (!wordPlaced && attempts < 100) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startR = Math.floor(Math.random() * size);
        const startC = Math.floor(Math.random() * size);

        // Check bounds
        const endR = startR + dir[0] * (word.length - 1);
        const endC = startC + dir[1] * (word.length - 1);

        if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
          // Check fit
          let canFit = true;
          const coords: [number, number][] = [];

          for (let i = 0; i < word.length; i++) {
            const r = startR + dir[0] * i;
            const c = startC + dir[1] * i;
            if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
              canFit = false;
              break;
            }
            coords.push([r, c]);
          }

          if (canFit) {
            coords.forEach(([r, c], i) => {
              newGrid[r][c] = word[i];
            });
            placed.push({ word, coords });
            wordPlaced = true;
          }
        }
      }
    }

    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setPlacedWords(placed);
    setFoundWords([]);
    setSelectedCoords([]);
    setHighlightedCoords(new Set());
    setScore(0);
    setTimeLeft(difficulty === 'easy' ? 150 : difficulty === 'medium' ? 120 : 90);
    setHintCoords(null);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
  };

  useEffect(() => {
    generateGrid();
  }, [difficulty]);

  // Timer Ticker
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsGameOver(true);
          setIsWin(false);
          soundManager.playLose();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused]);

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isPaused) return;
    soundManager.playClick();

    const newSelected = [...selectedCoords, [r, c] as [number, number]];
    setSelectedCoords(newSelected);

    // Check if new selection matches any unfound placed word
    const selectedLetters = newSelected.map(([sr, sc]) => grid[sr][sc]).join('');

    for (const pw of placedWords) {
      if (!foundWords.includes(pw.word) && pw.word === selectedLetters) {
        // Matched Word!
        soundManager.playMatch();
        const updatedFound = [...foundWords, pw.word];
        setFoundWords(updatedFound);

        // Highlight persistent coords
        const nextHighlighted = new Set(highlightedCoords);
        pw.coords.forEach(([hr, hc]) => nextHighlighted.add(`${hr}-${hc}`));
        setHighlightedCoords(nextHighlighted);

        setSelectedCoords([]);
        setScore((s) => s + pw.word.length * 20);

        // Check Win
        if (updatedFound.length === placedWords.length) {
          setIsWin(true);
          setIsGameOver(true);
          soundManager.playWin();
        }
        return;
      }
    }

    // Reset selection if longer than max word length
    if (newSelected.length >= 10) {
      setSelectedCoords([]);
    }
  };

  const handleHint = () => {
    if (isGameOver || isPaused) return;
    const unfound = placedWords.filter((pw) => !foundWords.includes(pw.word));
    if (unfound.length > 0) {
      soundManager.playClick();
      const target = unfound[0];
      setHintCoords(target.coords[0]);
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(score / 5) + (isWin ? 30 : 0);
    const earnedXP = score + (isWin ? 100 : 10);
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
          <h2 className="text-base font-black text-white">Optics Word Search</h2>
          <p className="text-[10px] text-slate-400">Select letters to locate target optical terms</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={generateGrid}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
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

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Score: {score}
        </div>
        <div className="text-rose-400 flex items-center gap-1 font-extrabold">
          <Clock className="w-4 h-4" /> {timeLeft}s
        </div>
        <button
          onClick={handleHint}
          className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {/* Word Search Grid */}
      <div
        className={`grid gap-1 p-2 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl select-none ${
          gridSize === 8 ? 'grid-cols-8' : gridSize === 9 ? 'grid-cols-9' : 'grid-cols-10'
        }`}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const coordKey = `${r}-${c}`;
            const isHighlighted = highlightedCoords.has(coordKey);
            const isSelected = selectedCoords.some(([sr, sc]) => sr === r && sc === c);
            const isHint = hintCoords && hintCoords[0] === r && hintCoords[1] === c;

            return (
              <button
                key={coordKey}
                onClick={() => handleCellClick(r, c)}
                className={`aspect-square rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center transition cursor-pointer border ${
                  isHighlighted
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-extrabold scale-95'
                    : isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-lg'
                    : isHint
                    ? 'bg-indigo-600 text-white border-indigo-400 animate-bounce'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      {/* Word List Badges */}
      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
        {placedWords.map((pw) => {
          const isFound = foundWords.includes(pw.word);
          return (
            <span
              key={pw.word}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono transition border ${
                isFound
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 line-through'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              {pw.word}
            </span>
          );
        })}
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
          <Trophy className={`w-16 h-16 ${isWin ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <div>
            <h3 className="text-2xl font-black text-white">{isWin ? '🎉 All Words Found!' : '⏰ Time Expired!'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isWin ? `Great job! You found all ${placedWords.length} optical terms.` : 'Time ran out! Try again.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Final Score: {score} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(score / 5) + (isWin ? 30 : 0)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score + (isWin ? 100 : 10)} XP</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={generateGrid}
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
