// src/components/common/SmoothScroll.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis                  from 'lenis';
import { gsap }               from 'gsap';
import { ScrollTrigger }      from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reduced) return;

    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    /*
      ── Mobile / touch: skip Lenis, use native scroll ──────────────

      WHY WE SKIP LENIS ON TOUCH DEVICES:

      1. Native mobile scroll is already optimized at the OS level —
         it has momentum, rubber-banding, and 120Hz ProMotion support.
         Lenis intercepts and re-implements this in JS, which is always
         slower and less smooth than the native implementation.

      2. The ScrollTrigger.scrollerProxy we set up below tells GSAP to
         read scroll position from Lenis instead of the real window.
         On iOS Safari this creates a race condition: the browser
         compositor scrolls the page natively while JS tries to
         override it via Lenis — producing visible jitter in the
         Projects section GSAP pin.

      3. The Projects section already detects mobile and renders
         MobileStack (a normal stacked layout) instead of the GSAP-
         pinned desktop panel — so ScrollTrigger proxy is not needed
         on mobile at all.

      For touch: GSAP reads native window scroll directly.
      No proxy needed. ScrollTrigger pins work correctly.
    */
    if (isTouchDevice) {
      /*
        Touch devices still need ScrollTrigger to be refreshed
        so that any InView triggers (Skills, Experience, etc.)
        calculate their positions correctly after hydration.
      */
      ScrollTrigger.refresh();
      return;
    }

    /*
      ── Desktop: Lenis + GSAP proxy ────────────────────────────────

      On desktop with a mouse wheel, Lenis provides smooth inertia
      scrolling that makes the Projects section pin feel premium.
      The scrollerProxy bridges Lenis scroll position to GSAP so
      ScrollTrigger.scrub reads the Lenis value, not window.scrollY.
    */
    const lenis = new Lenis({
      duration:        1.2,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:     true,
      touchMultiplier: 2,
      infinite:        false,
    });

    lenisRef.current = lenis;

    const tickerFn  = (time: number) => lenis.raf(time * 1000);
    const onRefresh = () => lenis.resize();

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tickerFn);

    /*
      lagSmoothing(0) disables GSAP's built-in lag compensation.
      With Lenis driving the timing, GSAP's lag smoother conflicts —
      it detects the intentional frame delay Lenis introduces and
      tries to "fix" it, causing ScrollTrigger scrub to stutter.
    */
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
          top:    0,
          left:   0,
          width:  window.innerWidth,
          height: window.innerHeight,
        };
      },
      /*
        pinType must match how the browser is actually compositing
        the page. If the body has a CSS transform applied (e.g. from
        a Framer Motion layout animation), pins must use 'transform'
        mode. Otherwise 'fixed' is more performant.
      */
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });

    ScrollTrigger.addEventListener('refresh', onRefresh);
    ScrollTrigger.refresh();

    /* ── Cleanup ─────────────────────────────────────────────────── */

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      gsap.ticker.remove(tickerFn);

      /*
        Kill ALL ScrollTrigger instances BEFORE destroying the proxy.

        WHY ORDER MATTERS:
        If we destroy the Lenis proxy first, any living ScrollTrigger
        that tries to read scroll position will call into a destroyed
        object and throw "Cannot read properties of null" in GSAP 3.14.

        Killing all triggers first ensures no trigger fires during
        or after proxy teardown.
      */
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();

      lenis.destroy();
      lenisRef.current = null;

      /*
        Defer the final refresh so any components that registered
        new ScrollTriggers during the cleanup phase (e.g. ErrorBoundary
        remounting a section) have time to mount before we recalculate
        all trigger positions.
      */
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
  }, []);

  return <>{children}</>;
}