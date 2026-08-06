import React, { useState } from 'react';
import { X, Sparkles, ArrowRightLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { ANIMALS_DATA } from '../data/animals';
import { AnimalProfile } from '../types';
import { compareAnimalsWithAI } from '../services/gemini';

interface AICompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAnimalA?: AnimalProfile;
  initialAnimalB?: AnimalProfile;
}

export const AICompareModal: React.FC<AICompareModalProps> = ({
  isOpen,
  onClose,
  initialAnimalA,
  initialAnimalB,
}) => {
  const [animalA, setAnimalA] = useState<AnimalProfile>(
    initialAnimalA || ANIMALS_DATA[0] // Human or first animal
  );
  const [animalB, setAnimalB] = useState<AnimalProfile>(
    initialAnimalB || ANIMALS_DATA.find((a) => a.id !== (initialAnimalA?.id || ANIMALS_DATA[0].id)) || ANIMALS_DATA[1]
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await compareAnimalsWithAI({
        animalA,
        animalB,
      });
      setComparisonResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to compare animals.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                AI Animal Optical Comparison
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.6
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compare visual mechanics, photoreceptor spectrums, and foveal acuity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animal Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Animal A:
            </label>
            <select
              value={animalA.id}
              onChange={(e) => {
                const found = ANIMALS_DATA.find((a) => a.id === e.target.value);
                if (found) setAnimalA(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {ANIMALS_DATA.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Animal B:
            </label>
            <select
              value={animalB.id}
              onChange={(e) => {
                const found = ANIMALS_DATA.find((a) => a.id === e.target.value);
                if (found) setAnimalB(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {ANIMALS_DATA.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Comparison Button */}
        <div className="flex justify-center shrink-0">
          <button
            type="button"
            onClick={handleRunComparison}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 text-white font-bold rounded-2xl text-xs hover:opacity-95 active:scale-95 transition cursor-pointer shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Optical Physics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Compare {animalA.name} vs {animalB.name}</span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 text-xs text-slate-300">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              ⚠️ {error}
            </div>
          )}

          {comparisonResult ? (
            <div className="space-y-4">
              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[11px] font-extrabold text-slate-300 uppercase">
                      <th className="p-3">Optical Feature</th>
                      <th className="p-3 text-purple-300">{animalA.icon} {animalA.name}</th>
                      <th className="p-3 text-emerald-300">{animalB.icon} {animalB.name}</th>
                      <th className="p-3 text-amber-300">Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {(comparisonResult.table || []).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-bold text-white">{row.feature}</td>
                        <td className="p-3 text-slate-300">{row.animalASpec}</td>
                        <td className="p-3 text-slate-300">{row.animalBSpec}</td>
                        <td className="p-3 font-semibold text-amber-300">{row.winnerOrAdvantage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Scientific Breakdown Narrative */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Comparative Biology Overview
                </h4>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {comparisonResult.scientificOverview}
                </p>
                {comparisonResult.keyEvolutionaryInsight && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-purple-300 italic">
                    💡 Evolutionary Insight: {comparisonResult.keyEvolutionaryInsight}
                  </div>
                )}
              </div>
            </div>
          ) : (
            !loading && (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Select two animals above and tap "Compare" to generate a detailed scientific comparison table using Gemini AI.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
