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

    // ✅ Detect mobile once — used to tune Lenis behaviour
    const isMobile = window.innerWidth < 768;

    const lenis = new Lenis({
      // ✅ Shorter duration on mobile.
      // 1.2 feels smooth on desktop with a mouse wheel.
      // On mobile, touch already has native momentum — 1.2 feels
      // sluggish on top of it. 0.8 feels snappy and natural.
      duration:        isMobile ? 0.8 : 1.2,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // ✅ Lower touch multiplier on mobile.
      // Default 2 causes overshooting on short content sections.
      // 1.2 gives enough acceleration without overshooting.
      touchMultiplier: isMobile ? 1.2 : 2,
      infinite:        false,
    });

    lenisRef.current = lenis;

    const tickerFn  = (time: number) => lenis.raf(time * 1000);
    const onRefresh = () => lenis.resize();

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tickerFn);

    // ✅ RESTORED lag smoothing with safe values.
    //
    // Original code had lagSmoothing(0) which DISABLES protection.
    // On a slow mobile device that takes 50ms per frame, GSAP without
    // lag smoothing tries to "catch up" with rapid successive ticks,
    // causing a burst of scroll updates that jank the page.
    //
    // lagSmoothing(500, 33) means:
    //   500 = max elapsed ms GSAP will report for a single tick
    //    33 = threshold ms — only applies smoothing if frame > 33ms
    //
    // Result: slow frames are capped, fast frames are unaffected.
    gsap.ticker.lagSmoothing(500, 33);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top:    0,
          left:   0,
          width:  window.innerWidth,
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
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();

      lenis.destroy();
      lenisRef.current = null;

      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
  }, []);

  return <>{children}</>;
}