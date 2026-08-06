import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Eye, Heart, Clock, Flame, Pause, Play, Trophy, Star, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface AnimalVisionChallengeProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  imageFilter: string;
  hintText: string;
  correctAnimal: string;
  options: string[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    imageFilter: 'Dichromatic Red-Green Vision (2 Cone Opsins)',
    hintText: 'Sees vibrant blues & yellows, but lacks red photoreceptors.',
    correctAnimal: 'Canine / Dog',
    options: ['Canine / Dog', 'Mantis Shrimp', 'Falcon', 'Chameleon'],
  },
  {
    id: 2,
    imageFilter: '16-Cone Polarized Ultraviolet Spectrum',
    hintText: 'Possesses 12-16 photoreceptors detecting circular polarization.',
    correctAnimal: 'Mantis Shrimp',
    options: ['Eagle', 'Mantis Shrimp', 'Feline / Cat', 'Horse'],
  },
  {
    id: 3,
    imageFilter: 'Thermal Infrared Pit Mapping',
    hintText: 'Senses heat radiation wavelengths in pitch black darkness.',
    correctAnimal: 'Pit Viper Snake',
    options: ['Peregrine Falcon', 'Pit Viper Snake', 'Honeybee', 'Barn Owl'],
  },
  {
    id: 4,
    imageFilter: 'Ultraviolet Flower Nectar Fluorescence',
    hintText: 'Perceives UV bullseye patterns on flower petals.',
    correctAnimal: 'Honeybee',
    options: ['Dog', 'Honeybee', 'Deep-Sea Squid', 'Fruit Bat'],
  },
  {
    id: 5,
    imageFilter: 'Amplified Low-Light Tapetum Lucidum Mirror',
    hintText: 'Reflects ambient light through a retroreflector tissue layer.',
    correctAnimal: 'Feline / Cat',
    options: ['Chameleon', 'Feline / Cat', 'Human', 'Gecko'],
  },
  {
    id: 6,
    imageFilter: 'High Flicker-Fusion Speed (100+ Hz)',
    hintText: 'Processes 100+ frames per second to catch fast prey.',
    correctAnimal: 'Dragonfly Insect',
    options: ['Sloth', 'Dragonfly Insect', 'Cow', 'Goldfish'],
  },
  {
    id: 7,
    imageFilter: 'Echolocation Acoustic Visual Mapping',
    hintText: 'Constructs 3D spatial geometry via high-frequency ultrasonic pulses.',
    correctAnimal: 'Microbat',
    options: ['Microbat', 'Chameleon', 'Eagle', 'Horse'],
  },
  {
    id: 8,
    imageFilter: 'Bioluminescent Deep-Sea Blue-Green Focus',
    hintText: 'Optimized solely for faint 470nm blue-green ocean luminescence.',
    correctAnimal: 'Giant Squid',
    options: ['Honeybee', 'Dog', 'Giant Squid', 'Falcon'],
  },
];

export const AnimalVisionChallengeGame: React.FC<AnimalVisionChallengeProps> = ({
  onGameEnd,
  onBack,
}) => {
  const [qIdx, setQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const currentQ = QUIZ_QUESTIONS[qIdx];

  const initGame = () => {
    setQIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setStreak(0);
    setLives(3);
    setTimeLeft(15);
    setIsPaused(false);
    setIsGameOver(false);
    setIsWin(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Question Timer Ticker
  useEffect(() => {
    if (isGameOver || isPaused || selectedOpt !== null) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time expired -> lose a life
          soundManager.playLose();
          setStreak(0);
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              setIsWin(false);
            } else {
              advanceNextQuestion();
            }
            return nextL;
          });
          return 15;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qIdx, lives, isGameOver, isPaused, selectedOpt]);

  const advanceNextQuestion = () => {
    setTimeout(() => {
      if (qIdx < QUIZ_QUESTIONS.length - 1) {
        setQIdx((q) => q + 1);
        setSelectedOpt(null);
        setTimeLeft(15);
      } else {
        // Quiz completed!
        setIsWin(true);
        setIsGameOver(true);
        soundManager.playWin();
      }
    }, 900);
  };

  const handleSelect = (opt: string) => {
    if (selectedOpt !== null || isGameOver || isPaused) return;

    soundManager.playClick();
    setSelectedOpt(opt);

    if (opt === currentQ.correctAnimal) {
      soundManager.playMatch();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const points = 100 * nextStreak + timeLeft * 10;
      setScore((s) => s + points);
      advanceNextQuestion();
    } else {
      soundManager.playLose();
      setStreak(0);
      setLives((l) => {
        const nextL = l - 1;
        if (nextL <= 0) {
          setIsGameOver(true);
          setIsWin(false);
        } else {
          advanceNextQuestion();
        }
        return nextL;
      });
    }
  };

  const handleFinish = () => {
    soundManager.playWin();
    const earnedCoins = Math.round(score / 5) + (isWin ? 40 : 0);
    const earnedXP = score + (isWin ? 100 : 20);
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
          <h2 className="text-base font-black text-white">Animal Vision Quiz</h2>
          <p className="text-[10px] text-slate-400">Match visual spectrum filters to species</p>
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

      {/* Lives & Streak Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${
                i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
              }`}
            />
          ))}
        </div>
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Score: {score}
        </div>
        {streak > 1 && (
          <div className="text-orange-400 flex items-center gap-1 font-extrabold animate-bounce">
            <Flame className="w-4 h-4" /> {streak}x Streak
          </div>
        )}
        <div className="text-cyan-400 flex items-center gap-1">
          <Clock className="w-4 h-4" /> {timeLeft}s
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>Question {qIdx + 1} of {QUIZ_QUESTIONS.length}</span>
          <span className="text-emerald-400">Streak: {streak}x</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
          <Eye className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
          <div className="text-sm font-black text-white">{currentQ.imageFilter}</div>
          <div className="text-[11px] text-slate-400 italic">"{currentQ.hintText}"</div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOpt === opt;
            const isCorrect = opt === currentQ.correctAnimal;

            let btnStyle = 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700';
            if (selectedOpt !== null) {
              if (isCorrect) btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg';
              else if (isSelected) btnStyle = 'bg-rose-500 text-white border-rose-400 font-black';
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition cursor-pointer text-left ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 space-y-4">
          <Pause className="w-12 h-12 text-amber-400 animate-pulse" />
          <h3 className="text-xl font-black text-white">Quiz Paused</h3>
          <button
            onClick={() => setIsPaused(false)}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-xl"
          >
            Resume Quiz
          </button>
        </div>
      )}

      {/* Game Over / Win Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center p-6 space-y-4 text-center border border-emerald-500/40">
          <Trophy className={`w-16 h-16 ${isWin ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <div>
            <h3 className="text-2xl font-black text-white">{isWin ? '🎉 Quiz Mastered!' : '💔 Quiz Failed'}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {isWin ? 'Excellent! You identified all animal optical filters.' : 'You lost all 3 lives. Try again!'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Final Score: {score} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(score / 5) + (isWin ? 40 : 0)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score + (isWin ? 100 : 20)} XP</div>
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
