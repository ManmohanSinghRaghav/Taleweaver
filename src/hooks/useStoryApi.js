import { useRef, useState, useCallback } from 'react';

export const useStoryApi = () => {
  const [lastApiResponse, setLastApiResponse] = useState(null);
  const inflightControllerRef = useRef(null);
  
  // Gemini API configuration
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyArqPAzy43U7dJWpGGHpfYeYLWclThB9p8';
  const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Build structured payloads to minimize tokens and bandwidth
  const buildInitPayload = useCallback((storyData, openingScene) => ({
    mode: 'init',
    genres: storyData.genres || [],
    characters: storyData.characters || [],
    themes: storyData.themes || [],
    setting: storyData.setting || '',
    openingScene,
  }), []);

  const buildContinuePayload = useCallback((storyData, storyHistory, latestChoice) => ({
    mode: 'continue',
    genres: storyData.genres || [],
    characters: storyData.characters || [],
    themes: storyData.themes || [],
    setting: storyData.setting || '',
    storyHistory: storyHistory.slice(-8), // keep last few entries only
    latestChoice,
  }), []);

  const buildImprovementPayload = useCallback((storyData, currentContent, improvementRequest) => ({
    mode: 'improve',
    genres: storyData.genres || [],
    characters: storyData.characters || [],
    themes: storyData.themes || [],
    setting: storyData.setting || '',
    currentContent,
    improvementRequest,
  }), []);

  // Convert our payload format to Gemini format
  const buildGeminiPrompt = useCallback((payload) => {
    if (payload.mode === 'init') {
      const genres = payload.genres.length > 0 ? payload.genres.join(', ') : 'adventure';
      const themes = payload.themes.length > 0 ? payload.themes.join(', ') : '';
      const setting = payload.setting || '';
      
      // Build character descriptions
      let characterDesc = 'The protagonist';
      if (payload.characters.length > 0) {
        characterDesc = payload.characters.map(char => 
          `${char.name}${char.role ? ` (${char.role})` : ''}`
        ).join(', ');
      }

      return `You are a professional novelist and master storyteller. Create a captivating story opening that immediately hooks readers and draws them into the narrative world.

STORY ELEMENTS:
- Genre: ${genres}
${themes ? `- Themes: ${themes}` : ''}
${setting ? `- Setting: ${setting}` : ''}
- Characters: ${characterDesc}
- Opening Scene: ${payload.openingScene}

WRITING REQUIREMENTS:
Write a compelling 3-4 paragraph story opening that demonstrates professional literary quality:

1. HOOK: Start with an immediate attention-grabbing moment, intriguing dialogue, or compelling action
2. ATMOSPHERE: Establish mood and setting through sensory details and vivid imagery
3. CHARACTER: Introduce the protagonist naturally within the action, showing personality through behavior
4. TENSION: Create immediate stakes, conflict, or mystery that compels readers to continue
5. VOICE: Use sophisticated prose with varied sentence structure and engaging narrative voice

PROFESSIONAL STANDARDS:
- Show, don't tell - reveal information through action and dialogue
- Use specific, concrete details rather than generic descriptions
- Create immediate emotional connection with readers
- Establish clear narrative momentum toward the next scene
- Write in third person past tense with literary quality prose
- NO metadata, character lists, or exposition dumps
- NO choices or interactive elements - pure narrative storytelling

Write a story opening that would captivate readers from the first sentence.`;
    } else if (payload.mode === 'continue') {
      const genres = payload.genres.length > 0 ? payload.genres.join(', ') : 'adventure';
      const themes = payload.themes.length > 0 ? payload.themes.join(', ') : '';
      const setting = payload.setting || '';
      
      // Build character descriptions  
      let characterDesc = 'The protagonist';
      if (payload.characters.length > 0) {
        characterDesc = payload.characters.map(char => 
          `${char.name}${char.role ? ` (${char.role})` : ''}`
        ).join(', ');
      }
      
      const recentStory = payload.storyHistory
        .filter(item => item.type === 'story')
        .slice(-2)
        .map(item => item.content)
        .join('\n\n');
      
      return `You are a professional novelist continuing a captivating ${genres} story. Maintain the established narrative quality while advancing the plot with literary excellence.

STORY CONTEXT:
${themes ? `- Themes: ${themes}` : ''}
${setting ? `- Setting: ${setting}` : ''}
- Characters: ${characterDesc}

PREVIOUS NARRATIVE:
${recentStory}

READER'S DIRECTION: ${payload.latestChoice}

CONTINUATION REQUIREMENTS:
Write the next story segment (3-4 paragraphs) with professional literary quality:

1. SEAMLESS FLOW: Continue naturally from the previous scene, responding to the reader's direction
2. PLOT ADVANCEMENT: Move the story forward with meaningful developments and revelations
3. CHARACTER DEPTH: Deepen character development through actions, dialogue, and internal conflict
4. SENSORY IMMERSION: Use vivid, specific details that engage all senses
5. TENSION & PACING: Maintain or escalate dramatic tension while varying sentence rhythm
6. LITERARY CRAFT: Demonstrate sophisticated prose with metaphor, symbolism, and subtext

PROFESSIONAL STANDARDS:
- Show character emotions through behavior, not exposition
- Use dialogue that reveals personality and advances plot
- Create vivid scenes that readers can visualize completely
- Build toward the next compelling story beat
- Maintain consistent voice and tone throughout
- NO choices, options, or meta-commentary
- Pure narrative storytelling that captivates readers

Continue the story with the quality expected in published fiction.`;
    } else if (payload.mode === 'improve') {
      const genres = payload.genres.length > 0 ? payload.genres.join(', ') : 'adventure';
      const themes = payload.themes.length > 0 ? payload.themes.join(', ') : '';
      const setting = payload.setting || '';
      
      // Build character descriptions  
      let characterDesc = 'The protagonist';
      if (payload.characters.length > 0) {
        characterDesc = payload.characters.map(char => 
          `${char.name}${char.role ? ` (${char.role})` : ''}`
        ).join(', ');
      }
      
      return `You are a professional editor and master storyteller. Transform the provided story content into publication-quality fiction that captivates readers.

CURRENT STORY:
${payload.currentContent}

IMPROVEMENT REQUEST: ${payload.improvementRequest}

STORY CONTEXT:
- Genre: ${genres}
${themes ? `- Themes: ${themes}` : ''}
${setting ? `- Setting: ${setting}` : ''}
- Characters: ${characterDesc}

PROFESSIONAL ENHANCEMENT REQUIREMENTS:
Rewrite the entire story with literary excellence, addressing the improvement request while applying these professional standards:

1. NARRATIVE CRAFT: Use sophisticated prose with varied sentence structure and rhythm
2. CHARACTER DEPTH: Develop three-dimensional characters through actions, dialogue, and subtext
3. SENSORY IMMERSION: Create vivid scenes with specific, concrete details that engage all senses
4. EMOTIONAL RESONANCE: Build genuine emotional connection between readers and characters
5. TENSION & PACING: Maintain compelling momentum with strategic use of conflict and revelation
6. DIALOGUE MASTERY: Write natural, character-specific dialogue that advances plot and reveals personality
7. ATMOSPHERIC WRITING: Establish mood and setting through evocative descriptions
8. SHOW DON'T TELL: Reveal information through action and implication rather than exposition

LITERARY STANDARDS:
- Use metaphor, symbolism, and subtext to add depth
- Create memorable, quotable prose that readers will remember
- Maintain consistent voice and tone throughout
- Build compelling hooks that keep readers engaged
- Demonstrate mastery of literary devices and techniques
- Write with the quality expected in bestselling fiction

Transform this story into compelling, professional-grade fiction that readers cannot put down.`;
    } else {
      throw new Error(`Unknown payload mode: ${payload.mode}`);
    }
  }, []);

  // API call directly to Gemini
  const callStoryAPI = useCallback(async (payload, retries = 3) => {
    if (inflightControllerRef.current) {
      inflightControllerRef.current.abort();
    }
    const controller = new AbortController();
    inflightControllerRef.current = controller;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const prompt = buildGeminiPrompt(payload);
        
        const geminiPayload = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        };

        const res = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(geminiPayload),
          signal: controller.signal,
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Gemini API error ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        
        // Extract the story content from Gemini response
        const storySegment = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!storySegment) {
          throw new Error('No story content received from Gemini API');
        }
        
        const result = {
          storySegment: storySegment.trim()
        };
        
        // Debug: log the API response
        console.log('Gemini API Response:', result);
        setLastApiResponse(result);
        
        return result;
      } catch (err) {
        if (controller.signal.aborted) throw new Error('Request was cancelled');
        console.error(`API attempt ${attempt} failed:`, err);
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }
  }, [buildGeminiPrompt, GEMINI_API_URL]);

  return {
    callStoryAPI,
    buildInitPayload,
    buildContinuePayload,
    buildImprovementPayload,
    lastApiResponse,
  };
};
