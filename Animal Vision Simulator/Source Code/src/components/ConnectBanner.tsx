import React from 'react';
import { HardDrive, ShieldCheck, Sparkles, FolderSync, ArrowRight } from 'lucide-react';

interface ConnectBannerProps {
  onConnectClick: () => void;
  isLoading?: boolean;
}

export const ConnectBanner: React.FC<ConnectBannerProps> = ({ onConnectClick, isLoading }) => {
  return (
    <div className="max-w-3xl mx-auto my-12 bg-white border border-slate-200/90 rounded-2xl shadow-lg p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
        <HardDrive className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Connect Your Google Drive</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Access, search, organize, upload, and summarize your Google Workspace files securely with built-in Gemini AI intelligence.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-2">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
          <FolderSync className="w-4 h-4 text-blue-600" />
          <div className="text-xs font-semibold text-slate-800">Full File Manager</div>
          <div className="text-[11px] text-slate-500">Browse folders, filter categories, upload & rename files.</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <div className="text-xs font-semibold text-slate-800">Gemini AI Assistant</div>
          <div className="text-[11px] text-slate-500">Instant AI summaries, key takeaways & Q&A for any document.</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <div className="text-xs font-semibold text-slate-800">Secure Workspace</div>
          <div className="text-[11px] text-slate-500">Direct OAuth integration with official Google Drive APIs.</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onConnectClick}
          disabled={isLoading}
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <span>Connect Google Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
