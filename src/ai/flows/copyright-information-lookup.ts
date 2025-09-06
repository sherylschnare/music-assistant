
'use server';

/**
 * @fileOverview Looks up copyright information for a given song using a generative AI tool.
 *
 * - copyrightInformationLookup - A function that handles the copyright information lookup process.
 * - CopyrightInformationLookupInput - The input type for the copyrightInformationLookup function.
 * - CopyrightInformationLookupOutput - The return type for the copyrightInformationLookup function.
 */
import {z} from 'zod';
import {defineFlow, generate} from 'genkit/flow';
import {googleAI} from '@genkit-ai/googleai';
import {prompt} from '@genkit-ai/dotprompt';

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

const copyrightLookupPrompt = await prompt('copyrightLookupPrompt');

export const copyrightInformationLookupFlow = defineFlow(
  {
    name: 'copyrightInformationLookupFlow',
    inputSchema: CopyrightInformationLookupInputSchema,
    outputSchema: CopyrightInformationLookupOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      prompt: copyrightLookupPrompt,
      model: googleAI.model('gemini-pro'),
      input: input,
      output: {
        schema: CopyrightInformationLookupOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);


export async function copyrightInformationLookup(
  input: CopyrightInformationLookupInput
): Promise<CopyrightInformationLookupOutput> {
  return copyrightInformationLookupFlow(input);
}
