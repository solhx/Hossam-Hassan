// ✅ FIXED — src/components/Providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}  // ← allow our CSS transitions (Fix 5)
      storageKey="portfolio-theme"       // ← consistent key across the app
    >
      {children}
    </ThemeProvider>
  );
}