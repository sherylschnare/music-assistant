import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkitEval } from '@genkit-ai/evaluator';
import { googleCloud } from '@genkit-ai/google-cloud';

export const ai = genkit({
  plugins: [
    googleAI(),
    genkitEval(),
    googleCloud(),
  ],
});
