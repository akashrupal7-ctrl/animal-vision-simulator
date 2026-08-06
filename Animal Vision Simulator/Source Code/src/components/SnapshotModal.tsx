import React, { useState } from 'react';
import { AnimalProfile } from '../types';
import { Download, X, Share2, Check } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string | null;
  animal: AnimalProfile;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = React.memo(({
  isOpen,
  onClose,
  dataUrl,
  animal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dataUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `animal-vision-${animal.id}-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${animal.id}-vision.png`, { type: 'image/png' });
        await navigator.share({
          title: `${animal.name} Vision Simulation`,
          text: `Check out how a ${animal.name} sees the world! Simulated in Animal Vision Simulator.`,
          files: [file],
        });
      } catch (e) {
        console.warn('Share failed or canceled:', e);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{animal.icon}</span>
            <div>
              <h3 className="text-base font-bold text-white">
                {animal.name} Vision Snapshot Captured
              </h3>
              <p className="text-xs text-slate-400">High Resolution GPU Frame Export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Captured Snapshot Preview */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
          <img
            src={dataUrl}
            alt={`${animal.name} Vision Captured`}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-400 border border-slate-700">
            {animal.name} Filter • 60 FPS WebGL Engine
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Link Copied!' : 'Share Snapshot'}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Snapshot Image
          </button>
        </div>
      </div>
    </div>
  );
});

SnapshotModal.displayName = 'SnapshotModal';
