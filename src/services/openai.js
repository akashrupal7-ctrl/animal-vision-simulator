/**
 * AI Assistant API Service
 * Proxies requests to the server backend endpoint (/api/chat) which interacts with Gemini / AI models securely.
 */

export async function sendChatMessage({ messages, animalContext, customSystemPrompt, apiKeyOverride }) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        animalContext,
        customSystemPrompt,
        apiKeyOverride,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to receive response from AI Assistant`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('sendChatMessage error:', error);
    throw error;
  }
}
