import { genkit, GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkitEval } from '@genkit-ai/evaluator';

const plugins: GenkitPlugin[] = [];

// Only configure plugins if an API key is provided.
// This prevents the app from crashing on startup if the key is missing.
if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI(), genkitEval());
}

export const ai = genkit({
  plugins,
});
