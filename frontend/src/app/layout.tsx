import type { Metadata, Viewport } from 'next';
import { Source_Serif_4, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// Use Google Fonts for development (will self-host in production)
const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'ProDo Reporter',
    template: '%s | ProDo Reporter',
  },
  description: 'Professional journalist portfolio and publishing platform. The byline\'s permanent home.',
  keywords: ['journalism', 'investigations', 'Bangladesh', 'The Daily Star', 'portfolio'],
  authors: [{ name: 'ProDo Reporter' }],
  creator: 'ProDo Reporter',
  publisher: 'ProDo Reporter',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prodo-reporter.example.com',
    siteName: 'ProDo Reporter',
    title: 'ProDo Reporter',
    description: 'Professional journalist portfolio and publishing platform.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'ProDo Reporter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProDo Reporter',
    description: 'Professional journalist portfolio and publishing platform.',
    images: ['/og-default.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F2EA' },
    { media: '(prefers-color-scheme: dark)', color: '#16130F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif4.variable} ${publicSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="min-h-screen bg-paper text-ink font-serif antialiased">
        {children}
      </body>
    </html>
  );
}