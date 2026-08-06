import React, { useState, useMemo } from 'react';
import { AnimalProfile, NavTab } from '../types';
import { ANIMALS_DATA } from '../data/animals';
import { Heart, Search, Play, Compass, Trash2 } from 'lucide-react';

interface FavoritesScreenProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectAnimalAndLaunch: (animal: AnimalProfile) => void;
  onOpenDetails: (animal: AnimalProfile) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = React.memo(({
  favorites,
  onToggleFavorite,
  onSelectAnimalAndLaunch,
  onOpenDetails,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteAnimals = useMemo(() => {
    return ANIMALS_DATA.filter((animal) => favorites.includes(animal.id)).filter((animal) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        animal.name.toLowerCase().includes(q) ||
        animal.scientificName.toLowerCase().includes(q)
      );
    });
  }, [favorites, searchQuery]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              Favorite Species ({favoriteAnimals.length})
            </h1>
            <p className="text-xs text-slate-400">
              Quick access to your saved animal vision profiles
            </p>
          </div>
        </div>

        {/* Search Bar if favorites exist */}
        {favorites.length > 0 && (
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-search-favorites"
              type="text"
              placeholder="Search your saved favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition backdrop-blur-md"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-white/10 rounded-3xl p-8 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Favorites Saved Yet</h3>
            <p className="text-xs text-slate-400">
              Explore the animal library and tap the heart icon on any species card to save it here for quick access!
            </p>
          </div>
          <button
            onClick={() => onSelectTab('library')}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Browse Species Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteAnimals.map((animal) => (
            <div
              key={animal.id}
              onClick={() => onOpenDetails(animal)}
              className="group relative bg-slate-900/70 border border-white/10 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                <img
                  src={animal.imageUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(animal.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 backdrop-blur text-rose-400 hover:text-white transition"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-3xl">{animal.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{animal.name}</h3>
                    <span className="text-[11px] italic text-slate-300">{animal.scientificName}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 line-clamp-2">{animal.shortTagline}</p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAnimalAndLaunch(animal);
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Simulate Vision
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

FavoritesScreen.displayName = 'FavoritesScreen';
