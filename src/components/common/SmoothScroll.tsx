'use client';

import { useEffect, useRef } from 'react';
import Lenis                 from 'lenis';
import { gsap }              from 'gsap';
import { ScrollTrigger }     from 'gsap/ScrollTrigger';
import { ScrollToPlugin }    from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

let _lenis: Lenis | null = null;
export function getLenis(): Lenis | null { return _lenis; }

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduced) {
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop() { return window.scrollY; },
        getBoundingClientRect() {
          return {
            top:    0,
            left:   0,
            width:  window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: 'fixed',
      });
      ScrollTrigger.refresh();
      return;
    }

    const isMobile = window.innerWidth < 768;

    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents:  'load',
    });

    const lenis = new Lenis({
      duration:        isMobile ? 0.8 : 1.2,
      lerp:            isMobile ? 0.1 : 0.08,
      easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: isMobile ? 1.2 : 2,
      infinite:        false,
    } as ConstructorParameters<typeof Lenis>[0]);

    lenis.stop();
    lenis.start();
    lenisRef.current = lenis;
    _lenis           = lenis;

    lenis.on('scroll', ({
      scroll,
      velocity,
    }: {
      scroll:   number;
      velocity: number;
    }) => {
      window.dispatchEvent(
        new CustomEvent('lenis-scroll', {
          detail: { scroll, velocity },
        }),
      );
      ScrollTrigger.update();
    });

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(500, 33);

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll ?? window.scrollY;
      },
      getBoundingClientRect() {
        return {
          top:    0,
          left:   0,
          width:  window.innerWidth,
          height: window.innerHeight,
        };
      },
      // 'fixed' is correct with Lenis + scrollerProxy.
      // Lenis does NOT transform <body> or any wrapper element —
      // it intercepts scroll events and updates its virtual scroll
      // position, then calls ScrollTrigger.update() to sync ST.
      // GSAP's position:fixed pinning is therefore relative to the
      // real viewport, which is exactly what we want.
      //
      // 'transform' was wrong — it causes GSAP to pin via translateY
      // on a spacer div, creating a new CSS containing block.
      // Any position:fixed element inside that containing block
      // (FloatingAppBar, ChatWidget) becomes fixed to the transformed
      // ancestor instead of the viewport — causing them to jump
      // during scroll-scrub transitions.
      pinType: 'fixed',
    });

    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();
      lenis.start();
      lenis.destroy();
      lenisRef.current = null;
      _lenis           = null;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
  }, []);

  return <>{children}</>;
}