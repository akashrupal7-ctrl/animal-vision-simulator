import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Send,
  Trash2,
  RefreshCw,
  Sparkles,
  Settings,
  X,
  Sliders,
  HelpCircle,
  Eye,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../components/ChatMessage';
import { TypingIndicator } from '../components/TypingIndicator';
import { VoiceInput } from '../components/VoiceInput';
import { ANIMALS_DATA } from '../data/animals';

const SUGGESTED_QUESTIONS = [
  'How does Peacock Mantis Shrimp see 16 colors & UV?',
  'Why can dogs only perceive blue and yellow wavelengths?',
  'How does the reflective Tapetum Lucidum enhance cat night vision?',
  'Explain how Eagle telephoto zoom works with dual foveae.',
  'What is compound ommatidia vision in insects like honeybees?',
  'How do Pit Vipers detect infrared thermal heat signatures?',
];

/**
 * @type {React.FC<{ selectedAnimal?: any; onSelectAnimalAndLaunch?: (animal: any) => void }>}
 */
export const AIAssistant = ({ selectedAnimal, onSelectAnimalAndLaunch }) => {
  const [activeAnimalContext, setActiveAnimalContext] = useState(
    selectedAnimal || ANIMALS_DATA[0]
  );
  const [inputText, setInputText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Local state for AI Settings
  const [customSystemPrompt, setCustomSystemPrompt] = useState(
    'You are the Animal Vision AI Specialist. Explain animal visual systems with scientific accuracy, bullet points, and enthusiasm.'
  );
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  const [autoReadResponses, setAutoReadResponses] = useState(false);

  const messagesEndRef = useRef(null);

  const {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    regenerateLastResponse,
  } = useChat({
    customSystemPrompt,
    apiKeyOverride,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText || !inputText.trim() || isLoading) return;

    sendMessage(inputText, activeAnimalContext);
    setInputText('');
  };

  const handleSelectSuggested = (questionText) => {
    sendMessage(questionText, activeAnimalContext);
  };

  const handleVoiceTranscript = (transcriptText) => {
    if (transcriptText) {
      setInputText(transcriptText);
      // Auto send transcript
      sendMessage(transcriptText, activeAnimalContext);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden relative">
      {/* Header Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Vision AI Assistant
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-emerald-400" />
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Comparative Photoreceptor & Optical Physics Expert
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="AI Settings"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear History Trigger */}
          <button
            type="button"
            onClick={clearHistory}
            title="Clear Chat History"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animal Context Selector Pill Strip */}
      <div className="bg-slate-950/40 border-b border-slate-800/60 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-emerald-400" /> Context:
        </span>

        {ANIMALS_DATA.map((animal) => {
          const isSelected = activeAnimalContext?.id === animal.id;
          return (
            <button
              key={animal.id}
              type="button"
              onClick={() => setActiveAnimalContext(animal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{animal.name}</span>
              {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
        {messages.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            message={msg}
            isLastMessage={index === messages.length - 1}
          />
        ))}

        {isTyping && <TypingIndicator />}

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => regenerateLastResponse(activeAnimalContext)}
              className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800/80 rounded-lg text-white font-bold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Section */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/60 shrink-0">
          <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            Suggested Questions:
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggested(q)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/50 hover:border-emerald-500/40 text-xs font-medium transition cursor-pointer text-left flex items-center gap-1"
              >
                <span>{q}</span>
                <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2.5 shrink-0"
      >
        <VoiceInput
          onTranscript={handleVoiceTranscript}
          isDisabled={isLoading}
        />

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask AI about ${activeAnimalContext?.name || 'animal'} vision...`}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            inputText.trim() && !isLoading
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 hover:scale-105'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* AI Settings Modal / Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">AI Assistant Settings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {/* Custom System Prompt */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    System Persona Instruction
                  </label>
                  <textarea
                    rows={3}
                    value={customSystemPrompt}
                    onChange={(e) => setCustomSystemPrompt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Defines the tone and background knowledge of the AI Assistant.
                  </p>
                </div>

                {/* API Key Override */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Custom Gemini API Key (Optional Override)
                  </label>
                  <input
                    type="password"
                    value={apiKeyOverride}
                    onChange={(e) => setApiKeyOverride(e.target.value)}
                    placeholder="Leave empty to use default server API key"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Server-side Gemini API key is configured automatically.
                  </p>
                </div>

                {/* Auto read responses */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      Auto-Read Responses (TTS)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Automatically speak assistant answers aloud using Web Speech API
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReadResponses}
                    onChange={(e) => setAutoReadResponses(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
