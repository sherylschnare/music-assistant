
import { copyrightInformationLookupFlow } from '@/ai/flows/copyright-information-lookup';
import { createApiHandler } from '@genkit-ai/next';

const handler = createApiHandler({
  flows: [copyrightInformationLookupFlow],
});

export const GET = handler;
export const POST = handler;

