// next.config.ts
import type { NextConfig } from 'next';

// ✅ Detect environment once
const isDev = process.env.NODE_ENV === 'development';

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
    ],
  },

  /*
   * Webpack alias: maps 'framer-motion' → 'motion/react'
   *
   * WHY:
   * package.json uses "motion": "^12.34.0" — the new unified package
   * that replaced the separate "framer-motion" package at v12.
   * All existing UI components (3d-card, section-heading, FloatingAppBar,
   * VelocityScroll, etc.) import from 'framer-motion'.
   * Without this alias, those imports would fail at bundle time because
   * 'framer-motion' is not in node_modules.
   *
   * This alias is transparent — the resolved exports are identical.
   * Zero changes needed in any other file.
   *
   * The optimizePackageImports entry above keeps 'framer-motion' because
   * Next.js applies that optimisation BEFORE webpack alias resolution,
   * so it still correctly tree-shakes motion/react exports.
   */
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'framer-motion': 'motion/react',
    };
    return config;
  },

  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob: https:",
              isDev
                ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:* wss://localhost:* https://openrouter.ai https://va.vercel-scripts.com https://vitals.vercel-insights.com"
                : "connect-src 'self' https://openrouter.ai https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key:   'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/(.*)\\.(webp|png|jpg|jpeg|svg|ico|pdf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;