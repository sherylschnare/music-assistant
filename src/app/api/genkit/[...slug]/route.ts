import { createApiHandler } from '@genkit-ai/next/server';
import '@/ai/flows/copyright-information-lookup';
import { myFlow } from '@/ai/flows/my-flow';

export const POST = createApiHandler();
