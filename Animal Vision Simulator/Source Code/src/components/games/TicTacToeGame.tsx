import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface TicTacToeProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const TicTacToeGame: React.FC<TicTacToeProps> = ({ onGameEnd, onBack }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'🦅' | '🐍'>('🦅');
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const checkWinner = (b: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, c, d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every((cell) => cell !== null)) return 'Draw';
    return null;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner) return;
    soundManager.playClick();
    const newBoard = [...board];
    newBoard[idx] = turn;
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
      if (win === '🦅') {
        soundManager.playWin();
        setScore((s) => s + 100);
      } else {
        soundManager.playLose();
      }
    } else {
      // AI opponent move
      const nextTurn = turn === '🦅' ? '🐍' : '🦅';
      setTurn(nextTurn);
      if (nextTurn === '🐍') {
        setTimeout(() => {
          const emptyIndices = newBoard
            .map((val, i) => (val === null ? i : null))
            .filter((v) => v !== null) as number[];

          if (emptyIndices.length > 0) {
            const aiChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            newBoard[aiChoice] = '🐍';
            setBoard(newBoard);
            const aiWin = checkWinner(newBoard);
            if (aiWin) {
              setWinner(aiWin);
            } else {
              setTurn('🦅');
            }
          }
        }, 400);
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('🦅');
    setWinner(null);
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
          <h2 className="text-base font-black text-white">Eagle vs Pit Viper Tic-Tac-Toe</h2>
          <p className="text-[10px] text-slate-400">Eagle Vision vs Thermal Infrared Slit Vision</p>
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
          <Zap className="w-4 h-4" /> Score: {score}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Rewards
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-4xl flex items-center justify-center transition cursor-pointer"
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center space-y-2">
          <div className="text-lg font-black text-white">
            {winner === 'Draw' ? 'It’s a Draw!' : `Winner: ${winner}`}
          </div>
          <button
            onClick={resetGame}
            className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
          >
            Play Next Round
          </button>
        </div>
      )}
    </div>
  );
};
