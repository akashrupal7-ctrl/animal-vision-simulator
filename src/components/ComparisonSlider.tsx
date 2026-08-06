import React from 'react';
import { FilterControls, AnimalProfile } from '../types';
import { Sliders, Eye, Sun, ZoomIn, Grid, Zap, Layers } from 'lucide-react';

interface ComparisonSliderProps {
  selectedAnimal: AnimalProfile;
  isComparisonActive: boolean;
  onToggleComparison: () => void;
  comparisonSplit: number;
  onChangeComparisonSplit: (value: number) => void;
  filterControls: FilterControls;
  onChangeFilterControls: (controls: FilterControls) => void;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = React.memo(({
  selectedAnimal,
  isComparisonActive,
  onToggleComparison,
  comparisonSplit,
  onChangeComparisonSplit,
  filterControls,
  onChangeFilterControls,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Top Header & Comparison Split Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Split-View Comparison & Vision Tuning
            </h3>
            <p className="text-xs text-slate-400">
              Compare Human standard vision side-by-side with {selectedAnimal.name} vision
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-comparison"
          onClick={onToggleComparison}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            isComparisonActive
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Eye className="w-4 h-4" />
          {isComparisonActive ? 'Split-Screen Active' : 'Enable Comparison Slider'}
        </button>
      </div>

      {/* Comparison Split Range Slider (when active) */}
      {isComparisonActive && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-blue-400 flex items-center gap-1">
              👤 Human Vision ({comparisonSplit}%)
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              {selectedAnimal.icon} {selectedAnimal.name} Vision ({100 - comparisonSplit}%)
            </span>
          </div>
          <input
            id="slider-comparison-split"
            type="range"
            min={0}
            max={100}
            value={comparisonSplit}
            onChange={(e) => onChangeComparisonSplit(Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Vision Fine-Tuning Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Filter Intensity */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Filter Intensity
            </span>
            <span className="font-mono text-emerald-400">{filterControls.intensity}%</span>
          </div>
          <input
            id="input-filter-intensity"
            type="range"
            min={0}
            max={100}
            value={filterControls.intensity}
            onChange={(e) =>
              onChangeFilterControls({ ...filterControls, intensity: Number(e.target.value) })
            }
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Low-Light / Night Sensitivity Gain */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Low-Light / Night Gain
            </span>
            <span className="font-mono text-amber-400">{filterControls.nightGain}%</span>
          </div>
          <input
            id="input-night-gain"
            type="range"
            min={10}
            max={100}
            value={filterControls.nightGain}
            onChange={(e) =>
              onChangeFilterControls({ ...filterControls, nightGain: Number(e.target.value) })
            }
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Conditional Special Controls based on selected animal */}
        {selectedAnimal.shaderConfig.foveaZoom && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-amber-300">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                Telephoto Fovea Zoom
              </span>
              <span className="font-mono text-amber-400">{(filterControls.zoomLevel * 1.2).toFixed(1)}x</span>
            </div>
            <input
              id="input-zoom-level"
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={filterControls.zoomLevel}
              onChange={(e) =>
                onChangeFilterControls({ ...filterControls, zoomLevel: Number(e.target.value) })
              }
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {selectedAnimal.shaderConfig.compoundEyeGrid && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-yellow-300">
                <Grid className="w-3.5 h-3.5 text-yellow-400" />
                Compound Hexagon Density
              </span>
              <span className="font-mono text-yellow-400">{filterControls.compoundScale}%</span>
            </div>
            <input
              id="input-compound-scale"
              type="range"
              min={10}
              max={100}
              value={filterControls.compoundScale}
              onChange={(e) =>
                onChangeFilterControls({ ...filterControls, compoundScale: Number(e.target.value) })
              }
              className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {selectedAnimal.shaderConfig.motionHighlight && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5 text-green-300">
                <Zap className="w-3.5 h-3.5 text-green-400" />
                Motion Detector Sensitivity
              </span>
              <span className="font-mono text-green-400">{filterControls.motionSensitivity}%</span>
            </div>
            <input
              id="input-motion-sensitivity"
              type="range"
              min={10}
              max={100}
              value={filterControls.motionSensitivity}
              onChange={(e) =>
                onChangeFilterControls({ ...filterControls, motionSensitivity: Number(e.target.value) })
              }
              className="w-full accent-green-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
});

ComparisonSlider.displayName = 'ComparisonSlider';
