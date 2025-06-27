'use server';

import { z } from 'zod';
import { signToSignTranslation } from '@/ai/flows/sign-to-sign-translation';
import type { SignToSignTranslationOutput } from '@/ai/flows/sign-to-sign-translation';

type SignToSignState = {
  data?: SignToSignTranslationOutput;
  error?: string;
};

const videoDataUriSchema = z.string().startsWith('data:video/webm;base64,', {
  message: 'Invalid video format. Expected a WebM video data URI.',
});

export async function handleSignToSign(videoDataUri: string): Promise<SignToSignState> {
  const validatedFields = videoDataUriSchema.safeParse(videoDataUri);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().formErrors.join(', ') };
  }
  
  try {
    const result = await signToSignTranslation({ videoDataUri: validatedFields.data });
    return { data: result };
  } catch (error) {
    console.error('Sign-to-sign translation failed:', error);
    return { error: 'Failed to translate video. The AI model may be unavailable or the video may be unclear.' };
  }
}
