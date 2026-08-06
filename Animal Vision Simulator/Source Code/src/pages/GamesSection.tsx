import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Zap,
  Award,
  Sparkles,
  Flame,
  Brain,
  HelpCircle,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Lock,
  ChevronRight,
  ArrowRight,
  Coins,
  Medal,
  Star,
  Gamepad2,
  Grid,
  Bot,
  Play,
} from 'lucide-react';
import { QUIZ_QUESTIONS, MATCH_PAIRS, Question, MatchCard } from '../data/quizQuestions';
import { sendChatMessage } from '../services/openai';
import { generateQuizWithAI } from '../services/gemini';
import { soundManager } from '../utils/soundManager';

// Import Mini Games
import { Match3Game } from '../components/games/Match3Game';
import { BlockPuzzleGame } from '../components/games/BlockPuzzleGame';
import { SnakeGame } from '../components/games/SnakeGame';
import { Game2048 } from '../components/games/Game2048';
import { TicTacToeGame } from '../components/games/TicTacToeGame';
import { WordSearchGame } from '../components/games/WordSearchGame';
import { SlidingPuzzleGame } from '../components/games/SlidingPuzzleGame';
import { JigsawGame } from '../components/games/JigsawGame';
import { SpotDifferenceGame } from '../components/games/SpotDifferenceGame';
import { EndlessRunnerGame } from '../components/games/EndlessRunnerGame';
import { SudokuGame } from '../components/games/SudokuGame';
import { AnimalVisionChallengeGame } from '../components/games/AnimalVisionChallengeGame';

interface GamesSectionProps {
  onNavigateToAI?: (prompt: string) => void;
  userStats?: any;
  onUpdateStats?: (stats: any) => void;
}

interface LocalStats {
  xp: number;
  coins: number;
  quizzesCompleted: number;
  perfectQuizzes: number;
  matchWins: number;
  streakDays: number;
  unlockedBadges: string[];
  highScores: Record<string, number>;
}

const DEFAULT_STATS: LocalStats = {
  xp: 450,
  coins: 250,
  quizzesCompleted: 4,
  perfectQuizzes: 1,
  matchWins: 3,
  streakDays: 4,
  unlockedBadges: ['badge_first_quiz', 'badge_match_novice'],
  highScores: {},
};

const BADGES_LIST = [
  { id: 'badge_first_quiz', name: 'First Sight', desc: 'Complete your first vision quiz', icon: '🎯', xpReward: 50 },
  { id: 'badge_speed_demon', name: 'Speed Demon', desc: 'Score 100+ points in Timed Challenge', icon: '⚡', xpReward: 100 },
  { id: 'badge_match_novice', name: 'Optics Matcher', desc: 'Win 2 Animal Match memory games', icon: '🧩', xpReward: 75 },
  { id: 'badge_mantis_master', name: '16-Cone Master', desc: 'Answer 5 Spectrum & UV questions correctly', icon: '🦐', xpReward: 150 },
  { id: 'badge_thermal_ace', name: 'Thermal Ace', desc: 'Score a perfect score on Hard quiz', icon: '🐍', xpReward: 200 },
  { id: 'badge_visionary', name: 'Universal Visionary', desc: 'Reach 1,000 total XP', icon: '👑', xpReward: 300 },
];

const LEADERBOARD_INITIAL = [
  { rank: 1, name: 'Dr. Evelyn Vance', title: 'Optics Specialist', xp: 2450, avatar: '👩‍🔬' },
  { rank: 2, name: 'Prof. Marcus Chen', title: 'Bio-Physicist', xp: 1980, avatar: '👨‍🏫' },
  { rank: 3, name: 'Aria Sterling', title: 'Mantis Enthusiast', xp: 1620, avatar: '🦐' },
  { rank: 4, name: 'You (Explorer)', title: 'Vision Student', xp: 450, avatar: '👁️', isUser: true },
  { rank: 5, name: 'Kaito Tanaka', title: 'Avian Visionary', xp: 890, avatar: '🦅' },
  { rank: 6, name: 'Zoe Martinez', title: 'Nocturnal Tracker', xp: 740, avatar: '🦉' },
];

export const GamesSection: React.FC<GamesSectionProps> = ({
  onNavigateToAI,
  userStats: externalStats,
  onUpdateStats,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'quiz' | 'match' | 'leaderboard' | 'active_game'
  >('dashboard');

  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const [userStats, setUserStats] = useState<LocalStats>(() => {
    try {
      if (externalStats) {
        return {
          ...DEFAULT_STATS,
          ...externalStats,
          highScores: { ...DEFAULT_STATS.highScores, ...(externalStats.highScores || {}) },
          unlockedBadges: externalStats.unlockedBadges || DEFAULT_STATS.unlockedBadges,
        };
      }
      const saved = localStorage.getItem('animal_vision_user_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          highScores: { ...DEFAULT_STATS.highScores, ...(parsed.highScores || {}) },
          unlockedBadges: parsed.unlockedBadges || DEFAULT_STATS.unlockedBadges,
        };
      }
      return DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  useEffect(() => {
    if (externalStats) {
      setUserStats((prev) => ({
        ...prev,
        ...externalStats,
        highScores: { ...DEFAULT_STATS.highScores, ...(externalStats.highScores || {}) },
        unlockedBadges: externalStats.unlockedBadges || prev.unlockedBadges || DEFAULT_STATS.unlockedBadges,
      }));
    }
  }, [externalStats]);

  useEffect(() => {
    try {
      localStorage.setItem('animal_vision_user_stats', JSON.stringify(userStats));
      if (onUpdateStats) onUpdateStats(userStats);
    } catch (e) {
      console.warn('Failed to save stats', e);
    }
  }, [userStats]);

  const playerLevel = Math.floor((userStats?.xp || 0) / 200) + 1;
  const xpCurrentLevel = (userStats?.xp || 0) % 200;
  const xpProgressPercent = Math.min(100, Math.round((xpCurrentLevel / 200) * 100));

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addRewards = (xpAmount: number, coinAmount: number, gameId?: string, score?: number) => {
    setUserStats((prev) => {
      const prevXp = prev?.xp || 0;
      const prevCoins = prev?.coins || 0;
      const newXp = prevXp + xpAmount;
      const newCoins = prevCoins + coinAmount;
      const newUnlocked = [...(prev?.unlockedBadges || [])];
      if (newXp >= 1000 && !newUnlocked.includes('badge_visionary')) {
        newUnlocked.push('badge_visionary');
      }

      const updatedHighs = { ...(prev?.highScores || {}) };
      if (gameId && score !== undefined) {
        if (!updatedHighs[gameId] || score > updatedHighs[gameId]) {
          updatedHighs[gameId] = score;
        }
      }

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        unlockedBadges: newUnlocked,
        highScores: updatedHighs,
      };
    });
  };

  // Launch sub mini game
  const handleLaunchGame = (gameId: string) => {
    soundManager.playClick();
    setActiveGameId(gameId);
    setActiveSubTab('active_game');
  };

  const handleMiniGameEnd = (score: number, coins: number, xp: number) => {
    addRewards(xp, coins, activeGameId || undefined, score);
    showToast(`🏆 Game Complete! Earned +${coins} Coins & +${xp} XP!`);
    setActiveSubTab('dashboard');
    setActiveGameId(null);
  };

  // ALL 14 GAMES CATALOG
  const GAMES_CATALOG = [
    { id: 'match3', name: 'Match-3 Puzzle', desc: 'Candy Crush style animal optics matcher', icon: '🍬', tag: 'Puzzle' },
    { id: 'block_puzzle', name: 'Block Blast Puzzle', desc: 'Fill rows & cols to clear optics blocks', icon: '🧱', tag: 'Strategy' },
    { id: 'memory_card', name: 'Animal Memory Match', desc: 'Pair animals with photoreceptor traits', icon: '🎴', tag: 'Memory' },
    { id: 'quiz_challenge', name: 'Animal Vision Quiz', desc: 'Multi-mode quiz with AI question generator', icon: '🧠', tag: 'Educational' },
    { id: 'jigsaw_puzzle', name: 'Jigsaw Optics Puzzle', desc: 'Reconstruct animal eyes from tiles', icon: '🧩', tag: 'Logic' },
    { id: 'spot_difference', name: 'Spot the Difference', desc: 'Spot dichromatic visual differences', icon: '👁️', tag: 'Observation' },
    { id: 'vision_challenge', name: 'Vision Filter Challenge', desc: 'Identify which species perceives this scene', icon: '🔍', tag: 'Quiz' },
    { id: 'endless_runner', name: 'Animal Vision Runner', desc: 'Switch vision modes to run through dark terrain', icon: '🏃', tag: 'Action' },
    { id: 'snake', name: 'Thermal Pit Snake', desc: 'Classic Snake with infrared thermal prey tracking', icon: '🐍', tag: 'Arcade' },
    { id: 'tic_tac_toe', name: 'Vision Tic-Tac-Toe', desc: 'Eagle Vision vs Pit Viper Thermal Vision', icon: '❌', tag: 'Casual' },
    { id: 'sudoku', name: '4x4 Mini Sudoku', desc: 'Optics number logic challenge', icon: '🔢', tag: 'Brain' },
    { id: 'game2048', name: 'Photoreceptor 2048', desc: 'Merge cones to reach 2048', icon: '🎲', tag: 'Math' },
    { id: 'word_search', name: 'Optics Word Search', desc: 'Find hidden comparative vision words', icon: '🔤', tag: 'Word' },
    { id: 'sliding_puzzle', name: 'Sliding Tile Puzzle', desc: 'Slide numbers 1-8 into order', icon: '🖼️', tag: 'Classic' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Toast Bar */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 border border-emerald-300"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER HERO & STATS BAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Gamepad2 className="w-4 h-4" /> 14 Games & Educational Arcade
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Animal Vision Arcade
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Play Match-3, Block Blast, Snake, Runner, Sudoku, 2048 & Quizzes to earn coins and unlock animals!
            </p>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 shrink-0 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center font-black text-slate-950 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center text-emerald-400">
                  <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">LVL</span>
                  <span className="text-lg font-black leading-none">{playerLevel}</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Vision Student <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
                <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-l border-slate-800 pl-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{userStats.coins} Coins</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400 font-mono">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{userStats.streakDays} Day Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-white/10 no-scrollbar">
          {[
            { id: 'dashboard', label: '14 Games Hub', icon: <Gamepad2 className="w-4 h-4" /> },
            { id: 'leaderboard', label: 'Leaderboard', icon: <Medal className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-black scale-105 shadow-lg'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE SUB-GAME CONTAINER */}
      {activeSubTab === 'active_game' && (
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
          {activeGameId === 'match3' && <Match3Game onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'block_puzzle' && <BlockPuzzleGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'snake' && <SnakeGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'game2048' && <Game2048 onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'tic_tac_toe' && <TicTacToeGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'word_search' && <WordSearchGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'sliding_puzzle' && <SlidingPuzzleGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'jigsaw_puzzle' && <JigsawGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'spot_difference' && <SpotDifferenceGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'endless_runner' && <EndlessRunnerGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'sudoku' && <SudokuGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'vision_challenge' && <AnimalVisionChallengeGame onGameEnd={handleMiniGameEnd} onBack={() => setActiveSubTab('dashboard')} />}
          {activeGameId === 'quiz_challenge' && (
            <div className="p-4 text-center space-y-3">
              <h2 className="text-lg font-black text-white">Vision Quiz Challenge</h2>
              <p className="text-xs text-slate-400">Launch multi-mode quiz challenge</p>
              <button
                onClick={() => handleMiniGameEnd(150, 30, 150)}
                className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
              >
                Complete Quiz
              </button>
            </div>
          )}
          {activeGameId === 'memory_card' && (
            <div className="p-4 text-center space-y-3">
              <h2 className="text-lg font-black text-white">Animal Memory Card Match</h2>
              <p className="text-xs text-slate-400">Pair animals with photoreceptors</p>
              <button
                onClick={() => handleMiniGameEnd(120, 25, 120)}
                className="px-5 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
              >
                Complete Memory Match
              </button>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD: 14 GAMES GRID */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" /> Select a Mini Game
            </h2>
            <span className="text-xs text-slate-400 font-mono">14 Games Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {GAMES_CATALOG.map((game) => {
              const highScore = (userStats?.highScores && userStats.highScores[game.id]) || 0;
              return (
                <div
                  key={game.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-3xl space-y-3 transition group relative overflow-hidden shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-3xl p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition">
                      {game.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {game.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition">
                      {game.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{game.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      High Score: {highScore}
                    </span>
                    <button
                      onClick={() => handleLaunchGame(game.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer transition"
                    >
                      <Play className="w-3 h-3 fill-slate-950" /> Play
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-4 animate-fade-in shadow-2xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-400" /> Global Optics Leaderboard
          </h2>
          <div className="space-y-2">
            {LEADERBOARD_INITIAL.map((entry) => (
              <div
                key={entry.rank}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  entry.isUser
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-slate-500 w-6">#{entry.rank}</span>
                  <span className="text-2xl">{entry.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{entry.name}</div>
                    <div className="text-[10px] text-slate-400">{entry.title}</div>
                  </div>
                </div>
                <div className="font-mono font-black text-amber-400 text-xs">{entry.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
