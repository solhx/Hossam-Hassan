// src/components/sections/home/projects/useScrollCapture.ts
'use client';
'use client';

import { useCallback, useRef } from 'react';
import { getLenis }            from '@/components/common/SmoothScroll';

export function useScrollCapture() {
  const isCapturedRef   = useRef(false);
  const originalLerpRef = useRef<number>(0.08);

  const captureScroll = useCallback(() => {
    if (isCapturedRef.current) return;

    const lenis = getLenis();
    if (!lenis) {
      isCapturedRef.current = true;
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalLerpRef.current = (lenis as any).options?.lerp ?? 0.08;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (lenis as any).options.lerp = 1;

    isCapturedRef.current = true;
  }, []);

  const releaseScroll = useCallback(() => {
    if (!isCapturedRef.current) return;

    isCapturedRef.current = false;

    const lenis = getLenis();
    if (!lenis) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (lenis as any).options.lerp = originalLerpRef.current;
  }, []);

  return { captureScroll, releaseScroll };
}