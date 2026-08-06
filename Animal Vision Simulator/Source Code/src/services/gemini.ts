/**
 * Gemini AI Service Frontend Client
 * Handles server-side proxy calls to /api/* endpoints for Gemini capabilities:
 * 1. AI Chat (/api/chat)
 * 2. AI Camera Explanation (/api/explain-scene)
 * 3. AI Compare (/api/compare-animals)
 * 4. AI Quiz Generator (/api/generate-quiz)
 * 5. AI Learning & Suggestions (/api/suggest-animals)
 * 6. AI Natural Language Search (/api/search-animals)
 * 7. AI Text-to-Speech Voice (/api/tts)
 */

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessageWithAI(payload: {
  messages: ChatMessagePayload[];
  animalContext?: any;
  customSystemPrompt?: string;
  apiKeyOverride?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.text;
  } catch (error: any) {
    console.error('sendChatMessageWithAI error:', error);
    throw error;
  }
}

export async function explainCameraScene(payload: {
  animal: any;
  filterSettings?: any;
  customPrompt?: string;
  apiKeyOverride?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/explain-scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.explanation;
  } catch (error: any) {
    console.error('explainCameraScene error:', error);
    throw error;
  }
}

export async function compareAnimalsWithAI(payload: {
  animalA: any;
  animalB: any;
  apiKeyOverride?: string;
}) {
  try {
    const res = await fetch('/api/compare-animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.comparison;
  } catch (error: any) {
    console.error('compareAnimalsWithAI error:', error);
    throw error;
  }
}

export async function generateQuizWithAI(payload: {
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  apiKeyOverride?: string;
}) {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.questions;
  } catch (error: any) {
    console.error('generateQuizWithAI error:', error);
    throw error;
  }
}

export async function suggestRelatedAnimalsWithAI(payload: {
  animalName: string;
  category?: string;
  apiKeyOverride?: string;
}) {
  try {
    const res = await fetch('/api/suggest-animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.suggestions;
  } catch (error: any) {
    console.error('suggestRelatedAnimalsWithAI error:', error);
    throw error;
  }
}

export async function searchAnimalsWithAI(payload: {
  query: string;
  animalsDatabase: any[];
  apiKeyOverride?: string;
}) {
  try {
    const res = await fetch('/api/search-animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.results;
  } catch (error: any) {
    console.error('searchAnimalsWithAI error:', error);
    throw error;
  }
}

export async function generateGeminiVoiceTTS(payload: {
  text: string;
  voiceName?: string;
  apiKeyOverride?: string;
}) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.audioBase64;
  } catch (error: any) {
    console.error('generateGeminiVoiceTTS error:', error);
    throw error;
  }
}
