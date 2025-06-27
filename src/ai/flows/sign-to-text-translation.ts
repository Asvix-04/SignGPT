'use server';
/**
 * @fileOverview Converts sign language video input to text.
 *
 * - signToTextTranslation - A function that translates sign language video to text.
 * - SignToTextTranslationInput - The input type for the signToTextTranslation function.
 * - SignToTextTranslationOutput - The return type for the signToTextTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SignToTextTranslationInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of sign language, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SignToTextTranslationInput = z.infer<typeof SignToTextTranslationInputSchema>;

const SignToTextTranslationOutputSchema = z.object({
  text: z.string().describe('The translated text from the sign language video.'),
});
export type SignToTextTranslationOutput = z.infer<typeof SignToTextTranslationOutputSchema>;

export async function signToTextTranslation(input: SignToTextTranslationInput): Promise<SignToTextTranslationOutput> {
  return signToTextTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'signToTextTranslationPrompt',
  input: {schema: SignToTextTranslationInputSchema},
  output: {schema: SignToTextTranslationOutputSchema},
  prompt: `You are a sign language expert.  You will watch the following video and translate the sign language into text.

Video: {{media url=videoDataUri}}`,
});

const signToTextTranslationFlow = ai.defineFlow(
  {
    name: 'signToTextTranslationFlow',
    inputSchema: SignToTextTranslationInputSchema,
    outputSchema: SignToTextTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
