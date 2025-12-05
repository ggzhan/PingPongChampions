import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Swords, BarChart2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/header';
import Footer from '@/components/footer';

const feature1Image = PlaceHolderImages.find(p => p.id === 'feature1');
const feature2Image = PlaceHolderImages.find(p => p.id === 'feature2');
const feature3Image = PlaceHolderImages.find(p => p.id === 'feature3');
const leagueBanner = PlaceHolderImages.find(p => p.id === 'league-banner');

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
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
              The ultimate platform to create, manage, and compete in your own ping pong leagues.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/leagues">Explore Leagues</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose Us?</h2>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to take your local ping pong rivalries to the next level.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center transition-transform transform hover:-translate-y-2">
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <CardTitle className="mt-4 font-headline">League Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Easily create and manage leagues. Invite players, set rules, and keep everything organized in one place.
                  </p>
                  {feature1Image && <div className="mt-4 rounded-lg overflow-hidden aspect-video relative">
                    <Image src={feature1Image.imageUrl} alt={feature1Image.description} layout="fill" objectFit="cover" data-ai-hint={feature1Image.imageHint} />
                  </div>}
                </CardContent>
              </Card>
              <Card className="text-center transition-transform transform hover:-translate-y-2">
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center">
                    <Swords className="w-8 h-8" />
                  </div>
                  <CardTitle className="mt-4 font-headline">ELO Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fair and transparent ELO-based ranking system. Watch your rating change after every match.
                  </p>
                  {feature2Image && <div className="mt-4 rounded-lg overflow-hidden aspect-video relative">
                    <Image src={feature2Image.imageUrl} alt={feature2Image.description} layout="fill" objectFit="cover" data-ai-hint={feature2Image.imageHint} />
                  </div>}
                </CardContent>
              </Card>
              <Card className="text-center transition-transform transform hover:-translate-y-2">
                <CardHeader>
                  <div className="mx-auto bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center">
                    <BarChart2 className="w-8 h-8" />
                  </div>
                  <CardTitle className="mt-4 font-headline">Player Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track your progress with detailed stats, ELO history charts, and head-to-head records.
                  </p>
                  {feature3Image && <div className="mt-4 rounded-lg overflow-hidden aspect-video relative">
                    <Image src={feature3Image.imageUrl} alt={feature3Image.description} layout="fill" objectFit="cover" data-ai-hint={feature3Image.imageHint} />
                  </div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Settle the Score?</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Join or create your first league today and start your journey to become the office champion.
            </p>
            <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/register">Create Your Free Account</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
