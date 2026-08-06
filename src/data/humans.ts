import { AnimalProfile } from '../types';

export const HUMAN_PROFILE: AnimalProfile = {
  id: 'human',
  name: 'Human Standard',
  scientificName: 'Homo sapiens',
  category: 'Mammal',
  icon: '🧍',
  imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
  shortTagline: 'Trichromatic Full Spectrum Baseline Vision',
  habitat: 'Global terrestrial cities, forests, biomes',
  diet: 'Omnivore',
  lifespan: '70 - 85 years',
  conservationStatus: 'Least Concern',
  eyeStructure: 'Single-lens spherical camera eye with central fovea density',
  stats: {
    type: 'Trichromat (3 Cones: Blue, Green, Red)',
    peakWavelengths: ['420nm (S-cone)', '534nm (M-cone)', '564nm (L-cone)'],
    fovDegrees: 180,
    acuitySnellen: '20/20',
    nightVisionScore: 3,
    motionSensitivityScore: 5,
    coneCount: 3,
    hasUV: false,
    hasInfrared: false,
    hasPolarization: false,
    visibleSpectrum: '380nm - 750nm (Visible Spectrum)',
    blindSpot: 'Small optic disc gap located ~15° nasalward from center',
  },
  description:
    'Human trichromatic vision provides sharp color discrimination in bright daylight with high resolution in the central fovea.',
  funFact: 'Humans have around 6 million cone cells concentrated in the macular fovea!',
  shaderConfig: {},
};
