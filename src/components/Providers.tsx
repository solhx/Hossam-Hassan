// ✅ FIXED — src/components/Providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

/**
 * Central provider wrapper.
 * next-themes handles:
 *  - SSR-safe theme reading
 *  - localStorage persistence
 *  - System preference sync
 *  - .dark class toggling on <html>
 *
 * Remove the inline <script> from layout.tsx when using this —
 * next-themes has its own built-in flash prevention.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"         // Uses .dark class (matches your CSS)
      defaultTheme="system"     // Respects OS preference
      enableSystem              // Sync with prefers-color-scheme
      disableTransitionOnChange // Prevents theme flash transition
      storageKey="theme"        // Matches your existing localStorage key
    >
      {children}
    </ThemeProvider>
  );
}