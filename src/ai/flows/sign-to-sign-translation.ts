'use server';
/**
 * @fileOverview Translates sign language video to an animated sign language video.
 *
 * - signToSignTranslation - A function that translates sign language video to an animation.
 * - SignToSignTranslationInput - The input type for the function.
 * - SignToSignTranslationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {signToTextTranslation} from './sign-to-text-translation';
import {textToSignAnimation} from './text-to-sign-animation';
import {
  SignToTextTranslationInputSchema,
  type SignToTextTranslationInput,
  TextToSignAnimationOutputSchema,
  type TextToSignAnimationOutput,
} from '@/ai/schemas';

export type SignToSignTranslationInput = SignToTextTranslationInput;
export type SignToSignTranslationOutput = TextToSignAnimationOutput;

export async function signToSignTranslation(
  input: SignToSignTranslationInput
): Promise<SignToSignTranslationOutput> {
  return signToSignTranslationFlow(input);
}

const signToSignTranslationFlow = ai.defineFlow(
  {
    name: 'signToSignTranslationFlow',
    inputSchema: SignToTextTranslationInputSchema,
    outputSchema: TextToSignAnimationOutputSchema,
  },
  async input => {
    // Step 1: Translate sign language video to text
    const textResult = await signToTextTranslation(input);

    if (!textResult.text) {
      throw new Error('Failed to translate sign to text.');
    }

    // Step 2: Translate text to sign language animation
    const animationResult = await textToSignAnimation({text: textResult.text});

    return animationResult;
  }
);
