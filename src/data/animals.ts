import { AnimalProfile } from '../types';
import { HUMAN_PROFILE } from './humans';
import { MAMMALS_DATA } from './mammals';
import { BIRDS_DATA } from './birds';
import { REPTILES_DATA } from './reptiles';
import { AMPHIBIANS_DATA } from './amphibians';
import { FISH_DATA } from './fish';
import { MARINE_DATA } from './marine';
import { INSECTS_DATA } from './insects';
import { ARACHNIDS_DATA } from './arachnids';

export const ANIMALS_DATA: AnimalProfile[] = [
  HUMAN_PROFILE,
  ...MAMMALS_DATA,
  ...BIRDS_DATA,
  ...REPTILES_DATA,
  ...AMPHIBIANS_DATA,
  ...FISH_DATA,
  ...MARINE_DATA,
  ...INSECTS_DATA,
  ...ARACHNIDS_DATA,
];

export function getAnimalById(id: string): AnimalProfile {
  const found = ANIMALS_DATA.find((a) => a.id === id);
  return found || ANIMALS_DATA[0];
}

export function getAnimalsByCategory(category: string): AnimalProfile[] {
  if (category === 'All') return ANIMALS_DATA;
  return ANIMALS_DATA.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}
