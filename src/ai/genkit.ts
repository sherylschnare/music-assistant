
import {genkit, ai} from '@genkit-ai/core';
import {googleAI} from '@genkit-ai/googleai';
import {firebasePlugin} from '@genkit-ai/firebase';

genkit({
  plugins: [
    googleAI(),
    firebasePlugin(),
  ],
  enableTracingAndMetrics: true,
});

export {ai};
