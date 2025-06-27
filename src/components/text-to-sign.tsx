'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { MessageSquare, Settings, Loader2, Info, Volume2 } from 'lucide-react';
import { handleTextToSign } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  data: undefined,
  error: undefined,
  fieldErrors: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Translating...
        </>
      ) : (
        'Translate to Sign'
      )}
    </Button>
  );
}

export function TextToSign() {
  const [state, formAction] = useFormState(handleTextToSign, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast({
        variant: 'destructive',
        title: 'Translation Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (state.data) {
      formRef.current?.reset();
    }
  }, [state.data]);
  
  const playAudio = () => {
    audioRef.current?.play();
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Text-to-Sign</CardTitle>
            <CardDescription>Convert written text into sign language animation.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text-input">Enter text</Label>
            <Textarea
              id="text-input"
              name="text"
              placeholder="e.g., Hello, how are you?"
              rows={4}
              className="resize-none"
              aria-describedby="text-error"
              required
            />
            {state.fieldErrors?.text && (
              <p id="text-error" className="text-sm text-destructive">{state.fieldErrors.text.join(', ')}</p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="w-5 h-5" />
              Customization
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dialect">Sign Language Dialect</Label>
                <Select defaultValue="asl" disabled>
                  <SelectTrigger id="dialect">
                    <SelectValue placeholder="Select dialect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asl">American Sign Language (ASL)</SelectItem>
                    <SelectItem value="bsl">British Sign Language (BSL)</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground mt-1">Dialect selection is coming soon.</p>
              </div>
              <div>
                <Label htmlFor="speed">Animation Speed</Label>
                <Slider id="speed" defaultValue={[50]} disabled/>
                <p className="text-xs text-muted-foreground mt-1">Speed control is coming soon.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
      {state.data && (
        <CardContent>
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Result</h3>
            <div className="border rounded-lg overflow-hidden relative group bg-gray-200">
               <Image
                  src={state.data.animationDataUri}
                  alt="Sign language animation"
                  width={512}
                  height={512}
                  className="w-full h-auto object-contain"
                  data-ai-hint="sign language"
                />
              <Button
                variant="ghost"
                size="icon"
                onClick={playAudio}
                className="absolute bottom-4 right-4 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full"
                aria-label="Play audio"
              >
                <Volume2 className="h-6 w-6 text-foreground" />
              </Button>
              <audio ref={audioRef} src={state.data.audioDataUri} className="hidden" />
            </div>
          </div>
        </CardContent>
      )}
      {state.error && !state.fieldErrors && (
        <CardContent>
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {state.error}
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}
