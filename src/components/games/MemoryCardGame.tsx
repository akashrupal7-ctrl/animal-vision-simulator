import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Zap, Pause, Play, Trophy, Clock, Brain } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface MemoryGameProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

type GridSize = '4x4' | '6x6';

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_DATA = [
  { pairId: 1, emoji: '🦅', name: 'Eagle' },
  { pairId: 2, emoji: '🐍', name: 'Viper' },
  { pairId: 3, emoji: '🦐', name: 'Mantis' },
  { pairId: 4, emoji: '🐝', name: 'Bee' },
  { pairId: 5, emoji: '🦉', name: 'Owl' },
  { pairId: 6, emoji: '🐱', name: 'Cat' },
  { pairId: 7, emoji: '🐶', name: 'Dog' },
  { pairId: 8, emoji: '🐙', name: 'Octopus' },
  { pairId: 9, emoji: '🦎', name: 'Gecko' },
  { pairId: 10, emoji: '🦇', name: 'Bat' },
  { pairId: 11, emoji: '🦈', name: 'Shark' },
  { pairId: 12, emoji: '🐴', name: 'Horse' },
  { pairId: 13, emoji: '🦋', name: 'Butterfly' },
  { pairId: 14, emoji: '🐬', name: 'Dolphin' },
  { pairId: 15, emoji: '🦑', name: 'Squid' },
  { pairId: 16, emoji: ' Dragonfly', name: 'Dragonfly' },
  { pairId: 17, emoji: '🦥', name: 'Sloth' },
  { pairId: 18, emoji: '🦩', name: 'Flamingo' },
];

export const MemoryCardGame: React.FC<MemoryGameProps> = ({ onGameEnd, onBack }) => {
  const [gridSize, setGridSize] = useState<GridSize>('4x4');
  const pairCount = gridSize === '4x4' ? 8 : 18;
  const maxMoves = gridSize === '4x4' ? 24 : 50;

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gridSize === '4x4' ? 90 : 180);
  
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const initGame = () => {
    const selected = CARD_DATA.slice(0, pairCount);
    const deck: Card[] = [];

    selected.forEach((item, idx) => {
      deck.push({ id: idx * 2, pairId: item.pairId, emoji: item.emoji, name: item.name, isFlipped: false, isMatched: false });
      deck.push({ id: idx * 2 + 1, pairId: item.pairId, emoji: item.emoji, name: item.name, isFlipped: false, isMatched: false });
    });

    // Shuffle
    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setTimeLeft(gridSize === '4x4' ? 90 : 180);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
  };

  useEffect(() => {
    initGame();
  }, [gridSize]);

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

  const handleCardClick = (idx: number) => {
    if (isGameOver || isPaused) return;
    if (cards[idx].isFlipped || cards[idx].isMatched) return;
    if (flippedIndices.length >= 2) return;

    soundManager.playClick();

    // Flip
    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      const [firstIdx, secondIdx] = nextFlipped;
      if (newCards[firstIdx].pairId === newCards[secondIdx].pairId) {
        // Matched!
        soundManager.playMatch();
        newCards[firstIdx].isMatched = true;
        newCards[secondIdx].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);

        const nextMatches = matches + 1;
        setMatches(nextMatches);
        setScore((s) => s + 150);

        if (nextMatches === pairCount) {
          setIsWin(true);
          setIsGameOver(true);
          soundManager.playWin();
        }
      } else {
        // Unmatched -> flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 900);

        if (nextMoves >= maxMoves) {
          setIsGameOver(true);
          setIsWin(false);
          soundManager.playLose();
        }
      }
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const finalScore = score + (isWin ? 200 : 0);
    const earnedCoins = Math.round(finalScore / 5);
    const earnedXP = finalScore;
    onGameEnd(finalScore, earnedCoins, earnedXP);
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
          <h2 className="text-base font-black text-white">Animal Memory Match</h2>
          <p className="text-[10px] text-slate-400">Match matching photoreceptor species pairs</p>
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

      {/* Grid Mode Selector */}
      <div className="flex justify-center gap-2">
        {(['4x4', '6x6'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGridSize(g)}
            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
              gridSize === g
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {g} Mode
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Pairs: {matches} / {pairCount}
        </div>
        <div className="text-indigo-400">Moves: {moves} / {maxMoves}</div>
        <div className="text-rose-400 flex items-center gap-1 font-extrabold">
          <Clock className="w-4 h-4" /> {timeLeft}s
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div
        className={`grid gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl select-none ${
          gridSize === '4x4' ? 'grid-cols-4' : 'grid-cols-6'
        }`}
      >
        {cards.map((card, idx) => (
          <button
            key={`${card.id}-${idx}`}
            onClick={() => handleCardClick(idx)}
            className={`aspect-square rounded-2xl border font-black text-2xl flex flex-col items-center justify-center transition cursor-pointer select-none ${
              card.isMatched
                ? 'bg-emerald-500/30 border-emerald-400 opacity-60'
                : card.isFlipped
                ? 'bg-slate-800 border-amber-400 text-white scale-105 shadow-xl'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-transparent'
            }`}
          >
            <span>{card.isFlipped || card.isMatched ? card.emoji : '❓'}</span>
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
          <Trophy className={`w-16 h-16 ${isWin ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <div>
            <h3 className="text-2xl font-black text-white">{isWin ? '🎉 All Pairs Matched!' : '💔 Game Over'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isWin ? `Found all ${pairCount} pairs in ${moves} moves!` : 'Ran out of moves or time.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Final Score: {score + (isWin ? 200 : 0)} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round((score + (isWin ? 200 : 0)) / 5)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score + (isWin ? 200 : 0)} XP</div>
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
