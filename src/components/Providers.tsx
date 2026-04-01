// src/components/Providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      /*
        WHY true NOW:
        
        Previously false + universal * transition = freeze.
        
        Now we set this to true so next-themes briefly adds
        [data-theme-transitioning] behavior via its own mechanism,
        BUT our ToggleTheme.tsx uses View Transition API which
        completely bypasses CSS transitions anyway.
        
        For the Firefox fallback path in ToggleTheme.tsx, we
        manually set data-theme-transitioning on <html> ourselves
        and control exactly which elements transition (Fix 1A).
        
        Result: next-themes class swap happens instantly (no flash),
        View Transition API handles the visual animation,
        fallback uses targeted element transitions only.
      */
      disableTransitionOnChange={true}
      storageKey="portfolio-theme"
    >
      {children}
    </ThemeProvider>
  );
}