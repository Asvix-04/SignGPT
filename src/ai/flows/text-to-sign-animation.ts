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
import {
  TextToSignAnimationInputSchema,
  type TextToSignAnimationInput,
  TextToSignAnimationOutputSchema,
  type TextToSignAnimationOutput,
} from '@/ai/schemas';

export type {TextToSignAnimationInput, TextToSignAnimationOutput};

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

const textToSignAnimationFlow = ai.defineFlow(
  {
    name: 'textToSignAnimationFlow',
    inputSchema: TextToSignAnimationInputSchema,
    outputSchema: TextToSignAnimationOutputSchema,
  },
  async input => {
    const imageGenerationPrompt = `An animated frame of a person demonstrating the sign for "${input.text}" in American Sign Language. The person should be clear and expressive, against a neutral, simple background. Focus on the hand gestures and facial expression.`;
    
    const [{media}, {media: audio}] = await Promise.all([
      ai.generate({
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageGenerationPrompt,
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
