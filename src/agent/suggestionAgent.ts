/**
 * Suggestion Agent - generates codemap suggestions based on recent activity
 */

import { generateText } from 'ai';
import { getOpenAIClient, getModelName, isConfigured } from './baseClient';
import { loadPrompt } from '../prompts';
import type { CodemapSuggestion } from '../types';

export async function generateSuggestions(
  recentFiles: string[]
): Promise<CodemapSuggestion[]> {
  if (!isConfigured()) {
    return [];
  }

  const client = getOpenAIClient();
  if (!client) {
    return [];
  }

  // Load prompts from template files
  const systemPrompt = loadPrompt('suggestion', 'system');
  const userPrompt = loadPrompt('suggestion', 'user', {
    recent_files: recentFiles.map((f, i) => `${i + 1}. ${f}`).join('\n'),
  });

  try {
    const result = await generateText({
      model: client(getModelName()),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 500,
    });

    // Parse JSON from response
    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]) as Array<{ id?: string; text: string }>;
      return suggestions.map((s, i) => ({
        id: s.id || `suggestion-${i}`,
        text: s.text,
        timestamp: Date.now(),
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
    return [];
  }
}
