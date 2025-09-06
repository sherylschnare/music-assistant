
'use server';

/**
 * @fileOverview Looks up copyright information for a given song using a generative AI tool.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';

// --------------------
// Schemas
// --------------------
const CopyrightInformationLookupInputSchema = z.object({
  title: z.string().describe('The title of the song.'),
  composer: z.string().describe('The composer of the song.'),
  lyricist: z.string().describe('The lyricist of the song.'),
  arranger: z.string().describe('The arranger of the song.'),
});
export type CopyrightInformationLookupInput = z.infer<
  typeof CopyrightInformationLookupInputSchema
>;

const CopyrightInformationLookupOutputSchema = z.object({
  summary: z.string().describe('A summary of the copyright information.'),
});
export type CopyrightInformationLookupOutput = z.infer<
  typeof CopyrightInformationLookupOutputSchema
>;

// --------------------
// Prompt definition
// --------------------
const copyrightLookupPrompt = ai.definePrompt({
    name: 'copyrightLookupPrompt',
    input: { schema: CopyrightInformationLookupInputSchema },
    output: { schema: CopyrightInformationLookupOutputSchema },
    prompt: `You are a copyright expert for musical compositions. Given the details of a song, provide a summary of its likely copyright status. Consider the composer's death date, the lyricist, and the arranger.

Song Details:
Title: {{{title}}}
Composer: {{{composer}}}
Lyricist: {{{lyricist}}}
Arranger: {{{arranger}}}

Analyze this information and provide a concise summary.
`,
});


// --------------------
// Flow definition
// --------------------
const copyrightInformationLookupFlow = ai.defineFlow(
  {
    name: 'copyrightInformationLookupFlow',
    inputSchema: CopyrightInformationLookupInputSchema,
    outputSchema: CopyrightInformationLookupOutputSchema,
  },
  async (input) => {
    const { output } = await copyrightLookupPrompt(input);
    return output!;
  }
);

// --------------------
// Function wrapper
// --------------------
export async function copyrightInformationLookup(
  input: CopyrightInformationLookupInput
): Promise<CopyrightInformationLookupOutput> {
  return await copyrightInformationLookupFlow(input);
}
