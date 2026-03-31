// ✅ FIXED — src/components/common/SmoothScroll.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // ✅ FIX 1: Store the ticker function reference so we can remove it
    // GSAP ticker passes time in seconds → multiply by 1000 for ms
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000); // ✅ Was 1500 — caused scroll to run 50% too fast
    };

    // ✅ FIX 2: Store the refresh handler reference for cleanup
    const onRefresh = () => lenis.resize();

    // Proxy ScrollTrigger through Lenis so GSAP pins work correctly
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });

    ScrollTrigger.addEventListener('refresh', onRefresh);
    ScrollTrigger.refresh();

    return () => {
      // ✅ FIX 3: All removals now use stored references — cleanup works correctly
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      ScrollTrigger.scrollerProxy(document.body, undefined as never);
      gsap.ticker.remove(tickerFn); // ✅ Correct reference — actually removes it
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}