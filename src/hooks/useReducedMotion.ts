// src/hooks/useReducedMotion.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Safely reads prefers-reduced-motion with reactive updates.
 *
 * FIX: This hook was correct but NOT USED in Projects.tsx.
 * Projects.tsx called prefersReducedMotion() from utils instead:
 *
 *   const reduced = useMemo(() => prefersReducedMotion(), [])
 *
 * PROBLEM with that approach:
 *   prefersReducedMotion() is a one-time synchronous read.
 *   If the user changes their system accessibility setting
 *   WHILE on the page (e.g. via System Preferences shortcut),
 *   Projects.tsx will NOT react to the change — GSAP ScrollTrigger
 *   keeps running even though the user now prefers no motion.
 *
 * FIX: Projects.tsx should use THIS hook instead of useMemo+util.
 * This hook:
 *   1. Reads the initial value synchronously (SSR safe)
 *   2. Re-renders when the system setting changes
 *   3. Allows Projects.tsx to tear down ScrollTrigger if needed
 *
 * See Projects.tsx — reduced state now comes from this hook.
 *
 * Server: returns false (safe default — server has no media queries)
 * Client: reads actual value immediately via state initializer,
 *         preventing a flash of animated content for users who
 *         prefer no motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    /*
     * State initializer runs synchronously during React.useState().
     * For SSR: typeof window === 'undefined' → return false (safe default)
     * For CSR: reads actual matchMedia value before first render
     *
     * This prevents the flicker where reduced=false renders first,
     * animations start, THEN useEffect fires and sets reduced=true.
     * With the initializer, reduced is correct from frame 1.
     */
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    /*
     * Sync in case the value changed between SSR and hydration.
     * This handles the edge case where the server rendered with
     * reduced=false but the client actually has reduce=true.
     * Without this sync, there's a 1-frame window where animations
     * could fire for reduced-motion users.
     */
    setReduced(mq.matches);

    /*
     * Live updates: if user changes system setting while on page.
     * Fires Projects.tsx useEffect cleanup + re-run because
     * reduced (from this hook) is in Projects.tsx's useEffect deps.
     * ScrollTrigger will be killed and not re-initialized for
     * reduced motion users who toggle their setting mid-session.
     */
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}