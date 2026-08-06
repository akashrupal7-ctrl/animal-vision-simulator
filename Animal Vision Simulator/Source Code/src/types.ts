export type AnimalId = string;

export type AnimalCategory =
  | 'Mammal'
  | 'Bird'
  | 'Reptile'
  | 'Amphibian'
  | 'Fish'
  | 'Marine'
  | 'Insect'
  | 'Arachnid';

export type NavTab = 'home' | 'camera' | 'library' | 'games' | 'ai' | 'favorites' | 'profile' | 'settings';

export interface PhotoreceptorInfo {
  type: string; // e.g. "Dichromat (2 cones)", "16 Cones + UV", "Rods Dominant"
  peakWavelengths: string[];
  fovDegrees: number; // e.g. 240
  acuitySnellen: string; // e.g. "20/75"
  nightVisionScore: number; // 1 to 10 scale
  motionSensitivityScore: number; // 1 to 10 scale
  coneCount?: number;
  hasUV?: boolean;
  hasInfrared?: boolean;
  hasPolarization?: boolean;
  visibleSpectrum?: string;
  blindSpot?: string;
}

export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'
  | 'Data Deficient';

export interface AnimalProfile {
  id: string;
  name: string;
  scientificName: string;
  category: AnimalCategory;
  icon: string; // Emoji
  imageUrl: string; // Realistic HD animal photo URL for Library/Details
  shortTagline: string;
  habitat: string;
  diet: string;
  lifespan: string;
  conservationStatus: ConservationStatus;
  eyeStructure: string;
  stats: PhotoreceptorInfo;
  description: string;
  funFact: string;
  shaderConfig: {
    colorMatrix?: number[];
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    nightGain?: number;
    fovDistortion?: number;
    foveaZoom?: boolean;
    compoundEyeGrid?: boolean;
    thermalVision?: boolean;
    motionHighlight?: boolean;
    polarizationPattern?: boolean;
    blindSpotCenter?: boolean;
    cyanWaterDepth?: boolean;
    uvFabricGlow?: boolean;
    sonarGrid?: boolean;
    splitMonocular?: boolean;
    parietalEye?: boolean;
    customShaderIndex?: number;
  };
}

export type InputSourceType = 'camera' | 'sample_video' | 'sample_image' | 'upload';

export interface FilterControls {
  intensity: number; // 0 - 100
  motionSensitivity: number; // 0 - 100
  nightGain: number; // 0 - 100
  zoomLevel: number; // 1x - 5x
  compoundScale: number; // hex density
}

export type AppLanguage = 'English' | 'Spanish' | 'German' | 'French' | 'Japanese';

export interface AppSettings {
  theme: 'dark' | 'light';
  cameraQuality: '720p' | '480p' | '1080p';
  performanceMode: 'gpu_high' | 'frame_saver';
  language: AppLanguage;
  autoStartCamera: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
}

export type GameId =
  | 'match3'
  | 'block_puzzle'
  | 'memory_card'
  | 'quiz_challenge'
  | 'jigsaw_puzzle'
  | 'spot_difference'
  | 'vision_challenge'
  | 'endless_runner'
  | 'snake'
  | 'tic_tac_toe'
  | 'sudoku'
  | 'game2048'
  | 'word_search'
  | 'sliding_puzzle';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  quizzesCompleted: number;
  perfectQuizzes: number;
  matchWins: number;
  gamesPlayed: number;
  highScores: Record<string, number>;
  gameProgress: Record<string, any>;
  unlockedAnimals: string[];
  unlockedBadges: string[];
  favoriteAnimals: string[];
  lastLoginDate: string;
  loginStreak: number;
  isGuest: boolean;
}


