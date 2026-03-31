// ✅ UPDATED — src/app/layout.tsx
// Remove the inline <script> block entirely — next-themes handles this
import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/Providers';
import { siteConfig } from '@/lib/portfolio-data';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Full-Stack Developer',
    'MERN Stack',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'MongoDB',
    'Portfolio',
    'Hossam Hassan',
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
 
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning required by next-themes
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          ✅ Load fonts with font-display=swap for better LCP.
          Only load weights actually used: 400,500,600,700,800 for Inter.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/*
          ✅ Use PNG/ICO favicon for better browser compatibility.
          WebP favicons are not supported in all browsers (Safari <17).
        */}
        <link rel="icon" href="/fav.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/fav.webp" />
        {/*
          ✅ NO inline theme script needed — next-themes handles flash prevention.
          Removed to reduce HTML payload and eliminate duplication.
        */}
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}