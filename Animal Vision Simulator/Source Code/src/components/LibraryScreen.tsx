import React, { useState, useMemo } from 'react';
import { AnimalProfile } from '../types';
import { ANIMALS_DATA } from '../data/animals';
import { Search, Heart, Play, Eye, Filter, X, Sparkles, ArrowRightLeft, Loader2 } from 'lucide-react';
import { searchAnimalsWithAI } from '../services/gemini';
import { AICompareModal } from './AICompareModal';

interface LibraryScreenProps {
  onSelectAnimalAndLaunch: (animal: AnimalProfile) => void;
  onOpenDetails: (animal: AnimalProfile) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const CATEGORIES = ['All', 'Mammal', 'Bird', 'Insect', 'Reptile', 'Amphibian', 'Marine', 'Fish', 'Arachnid'] as const;

export const LibraryScreen: React.FC<LibraryScreenProps> = React.memo(({
  onSelectAnimalAndLaunch,
  onOpenDetails,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // AI Compare Modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // AI Natural Language Search state
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any[] | null>(null);

  const handleRunAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAiSearching(true);
    try {
      const results = await searchAnimalsWithAI({
        query: searchQuery,
        animalsDatabase: ANIMALS_DATA,
      });
      setAiSearchResults(results || []);
    } catch (err) {
      console.error('AI search error', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  const filteredAnimals = useMemo(() => {
    // If AI Search results exist, order database by AI match score
    if (aiSearchResults && aiSearchResults.length > 0) {
      const matchMap = new Map<string, { score: number; reason: string }>();
      aiSearchResults.forEach((r) => matchMap.set(r.animalId, { score: r.matchScore, reason: r.matchReason }));

      const matched = ANIMALS_DATA.filter((a) => matchMap.has(a.id)).sort(
        (a, b) => (matchMap.get(b.id)?.score || 0) - (matchMap.get(a.id)?.score || 0)
      );

      if (selectedCategory === 'All') return matched;
      return matched.filter((a) => a.category === selectedCategory);
    }

    return ANIMALS_DATA.filter((animal) => {
      const matchesCategory = selectedCategory === 'All' || animal.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        animal.name.toLowerCase().includes(q) ||
        animal.scientificName.toLowerCase().includes(q) ||
        animal.description.toLowerCase().includes(q) ||
        animal.eyeStructure.toLowerCase().includes(q) ||
        animal.stats.type.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, aiSearchResults]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Search Bar & Title Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-emerald-400" />
              Animal Species Library ({filteredAnimals.length})
            </h1>
            <p className="text-xs text-slate-400">
              Browse biological profiles, Snellen acuity, and photoreceptor spectrums
            </p>
          </div>

          {/* AI Compare Trigger Button */}
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-200" />
            <span>AI Compare Species</span>
          </button>
        </div>

        {/* Search Input Box with AI Natural Language Search Option */}
        <form onSubmit={handleRunAiSearch} className="relative w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-search-library"
              type="text"
              placeholder="Search by name, or ask AI (e.g. 'animals that see in UV light' or '360 vision')..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (aiSearchResults) setAiSearchResults(null);
              }}
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition backdrop-blur-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAiSearchResults(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Natural Language Search Submit Button */}
          <button
            type="submit"
            disabled={isAiSearching || !searchQuery.trim()}
            className="px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 disabled:opacity-50 cursor-pointer transition flex items-center gap-1.5 shrink-0 shadow-lg"
          >
            {isAiSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950" />
            )}
            <span className="hidden sm:inline">AI Search</span>
          </button>
        </form>

        {aiSearchResults && (
          <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>✨ Gemini AI matched {aiSearchResults.length} species for your query!</span>
            <button
              type="button"
              onClick={() => setAiSearchResults(null)}
              className="text-[11px] underline font-bold hover:text-white"
            >
              Reset AI Search
            </button>
          </div>
        )}

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`chip-cat-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Species Cards */}
      {filteredAnimals.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 border border-white/10 rounded-3xl p-6 text-slate-400 space-y-2">
          <p className="font-semibold text-sm">No animals found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs text-emerald-400 underline hover:text-white font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map((animal) => {
            const isFav = favorites.includes(animal.id);

            return (
              <div
                key={animal.id}
                onClick={() => onOpenDetails(animal)}
                className="group relative bg-slate-900/70 border border-white/10 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Photo Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={animal.imageUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/70 backdrop-blur text-emerald-400 border border-slate-700/60">
                    {animal.category}
                  </span>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(animal.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 backdrop-blur text-white hover:text-rose-400 transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-3xl">{animal.icon}</span>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {animal.name}
                      </h3>
                      <span className="text-[11px] italic text-slate-300">
                        {animal.scientificName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {animal.shortTagline}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Acuity</span>
                      <span className="font-bold text-emerald-400">{animal.stats.acuitySnellen}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[9px]">Field of View</span>
                      <span className="font-bold text-purple-400">{animal.stats.fovDegrees}°</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnimalAndLaunch(animal);
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Simulate
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(animal);
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Compare Modal */}
      <AICompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
});

LibraryScreen.displayName = 'LibraryScreen';
