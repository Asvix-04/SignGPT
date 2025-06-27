'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Mic, MicOff, Loader2, Info, Volume2, RefreshCw } from 'lucide-react';
import { handleSignToSign } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type RecordingState = 'idle' | 'requesting' | 'ready' | 'recording' | 'processing' | 'denied' | 'done';

type TranslationResult = {
  animationDataUri: string;
  audioDataUri: string;
};

export function SignToSign() {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const setupWebcam = useCallback(async () => {
    setRecordingState('requesting');
    setError(null);
    setResult(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Webcam access is not supported by your browser.');
      setRecordingState('denied');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      setRecordingState('ready');
      setError(null);
    } catch (err) {
      console.error('Webcam access denied:', err);
      setError('Webcam access was denied. Please enable it in your browser settings.');
      setRecordingState('denied');
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'ready') {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setRecordingState('recording');
      setResult(null);
      setError(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');

      mediaRecorderRef.current.onstop = async () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const response = await handleSignToSign(base64data);
          if (response.error) {
            setError(response.error);
            toast({
                variant: 'destructive',
                title: 'Translation Error',
                description: response.error,
              });
            setRecordingState('ready'); // Go back to ready state on error
          } else if(response.data) {
            setResult(response.data);
            setRecordingState('done');
          }
        };
      };
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setRecordingState('ready');
  }

  const playAudio = () => {
    audioRef.current?.play();
  };

  const renderButton = () => {
    switch (recordingState) {
      case 'idle':
        return <Button onClick={setupWebcam} className="w-full">Enable Webcam</Button>;
      case 'requesting':
        return <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Requesting...</Button>;
      case 'ready':
        return <Button onClick={startRecording} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"><Mic className="mr-2 h-4 w-4" />Start Recording</Button>;
      case 'recording':
        return <Button onClick={stopRecording} variant="destructive" className="w-full"><MicOff className="mr-2 h-4 w-4" />Stop Recording</Button>;
      case 'processing':
        return <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Translating...</Button>;
      case 'done':
        return <Button onClick={reset} className="w-full"><RefreshCw className="mr-2 h-4 w-4" />Translate Another</Button>;
      case 'denied':
        return <Button onClick={setupWebcam} variant="secondary" className="w-full">Retry Webcam</Button>;
    }
  };
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sign-to-Sign</CardTitle>
            <CardDescription>Translate from one sign language to an animation.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
            <div className="border rounded-lg overflow-hidden relative group bg-gray-200">
               <Image
                  src={result.animationDataUri}
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
              <audio ref={audioRef} src={result.audioDataUri} className="hidden" />
            </div>
        ) : (
          <div className="aspect-video bg-card-foreground/10 rounded-lg overflow-hidden flex items-center justify-center relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
            {recordingState === 'idle' && <p className="text-muted-foreground">Enable webcam to begin</p>}
            {recordingState === 'denied' && <p className="text-destructive max-w-xs text-center p-4">{error}</p>}
            {recordingState === 'recording' && (
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-destructive/80 text-destructive-foreground px-2 py-1 rounded-md text-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                REC
              </div>
            )}
          </div>
        )}
        {error && recordingState !== 'denied' && (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        {renderButton()}
      </CardFooter>
    </Card>
  );
}
