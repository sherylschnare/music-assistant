import { genkit, GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkitEval } from '@genkit-ai/evaluator';

const plugins: GenkitPlugin[] = [googleAI(), genkitEval()];

// This logic was flawed. Genkit handles the missing API key at flow execution time.
// The crash was caused by an empty plugins array while flows were still being defined.
// if (process.env.GEMINI_API_KEY) {
//   plugins.push(googleAI(), genkitEval());
// }

export const ai = genkit({
  plugins,
});
