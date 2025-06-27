'use server';

import { z } from 'zod';
import { textToSignAnimation } from '@/ai/flows/text-to-sign-animation';
import type { TextToSignAnimationOutput } from '@/ai/flows/text-to-sign-animation';
import { signToTextTranslation } from '@/ai/flows/sign-to-text-translation';
import type { SignToTextTranslationOutput } from '@/ai/flows/sign-to-text-translation';

const textSchema = z.string().min(1, { message: 'Text cannot be empty.' }).max(500, { message: 'Text must be 500 characters or less.'});

type TextToSignState = {
  data?: TextToSignAnimationOutput;
  error?: string;
  fieldErrors?: { text?: string[] };
};

export async function handleTextToSign(
  prevState: TextToSignState,
  formData: FormData
): Promise<TextToSignState> {
  const text = formData.get('text') as string;
  const validatedFields = textSchema.safeParse(text);

  if (!validatedFields.success) {
    return {
      error: 'Invalid input.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await textToSignAnimation({ text: validatedFields.data });
    return { data: result };
  } catch (error) {
    console.error('Text-to-sign animation failed:', error);
    return { error: 'Failed to generate sign language animation. Please try again later.' };
  }
}

type SignToTextState = {
  data?: SignToTextTranslationOutput;
  error?: string;
};

const videoDataUriSchema = z.string().startsWith('data:video/webm;base64,', {
  message: 'Invalid video format. Expected a WebM video data URI.',
});

export async function handleSignToText(videoDataUri: string): Promise<SignToTextState> {
  const validatedFields = videoDataUriSchema.safeParse(videoDataUri);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().formErrors.join(', ') };
  }
  
  try {
    const result = await signToTextTranslation({ videoDataUri: validatedFields.data });
    return { data: result };
  } catch (error) {
    console.error('Sign-to-text translation failed:', error);
    return { error: 'Failed to translate video. The AI model may be unavailable or the video may be unclear.' };
  }
}
