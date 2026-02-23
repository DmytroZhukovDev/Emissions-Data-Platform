import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Emissions Data Platform',
  description: 'Methane emissions monitoring & analytics dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
              <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
                <a href="/" className="flex items-center gap-2">
                  <span className="text-lg">🌍</span>
                  <span className="font-bold text-foreground">
                    Emissions Platform
                  </span>
                </a>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                  <a
                    href="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    API Docs
                  </a>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
