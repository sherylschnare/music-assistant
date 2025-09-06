
import {genkit, ai} from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

genkit({
  plugins: [
    googleAI(),
    firebase(),
  ],
  enableTracingAndMetrics: true,
});

export {ai};
