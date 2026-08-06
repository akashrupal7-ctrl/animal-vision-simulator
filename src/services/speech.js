/**
 * Web Speech API Service
 * Handles Text-to-Speech (speechSynthesis) and Speech Recognition (SpeechRecognition)
 */

import { generateGeminiVoiceTTS } from './gemini';

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window);
}

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function getVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

let activeAudio = null;
let activeUtterance = null;

export async function speakText(text, options = {}) {
  // Stop any currently playing audio or utterance
  stopSpeaking();

  // Strip markdown formatting symbols for smoother speech reading
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[•\-\*]\s/g, '. ');

  if (options.onStart) options.onStart();

  // Attempt 1: Gemini AI TTS API endpoint
  try {
    const audioBase64 = await generateGeminiVoiceTTS({
      text: cleanText,
      voiceName: options.voiceName || 'Puck',
    });

    if (audioBase64) {
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onended = () => {
        activeAudio = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = (e) => {
        console.warn('Gemini Audio playback failed, falling back to Web Speech API', e);
        fallbackWebSpeech(cleanText, options);
      };

      await audio.play();
      return true;
    }
  } catch (err) {
    console.warn('Gemini TTS endpoint unavailable, using Web Speech fallback', err);
  }

  // Attempt 2: Fallback to native Web Speech API
  return fallbackWebSpeech(cleanText, options);
}

function fallbackWebSpeech(cleanText, options) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (options.onError) options.onError('Speech synthesis is not supported.');
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.lang = options.lang || 'en-US';

  if (options.voiceName) {
    const voices = getVoices();
    const selectedVoice = voices.find((v) => v.name === options.voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
  }

  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  }
  activeUtterance = null;
}

export function createSpeechRecognizer({ onResult, onError, onEnd, lang = 'en-US' }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech Recognition is not supported in this browser.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();

  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.lang = lang;

  recognizer.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        final: finalTranscript,
        interim: interimTranscript,
        transcript: finalTranscript || interimTranscript,
      });
    }
  };

  recognizer.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}
