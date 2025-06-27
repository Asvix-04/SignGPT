import { Header } from '@/components/header';
import { TextToSign } from '@/components/text-to-sign';
import { SignToText } from '@/components/sign-to-text';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <TextToSign />
          <SignToText />
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Built with passion for accessibility. © 2024 SignSpeak.</p>
      </footer>
    </div>
  );
}
