// ✅ FIXED — src/hooks/useReducedMotion.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Safely reads prefers-reduced-motion.
 * - Server: returns false (safe default)
 * - Client: reads actual value immediately via initializer function,
 *   preventing a flash of animated content for users who prefer no motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    // typeof window check makes this SSR-safe
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Sync in case it changed between SSR and hydration
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}