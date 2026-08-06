import React, { useState } from 'react';
import { AnimalProfile } from '../types';
import { X, Heart, Play, Eye, Compass, Moon, Sparkles, BookOpen, Activity, Loader2, CompassIcon } from 'lucide-react';
import { suggestRelatedAnimalsWithAI } from '../services/gemini';

interface AnimalDetailsModalProps {
  animal: AnimalProfile | null;
  onClose: () => void;
  onSelectAnimalAndLaunch: (animal: AnimalProfile) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const AnimalDetailsModal: React.FC<AnimalDetailsModalProps> = React.memo(({
  animal,
  onClose,
  onSelectAnimalAndLaunch,
  isFavorite,
  onToggleFavorite,
}) => {
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<any>(null);

  if (!animal) return null;

  const { stats } = animal;

  const handleFetchRelated = async () => {
    setLoadingSuggestions(true);
    try {
      const data = await suggestRelatedAnimalsWithAI({
        animalName: animal.name,
        category: animal.category,
      });
      setSuggestions(data);
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 backdrop-blur text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header Image */}
        <div className="relative h-64 w-full overflow-hidden bg-slate-950">
          <img
            src={animal.imageUrl}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Favorite Toggle Button */}
          <button
            onClick={() => onToggleFavorite(animal.id)}
            className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-slate-950/70 backdrop-blur text-white hover:text-rose-400 transition"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
              }`}
            />
          </button>

          {/* Header Title Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {animal.category}
              </span>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-4xl">{animal.icon}</span>
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight">{animal.name}</h2>
                  <p className="text-xs italic text-slate-300">{animal.scientificName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Tagline */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-xs font-medium">
            ✨ {animal.shortTagline}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Receptors
              </div>
              <div className="text-xs font-bold text-white truncate">{stats.type}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                Field of View
              </div>
              <div className="text-xs font-bold text-purple-400">{stats.fovDegrees}° Panoramic</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Visual Acuity
              </div>
              <div className="text-xs font-bold text-emerald-400">{stats.acuitySnellen}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                Night Rating
              </div>
              <div className="text-xs font-bold text-amber-400">{stats.nightVisionScore} / 10</div>
            </div>
          </div>

          {/* Biological Capability Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.coneCount !== undefined && (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                🧬 {stats.coneCount} Cone Types
              </span>
            )}
            {stats.hasUV && (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                🟣 Ultraviolet (UV) Spectrum
              </span>
            )}
            {stats.hasInfrared && (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                🔴 Thermal Infrared Sensing
              </span>
            )}
            {stats.hasPolarization && (
              <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                🌀 Polarized Light Vectoring
              </span>
            )}
          </div>

          {/* Anatomical Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Vision Explanation & Spectral Sensitivity
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
              {animal.description}
            </p>
          </div>

          {/* Peak Wavelengths */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Photoreceptor Spectral Sensitivity Peaks:
            </span>
            <div className="flex flex-wrap gap-2">
              {stats.peakWavelengths.map((wl) => (
                <span
                  key={wl}
                  className="px-3 py-1 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl border border-slate-800"
                >
                  {wl}
                </span>
              ))}
            </div>
          </div>

          {/* Fun Fact Callout */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-0.5">
                Fun Biological Fact
              </h4>
              <p className="text-xs text-emerald-100 leading-relaxed">{animal.funFact}</p>
            </div>
          </div>

          {/* AI Learning: Suggest Related Species */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-extrabold text-white">AI Learning: Related Species</h4>
              </div>
              <button
                type="button"
                onClick={handleFetchRelated}
                disabled={loadingSuggestions}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                {loadingSuggestions ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Suggest Related Species</span>
                )}
              </button>
            </div>

            {suggestions && suggestions.recommendations && (
              <div className="space-y-2 pt-1 border-t border-slate-800 animate-fade-in">
                {suggestions.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center justify-between">
                      <span>{rec.name} <span className="text-[10px] text-slate-400 italic">({rec.scientificName})</span></span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">{rec.category}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-purple-300">
                      ⚡ {rec.keyVisualTrait}
                    </div>
                    <p className="text-[11px] text-slate-400">{rec.whyStudy}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Launch Simulator Button */}
          <div className="pt-2">
            <button
              id="btn-modal-simulate"
              onClick={() => {
                onClose();
                onSelectAnimalAndLaunch(animal);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch {animal.name} Vision Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

AnimalDetailsModal.displayName = 'AnimalDetailsModal';
