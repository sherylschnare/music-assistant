
import {configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {genkitEval} from '@genkit-ai/evaluator';
import {dotprompt} from '@genkit-ai/dotprompt';
import {googleCloud} from '@genkit-ai/google-cloud';

configureGenkit({
  plugins: [
    googleAI(),
    firebase(),
    genkitEval(),
    dotprompt({
      promptDir: './prompts',
    }),
    googleCloud(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
