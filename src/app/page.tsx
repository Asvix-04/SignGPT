import { Header } from '@/components/header';
import { SignToSign } from '@/components/sign-to-sign';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <SignToSign />
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Built with passion for accessibility. © 2024 SignSpeak.</p>
      </footer>
    </div>
  );
}
