// src/components/Providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // ✅ REMOVED disableTransitionOnChange
      // Reason: it injects `transition: none !important` on ALL elements,
      // forcing a full style recalculation across the entire DOM on every
      // theme toggle. On mobile with active animations this causes a 
      // visible freeze. The View Transition API in ToggleTheme.tsx already
      // handles the visual transition — we don't need next-themes to 
      // suppress anything.
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
}