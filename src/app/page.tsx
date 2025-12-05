import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const leagueBanner = PlaceHolderImages.find(p => p.id === 'league-banner');

export default function Home() {
  return (
    <main className="-mt-[4rem]">
      {/* Hero Section */}
      <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0">
          {leagueBanner && <Image
            src={leagueBanner.imageUrl}
            alt={leagueBanner.description}
            fill
            className="object-cover"
            data-ai-hint={leagueBanner.imageHint}
            priority
          />}
          <div className="absolute inset-0 bg-primary/70"></div>
        </div>
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline">
            Ping Pong Champions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
            The ultimate platform to create, manage, and compete in your own ping pong leagues. Free and easy to use.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/leagues">Explore Leagues</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
