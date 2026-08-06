import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

/**
 * @type {React.FC<{ onClick?: () => void; isChatActive?: boolean }>}
 */
export const AIChatButton = React.memo(({ onClick, isChatActive = false }) => {
  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-24 sm:right-6">
      <button
        id="ai-chat-fab-button"
        type="button"
        onClick={onClick}
        title="Open AI Vision Assistant"
        className={`group relative p-3.5 sm:p-4 rounded-2xl flex items-center gap-2.5 transition-all duration-300 shadow-2xl cursor-pointer ${
          isChatActive
            ? 'bg-emerald-500 text-slate-950 scale-105 ring-2 ring-emerald-300 shadow-emerald-500/50'
            : 'bg-slate-900/90 text-emerald-400 hover:text-white border border-emerald-500/40 hover:border-emerald-400 backdrop-blur-xl hover:scale-105 shadow-emerald-950/60'
        }`}
      >
        {/* Glow halo animation */}
        {!isChatActive && (
          <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-md opacity-75 group-hover:opacity-100 transition duration-500 -z-10 animate-pulse" />
        )}

        <div className="relative flex items-center justify-center">
          <Bot className={`w-6 h-6 transition-transform duration-300 ${isChatActive ? 'rotate-12' : 'group-hover:scale-110'}`} />
          <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1.5 animate-bounce" />
        </div>

        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          Vision AI
        </span>

        {/* Pulse badge */}
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </button>
    </div>
  );
});

AIChatButton.displayName = 'AIChatButton';
