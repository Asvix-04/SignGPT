/**
 * @fileOverview Shared Zod schemas for AI flows.
 */

import {z} from 'genkit';

export const SignToTextTranslationInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of sign language, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SignToTextTranslationInput = z.infer<
  typeof SignToTextTranslationInputSchema
>;

export const SignToTextTranslationOutputSchema = z.object({
  text: z
    .string()
    .describe('The translated text from the sign language video.'),
});
export type SignToTextTranslationOutput = z.infer<
  typeof SignToTextTranslationOutputSchema
>;

export const TextToSignAnimationInputSchema = z.object({
  text: z
    .string()
    .describe('The text to be translated into sign language animation.'),
});
export type TextToSignAnimationInput = z.infer<
  typeof TextToSignAnimationInputSchema
>;

export const TextToSignAnimationOutputSchema = z.object({
  animationDataUri: z
    .string()
    .describe(
      'A data URI containing the animated sign language representation of the input text.'
    ),
  audioDataUri: z
    .string()
    .describe('A data URI containing the audio representation of the input text.'),
});
export type TextToSignAnimationOutput = z.infer<
  typeof TextToSignAnimationOutputSchema
>;
