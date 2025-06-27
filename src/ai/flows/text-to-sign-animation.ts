'use server';
/**
 * @fileOverview Text-to-Sign Animation Flow.
 *
 * Translates text input into animated sign language.
 * This file exports:
 * - `textToSignAnimation`: The main function to trigger the flow.
 * - `TextToSignAnimationInput`: The input type for the flow.
 * - `TextToSignAnimationOutput`: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TextToSignAnimationInputSchema = z.object({
  text: z.string().describe('The text to be translated into sign language animation.'),
});
export type TextToSignAnimationInput = z.infer<typeof TextToSignAnimationInputSchema>;

const TextToSignAnimationOutputSchema = z.object({
  animationDataUri: z
    .string()
    .describe(
      'A data URI containing the animated sign language representation of the input text.'
    ),
  audioDataUri: z.string().describe('A data URI containing the audio representation of the input text.'),
});
export type TextToSignAnimationOutput = z.infer<typeof TextToSignAnimationOutputSchema>;

export async function textToSignAnimation(
  input: TextToSignAnimationInput
): Promise<TextToSignAnimationOutput> {
  return textToSignAnimationFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: z.any(),
  },
  async (query) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateAnimationPrompt = ai.definePrompt({
  name: 'generateAnimationPrompt',
  input: {schema: TextToSignAnimationInputSchema},
  output: {schema: z.string().describe('A textual description of the animation')},
  prompt: `You are an expert animator of sign language.

  Given the text: "{{text}}", describe the animation to display the text in sign language. 
  Be as detailed as possible in terms of sequence of sign and transitions.
  The description should not contain any information about the viewpoint or camera movements.
  The description should only describe the sequence of signs. Do not include anything else.`, // Removed the system prompt as it's now part of the base prompt.
});

const generateImagePrompt = ai.definePrompt({
  name: 'generateImagePrompt',
  input: {schema: z.object({animationDescription: z.string()})},
  output: {schema: z.string().describe('A textual description of the image')},
  prompt: `You are an expert image generator.

  Given the animation description: "{{animationDescription}}", create a prompt suitable for image generation of a single frame representing the sign language.

  The prompt description should be about a frame of an animation in sign language with a neutral background.
  Do not include anything else.`, // Removed the system prompt as it's now part of the base prompt.
});

const textToSignAnimationFlow = ai.defineFlow(
  {
    name: 'textToSignAnimationFlow',
    inputSchema: TextToSignAnimationInputSchema,
    outputSchema: TextToSignAnimationOutputSchema,
  },
  async input => {
    const animationDescription = (await generateAnimationPrompt(input)).output!;
    const imageDescription = (await generateImagePrompt({animationDescription})).output!;

    const [{media}, {media: audio}] = await Promise.all([
      ai.generate({
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageDescription,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      }),
      textToSpeechFlow(input.text),
    ]);

    if (!media) {
      throw new Error('no image returned');
    }

    return {
      animationDataUri: media.url,
      audioDataUri: audio.media,
    };
  }
);

