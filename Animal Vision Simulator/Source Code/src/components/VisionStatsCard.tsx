import React from 'react';
import { AnimalProfile } from '../types';
import { BookOpen, Sparkles, Compass, Eye, Moon, Activity } from 'lucide-react';

interface VisionStatsCardProps {
  animal: AnimalProfile;
}

export const VisionStatsCard: React.FC<VisionStatsCardProps> = React.memo(({ animal }) => {
  const { stats } = animal;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl p-2.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            {animal.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{animal.name} Vision Profile</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {animal.category}
              </span>
            </div>
            <p className="text-xs italic text-slate-400">{animal.scientificName}</p>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">{animal.shortTagline}</p>
          </div>
        </div>
      </div>

      {/* Grid of Key Scientific Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Photoreceptor System */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Receptors
          </div>
          <div className="text-sm font-bold text-white truncate">{stats.type}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Peaks: {stats.peakWavelengths.join(', ')}
          </div>
        </div>

        {/* Field of View */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            Field of View
          </div>
          <div className="text-sm font-bold text-white">{stats.fovDegrees}° Panoramic</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (stats.fovDegrees / 360) * 100)}%` }}
            />
          </div>
        </div>

        {/* Visual Acuity */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Visual Acuity
          </div>
          <div className="text-sm font-bold text-emerald-400">{stats.acuitySnellen}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stats.acuitySnellen === '20/20'
              ? 'Human Standard'
              : parseInt(stats.acuitySnellen.split('/')[1] || '20') < 20
              ? 'Ultra High Resolution'
              : 'Lower Spatial Detail'}
          </div>
        </div>

        {/* Night Vision Rating */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1">
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            Night Sensitivity
          </div>
          <div className="text-sm font-bold text-amber-400">{stats.nightVisionScore} / 10</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.nightVisionScore * 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Description & Scientific Explanation */}
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          Anatomical Overview
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">{animal.description}</p>
      </div>

      {/* Fun Fact Callout */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 p-4 rounded-xl border border-emerald-500/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-0.5">
            Did You Know?
          </h4>
          <p className="text-xs text-emerald-100 font-medium leading-normal">{animal.funFact}</p>
        </div>
      </div>
    </div>
  );
});

VisionStatsCard.displayName = 'VisionStatsCard';
