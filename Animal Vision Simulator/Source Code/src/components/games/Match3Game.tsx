import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Trophy, Zap, Coins, Sparkles, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface Match3Props {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

const BOARD_SIZE = 7;
const ANIMAL_ITEMS = ['🐶', '🦅', '🦐', '🦉', '🐍', '🦈'];

export const Match3Game: React.FC<Match3Props> = ({ onGameEnd, onBack }) => {
  const [board, setBoard] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize Board without immediate matches
  const createBoard = () => {
    let newBoard: string[] = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
      const randomAnimal = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
      newBoard.push(randomAnimal);
    }
    setBoard(newBoard);
    setScore(0);
    setMovesLeft(20);
    setIsGameOver(false);
  };

  useEffect(() => {
    createBoard();
  }, []);

  const checkMatches = (currentBoard: string[]) => {
    let matchedIndices = new Set<number>();

    // Horizontal check
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        const i1 = r * BOARD_SIZE + c;
        const i2 = i1 + 1;
        const i3 = i1 + 2;
        if (
          currentBoard[i1] &&
          currentBoard[i1] === currentBoard[i2] &&
          currentBoard[i1] === currentBoard[i3]
        ) {
          matchedIndices.add(i1);
          matchedIndices.add(i2);
          matchedIndices.add(i3);
        }
      }
    }

    // Vertical check
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        const i1 = r * BOARD_SIZE + c;
        const i2 = i1 + BOARD_SIZE;
        const i3 = i1 + BOARD_SIZE * 2;
        if (
          currentBoard[i1] &&
          currentBoard[i1] === currentBoard[i2] &&
          currentBoard[i1] === currentBoard[i3]
        ) {
          matchedIndices.add(i1);
          matchedIndices.add(i2);
          matchedIndices.add(i3);
        }
      }
    }

    if (matchedIndices.size > 0) {
      soundManager.playMatch();
      const newBoard = [...currentBoard];
      matchedIndices.forEach((idx) => {
        newBoard[idx] = ANIMAL_ITEMS[Math.floor(Math.random() * ANIMAL_ITEMS.length)];
      });
      setScore((prev) => prev + matchedIndices.size * 20);
      setBoard(newBoard);
    }
  };

  const handleTileClick = (idx: number) => {
    if (isGameOver || movesLeft <= 0) return;

    if (selectedIdx === null) {
      soundManager.playClick();
      setSelectedIdx(idx);
    } else {
      const isAdjacent =
        Math.abs(selectedIdx - idx) === 1 || Math.abs(selectedIdx - idx) === BOARD_SIZE;

      if (isAdjacent) {
        soundManager.playClick();
        const newBoard = [...board];
        const temp = newBoard[selectedIdx];
        newBoard[selectedIdx] = newBoard[idx];
        newBoard[idx] = temp;

        setBoard(newBoard);
        setSelectedIdx(null);
        const nextMoves = movesLeft - 1;
        setMovesLeft(nextMoves);

        checkMatches(newBoard);

        if (nextMoves <= 0) {
          endGame(score + 100);
        }
      } else {
        setSelectedIdx(idx);
      }
    }
  };

  const endGame = (finalScore: number) => {
    setIsGameOver(true);
    soundManager.playWin();
    const earnedCoins = Math.round(finalScore / 10);
    const earnedXP = finalScore;
    onGameEnd(finalScore, earnedCoins, earnedXP);
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
          <h2 className="text-base font-black text-white">Animal Match-3</h2>
          <p className="text-[10px] text-slate-400">Swap tiles to align 3 matching vision icons</p>
        </div>
        <button
          onClick={createBoard}
          className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4" /> Score: {score}
        </div>
        <div className="text-emerald-400">Moves Left: {movesLeft}</div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-7 gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {board.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleTileClick(idx)}
            className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition cursor-pointer border ${
              selectedIdx === idx
                ? 'bg-emerald-500/40 border-emerald-400 scale-110 shadow-lg'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {isGameOver && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center space-y-2">
          <div className="text-lg font-black text-white">Game Over!</div>
          <div className="text-xs text-emerald-400 font-mono font-bold">Score: {score} pts</div>
          <button
            onClick={createBoard}
            className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};
