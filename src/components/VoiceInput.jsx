import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../services/speech';

/**
 * @type {React.FC<{ onTranscript: (text: string) => void; isDisabled?: boolean }>}
 */
export const VoiceInput = React.memo(({ onTranscript, isDisabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [interimText, setInterimText] = useState('');
  const recognizerRef = useRef(null);

  const isSupported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognizerRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech Recognition is not supported in this browser.');
      return;
    }

    setError(null);
    setInterimText('');

    const recognizer = createSpeechRecognizer({
      onResult: ({ final, interim, transcript }) => {
        setInterimText(interim || transcript);
        if (final && final.trim()) {
          onTranscript(final.trim());
          setInterimText('');
          stopListening();
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setError(`Mic error: ${err}`);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognizer) {
      try {
        recognizer.start();
        recognizerRef.current = recognizer;
        setIsListening(true);
      } catch (err) {
        setError('Could not access microphone.');
        setIsListening(false);
      }
    }
  }, [isSupported, onTranscript, stopListening]);

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input not supported in this browser"
        className="p-2.5 rounded-xl bg-slate-800/40 text-slate-500 cursor-not-allowed"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={isDisabled}
        title={isListening ? 'Stop Voice Listening' : 'Speak your question'}
        className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
          isListening
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse ring-2 ring-rose-400'
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-emerald-400 border border-slate-700/60'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isListening ? (
          <Volume2 className="w-5 h-5 animate-bounce" />
        ) : (
          <Mic className="w-5 h-5" />
        )}

        {/* Listening ripple waves */}
        {isListening && (
          <span className="absolute -inset-1 rounded-xl bg-rose-500/30 animate-ping -z-10" />
        )}
      </button>

      {/* Interim Listening Tooltip Overlay */}
      {isListening && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-rose-500/40 text-rose-300 text-xs px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap z-30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Listening... {interimText ? `"${interimText}"` : 'Speak now'}</span>
        </div>
      )}

      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-500/40 text-amber-300 text-[11px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-30 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

VoiceInput.displayName = 'VoiceInput';
