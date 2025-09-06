import {createApiHandler} from '@genkit-ai/next/server';
import {ai} from '@/ai/genkit';
import '@/ai/flows/copyright-information-lookup';

export const {GET, POST} = createApiHandler({ai});
