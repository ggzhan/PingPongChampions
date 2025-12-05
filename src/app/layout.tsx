
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/context/user-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noHeaderFooter = ['/login', '/register'].includes(pathname);

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Ping Pong Champions</title>
        <meta name="description" content="Manage and compete in ping pong leagues." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col h-full bg-background">
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            {!noHeaderFooter && <Header />}
            <main className="flex-grow">
              {noHeaderFooter ? children : <div className="container mx-auto px-4 py-8">{children}</div>}
            </main>
            {!noHeaderFooter && <Footer />}
          </div>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
