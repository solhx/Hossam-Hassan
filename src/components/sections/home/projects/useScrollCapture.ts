// src/components/sections/home/projects/useScrollCapture.ts
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
  // Track if we are in the middle of a lenis scroll-to exit
  const isExitingRef     = useRef(false);

  // ── Smooth exit helper ─────────────────────────────────────────
  // Instead of just starting Lenis and leaving the user stranded
  // in the middle of the section's scroll height, we programmatically
  // scroll Lenis to the correct boundary (top or bottom of section).
  const exitSection = useCallback((direction: 1 | -1) => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    const container = containerRef.current;
    const lenis     = getLenis();

    if (!lenis || !container) {
      isExitingRef.current = false;
      return;
    }

    // Calculate target scroll position
    const sectionTop    = container.offsetTop;
    const sectionHeight = container.offsetHeight;

    // direction  1 = exiting at bottom → scroll to END of section
    // direction -1 = exiting at top    → scroll to START of section
    const targetY = direction === 1
      ? sectionTop + sectionHeight  // past last vh = contact section
      : sectionTop;                 // back to top of projects

    // Start Lenis first so it can animate
    if (lenis.isStopped) lenis.start();
    isSectionActive.current = false;
    onSectionLeave?.();

    // Smooth scroll to boundary — Lenis handles the easing
    lenis.scrollTo(targetY, {
      duration:  0.9,
      easing:    (t: number) => 1 - Math.pow(1 - t, 4), // ease-out-quart
      lock:      true,  // prevent interference during scroll
      onComplete: () => {
        isExitingRef.current = false;
      },
    });
  }, [containerRef, onSectionLeave]);

  // ── Navigate ───────────────────────────────────────────────────
  const navigate = useCallback((direction: 1 | -1) => {
    const now = performance.now();

    // Block if already animating or in cooldown
    if (isAnimatingRef.current || now < cooldownUntilRef.current) return;

    // Block if we're mid-exit scroll
    if (isExitingRef.current) return;

    const next = currentIndexRef.current + direction;

    // ── Out of bounds → smooth exit ────────────────────────────
    // FIX: Instead of just starting Lenis and leaving scroll position
    // stranded, we drive Lenis to the section boundary smoothly.
    if (next < 0 || next >= count) {
      exitSection(direction);
      return;
    }

    // ── In bounds → navigate card ──────────────────────────────
    currentIndexRef.current  = next;
    isAnimatingRef.current   = true;
    // FIX: Reduced cooldown from 650ms → 500ms for snappier feel
    // 500ms matches the GSAP exit.duration (0.55s) so next scroll
    // is accepted right as the animation completes
    cooldownUntilRef.current = now + 500;

    onNavigate(next);

    // Reset animating flag after cooldown (RAF keeps it in sync)
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 500);

  }, [count, onNavigate, exitSection]);

  // ── navigateTo (dot nav) ───────────────────────────────────────
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

  // ── Main effect — event listeners ─────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // ── Section activation ─────────────────────────────────────
    const activateSection = () => {
      if (isSectionActive.current) return;
      if (isExitingRef.current)    return; // don't re-capture mid-exit
      isSectionActive.current = true;

      const lenis = getLenis();
      if (lenis && !lenis.isStopped) {
        lenis.stop();
      }
      onSectionEnter?.();
    };

    const deactivateSection = () => {
      if (!isSectionActive.current) return;
      isSectionActive.current = false;

      const lenis = getLenis();
      if (lenis && lenis.isStopped) {
        lenis.start();
      }
      onSectionLeave?.();
    };

    // ── IntersectionObserver ───────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // Don't re-activate while we're doing an exit scroll
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

      // FIX: Lowered threshold from 25 → 15 so light trackpad
      // scrolls register more responsively
      if (Math.abs(e.deltaY) < 15) return;
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    // ── Touch ──────────────────────────────────────────────────
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      if (isSectionActive.current) e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSectionActive.current) return;
      e.preventDefault();

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      if (Math.abs(deltaX) > Math.abs(deltaY)) return;
      if (Math.abs(deltaY) < 60) return;

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

    // ── Lenis scroll position fallback ─────────────────────────
    const handleLenisScroll = () => {
      if (!container || isExitingRef.current) return;
      const rect = container.getBoundingClientRect();
      const isCentered =
        rect.top    <= 10 &&
        rect.bottom >= window.innerHeight - 10;

      if (isCentered && !isSectionActive.current) {
        activateSection();
      }
    };

    window.addEventListener('wheel',        handleWheel,      { passive: false, capture: true });
    window.addEventListener('touchstart',   handleTouchStart, { passive: false, capture: false });
    window.addEventListener('touchend',     handleTouchEnd,   { passive: false, capture: false });
    window.addEventListener('keydown',      handleKeyDown);
    window.addEventListener('lenis-scroll', handleLenisScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('wheel',        handleWheel,      { capture: true } as EventListenerOptions);
      window.removeEventListener('touchstart',   handleTouchStart, { capture: false } as EventListenerOptions);
      window.removeEventListener('touchend',     handleTouchEnd,   { capture: false } as EventListenerOptions);
      window.removeEventListener('keydown',      handleKeyDown);
      window.removeEventListener('lenis-scroll', handleLenisScroll);

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