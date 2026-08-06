import React from 'react';
import { motion } from 'motion/react';
import { NavTab } from '../types';
import { Home, Camera, Compass, Heart, Settings, Bot, Gamepad2, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  activeTab,
  onSelectTab,
  favoritesCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'camera', label: 'Camera', icon: <Camera className="w-5 h-5" /> },
    { id: 'library', label: 'Library', icon: <Compass className="w-5 h-5" /> },
    { id: 'games', label: 'Games', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'ai', label: 'AI', icon: <Bot className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md pb-safe">
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 shadow-2xl shadow-emerald-950/50 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-2.5 sm:px-3.5 rounded-2xl transition-colors duration-200 cursor-pointer min-w-[48px] min-h-[48px] ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Backdrop Pill with Framer Motion layoutId */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl -z-10 shadow-sm shadow-emerald-500/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative">
                {tab.icon}
                {tab.id === 'favorites' && favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 shadow-sm">
                    {favoritesCount}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';
