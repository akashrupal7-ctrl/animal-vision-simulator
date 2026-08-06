import React, { useState, useMemo } from 'react';
import { AnimalProfile, AnimalId } from '../types';
import { ANIMALS_DATA } from '../data/animals';
import { Eye, CheckCircle2 } from 'lucide-react';

interface AnimalSelectorProps {
  selectedAnimalId: AnimalId;
  onSelectAnimal: (animal: AnimalProfile) => void;
}

const CATEGORIES = ['All', 'Mammal', 'Bird', 'Insect', 'Reptile', 'Amphibian', 'Marine'] as const;

export const AnimalSelector: React.FC<AnimalSelectorProps> = React.memo(({
  selectedAnimalId,
  onSelectAnimal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredAnimals = useMemo(() => {
    return ANIMALS_DATA.filter(
      (animal) => selectedCategory === 'All' || animal.category === selectedCategory
    );
  }, [selectedCategory]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            Select Animal Simulator (12 Species)
          </h2>
          <p className="text-xs text-slate-400">
            Choose how different species perceive color, spatial acuity, low-light, or heat spectrums
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Animal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredAnimals.map((animal) => {
          const isSelected = animal.id === selectedAnimalId;

          return (
            <button
              key={animal.id}
              id={`animal-card-${animal.id}`}
              onClick={() => onSelectAnimal(animal)}
              className={`relative group text-left p-3 rounded-xl transition-all duration-150 border flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-800 to-emerald-950/60 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {/* Selected Check Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                  {animal.icon}
                </div>
                <div className="font-bold text-sm text-white leading-tight mb-0.5">
                  {animal.name}
                </div>
                <div className="text-[10px] italic text-slate-400 truncate mb-2">
                  {animal.scientificName}
                </div>
              </div>

              <div>
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900/80 text-slate-300 border border-slate-700">
                  {animal.stats.acuitySnellen} • {animal.stats.fovDegrees}° FOV
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

AnimalSelector.displayName = 'AnimalSelector';
