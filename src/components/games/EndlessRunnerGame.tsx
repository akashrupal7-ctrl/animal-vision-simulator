import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Zap, Eye, Shield, Magnet, Pause, Play, Trophy, ArrowLeftRight, ChevronUp, ChevronDown, Coins } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface EndlessRunnerProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

interface Obstacle {
  id: number;
  lane: number; // 0 (Left), 1 (Center), 2 (Right)
  y: number; // 0 (top) to 100 (bottom collision zone)
  type: 'hurdle' | 'barrier' | 'thermal'; // hurdle = jump, barrier = slide/dodge, thermal = vision switch
  icon: string;
}

interface Coin {
  id: number;
  lane: number;
  y: number;
}

interface PowerUp {
  id: number;
  lane: number;
  y: number;
  type: 'shield' | 'magnet' | 'surge';
  icon: string;
}

export const EndlessRunnerGame: React.FC<EndlessRunnerProps> = ({ onGameEnd, onBack }) => {
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [actionState, setActionState] = useState<'running' | 'jumping' | 'sliding'>('running');
  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [speed, setSpeed] = useState(1.2);
  const [shieldActive, setShieldActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [revived, setRevived] = useState(false);
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);

  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const gameLoopRef = useRef<number | null>(null);

  const initGame = () => {
    setLane(1);
    setActionState('running');
    setDistance(0);
    setCoinsCollected(0);
    setSpeed(1.2);
    setShieldActive(false);
    setMagnetActive(false);
    setRevived(false);
    setObstacles([]);
    setCoins([]);
    setPowerUps([]);
    setIsPaused(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Controls
  const moveLeft = () => {
    if (lane > 0 && !isGameOver && !isPaused) {
      soundManager.playClick();
      setLane((l) => l - 1);
    }
  };

  const moveRight = () => {
    if (lane < 2 && !isGameOver && !isPaused) {
      soundManager.playClick();
      setLane((l) => l + 1);
    }
  };

  const jump = () => {
    if (actionState === 'running' && !isGameOver && !isPaused) {
      soundManager.playClick();
      setActionState('jumping');
      setTimeout(() => setActionState('running'), 600);
    }
  };

  const slide = () => {
    if (actionState === 'running' && !isGameOver && !isPaused) {
      soundManager.playClick();
      setActionState('sliding');
      setTimeout(() => setActionState('running'), 600);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight();
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') jump();
      if (e.key === 'ArrowDown' || e.key === 's') slide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lane, actionState, isGameOver, isPaused]);

  // Main Game Loop Ticker
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      // Advance distance & speed
      setDistance((d) => d + 1);
      setSpeed((s) => Math.min(2.8, s + 0.001));

      // Spawn items
      if (Math.random() < 0.12) {
        const randLane = Math.floor(Math.random() * 3);
        const randType = Math.random() < 0.5 ? 'hurdle' : 'barrier';
        setObstacles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            lane: randLane,
            y: 0,
            type: randType,
            icon: randType === 'hurdle' ? '🪵' : '🛑',
          },
        ]);
      }

      if (Math.random() < 0.15) {
        const randLane = Math.floor(Math.random() * 3);
        setCoins((prev) => [...prev, { id: Date.now() + Math.random(), lane: randLane, y: 0 }]);
      }

      if (Math.random() < 0.03) {
        const randLane = Math.floor(Math.random() * 3);
        const pType = Math.random() < 0.5 ? 'shield' : 'magnet';
        setPowerUps((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            lane: randLane,
            y: 0,
            type: pType,
            icon: pType === 'shield' ? '🛡️' : '🧲',
          },
        ]);
      }

      // Move items down
      setObstacles((prev) =>
        prev
          .map((obs) => ({ ...obs, y: obs.y + speed * 3 }))
          .filter((obs) => obs.y < 105)
      );

      setCoins((prev) =>
        prev
          .map((c) => {
            let nextLane = c.lane;
            if (magnetActive && Math.abs(c.y - 85) < 30) {
              nextLane = lane; // pull towards player
            }
            return { ...c, lane: nextLane, y: c.y + speed * 3 };
          })
          .filter((c) => c.y < 105)
      );

      setPowerUps((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + speed * 3 }))
          .filter((p) => p.y < 105)
      );

      // Check Collisions
      setCoins((prev) => {
        return prev.filter((c) => {
          if (c.lane === lane && c.y >= 75 && c.y <= 95) {
            soundManager.playClick();
            setCoinsCollected((cnt) => cnt + 1);
            return false;
          }
          return true;
        });
      });

      setPowerUps((prev) => {
        return prev.filter((p) => {
          if (p.lane === lane && p.y >= 75 && p.y <= 95) {
            soundManager.playMatch();
            if (p.type === 'shield') {
              setShieldActive(true);
            } else if (p.type === 'magnet') {
              setMagnetActive(true);
              setTimeout(() => setMagnetActive(false), 8000);
            }
            return false;
          }
          return true;
        });
      });

      setObstacles((prev) => {
        for (const obs of prev) {
          if (obs.lane === lane && obs.y >= 80 && obs.y <= 95) {
            // Check dodge condition
            if (obs.type === 'hurdle' && actionState === 'jumping') {
              continue; // Successfully jumped over hurdle!
            }
            if (obs.type === 'barrier' && actionState === 'sliding') {
              continue; // Successfully slid under barrier!
            }

            // Hit! Check shield
            if (shieldActive) {
              soundManager.playMatch();
              setShieldActive(false);
              return prev.filter((o) => o.id !== obs.id);
            }

            // Game Over
            soundManager.playLose();
            setIsGameOver(true);
            break;
          }
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [lane, actionState, speed, shieldActive, magnetActive, isGameOver, isPaused]);

  const handleRevive = () => {
    if (coinsCollected >= 20 && !revived) {
      soundManager.playWin();
      setCoinsCollected((c) => c - 20);
      setRevived(true);
      setShieldActive(true);
      setObstacles([]);
      setIsGameOver(false);
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const finalScore = distance;
    const earnedCoins = coinsCollected + Math.round(distance / 10);
    const earnedXP = distance * 2;
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
          <h2 className="text-base font-black text-white">Vision Safari Runner</h2>
          <p className="text-[10px] text-slate-400">Swipe/Tap to dodge obstacles & gather coins!</p>
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

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> {distance}m
        </div>
        <div className="text-yellow-400 flex items-center gap-1">
          <Coins className="w-4 h-4 fill-yellow-400" /> {coinsCollected}
        </div>
        {shieldActive && (
          <div className="text-cyan-400 flex items-center gap-1 font-bold animate-pulse">
            <Shield className="w-4 h-4" /> Shield
          </div>
        )}
        {magnetActive && (
          <div className="text-purple-400 flex items-center gap-1 font-bold animate-pulse">
            <Magnet className="w-4 h-4" /> Magnet
          </div>
        )}
      </div>

      {/* 3D Track Stage */}
      <div className="h-64 w-full bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden flex shadow-2xl">
        {/* 3 Lanes */}
        {[0, 1, 2].map((l) => (
          <div
            key={l}
            className={`flex-1 border-r border-slate-800/60 relative ${
              lane === l ? 'bg-slate-900/30' : ''
            }`}
          >
            {/* Lane perspective lines */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800" />
          </div>
        ))}

        {/* Obstacles Rendering */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute text-2xl transition-all duration-75 flex items-center justify-center"
            style={{
              left: `${obs.lane * 33.33 + 10}%`,
              top: `${obs.y}%`,
            }}
          >
            {obs.icon}
          </div>
        ))}

        {/* Coins Rendering */}
        {coins.map((c) => (
          <div
            key={c.id}
            className="absolute text-xl transition-all duration-75 text-amber-400 animate-spin"
            style={{
              left: `${c.lane * 33.33 + 12}%`,
              top: `${c.y}%`,
            }}
          >
            🪙
          </div>
        ))}

        {/* PowerUps Rendering */}
        {powerUps.map((p) => (
          <div
            key={p.id}
            className="absolute text-2xl transition-all duration-75 animate-bounce"
            style={{
              left: `${p.lane * 33.33 + 10}%`,
              top: `${p.y}%`,
            }}
          >
            {p.icon}
          </div>
        ))}

        {/* Player Sprite */}
        <div
          className={`absolute text-3xl transition-all duration-150 flex items-center justify-center ${
            actionState === 'jumping'
              ? '-translate-y-8 scale-125'
              : actionState === 'sliding'
              ? 'scale-y-50 translate-y-4'
              : ''
          }`}
          style={{
            left: `${lane * 33.33 + 8}%`,
            top: '80%',
          }}
        >
          🐆
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <button
          onClick={moveLeft}
          className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
        >
          ◀ LEFT
        </button>
        <button
          onClick={jump}
          className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
        >
          <ChevronUp className="w-5 h-5" /> JUMP
        </button>
        <button
          onClick={slide}
          className="py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
        >
          <ChevronDown className="w-5 h-5" /> SLIDE
        </button>
        <button
          onClick={moveRight}
          className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-95"
        >
          RIGHT ▶
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
            <h3 className="text-2xl font-black text-white">Run Ended!</h3>
            <p className="text-xs text-slate-400 mt-1">Obstacle collision detected.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Distance: {distance}m</div>
            <div className="text-yellow-400 font-bold">Coins: {coinsCollected} collected</div>
            <div className="text-teal-300 font-bold">+ {distance * 2} XP</div>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs pt-1">
            {!revived && coinsCollected >= 20 && (
              <button
                onClick={handleRevive}
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
              >
                Revive with 20 Coins
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={initGame}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
              >
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
