import React from 'react';
import { AnimalProfile, NavTab } from '../types';
import { ANIMALS_DATA } from '../data/animals';
import { Camera, Sparkles, Eye, Gauge, ArrowRight, Play, Heart, Zap, BookOpen } from 'lucide-react';

interface HomeScreenProps {
  onSelectTab: (tab: NavTab) => void;
  onSelectAnimalAndLaunch: (animal: AnimalProfile) => void;
  onOpenDetails: (animal: AnimalProfile) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = React.memo(({
  onSelectTab,
  onSelectAnimalAndLaunch,
  onOpenDetails,
  favorites,
  onToggleFavorite,
}) => {
  const featuredAnimal = ANIMALS_DATA.find((a) => a.id === 'eagle') || ANIMALS_DATA[3];
  const quickAnimals = ANIMALS_DATA.slice(1, 7);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Hero Banner with Vibrant Gradient & FlutterFlow Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/70 to-slate-950 border border-white/10 p-6 md:p-8 shadow-2xl shadow-emerald-950/40">
        {/* Background Glowing Orbs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time 60 FPS WebGL Shader Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              See the World Through <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Animal Eyes
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Experience dichromatic, night vision tapetum, infrared heat spectrums, compound ommatidia, and ultra telephoto fovea zoom across {ANIMALS_DATA.length}+ species in real-time GPU precision.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Primary Large Scan Button */}
              <button
                id="btn-scan-animal-vision"
                onClick={() => onSelectTab('camera')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                Scan Animal Vision Now
              </button>

              <button
                id="btn-explore-library"
                onClick={() => onSelectTab('library')}
                className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
              >
                Explore {ANIMALS_DATA.length}+ Species
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="w-full md:w-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3 shrink-0 min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{ANIMALS_DATA.length}+ Species</div>
                <div className="text-[11px] text-slate-400">Biological Photoreceptors</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800 pt-2 font-mono">
              <span>Low Light Tapetum:</span>
              <span className="text-amber-400 font-bold">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Species Cards (Horizontally Scrollable) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Quick Simulator Launch
          </h2>
          <button
            onClick={() => onSelectTab('library')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {quickAnimals.map((animal) => {
            const isFav = favorites.includes(animal.id);

            return (
              <div
                key={animal.id}
                className="group relative shrink-0 w-44 rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-lg hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                  <img
                    src={animal.imageUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(animal.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/60 backdrop-blur text-white hover:text-rose-400 transition"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-2 left-2 text-2xl">{animal.icon}</div>
                </div>

                {/* Card Info */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{animal.name}</h3>
                    <p className="text-[10px] text-emerald-400 font-medium truncate">
                      {animal.stats.acuitySnellen} • {animal.category}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectAnimalAndLaunch(animal)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Simulate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Species Spotlight Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="relative rounded-2xl overflow-hidden min-h-[200px] border border-white/10">
            <img
              src={featuredAnimal.imageUrl}
              alt={featuredAnimal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="text-3xl">{featuredAnimal.icon}</span>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                  Featured Species
                </span>
                <h3 className="text-lg font-bold text-white">{featuredAnimal.name} Vision</h3>
              </div>
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs italic text-slate-400">{featuredAnimal.scientificName}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {featuredAnimal.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">Acuity:</span>
                  <span className="font-bold text-emerald-400">{featuredAnimal.stats.acuitySnellen}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">FOV:</span>
                  <span className="font-bold text-purple-400">{featuredAnimal.stats.fovDegrees}° Panoramic</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onSelectAnimalAndLaunch(featuredAnimal)}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Simulate {featuredAnimal.name}
              </button>

              <button
                onClick={() => onOpenDetails(featuredAnimal)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Science Fact Glass Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/30 p-5 backdrop-blur-xl flex items-start gap-4 shadow-lg">
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Daily Vision Science Fact
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed">
            The Mantis Shrimp visual system features 16 distinct color photoreceptors, allowing it to perceive circular polarization and deep ultraviolet light frequencies entirely invisible to human technology!
          </p>
        </div>
      </div>
    </div>
  );
});

HomeScreen.displayName = 'HomeScreen';
