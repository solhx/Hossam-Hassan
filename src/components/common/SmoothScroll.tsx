// src/components/common/SmoothScroll.tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis                 from 'lenis';
import { gsap }              from 'gsap';
import { ScrollTrigger }     from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * Module-level singleton.
 * Exported so other components can call getLenis() to access
 * the Lenis instance directly — used by useScrollCapture to
 * call lenis.stop() / lenis.start() when the projects section
 * takes over scroll control.
 *
 * Typed as Lenis | null with explicit null init.
 * Nulled in cleanup to prevent stale instance access after
 * Next.js Fast Refresh unmount/remount cycles.
 */
let _lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return _lenis;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      /*
       * Reduced motion: bypass Lenis entirely.
       * ScrollTrigger still needs a proxy to read scroll positions
       * correctly. pinType:'transform' uses translateY for pinning
       * instead of position:fixed — compositor-only, no repaint.
       *
       * Safe for this portfolio because no fixed-positioned elements
       * need to render above a pinned section.
       */
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
        pinType: 'transform',
      });
      ScrollTrigger.refresh();
      return;
    }

    const isMobile = window.innerWidth < 768;

    /*
     * ignoreMobileResize: prevents ScrollTrigger from recalculating
     * all scroll positions when the mobile browser chrome (address
     * bar) resizes the viewport on scroll.
     *
     * autoRefreshEvents: only refresh on meaningful page-state
     * changes, not on every visibilitychange (fires on mobile when
     * switching tabs during a scroll animation).
     */
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents:  'DOMContentLoaded,load',
    });

    /*
     * Lenis config:
     *
     * duration + lerp: both provided for version compatibility.
     * - Lenis 1.0.x uses 'duration' (ignores 'lerp')
     * - Lenis 1.1.x uses 'lerp'    (ignores 'duration')
     * package.json has "^1.0.42" which can resolve to 1.1.x.
     *
     * lerp: 0.1 on mobile (snappier for touch)
     *       0.08 on desktop (slightly smoother for parallax)
     *
     * touchMultiplier: controls how far a touch swipe scrolls.
     * Higher on desktop (mouse wheel = larger deltas) vs mobile.
     *
     * infinite: false — standard bounded scroll.
     */
    const lenis = new Lenis({
      duration:        isMobile ? 0.8 : 1.2,
      lerp:            isMobile ? 0.1 : 0.08,
      easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: isMobile ? 1.2 : 2,
      infinite:        false,
    } as ConstructorParameters<typeof Lenis>[0]);

    /*
     * FIX: Call stop() then start() immediately after construction.
     *
     * WHY: This registers Lenis's internal "stopped" state correctly
     * so that when useScrollCapture later calls lenis.stop(),
     * Lenis does NOT auto-restart on the next pointer/touch event.
     *
     * Without this initialisation cycle, Lenis v1.1.x has a bug
     * where the first stop() call after construction is ignored
     * because the internal _stopped flag is never set to true
     * during the construction phase — only after the first start().
     *
     * The stop/start here is instant (no visual effect) but
     * correctly initialises the internal state machine.
     */
    lenis.stop();
    lenis.start();

    lenisRef.current = lenis;
    _lenis           = lenis;

    /*
     * Lenis scroll event → broadcast + ScrollTrigger sync.
     *
     * lenis-scroll custom event: lets other components (FloatingAppBar,
     * parallax elements) react to scroll without attaching their
     * own window scroll listeners.
     *
     * ScrollTrigger.update(): drives ST from Lenis's RAF tick.
     * Without this, ST listens to native 'scroll' events which
     * Lenis suppresses — causing ST to read stale positions and
     * fire onUpdate with wrong progress values → panel jitter.
     *
     * Do NOT use ScrollTrigger.normalizeScroll(true) as an
     * alternative — it intercepts all pointer/touch events globally,
     * breaking hover states and button clicks inside pinned sections.
     */
    lenis.on('scroll', ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      window.dispatchEvent(
        new CustomEvent('lenis-scroll', {
          detail: { scroll, velocity },
        }),
      );
      ScrollTrigger.update();
    });

    /*
     * Connect Lenis RAF loop to GSAP ticker.
     *
     * gsap.ticker fires slightly before the browser's native RAF
     * (synchronous pre-paint tick). This means Lenis position
     * updates happen BEFORE ScrollTrigger reads them in the same
     * frame — correct ordering guaranteed, no 1-frame lag.
     *
     * time * 1000: GSAP ticker provides seconds, Lenis expects ms.
     */
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);

    /*
     * lagSmoothing: if a frame takes longer than 500ms
     * (tab switch, heavy JS), reset the ticker to avoid a massive
     * time-jump that would snap animations instead of easing them.
     *
     * 500ms threshold, 33ms (≈30fps) minimum lag frame.
     */
    gsap.ticker.lagSmoothing(500, 33);

    /*
     * ScrollerProxy: tells ScrollTrigger to read scroll position
     * from Lenis (lenis.scroll = current interpolated position)
     * instead of window.scrollY (native, unsmoothed position).
     *
     * scrollTop setter: called by ScrollTrigger when it needs to
     * programmatically set scroll position (e.g. during snap).
     * lenis.scrollTo(value, { immediate:true }) bypasses easing
     * and jumps directly — correct for GSAP-controlled snaps.
     *
     * pinType:'fixed': required with Lenis because Lenis sets
     * overflow:hidden on the body and moves content via transform.
     * ScrollTrigger's 'transform' pinning stacks on top of this
     * causing double-transform issues. 'fixed' pinning uses
     * position:fixed which is independent of Lenis transforms.
     */
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
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
      pinType: 'fixed',
    });

    /*
     * Sync Lenis dimensions when ScrollTrigger refreshes.
     * After ST recalculates all trigger positions, Lenis must
     * update its scroll limits (total scrollable height) to match
     * the new DOM dimensions. Without this, Lenis can clamp scroll
     * at the old maximum, preventing the last section from being reached.
     */
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', onRefresh);

    /*
     * Initial refresh after proxy is set.
     * Deferred one microtask to ensure the proxy is fully
     * registered before ScrollTrigger reads initial positions.
     */
    queueMicrotask(() => ScrollTrigger.refresh());

    return () => {
      /*
       * Cleanup order matters — each step depends on the previous:
       *
       * 1. Remove refresh listener FIRST
       *    Prevents resize() being called on a destroyed instance
       *    if ST triggers a refresh during cleanup.
       *
       * 2. Remove GSAP ticker
       *    Stops lenis.raf() calls — Lenis is now idle.
       *
       * 3. Kill all ScrollTriggers
       *    Prevents onUpdate callbacks firing on dead DOM refs
       *    after Lenis is destroyed.
       *
       * 4. Clear scroll memory
       *    Resets ST's cached scroll position to 0 so the next
       *    page load doesn't start at a stale position.
       *
       * 5. Ensure Lenis is started before destroy
       *    If useScrollCapture called lenis.stop() and the component
       *    unmounts while the section is active (e.g. Fast Refresh),
       *    lenis.destroy() on a stopped instance can throw in some
       *    versions. start() first makes destroy() safe.
       *
       * 6. Destroy Lenis
       *    Cleans up all internal event listeners, RAF loop,
       *    and DOM mutations (overflow:hidden removal).
       *
       * 7. Null refs
       *    Prevents stale closure access from any lingering
       *    async callbacks (setTimeout in useScrollCapture).
       *
       * 8. Refresh ST
       *    Resets to native scroll now that proxy is removed.
       */
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      gsap.ticker.remove(tickerFn);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();
      lenis.start(); // ensure started before destroy (see note 5)
      lenis.destroy();
      lenisRef.current = null;
      _lenis           = null;
      queueMicrotask(() => ScrollTrigger.refresh());
    };
  }, []);

  return <>{children}</>;
}