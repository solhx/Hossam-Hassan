// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 95],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@tabler/icons-react',
      'three',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key:   'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key:   'X-Frame-Options',
            value: 'DENY',
          },
          {
            key:   'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // ✅ Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-eval in dev; unsafe-inline for RSC
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
              // Inline styles used throughout (Framer Motion, GSAP)
              "style-src 'self' 'unsafe-inline'",
              // Fonts via next/font (self-hosted after build)
              "font-src 'self' data:",
              // Images: self + data URIs for SVG noise + remote patterns
              "img-src 'self' data: blob: https:",
              // API calls: own API + OpenRouter + Vercel analytics
              "connect-src 'self' https://openrouter.ai https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              // Workers for Lenis / GSAP
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // ✅ HSTS — only active over HTTPS (Netlify enforces this)
          {
            key:   'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // ✅ Aggressive caching for static assets
        source: '/(.*)\\.(webp|png|jpg|jpeg|svg|ico|pdf)',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;