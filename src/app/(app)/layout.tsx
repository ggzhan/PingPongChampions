import Header from '@/components/header';
import Footer from '@/components/footer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
