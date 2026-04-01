// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/components/Providers';
import { siteConfig } from '@/lib/portfolio-data';
import { cn } from '@/utils/utils';
import './globals.css';

// ✅ next/font — zero layout shift, automatic subsetting, no render blocking
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
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
        {/* ✅ Multi-format favicon for cross-browser support          */}
        {/* favicon.ico  → Safari < 17, IE, older browsers            */}
        {/* fav.webp     → Chrome, Edge, Firefox, Safari 17+          */}
        <link rel="icon"             href="/favicon.ico" sizes="any" />
        <link rel="icon"             href="/fav.webp"   type="image/webp" />
        <link rel="apple-touch-icon" href="/fav.webp" />
        {/* No Google Fonts <link> tags — next/font handles everything */}
      </head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased',
          inter.className,
        )}
      >
        {/* ✅ Skip-to-content — visually hidden until focused (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className={cn(
            'fixed top-4 left-4 z-[9999] px-4 py-2 rounded-lg',
            'bg-emerald-500 text-white text-sm font-semibold',
            '-translate-y-[150%] focus:translate-y-0',
            'transition-transform duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
          )}
        >
          Skip to main content
        </a>

        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}