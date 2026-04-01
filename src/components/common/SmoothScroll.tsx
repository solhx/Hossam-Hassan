// src/components/common/SmoothScroll.tsx
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

    const tickerFn  = (time: number) => lenis.raf(time * 1000);
    const onRefresh = () => lenis.resize();

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
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      gsap.ticker.remove(tickerFn);

      // ✅ Kill ALL ScrollTrigger instances before destroying proxy
      // Prevents "scrollerProxy called after destroy" warnings in GSAP 3.14
      ScrollTrigger.getAll().forEach((t) => t.kill());

      // ✅ Clear scroll memory correctly
      ScrollTrigger.clearScrollMemory();

      lenis.destroy();
      lenisRef.current = null;

      // ✅ Refresh after cleanup so any remaining triggers recalculate
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
  }, []);

  return <>{children}</>;
}