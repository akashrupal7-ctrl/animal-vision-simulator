import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper to initialize Gemini SDK
  const getGeminiClient = (apiKeyOverride?: string) => {
    const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Animal Vision Simulator' });
  });

  // 1. AI Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, animalContext, customSystemPrompt, apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      const defaultSystemInstruction = `You are the Animal Vision AI Specialist, an expert comparative biologist and optical physicist.
You explain how different animals perceive the world through their eyes, photoreceptor cones/rods, visual spectrums, fovea structures, polarized light sensitivity, motion detection, and depth perception.
Keep your explanations engaging, scientifically precise, easy to understand, and enthusiastic!
Use bullet points and bold formatting where appropriate.
${animalContext ? `Current Selected Animal Context: ${JSON.stringify(animalContext)}` : ''}`;

      const systemInstruction = customSystemPrompt
        ? `${customSystemPrompt}\n\n${animalContext ? `Current Selected Animal Context: ${JSON.stringify(animalContext)}` : ''}`
        : defaultSystemInstruction;

      // Filter and sanitize messages to prevent empty/undefined text parts
      const rawMessages = Array.isArray(messages) ? messages : [];
      const validMessages = rawMessages.filter(
        (m: any) => m && typeof m.content === 'string' && m.content.trim().length > 0
      );

      if (ai) {
        let formattedContents = validMessages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content.trim() }],
        }));

        // Ensure contents array is non-empty with valid part text
        if (formattedContents.length === 0) {
          formattedContents = [
            {
              role: 'user',
              parts: [{ text: 'Hello! Please explain how animal vision works.' }],
            },
          ];
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const replyText = response.text || 'I could not generate a response at this time.';
        return res.json({ response: replyText, text: replyText });
      }

      // Fallback if no API key is active
      const lastMsg = validMessages.length > 0 ? validMessages[validMessages.length - 1].content : '';
      const fallbackReply = generateFallbackAnimalVisionReply(lastMsg, animalContext);
      return res.json({ response: fallbackReply, text: fallbackReply });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      return res.status(500).json({
        error: error.message || 'An error occurred while processing your AI chat request.',
      });
    }
  });

  // 2. AI Camera Explanation Endpoint
  app.post('/api/explain-scene', async (req, res) => {
    try {
      const { animal, filterSettings, customPrompt, apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      const prompt = `Explain in real-time scientific detail how a ${animal?.name || 'selected animal'} (${animal?.scientificName || ''}) perceives the scene currently captured through the device camera simulator.
Animal Vision Stats: ${JSON.stringify(animal?.stats || {})}
Active Filter Controls: ${JSON.stringify(filterSettings || {})}
User Specific Question: "${customPrompt || 'Describe how this animal sees the current camera environment right now.'}"

Provide 3 bullet points detailing:
1. Photoreceptors & Color Spectrum (UV, IR, Dichromatic vs Tetrachromatic vs 12-Cone polarization)
2. Field of View, Fovea Zoom, and Motion Sensitivity
3. Night Vision (Tapetum Lucidum / Rod Density) & Special Optical Adaptations`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an optical physics and animal vision AI specialist giving live real-time camera scene analysis.',
            temperature: 0.6,
          },
        });

        return res.json({ explanation: response.text || 'Unable to generate camera scene analysis.' });
      }

      // Fallback
      return res.json({
        explanation: `**Live Scene Analysis for ${animal?.name || 'Selected Animal'}**\n\n• **Photoreceptors & Spectrum:** ${animal?.stats?.type || 'Specialized Eye Structure'} tuned to ${animal?.stats?.visibleSpectrum || 'their natural light spectrum'}.\n• **Field of View & Acuity:** ${animal?.stats?.fovDegrees || 200}° FOV with ${animal?.stats?.acuitySnellen || '20/50'} acuity.\n• **Night & Motion Sensitivity:** Tapetum rating ${animal?.stats?.nightVisionScore || 5}/10, Motion Sensitivity ${animal?.stats?.motionSensitivityScore || 5}/10.`,
      });
    } catch (error: any) {
      console.error('Error in /api/explain-scene:', error);
      return res.status(500).json({ error: error.message || 'Failed to analyze camera scene' });
    }
  });

  // 3. AI Compare Animals Endpoint
  app.post('/api/compare-animals', async (req, res) => {
    try {
      const { animalA, animalB, apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      const prompt = `Compare the visual systems and optical physics of Animal A (${animalA.name} - ${animalA.scientificName}) vs Animal B (${animalB.name} - ${animalB.scientificName}).
Animal A Profile: ${JSON.stringify(animalA)}
Animal B Profile: ${JSON.stringify(animalB)}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are a comparative biologist specializing in visual systems.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                animalAName: { type: Type.STRING },
                animalBName: { type: Type.STRING },
                table: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      feature: { type: Type.STRING },
                      animalASpec: { type: Type.STRING },
                      animalBSpec: { type: Type.STRING },
                      winnerOrAdvantage: { type: Type.STRING },
                    },
                  },
                },
                scientificOverview: { type: Type.STRING },
                keyEvolutionaryInsight: { type: Type.STRING },
              },
            },
          },
        });

        const json = JSON.parse(response.text || '{}');
        return res.json({ comparison: json });
      }

      // Fallback
      return res.json({
        comparison: {
          animalAName: animalA.name,
          animalBName: animalB.name,
          table: [
            {
              feature: 'Photoreceptor Type',
              animalASpec: animalA.stats?.type || 'Specialized Cones',
              animalBSpec: animalB.stats?.type || 'Specialized Cones',
              winnerOrAdvantage: 'Varies by ecological niche',
            },
            {
              feature: 'Field of View',
              animalASpec: `${animalA.stats?.fovDegrees || 200}°`,
              animalBSpec: `${animalB.stats?.fovDegrees || 200}°`,
              winnerOrAdvantage: (animalA.stats?.fovDegrees || 0) > (animalB.stats?.fovDegrees || 0) ? animalA.name : animalB.name,
            },
            {
              feature: 'Night Vision',
              animalASpec: `${animalA.stats?.nightVisionScore || 5}/10 Rating`,
              animalBSpec: `${animalB.stats?.nightVisionScore || 5}/10 Rating`,
              winnerOrAdvantage: (animalA.stats?.nightVisionScore || 0) > (animalB.stats?.nightVisionScore || 0) ? animalA.name : animalB.name,
            },
            {
              feature: 'Special Capabilities',
              animalASpec: animalA.stats?.hasUV ? 'UV Spectrum' : animalA.stats?.hasInfrared ? 'Infrared Sensing' : 'Standard Optical',
              animalBSpec: animalB.stats?.hasUV ? 'UV Spectrum' : animalB.stats?.hasInfrared ? 'Infrared Sensing' : 'Standard Optical',
              winnerOrAdvantage: 'Unique evolutionary adaptation',
            },
          ],
          scientificOverview: `${animalA.name} and ${animalB.name} have evolved radically different optical mechanics. ${animalA.name} relies on ${animalA.eyeStructure}, whereas ${animalB.name} utilizes ${animalB.eyeStructure}.`,
          keyEvolutionaryInsight: `Visual spectrums align directly with hunting, predator avoidance, and habitat light intensity.`,
        },
      });
    } catch (error: any) {
      console.error('Error in /api/compare-animals:', error);
      return res.status(500).json({ error: error.message || 'Failed to compare animals' });
    }
  });

  // 4. AI Quiz Generator Endpoint
  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const { difficulty = 'medium', topic = 'Animal Photoreceptors and Visual Physics', apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      const prompt = `Generate 5 challenging, scientifically accurate multiple-choice quiz questions about ${topic} at ${difficulty} difficulty level.
Topics to cover: UV light perception, tapetum lucidum, dichromacy vs tetrachromacy, compound ommatidia, pit organ thermal sensing, or fovea zoom.`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an educational science quiz author specializing in animal optics and comparative biology.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  category: { type: Type.STRING },
                  animalContext: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
        });

        const questions = JSON.parse(response.text || '[]');
        return res.json({ questions });
      }

      // Fallback static questions if no key
      return res.json({
        questions: [
          {
            id: `ai-q1-${Date.now()}`,
            question: 'Which animal possesses 12 color photoreceptor cones spanning UV to deep red, plus 4 polarized light filters?',
            options: ['Peacock Mantis Shrimp', 'Golden Eagle', 'Domestic Dog', 'Pit Viper'],
            correctIndex: 0,
            explanation: 'Peacock Mantis Shrimp have 16 distinct photoreceptor types, allowing them to detect circularly polarized light and subtle UV patterns.',
            category: 'Spectral Vision',
            animalContext: 'Mantis Shrimp',
          },
          {
            id: `ai-q2-${Date.now()}`,
            question: 'What is the reflective mirror-like membrane behind the retinas of nocturnal hunters like cats and owls called?',
            options: ['Tapetum Lucidum', 'Dual Fovea', 'Ommatidia Matrix', 'Parietal Eye'],
            correctIndex: 0,
            explanation: 'The tapetum lucidum reflects unabsorbed light back through rod photoreceptors a second time, boosting low-light sensitivity by 5x.',
            category: 'Night Vision',
            animalContext: 'Cat',
          },
          {
            id: `ai-q3-${Date.now()}`,
            question: 'Why can eagles spot tiny rodents from over 2 miles away in high definition?',
            options: ['Dual Foveas with 5x rod/cone density', 'Thermal heat pit sensors', 'Polarized light filters', 'Monocular compound lenses'],
            correctIndex: 0,
            explanation: 'Eagles possess dual foveas in each eye with over 1 million photoreceptors per square millimeter, creating telephoto optical magnification.',
            category: 'Acuity & Fovea',
            animalContext: 'Eagle',
          },
        ],
      });
    } catch (error: any) {
      console.error('Error in /api/generate-quiz:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate AI quiz' });
    }
  });

  // 5. AI Learning & Related Animal Suggestions Endpoint
  app.post('/api/suggest-animals', async (req, res) => {
    try {
      const { animalName, category, apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      const prompt = `Given the animal "${animalName}" (${category || 'Wild animal'}), recommend 3 related animals with fascinating visual traits that a biology student should study next.
Explain why each animal is recommended, detailing its photoreceptors, light spectrum, or optical adaptations compared to ${animalName}.`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are a comparative optics teacher providing study recommendations.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                currentAnimal: { type: Type.STRING },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      scientificName: { type: Type.STRING },
                      category: { type: Type.STRING },
                      keyVisualTrait: { type: Type.STRING },
                      whyStudy: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        });

        const data = JSON.parse(response.text || '{}');
        return res.json({ suggestions: data });
      }

      // Fallback
      return res.json({
        suggestions: {
          currentAnimal: animalName,
          recommendations: [
            {
              name: 'Peacock Mantis Shrimp',
              scientificName: 'Odontodactylus scyllarus',
              category: 'Marine',
              keyVisualTrait: '16 Photoreceptors & Circular Polarization',
              whyStudy: 'Exhibits the most complex visual system known to science.',
            },
            {
              name: 'Pit Viper',
              scientificName: 'Crotalinae',
              category: 'Reptile',
              keyVisualTrait: 'Infrared Pit Organ Heat Imaging',
              whyStudy: 'Overlays thermal infrared heat maps directly onto binocular visual field.',
            },
            {
              name: 'Honeybee',
              scientificName: 'Apis mellifera',
              category: 'Insect',
              keyVisualTrait: 'UV Floral Guidance & Compound Ommatidia',
              whyStudy: 'Uses UV light patterns on flowers as landing runways.',
            },
          ],
        },
      });
    } catch (error: any) {
      console.error('Error in /api/suggest-animals:', error);
      return res.status(500).json({ error: error.message || 'Failed to suggest related animals' });
    }
  });

  // 6. AI Natural Language Search Endpoint
  app.post('/api/search-animals', async (req, res) => {
    try {
      const { query, animalsDatabase, apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      if (!query || !query.trim()) {
        return res.json({ results: [] });
      }

      const prompt = `Natural Language Query: "${query}"
Search through the following list of animal profiles and return the top matching animals with match score (0-100) and a brief 1-sentence optical reasoning why it matches.
Animal Profiles Summary: ${JSON.stringify(
        (animalsDatabase || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          stats: a.stats,
          eyeStructure: a.eyeStructure,
          shortTagline: a.shortTagline,
        }))
      )}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an intelligent search engine matching user natural language prompts against animal visual system attributes.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  animalId: { type: Type.STRING },
                  animalName: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  matchReason: { type: Type.STRING },
                },
              },
            },
          },
        });

        const results = JSON.parse(response.text || '[]');
        return res.json({ results });
      }

      // Simple keyword fallback search
      const lowerQuery = query.toLowerCase();
      const filtered = (animalsDatabase || [])
        .filter((a: any) => {
          const combined = `${a.name} ${a.category} ${a.shortTagline} ${a.description} ${a.eyeStructure} ${JSON.stringify(a.stats)}`.toLowerCase();
          return combined.includes(lowerQuery);
        })
        .map((a: any) => ({
          animalId: a.id,
          animalName: a.name,
          matchScore: 85,
          matchReason: `Matches query keywords in visual stats and profile description.`,
        }));

      return res.json({ results: filtered });
    } catch (error: any) {
      console.error('Error in /api/search-animals:', error);
      return res.status(500).json({ error: error.message || 'Failed to execute AI search' });
    }
  });

  // 7. AI Voice Text-to-Speech Endpoint
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceName = 'Kore', apiKeyOverride } = req.body;
      const ai = getGeminiClient(apiKeyOverride);

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Text prompt is required for TTS' });
      }

      // Strip markdown symbols for voice generation
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#+\s/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[•\-\*]\s/g, '. ');

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: `Say clearly and naturally: ${cleanText}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({ audioBase64: base64Audio, format: 'pcm_24000' });
        }
      }

      return res.status(400).json({ error: 'TTS model output unavailable, fallback to Web Speech API.' });
    } catch (error: any) {
      console.error('Error in /api/tts:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate voice audio' });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Animal Vision Simulator server listening on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackAnimalVisionReply(prompt: string, animalContext: any): string {
  const lower = prompt.toLowerCase();
  const animalName = animalContext?.name || 'this animal';

  if (lower.includes('mantis shrimp') || lower.includes('shrimp')) {
    return `**Peacock Mantis Shrimp Vision**\n\n• **16 Photoreceptor Types:** Humans have 3 color cones (Red, Green, Blue). Mantis shrimp possess 12 color photoreceptors (spanning UV to deep red) plus 4 polarized light filters!\n• **Circular Polarization:** They are the only animals known to perceive circularly polarized light, using it for private courtship signals.\n• **Trinocular Vision:** Each eye is divided into 3 bands that can rotate independently, giving each eye individual depth perception!`;
  }

  if (lower.includes('dog') || lower.includes('canine')) {
    return `**Canine Vision Breakdown**\n\n• **Dichromatic Vision:** Dogs are dichromats with 2 cone types tuned to **Blue (429nm)** and **Yellow (555nm)**. They cannot see red or green, perceiving them as greyish-yellow.\n• **Night Vision Tapetum:** Dogs possess a reflective *tapetum lucidum* behind their retina that bounces light back through rods, giving them 5x superior dim-light motion detection compared to humans.`;
  }

  if (lower.includes('eagle') || lower.includes('hawk') || lower.includes('bird')) {
    return `**Avian & Eagle Vision**\n\n• **Tetrachromatic (4 Cones):** Eagles see ultraviolet light (UV) in addition to RGB, making prey urine trails visible from thousands of feet up.\n• **Dual Foveae:** Eagles have two distinct foveas in each eye—a forward-facing one for binocular depth and a lateral one for telephoto macro zoom (20/5 acuity)!`;
  }

  if (lower.includes('night') || lower.includes('dark') || lower.includes('tapetum')) {
    return `**Night Vision & The Tapetum Lucidum**\n\n• **Photoreceptor Density:** Nocturnal animals (cats, owls, snakes, frogs) have retinas heavily dominated by **rod photoreceptors**, which are 1,000x more sensitive to light than color cones.\n• **Reflective Mirror Layer:** The *tapetum lucidum* acts like a mirror behind the retina, reflecting unabsorbed light back through photoreceptors a second time!`;
  }

  return `**Animal Vision Insights regarding ${animalName}**\n\n• **Visual System:** ${animalContext?.stats?.type || 'Specialized Photoreceptor Array'}\n• **Field of View:** ${animalContext?.stats?.fovDegrees || 300}° angular range with ${animalContext?.stats?.acuitySnellen || '20/50'} acuity.\n• **Key Adaptations:** ${animalContext?.description || 'Different animals have evolved visual systems uniquely tuned to their ecological niches, prey hunting, and habitat light levels.'}\n\n*Pro tip: Connect your Gemini API Key in Settings > Secrets to unlock unlimited real-time deep reasoning AI answers!*`;
}

startServer();

