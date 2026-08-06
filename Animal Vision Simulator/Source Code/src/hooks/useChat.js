import { useState, useEffect, useCallback } from 'react';
import { sendChatMessageWithAI } from '../services/gemini';

const STORAGE_KEY = 'animal_vision_chat_history';

const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `Hello! I am your **Animal Vision AI Specialist**. 🧬👁️\n\nAsk me anything about how animals perceive color, night tapetum reflections, infrared heat, UV flowers, compound ommatidia, or telephoto foveal zoom! Select an animal context above to tailor your questions directly to its visual system.`,
  timestamp: new Date().toISOString(),
};

export function useChat(options = {}) {
  const { customSystemPrompt, apiKeyOverride } = options;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history from localStorage', e);
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (userText, animalContext = null) => {
      if (!userText || !userText.trim() || isLoading) return;

      const trimmedText = userText.trim();
      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmedText,
        timestamp: new Date().toISOString(),
        animalContextName: animalContext?.name,
      };

      setError(null);
      setIsLoading(true);
      setIsTyping(true);

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      try {
        const aiResponseText = await sendChatMessageWithAI({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          animalContext,
          customSystemPrompt,
          apiKeyOverride,
        });

        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMessage = err.message || 'Sorry, I encountered an error fetching AI insights. Please try again.';
        setError(errorMessage);
        const errorAssistantMsg = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Error:** ${errorMessage}`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorAssistantMsg]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [messages, isLoading, customSystemPrompt, apiKeyOverride]
  );

  const clearHistory = useCallback(() => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const deleteMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const regenerateLastResponse = useCallback(
    async (animalContext = null) => {
      if (isLoading || messages.length < 2) return;

      // Find last user message
      const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
      if (lastUserIndex === -1) return;

      const trueIndex = messages.length - 1 - lastUserIndex;
      const historyUntilUser = messages.slice(0, trueIndex + 1);
      const lastUserMsg = messages[trueIndex];

      setMessages(historyUntilUser);
      setIsLoading(true);
      setIsTyping(true);
      setError(null);

      try {
        const aiResponseText = await sendChatMessageWithAI({
          messages: historyUntilUser.map((m) => ({ role: m.role, content: m.content })),
          animalContext,
          customSystemPrompt,
          apiKeyOverride,
        });

        const assistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: aiResponseText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setError(err.message || 'Failed to regenerate response');
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [messages, isLoading, customSystemPrompt, apiKeyOverride]
  );

  return {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    clearHistory,
    deleteMessage,
    regenerateLastResponse,
  };
}
