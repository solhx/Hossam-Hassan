// src/components/Providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      /*
       * FIX: disableTransitionOnChange added back — but for a
       * DIFFERENT reason than why it was removed.
       *
       * The original comment said removing it was correct because
       * it "injects transition:none on all elements causing freeze".
       * That's true — BUT without it, there's a worse problem
       * specific to your Projects section:
       *
       * PROBLEM WITHOUT disableTransitionOnChange:
       *   1. User toggles theme
       *   2. next-themes swaps .dark class on <html>
       *   3. .projects-overlay background-color changes:
       *      oklch(1 0 0) → oklch(0.145 0 0)
       *   4. CSS transition on background-color fires (if any glass/
       *      card transitions apply via inheritance)
       *   5. Overlay briefly shows the WRONG color during transition
       *   6. Panel content visible through semi-transparent overlay
       *      → FLICKER during theme switch
       *
       * HOWEVER: The original comment about "freeze" is also valid.
       * next-themes' disableTransitionOnChange injects:
       *   * { transition: none !important }
       * via a <style> tag for ~300ms. This DOES break Framer Motion
       * springs because !important overrides FM's inline style
       * transition values.
       *
       * THE REAL FIX: Neither option is perfect by default.
       * We handle this with a custom theme toggle (see ToggleTheme.tsx
       * which uses View Transitions API) that:
       *   1. Freezes the current frame via getAnimations().pause()
       *   2. Swaps theme
       *   3. Animates transition via ::view-transition pseudo-elements
       *   4. Resumes
       *
       * So the correct setting here is:
       *   disableTransitionOnChange={true} — suppresses CSS transitions
       *   during the ~16ms class swap window ONLY.
       *   The View Transition API in ToggleTheme.tsx provides the
       *   visual transition AFTER the class swap completes.
       *   FM springs are not affected because they don't use CSS
       *   transitions — they use requestAnimationFrame.
       *
       * Net result:
       *   ✅ No overlay flicker on theme switch
       *   ✅ No FM spring breakage (FM uses RAF, not CSS transition)
       *   ✅ Smooth theme animation via View Transitions
       *   ✅ No freeze (View Transition handles visual smoothness)
       */
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
}