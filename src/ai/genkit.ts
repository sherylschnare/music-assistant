
import {genkit, ai} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

genkit({
  plugins: [
    googleAI(),
    firebase(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export {ai};
