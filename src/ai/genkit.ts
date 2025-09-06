import { genkit, GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkitEval } from '@genkit-ai/evaluator';
import { googleCloud } from '@genkit-ai/google-cloud';

const plugins: GenkitPlugin[] = [genkitEval()];

if (process.env.GCP_PROJECT_ID) {
  plugins.push(googleCloud);
}

if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins,
});
