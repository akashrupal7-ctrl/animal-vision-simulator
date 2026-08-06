import React, { useState } from 'react';
import { ArrowLeft, Zap, Eye, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface AnimalVisionChallengeProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

export const AnimalVisionChallengeGame: React.FC<AnimalVisionChallengeProps> = ({
  onGameEnd,
  onBack,
}) => {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const QUESTIONS = [
    {
      imageFilter: 'Dichromatic Red-Green Blindness',
      correctAnimal: 'Dog / Canine',
      options: ['Dog / Canine', 'Mantis Shrimp', 'Human', 'Falcon'],
    },
    {
      imageFilter: '16-Cone Ultraviolet Spectrum',
      correctAnimal: 'Mantis Shrimp',
      options: ['Dog / Canine', 'Mantis Shrimp', 'Cat', 'Horse'],
    },
    {
      imageFilter: 'Thermal Infrared Heat Map',
      correctAnimal: 'Pit Viper Snake',
      options: ['Falcon', 'Pit Viper Snake', 'Bee', 'Owl'],
    },
  ];

  const [qIdx, setQIdx] = useState(0);

  const handleSelect = (opt: string) => {
    soundManager.playClick();
    setSelectedAnimal(opt);
    const curr = QUESTIONS[qIdx];
    if (opt === curr.correctAnimal) {
      soundManager.playMatch();
      setScore((s) => s + 200);
    } else {
      soundManager.playLose();
    }

    setTimeout(() => {
      if (qIdx < QUESTIONS.length - 1) {
        setQIdx((q) => q + 1);
        setSelectedAnimal(null);
      } else {
        soundManager.playWin();
      }
    }, 800);
  };

  const handleFinish = () => {
    onGameEnd(score, Math.round(score / 5), score);
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
          <h2 className="text-base font-black text-white">Guess the Animal Vision Filter</h2>
          <p className="text-[10px] text-slate-400">Identify which animal perceives the world like this</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4" /> Score: {score}
        </div>
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Finish Challenge
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
          <Eye className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
          <div className="text-xs font-mono text-emerald-300 font-bold">
            Filter: {QUESTIONS[qIdx].imageFilter}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {QUESTIONS[qIdx].options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`p-3 rounded-xl border text-xs font-extrabold transition cursor-pointer text-left ${
                selectedAnimal === opt
                  ? opt === QUESTIONS[qIdx].correctAnimal
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-red-500/40 text-red-200 border-red-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
