import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Zap, Eye, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface EndlessRunnerProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const EndlessRunnerGame: React.FC<EndlessRunnerProps> = ({ onGameEnd, onBack }) => {
  const [distance, setDistance] = useState(0);
  const [visionPower, setVisionPower] = useState<'normal' | 'thermal' | 'uv' | 'night'>('normal');
  const [isJumping, setIsJumping] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setDistance((d) => d + 5);
    }, 100);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleJump = () => {
    if (isJumping || isGameOver) return;
    soundManager.playClick();
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
  };

  const handleToggleVision = (power: 'thermal' | 'uv' | 'night') => {
    soundManager.playClick();
    setVisionPower(power);
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(distance / 10);
    onGameEnd(distance, earnedCoins, distance);
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
          <h2 className="text-base font-black text-white">Animal Vision Endless Runner</h2>
          <p className="text-[10px] text-slate-400">Switch vision powers to dodge dark obstacles</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4" /> Distance: {distance}m
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Finish Run
        </button>
      </div>

      {/* Runner Stage */}
      <div
        className={`h-48 w-full rounded-3xl border relative overflow-hidden flex flex-col justify-between p-4 transition-colors duration-500 ${
          visionPower === 'thermal'
            ? 'bg-gradient-to-r from-red-950 via-orange-950 to-slate-950 border-red-500/50'
            : visionPower === 'uv'
            ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border-purple-500/50'
            : visionPower === 'night'
            ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-emerald-500/50'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
          <Eye className="w-4 h-4" /> Power: {visionPower.toUpperCase()}
        </div>

        {/* Runner Character */}
        <div
          onClick={handleJump}
          className={`w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg transition-transform cursor-pointer ${
            isJumping ? '-translate-y-20 scale-110' : 'translate-y-0'
          }`}
        >
          🐆
        </div>

        {/* Ground */}
        <div className="w-full h-3 bg-slate-800 rounded-full" />
      </div>

      {/* Vision Power Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        {(['thermal', 'uv', 'night'] as const).map((pow) => (
          <button
            key={pow}
            onClick={() => handleToggleVision(pow)}
            className={`py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
              visionPower === pow
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {pow}
          </button>
        ))}
      </div>
    </div>
  );
};
