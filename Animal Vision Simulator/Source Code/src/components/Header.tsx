import React, { useState } from 'react';
import { Eye, Smartphone, Info, X, ShieldCheck, Check, User, Coins, LogIn } from 'lucide-react';
import { getAppPlatform } from '../utils/capacitorBridge';
import { UserProfile } from '../types';

interface HeaderProps {
  isCameraMode?: boolean;
  currentUser?: UserProfile;
  onOpenAuthModal?: () => void;
  onNavigateToProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  isCameraMode = false,
  currentUser,
  onOpenAuthModal,
  onNavigateToProfile,
}) => {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const platformInfo = getAppPlatform();

  return (
    <>
      <header className={`w-full bg-slate-950/85 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40 transition-all duration-300 ${
        isCameraMode ? 'px-3 py-2' : 'px-4 py-3 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* App Title & Logo */}
          <div className="flex items-center gap-2.5">
            <div className={`p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl text-slate-950 font-black shadow-md shadow-emerald-500/20 ${
              isCameraMode ? 'p-1.5' : 'p-2.5'
            }`}>
              <Eye className={`stroke-[2.5] ${isCameraMode ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </div>
            <div>
              <h1 className={`font-black tracking-tight text-white flex items-center gap-2 ${
                isCameraMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}>
                Animal Vision Simulator
              </h1>
              {!isCameraMode && (
                <p className="text-xs text-slate-400 hidden sm:block">
                  Real-time WebGL 60 FPS visual acuity simulator across 12 species
                </p>
              )}
            </div>
          </div>

          {/* Right User Stats & Auth Chip */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div
                onClick={onNavigateToProfile}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl cursor-pointer transition"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{currentUser.username}</span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-0.5">
                    <Coins className="w-3 h-3" /> {currentUser.coins}
                  </span>
                </div>
              </div>
            )}

            {currentUser?.isGuest && onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 cursor-pointer transition shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button
              id="btn-app-info"
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
              title="About & Camera Info"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Info & Android Capacitor Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                About Animal Vision Simulator
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                Powered by a high-speed GPU WebGL shader engine executing fragment pixel transformations at a locked 60 FPS. Simulates how different animals process light, spectral dichromacy/trichromacy, heat vision, and optical acuity.
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                  📱 Android Release (Capacitor Ready)
                </h4>
                <ul className="space-y-1 text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Configured with <code className="text-emerald-300 font-mono">capacitor.config.json</code></li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Powered by <code className="text-emerald-300 font-mono">@capacitor/camera</code> native bridge</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Low memory consumption & sub-2s cold launch</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                  📷 Camera & Permissions
                </h4>
                <p>
                  To view live camera feed, grant camera permission when prompted by your browser or Android OS. Front/back camera toggle and sample fallback video/photos are supported seamlessly!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Header.displayName = 'Header';
