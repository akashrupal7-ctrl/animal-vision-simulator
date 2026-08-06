import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { Bot, User, Volume2, VolumeX, Copy, Check, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../services/speech';

/**
 * @type {React.FC<{ message: any; isLastMessage?: boolean }>}
 */
export const ChatMessage = React.memo(({ message, isLastMessage = false }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAssistant = message.role === 'assistant';
  const hasTTS = isSpeechSynthesisSupported();

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, [isSpeaking]);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(message.content, {
        rate: 1.05,
        pitch: 1.0,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 my-3.5 ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-950/40 shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-slate-950" />
        </div>
      )}

      {/* Message Content Bubble */}
      <div
        className={`relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xl transition-all ${
          isAssistant
            ? message.isError
              ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-tl-sm'
              : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-sm backdrop-blur-md shadow-emerald-950/20'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-medium rounded-tr-sm shadow-emerald-900/30'
        }`}
      >
        {/* Animal Context Badge if message contains context metadata */}
        {message.animalContextName && (
          <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-slate-950/30 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Context: {message.animalContextName}
          </div>
        )}

        {/* Message Body */}
        <div className={`text-sm leading-relaxed ${isAssistant ? 'prose prose-invert max-w-none text-slate-200' : 'text-slate-950 font-normal'}`}>
          {isAssistant ? (
            <div className="markdown-body space-y-2">
              <Markdown>{message.content}</Markdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Action Bar (Time, Copy, Text-to-Speech) */}
        <div
          className={`mt-2.5 pt-2 flex items-center justify-between gap-3 text-[11px] border-t ${
            isAssistant
              ? 'border-slate-800/80 text-slate-400'
              : 'border-slate-950/20 text-slate-900/70'
          }`}
        >
          <span className="font-mono text-[10px] opacity-80">{formattedTime}</span>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy message text"
              className={`p-1 rounded-md transition cursor-pointer ${
                isAssistant
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-900/20 text-slate-900/80'
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Speech synthesis / TTS Button */}
            {isAssistant && hasTTS && (
              <button
                type="button"
                onClick={handleToggleSpeak}
                title={isSpeaking ? 'Stop speech audio' : 'Read aloud with Text-to-Speech'}
                className={`p-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
                  isSpeaking
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 animate-pulse'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px]">Stop</span>
                  </>
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shadow-md shrink-0 mt-0.5">
          <User className="w-4 h-4 text-emerald-400" />
        </div>
      )}
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';
