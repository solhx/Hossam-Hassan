// src/components/common/SmoothScroll.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Singleton Lenis instance ──────────────────────────────────
// Exposed so FloatingAppBar can read `.scroll` and `.velocity`
// without subscribing to window.scroll — which bypasses Lenis
// and races with GSAP's ScrollTrigger proxy.
let _lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return _lenis;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduced) {
      // Even without Lenis, GSAP needs a proxy for ScrollTrigger pin to work.
      // Use a no-op proxy that reads window.scrollY directly.
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop() {
          return window.scrollY;
        },
        getBoundingClientRect() {
          return {
            top: 0, left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        // ✅ 'fixed' is always correct when not using CSS transforms
        pinType: 'fixed',
      });
      ScrollTrigger.refresh();
      return;
    }

    const isMobile = window.innerWidth < 768;

    const lenis = new Lenis({
      duration:        isMobile ? 0.8 : 1.2,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: isMobile ? 1.2 : 2,
      infinite:        false,
    });

    lenisRef.current = lenis;
    _lenis = lenis; // ✅ Expose singleton

    const tickerFn = (time: number) => lenis.raf(time * 1000);

    // ✅ Feed Lenis scroll into ScrollTrigger AND dispatch a custom
    // event for FloatingAppBar to consume — keeping everything on
    // the same scroll "clock" (Lenis RAF) instead of window.scroll.
    lenis.on('scroll', ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      ScrollTrigger.update();
      // Custom event — lightweight, no object allocation on hot path
      window.dispatchEvent(
        new CustomEvent('lenis-scroll', {
          detail: { scroll, velocity },
        }),
      );
    });

    gsap.ticker.add(tickerFn);
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
          top: 0, left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // ✅ Never use document.body.style.transform check here.
      // Lenis does NOT use CSS transforms on body — it uses scroll position.
      // Returning 'transform' would tell GSAP to pin via CSS transform
      // instead of position:fixed, breaking mobile Safari's fixed stack.
      pinType: 'fixed',
    });

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();
      lenis.destroy();
      lenisRef.current = null;
      _lenis = null;

      // ✅ Use queueMicrotask instead of setTimeout(100).
      // Microtask fires after current render cycle but before next
      // paint — safe for refresh without the 100ms "dead zone" where
      // new ScrollTriggers could be created against a stale proxy.
      queueMicrotask(() => ScrollTrigger.refresh());
    };
  }, []);

  return <>{children}</>;
}