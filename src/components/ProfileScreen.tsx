import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Trophy,
  Coins,
  Flame,
  Award,
  Sparkles,
  Gamepad2,
  Lock,
  Unlock,
  CheckCircle2,
  LogOut,
  Edit2,
  Heart,
  Brain,
  ShieldCheck,
  Star,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, AnimalProfile } from '../types';
import { ANIMALS_DATA } from '../data/animals';
import { unlockAnimalWithCoins } from '../services/userService';
import { soundManager } from '../utils/soundManager';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAuthModal: () => void;
  onSelectAnimalAndLaunch: (animal: AnimalProfile) => void;
  onOpenDetails: (animal: AnimalProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onOpenAuthModal,
  onSelectAnimalAndLaunch,
  onOpenDetails,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [avatarInput, setAvatarInput] = useState(user.avatar);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const AVATARS = ['🦅', '🦁', '🦉', '🦐', '🐍', '🐺', '🦈', '🐝', '🦊', '🐯', '🐬', '🦎'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = () => {
    soundManager.playClick();
    const updated: UserProfile = {
      ...user,
      username: usernameInput || 'Explorer',
      avatar: avatarInput,
    };
    onUpdateUser(updated);
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  const handleUnlockAnimal = (animal: AnimalProfile, cost: number = 200) => {
    soundManager.playClick();
    const res = unlockAnimalWithCoins(user, animal.id, cost);
    if (res.success) {
      onUpdateUser(res.updatedProfile);
      soundManager.playWin();
      showToast(`🎉 Unlocked ${animal.name}! Enjoy full vision simulator!`);
    } else {
      soundManager.playLose();
      showToast(`⚠️ ${res.error}`);
    }
  };

  const levelProgress = Math.min(100, Math.round(((user.xp % 200) / 200) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Toast Alert */}
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

      {/* USER PROFILE HEADER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl">
                  {user.avatar}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-950">
                LVL {user.level}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.username}</h1>
                {user.isGuest ? (
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    Guest Account
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>

              {/* XP Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                  <span>Level {user.level}</span>
                  <span>{user.xp % 200} / 200 XP</span>
                </div>
                <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{user.coins} Coins</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-1.5 text-orange-400 font-bold text-sm">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{user.loginStreak} Day Streak</span>
              </div>
            </div>

            {user.isGuest ? (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenAuthModal();
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer hover:from-emerald-400 hover:to-teal-300 transition"
              >
                Login / Sync
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile View */}
        {isEditing && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Update Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">Display Name</label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold">Avatar</label>
                <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setAvatarInput(emoji)}
                      className={`text-lg p-1.5 rounded-xl border cursor-pointer ${
                        avatarInput === emoji
                          ? 'bg-emerald-500/30 border-emerald-400'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        )}
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> Games Played
          </div>
          <div className="text-xl font-black text-white font-mono">{user.gamesPlayed}</div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-purple-400" /> Quizzes Done
          </div>
          <div className="text-xl font-black text-white font-mono">{user.quizzesCompleted}</div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Total XP
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">{user.xp}</div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-blue-400" /> Badges Unlocked
          </div>
          <div className="text-xl font-black text-white font-mono">{user.unlockedBadges.length} / 6</div>
        </div>
      </div>

      {/* UNLOCKABLE ANIMALS MARKETPLACE */}
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" /> Unlockable Animal Vision Modes
            </h3>
            <p className="text-xs text-slate-400">
              Spend earned coins to unlock rare species vision filters in the live simulator!
            </p>
          </div>
          <div className="text-xs font-mono font-extrabold text-amber-400 flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            <Coins className="w-3.5 h-3.5" /> {user.coins} Available
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ANIMALS_DATA.slice(0, 12).map((animal) => {
            const isUnlocked = user.unlockedAnimals.includes(animal.id);
            const cost = 200;

            return (
              <div
                key={animal.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{animal.icon}</span>
                  {isUnlocked ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {cost}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-white">{animal.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{animal.stats.type}</div>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onSelectAnimalAndLaunch(animal);
                    }}
                    className="w-full py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-[11px] border border-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Launch Vision</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockAnimal(animal, cost)}
                    className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Unlock ({cost})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
