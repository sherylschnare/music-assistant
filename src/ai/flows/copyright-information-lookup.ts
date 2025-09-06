
'use server';

/**
 * @fileOverview Looks up copyright information for a given song using a generative AI tool.
 *
 * - copyrightInformationLookup - A function that handles the copyright information lookup process.
 * - CopyrightInformationLookupInput - The input type for the copyrightInformationLookup function.
 * - CopyrightInformationLookupOutput - The return type for the copyrightInformationLookup function.
 */
import {z} from 'zod';
import {ai} from '../genkit';

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

export async function copyrightInformationLookup(
  input: CopyrightInformationLookupInput
): Promise<CopyrightInformationLookupOutput> {
  return copyrightInformationLookupFlow(input);
}

const copyrightInformationLookupPrompt = ai.definePrompt(
  {
    name: 'copyrightInformationLookupPrompt',
    input: {schema: CopyrightInformationLookupInputSchema},
    output: {schema: CopyrightInformationLookupOutputSchema},
    prompt: `You are an expert in music copyright law. Please provide a summary of the copyright information for the following song, including the copyright holder, any relevant licensing information, and any other important details related to the copyright of the song.

Song Title: {{title}}
Composer: {{composer}}
Lyricist: {{lyricist}}
Arranger: {{arranger}}`,
  },
);

export const copyrightInformationLookupFlow = ai.defineFlow(
  {
    name: 'copyrightInformationLookupFlow',
    inputSchema: CopyrightInformationLookupInputSchema,
    outputSchema: CopyrightInformationLookupOutputSchema,
  },
  async (input) => {
    const llmResponse = await copyrightInformationLookupPrompt(input);
    return llmResponse;
  }
);
