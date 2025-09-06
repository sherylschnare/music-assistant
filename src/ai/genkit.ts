import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const plugins = [googleAI()];

// This logic was flawed. Genkit handles the missing API key at flow execution time.
// The crash was caused by an empty plugins array while flows were still being defined.
// if (process.env.GEMINI_API_KEY) {
//   plugins.push(googleAI());
// }

export const ai = genkit({
  plugins,
});
