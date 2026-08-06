import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bot } from 'lucide-react';

export const TypingIndicator = React.memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-start gap-3 my-3"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-950/40 shrink-0">
        <Bot className="w-4 h-4 text-slate-950" />
      </div>

      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl rounded-tl-sm p-3.5 backdrop-blur-md shadow-lg max-w-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-1 py-0.5">
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            className="w-2 h-2 rounded-full bg-emerald-400"
          />
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-teal-400"
          />
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-cyan-400"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
          Analyzing ocular optics...
        </span>
      </div>
    </motion.div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';
