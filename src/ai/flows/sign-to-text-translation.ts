'use server';
/**
 * @fileOverview Converts sign language video input to text.
 *
 * - signToTextTranslation - A function that translates sign language video to text.
 * - SignToTextTranslationInput - The input type for the signToTextTranslation function.
 * - SignToTextTranslationOutput - The return type for the signToTextTranslation function.
 */

import {ai} from '@/ai/genkit';
import {
  SignToTextTranslationInputSchema,
  type SignToTextTranslationInput,
  SignToTextTranslationOutputSchema,
  type SignToTextTranslationOutput,
} from '@/ai/schemas';

export type {SignToTextTranslationInput, SignToTextTranslationOutput};

export async function signToTextTranslation(
  input: SignToTextTranslationInput
): Promise<SignToTextTranslationOutput> {
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
