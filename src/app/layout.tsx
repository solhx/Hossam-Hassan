// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { siteConfig } from '@/lib/portfolio-data';
import { cn } from '@/utils/utils';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
// ✅ next/font — zero layout shift, automatic subsetting, no render blocking
const inter = Inter({
  subsets:          ['latin'],
  weight:           ['400', '500', '600', '700', '800'],
  variable:         '--font-inter',
  display:          'swap',
  preload:          true,         
  adjustFontFallback: true,       
});

const jetbrainsMono = JetBrains_Mono({
  subsets:          ['latin'],
  weight:           ['400', '500', '600'],
  variable:         '--font-jetbrains',
  display:          'swap',
  adjustFontFallback: true,        // ✅ same fix for mono font
});

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
    { media: '(prefers-color-scheme: dark)',  color: '#0a0a0a' },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
       {/* ✅ Preconnect to external origins used by your app */}
  <link rel="preconnect"    href="https://fonts.googleapis.com" />
  <link rel="preconnect"    href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link rel="dns-prefetch"  href="https://openrouter.ai" />

  {/* ✅ Preload your LCP image if it's a static asset */}
  {/* Only add this if your Hero has a background image file */}
  {/* Skip if LCP element is text — text doesn't need preload */}

     <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Hossam Hassan',
      url: 'https://hossam-hassann.netlify.app',
      jobTitle: 'Full-Stack Developer',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cairo',
        addressCountry: 'EG',
      },
      sameAs: [
        'https://github.com/hossam-hassan',
        'https://linkedin.com/in/hossam-hassan',
      ],
    }),
  }}
/> 
  <link rel="icon"             href="/fav.webp" type="image/webp" sizes="32x32" />
  <link rel="apple-touch-icon" href="/fav.webp" />
  </head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased',
          inter.className,
        )}
      >
      

        <Providers>{children}</Providers>
    <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}