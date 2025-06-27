'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, MicOff, Loader2, Info, CheckCircle } from 'lucide-react';
import { handleSignToText } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type RecordingState = 'idle' | 'requesting' | 'ready' | 'recording' | 'processing' | 'denied';

export function SignToText() {
  const { toast } = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const setupWebcam = useCallback(async () => {
    setRecordingState('requesting');
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
      setTranslatedText(null);
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
          const result = await handleSignToText(base64data);
          if (result.error) {
            setError(result.error);
            toast({
                variant: 'destructive',
                title: 'Translation Error',
                description: result.error,
              });
          } else {
            setTranslatedText(result.data?.text ?? '');
          }
          setRecordingState('ready');
        };
      };
    }
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
        return <Button disabled className="w-full"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</Button>;
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
            <CardTitle className="text-2xl">Sign-to-Text</CardTitle>
            <CardDescription>Translate sign language from your webcam in real-time.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter>
        {renderButton()}
      </CardFooter>
      
      {(translatedText !== null || error) && (
        <CardContent>
          <div className="mt-4 border-t pt-4 space-y-4">
             {translatedText !== null && (
                 <Alert variant="default" className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-200 dark:border-green-700">
                    <CheckCircle className="h-4 w-4 !text-green-500" />
                    <AlertTitle className="font-bold">Translation Result</AlertTitle>
                    <AlertDescription className="text-lg">
                       "{translatedText}"
                    </AlertDescription>
                </Alert>
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
          </div>
        </CardContent>
      )}
    </Card>
  );
}
