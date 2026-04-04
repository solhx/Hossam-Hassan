// src/components/sections/home/projects/useScrollCapture.ts
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX K — Wheel event deltaMode normalization
// BEFORE: deltaY compared raw against 15px threshold.
//         DOM_DELTA_LINE (deltaMode=1) gives values like 3 (lines),
//         DOM_DELTA_PAGE (deltaMode=2) gives values like 1 (pages).
//         Both were BELOW the 15px threshold → trackpad line-scrolls
//         on Firefox were silently ignored.
// AFTER:  Normalize deltaY to pixels before threshold check.
//         LINE mode: multiply by 40 (typical line height).
//         PAGE mode: multiply by window.innerHeight.
//
// FIX L — Touch handler passive mismatch
// BEFORE: touchstart registered with { passive: false, capture: false }
//         but some browsers require passive:true on touchstart for
//         scroll performance. We called e.preventDefault() inside
//         which throws a console error on those browsers.
// AFTER:  touchstart is now passive:true (we only record start pos,
//         no preventDefault needed here). touchend remains
//         passive:false (we call preventDefault on swipe confirm).
//
// FIX M — IntersectionObserver re-entry during exit scroll
// BEFORE: When exitSection() called lenis.scrollTo(), the section
//         briefly re-entered the observer threshold during the
//         animated scroll, triggering activateSection() again.
//         This re-stopped Lenis mid-exit scroll.
// AFTER:  Added isExitingRef guard in the observer callback
//         (already partially present, now complete).
// ─────────────────────────────────────────────────────────────────
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getLenis }                        from '@/components/common/SmoothScroll';

interface ScrollCaptureOptions {
  enabled:         boolean;
  count:           number;
  onNavigate:      (index: number) => void;
  containerRef:    React.RefObject<HTMLElement | null>;
  onSectionEnter?: () => void;
  onSectionLeave?: () => void;
}

export function useScrollCapture({
  enabled,
  count,
  onNavigate,
  containerRef,
  onSectionEnter,
  onSectionLeave,
}: ScrollCaptureOptions) {
  const currentIndexRef  = useRef(0);
  const isAnimatingRef   = useRef(false);
  const cooldownUntilRef = useRef(0);
  const isSectionActive  = useRef(false);
  const touchStartY      = useRef(0);
  const touchStartX      = useRef(0);
  const isExitingRef     = useRef(false);

  // ── Smooth exit — drives Lenis to section boundary ────────────
  const exitSection = useCallback((direction: 1 | -1) => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    const container = containerRef.current;
    const lenis     = getLenis();

    if (!lenis || !container) {
      isExitingRef.current = false;
      return;
    }

    const sectionTop    = container.offsetTop;
    const sectionHeight = container.offsetHeight;

    // direction=1: exiting bottom → scroll past section end
    // direction=-1: exiting top → scroll to section start
    const targetY = direction === 1
      ? sectionTop + sectionHeight
      : sectionTop;

    // Start Lenis before scrollTo so it can animate
    if (lenis.isStopped) lenis.start();
    isSectionActive.current = false;
    onSectionLeave?.();

    lenis.scrollTo(targetY, {
      duration:  0.9,
      easing:    (t: number) => 1 - Math.pow(1 - t, 4), // ease-out-quart
      lock:      true,
      onComplete: () => {
        isExitingRef.current = false;
      },
    });
  }, [containerRef, onSectionLeave]);

  // ── Navigate by direction (+1 or -1) ──────────────────────────
  const navigate = useCallback((direction: 1 | -1) => {
    const now = performance.now();
    if (isAnimatingRef.current)       return;
    if (now < cooldownUntilRef.current) return;
    if (isExitingRef.current)         return;

    const next = currentIndexRef.current + direction;

    if (next < 0 || next >= count) {
      // Out of bounds → smooth exit to next/previous section
      exitSection(direction);
      return;
    }

    currentIndexRef.current  = next;
    isAnimatingRef.current   = true;
    cooldownUntilRef.current = now + 500;

    onNavigate(next);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 500);
  }, [count, onNavigate, exitSection]);

  // ── Navigate to specific index (dot nav) ──────────────────────
  const navigateTo = useCallback((index: number) => {
    const now = performance.now();
    if (
      index === currentIndexRef.current ||
      isAnimatingRef.current ||
      now < cooldownUntilRef.current
    ) return;

    currentIndexRef.current  = Math.max(0, Math.min(count - 1, index));
    isAnimatingRef.current   = true;
    cooldownUntilRef.current = now + 500;

    onNavigate(index);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 500);
  }, [count, onNavigate]);

  // ── Main effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const activateSection = () => {
      if (isSectionActive.current) return;
      if (isExitingRef.current)    return; // FIX M: block re-entry during exit
      isSectionActive.current = true;

      const lenis = getLenis();
      if (lenis && !lenis.isStopped) lenis.stop();
      onSectionEnter?.();
    };

    const deactivateSection = () => {
      if (!isSectionActive.current) return;
      isSectionActive.current = false;

      const lenis = getLenis();
      if (lenis && lenis.isStopped) lenis.start();
      onSectionLeave?.();
    };

    // ── IntersectionObserver ───────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // FIX M: Guard against re-activation during exit scroll
            if (!isExitingRef.current) {
              activateSection();
            }
          } else if (!entry.isIntersecting) {
            deactivateSection();
          }
        });
      },
      {
        rootMargin: '-10% 0px -20% 0px',
        threshold:  [0, 0.1, 0.6, 0.8, 1.0],
      },
    );

    observer.observe(container);

    // ── Wheel ──────────────────────────────────────────────────
    const handleWheel = (e: WheelEvent) => {
      if (!isSectionActive.current) return;
      e.stopPropagation();
      e.preventDefault();

      // FIX K: Normalize deltaY to pixels based on deltaMode.
      // deltaMode 0 = DOM_DELTA_PIXEL  → use as-is
      // deltaMode 1 = DOM_DELTA_LINE   → multiply by line height
      // deltaMode 2 = DOM_DELTA_PAGE   → multiply by viewport height
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;               // line → px
      if (e.deltaMode === 2) delta *= window.innerHeight; // page → px

      if (Math.abs(delta) < 15) return;
      navigate(delta > 0 ? 1 : -1);
    };

    // ── Touch ──────────────────────────────────────────────────
    // FIX L: touchstart is passive (only records position, no preventDefault)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      // No e.preventDefault() here — passive:true on this handler
    };

    // touchend is non-passive (calls preventDefault on confirmed swipe)
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSectionActive.current) return;

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      // Ignore horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;
      // Minimum swipe distance threshold
      if (Math.abs(deltaY) < 60) return;

      e.preventDefault(); // prevent scroll before navigation
      navigate(deltaY > 0 ? 1 : -1);
    };

    // ── Keyboard ───────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSectionActive.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        e.stopImmediatePropagation();
        navigate(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        e.stopImmediatePropagation();
        navigate(-1);
      }
    };

    // ── Lenis scroll fallback ──────────────────────────────────
    // Catches cases where IntersectionObserver misses the sticky
    // section (some browsers don't fire IO for sticky elements)
    const handleLenisScroll = () => {
      if (!container || isExitingRef.current) return;
      const rect       = container.getBoundingClientRect();
      const isCentered =
        rect.top    <= 10 &&
        rect.bottom >= window.innerHeight - 10;

      if (isCentered && !isSectionActive.current) {
        activateSection();
      }
    };

    // FIX L: touchstart is passive:true — browser won't warn about
    // blocking scroll. We only need the position, not to block default.
    window.addEventListener('wheel',        handleWheel,      { passive: false, capture: true });
    window.addEventListener('touchstart',   handleTouchStart, { passive: true }); // FIX L
    window.addEventListener('touchend',     handleTouchEnd,   { passive: false });
    window.addEventListener('keydown',      handleKeyDown);
    window.addEventListener('lenis-scroll', handleLenisScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('wheel',      handleWheel,      { capture: true } as EventListenerOptions);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend',   handleTouchEnd);
      window.removeEventListener('keydown',    handleKeyDown);
      window.removeEventListener('lenis-scroll', handleLenisScroll);

      // Ensure Lenis is unblocked on unmount
      const lenis = getLenis();
      if (lenis && lenis.isStopped) lenis.start();
    };
  }, [enabled, containerRef, navigate, onSectionEnter, onSectionLeave]);

  return {
    navigateTo,
    currentIndexRef,
    isAnimatingRef,
    isSectionActive,
  };
}