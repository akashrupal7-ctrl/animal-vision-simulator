import React from 'react';
import { AppSettings } from '../types';
import { Settings, Moon, Sun, Camera, Gauge, Globe, Smartphone, ShieldCheck, Check, Volume2, VolumeX, Music, Bell } from 'lucide-react';
import { getAppPlatform } from '../utils/capacitorBridge';
import { soundManager } from '../utils/soundManager';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = React.memo(({
  settings,
  onUpdateSettings,
}) => {
  const platformInfo = getAppPlatform();

  const handleToggleSound = (enabled: boolean) => {
    soundManager.soundEnabled = enabled;
    onUpdateSettings({ ...settings, soundEnabled: enabled });
  };

  const handleToggleMusic = (enabled: boolean) => {
    soundManager.toggleMusic(enabled);
    onUpdateSettings({ ...settings, musicEnabled: enabled });
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400">
          Customize audio, sound effects, shader performance, camera resolution, and native features
        </p>
      </div>

      {/* Settings Options Card Group */}
      <div className="space-y-4">
        {/* Audio & Sound Effects Controls */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/15 border border-purple-500/20 rounded-2xl text-purple-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Audio & Sound Effects</h3>
              <p className="text-xs text-slate-400">Manage synthesizer game SFX & ambient background melody</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" /> Sound Effects (SFX)
              </span>
              <button
                onClick={() => handleToggleSound(!settings.soundEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  settings.soundEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" /> Ambient Music
              </span>
              <button
                onClick={() => handleToggleMusic(!settings.musicEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  settings.musicEnabled ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Dark / Light Theme Toggle */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl text-emerald-400">
              {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Appearance Theme</h3>
              <p className="text-xs text-slate-400">Choose preferred application UI color palette</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              id="btn-theme-dark"
              onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark
            </button>
            <button
              id="btn-theme-light"
              onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light
            </button>
          </div>
        </div>

        {/* Camera Resolution Quality */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/15 border border-blue-500/20 rounded-2xl text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Camera Capture Resolution</h3>
              <p className="text-xs text-slate-400">Higher resolution increases visual sharpness</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['480p', '720p', '1080p'] as const).map((qual) => (
              <button
                key={qual}
                id={`btn-cam-quality-${qual}`}
                onClick={() => onUpdateSettings({ ...settings, cameraQuality: qual })}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                  settings.cameraQuality === qual
                    ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {qual === '480p' && '480p (Fast)'}
                {qual === '720p' && '720p HD (Balanced)'}
                {qual === '1080p' && '1080p Ultra'}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Mode */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/15 border border-amber-500/20 rounded-2xl text-amber-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">WebGL Performance Mode</h3>
              <p className="text-xs text-slate-400">Manage GPU frame processing rate</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="btn-perf-gpu"
              onClick={() => onUpdateSettings({ ...settings, performanceMode: 'gpu_high' })}
              className={`p-3 rounded-2xl text-xs font-bold text-left transition border cursor-pointer ${
                settings.performanceMode === 'gpu_high'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-extrabold text-sm mb-0.5">🚀 60 FPS GPU Shader</div>
              <div className="text-[10px] text-slate-400 font-normal">Maximum fluid motion and shader effects</div>
            </button>

            <button
              id="btn-perf-saver"
              onClick={() => onUpdateSettings({ ...settings, performanceMode: 'frame_saver' })}
              className={`p-3 rounded-2xl text-xs font-bold text-left transition border cursor-pointer ${
                settings.performanceMode === 'frame_saver'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-extrabold text-sm mb-0.5">🔋 Battery Saver (30 FPS)</div>
              <div className="text-[10px] text-slate-400 font-normal">Conserves battery life on older devices</div>
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/15 border border-purple-500/20 rounded-2xl text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Language</h3>
              <p className="text-xs text-slate-400">Select application display language</p>
            </div>
          </div>

          <select
            id="select-language"
            value={settings.language}
            onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value as any })}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            {['English', 'Spanish', 'German', 'French', 'Japanese'].map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Native Capacitor / App Info Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Animal Vision Simulator v2.5</h3>
              <p className="text-xs text-slate-400">Capacitor Android Native Build Architecture</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Runtime Target:</span>
              <span className="font-mono text-emerald-400 font-bold">{platformInfo.platformName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Native Camera Bridge:</span>
              <span className="font-mono text-emerald-400 font-bold">@capacitor/camera</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Graphics Engine:</span>
              <span className="font-mono text-emerald-400 font-bold">WebGL GLSL GPU Shaders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsScreen.displayName = 'SettingsScreen';
