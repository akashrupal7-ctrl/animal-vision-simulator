import { UserProfile } from '../types';

const USER_STORAGE_KEY = 'animal_vision_user_profile';

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest_101',
  email: 'guest@animalvision.app',
  username: 'Nature Explorer',
  avatar: '🦅',
  level: 3,
  xp: 450,
  coins: 250,
  quizzesCompleted: 4,
  perfectQuizzes: 1,
  matchWins: 3,
  gamesPlayed: 12,
  highScores: {
    match3: 1250,
    block_puzzle: 840,
    memory_card: 18,
    quiz_challenge: 90,
    jigsaw_puzzle: 240,
    spot_difference: 500,
    vision_challenge: 620,
    endless_runner: 1450,
    snake: 32,
    tic_tac_toe: 5,
    sudoku: 420,
    game2048: 1024,
    word_search: 350,
    sliding_puzzle: 180,
  },
  gameProgress: {},
  unlockedAnimals: ['dog', 'cat', 'eagle', 'mantis_shrimp', 'bee', 'owl', 'snake', 'shark', 'horse', 'frog'],
  unlockedBadges: ['badge_first_quiz', 'badge_match_novice'],
  favoriteAnimals: ['eagle', 'mantis_shrimp', 'owl'],
  lastLoginDate: new Date().toISOString().split('T')[0],
  loginStreak: 3,
  isGuest: true,
};

export function loadUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Safely merge with defaults to avoid undefined property errors on old saved profiles
      const profile: UserProfile = {
        ...DEFAULT_GUEST_USER,
        ...parsed,
        highScores: {
          ...DEFAULT_GUEST_USER.highScores,
          ...(parsed.highScores || {}),
        },
        gameProgress: {
          ...DEFAULT_GUEST_USER.gameProgress,
          ...(parsed.gameProgress || {}),
        },
        unlockedAnimals: parsed.unlockedAnimals || DEFAULT_GUEST_USER.unlockedAnimals,
        unlockedBadges: parsed.unlockedBadges || DEFAULT_GUEST_USER.unlockedBadges,
        favoriteAnimals: parsed.favoriteAnimals || DEFAULT_GUEST_USER.favoriteAnimals,
      };

      // Check for daily login reward
      const today = new Date().toISOString().split('T')[0];
      if (profile.lastLoginDate !== today) {
        const lastDate = new Date(profile.lastLoginDate);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        
        profile.lastLoginDate = today;
        if (diffDays === 1) {
          profile.loginStreak = (profile.loginStreak || 0) + 1;
        } else {
          profile.loginStreak = 1;
        }
        // Daily login bonus
        profile.coins += 50;
        profile.xp += 100;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      }
      return profile;
    }
  } catch (e) {
    console.warn('Failed to load user profile', e);
  }
  return DEFAULT_GUEST_USER;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save user profile', e);
  }
}

export function updateUserStats(
  current: UserProfile,
  rewards: { xp?: number; coins?: number; gameId?: string; score?: number; gameProgressData?: any }
): UserProfile {
  const xpToAdd = rewards.xp || 0;
  const coinsToAdd = rewards.coins || 0;

  const newXp = (current?.xp || 0) + xpToAdd;
  const newCoins = (current?.coins || 0) + coinsToAdd;
  const newLevel = Math.floor(newXp / 200) + 1;

  const updatedHighScores = { ...(current?.highScores || {}) };
  if (rewards.gameId && rewards.score !== undefined) {
    const prevHigh = updatedHighScores[rewards.gameId] || 0;
    if (rewards.score > prevHigh) {
      updatedHighScores[rewards.gameId] = rewards.score;
    }
  }

  const updatedGameProgress = { ...(current?.gameProgress || {}) };
  if (rewards.gameId && rewards.gameProgressData) {
    updatedGameProgress[rewards.gameId] = rewards.gameProgressData;
  }

  const updated: UserProfile = {
    ...current,
    xp: newXp,
    coins: newCoins,
    level: newLevel,
    gamesPlayed: (current?.gamesPlayed || 0) + (rewards.gameId ? 1 : 0),
    highScores: updatedHighScores,
    gameProgress: updatedGameProgress,
  };

  saveUserProfile(updated);
  return updated;
}

export function unlockAnimalWithCoins(current: UserProfile, animalId: string, cost: number): { success: boolean; updatedProfile: UserProfile; error?: string } {
  const currentCoins = current?.coins || 0;
  if (currentCoins < cost) {
    return { success: false, updatedProfile: current, error: `Need ${cost - currentCoins} more coins!` };
  }
  const unlocked = current?.unlockedAnimals || [];
  if (unlocked.includes(animalId)) {
    return { success: true, updatedProfile: current };
  }

  const updated: UserProfile = {
    ...current,
    coins: currentCoins - cost,
    unlockedAnimals: [...unlocked, animalId],
  };

  saveUserProfile(updated);
  return { success: true, updatedProfile: updated };
}
