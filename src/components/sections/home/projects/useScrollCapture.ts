// src/components/sections/home/projects/useScrollCapture.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getLenis } from '@/components/common/SmoothScroll';

interface ScrollCaptureOptions {
  enabled: boolean;
  count: number;
  onNavigate: (index: number) => void;
  containerRef: React.RefObject<HTMLElement | null>;
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

  // ── Detect mobile once ─────────────────────────────────────────
  // FIX: On mobile we use a completely different, lighter strategy:
  //   • No lenis.stop() — lenis keeps running
  //   • Touch listeners on the CONTAINER only (not window)
  //   • No preventDefault on touchmove (keeps scroll passive)
  //   • Swipe detection only — no scroll capture/lock
  const isMobile = useRef(false);
  useEffect(() => {
    isMobile.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches;
  }, []);

  // ── Safe exit: always ensures lenis restarts ───────────────────
  const ensureLenisRunning = useCallback(() => {
    const lenis = getLenis();
    if (lenis?.isStopped) lenis.start();
  }, []);

  // ── Smooth exit helper ─────────────────────────────────────────
  const exitSection = useCallback(
    (direction: 1 | -1) => {
      if (isExitingRef.current) return;
      isExitingRef.current = true;

      const container = containerRef.current;
      const lenis     = getLenis();

      if (!lenis || !container) {
        isExitingRef.current    = false;
        isSectionActive.current = false;
        ensureLenisRunning();
        return;
      }

      const sectionTop    = container.offsetTop;
      const sectionHeight = container.offsetHeight;
      const targetY =
        direction === 1 ? sectionTop + sectionHeight : sectionTop;

      isSectionActive.current = false;
      onSectionLeave?.();

      // FIX: Always start lenis before scrollTo
      // Previously lenis.start() was only called if isStopped — but
      // on mobile isStopped is never true (we don't stop it),
      // so scrollTo is safe to call immediately
      if (lenis.isStopped) lenis.start();

      lenis.scrollTo(targetY, {
        duration: 0.9,
        easing:   (t: number) => 1 - Math.pow(1 - t, 4),
        lock:     true,
        onComplete: () => {
          isExitingRef.current = false;
        },
      });
    },
    [containerRef, onSectionLeave, ensureLenisRunning],
  );

  // ── Navigate ───────────────────────────────────────────────────
  const navigate = useCallback(
    (direction: 1 | -1) => {
      const now = performance.now();
      if (isAnimatingRef.current || now < cooldownUntilRef.current) return;
      if (isExitingRef.current) return;

      const next = currentIndexRef.current + direction;

      if (next < 0 || next >= count) {
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
    },
    [count, onNavigate, exitSection],
  );

  // ── navigateTo (dot nav) ───────────────────────────────────────
  const navigateTo = useCallback(
    (index: number) => {
      const now = performance.now();
      if (
        index === currentIndexRef.current ||
        isAnimatingRef.current ||
        now < cooldownUntilRef.current
      )
        return;

      currentIndexRef.current  = Math.max(0, Math.min(count - 1, index));
      isAnimatingRef.current   = true;
      cooldownUntilRef.current = now + 500;

      onNavigate(index);

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 500);
    },
    [count, onNavigate],
  );

  // ══════════════════════════════════════════════════════════════
  //  DESKTOP effect — wheel + keyboard + lenis lock
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    // FIX: Skip this entire effect on mobile
    // Desktop scroll capture must NOT run on touch devices —
    // it stops lenis and intercepts wheel events that don't exist
    if (!enabled || isMobile.current) return;

    const container = containerRef.current;
    if (!container) return;

    // ── Section activation ──────────────────────────────────────
    const activateSection = () => {
      if (isSectionActive.current) return;
      if (isExitingRef.current)    return;
      isSectionActive.current = true;

      const lenis = getLenis();
      // FIX: Only stop lenis on desktop — mobile never stops it
      if (lenis && !lenis.isStopped) lenis.stop();
      onSectionEnter?.();
    };

    const deactivateSection = () => {
      if (!isSectionActive.current) return;
      isSectionActive.current = false;
      ensureLenisRunning();
      onSectionLeave?.();
    };

    // ── IntersectionObserver — desktop thresholds ───────────────
    // FIX: Using 0.5 instead of 0.6 — on some viewport heights
    // 0.6 is never reached even when section is "fully" visible,
    // causing the capture to never activate.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!isExitingRef.current) activateSection();
          } else if (!entry.isIntersecting) {
            deactivateSection();
          }
        });
      },
      {
        // FIX: Removed negative rootMargin — it was shrinking the
        // "visible" area so aggressively the section never hit 0.6
        // threshold on short viewport heights (laptops 768px–900px)
        rootMargin: '0px',
        threshold:  [0, 0.25, 0.5, 0.75, 1.0],
      },
    );

    observer.observe(container);

    // ── Wheel — desktop only ────────────────────────────────────
    const handleWheel = (e: WheelEvent) => {
      if (!isSectionActive.current) return;
      e.stopPropagation();
      e.preventDefault();
      if (Math.abs(e.deltaY) < 15) return;
      navigate(e.deltaY > 0 ? 1 : -1);
    };

    // ── Keyboard — desktop only ─────────────────────────────────
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

    // ── Lenis scroll fallback — desktop only ────────────────────
    const handleLenisScroll = () => {
      if (!container || isExitingRef.current) return;
      const rect = container.getBoundingClientRect();
      const isCentered =
        rect.top <= 10 && rect.bottom >= window.innerHeight - 10;

      if (isCentered && !isSectionActive.current) {
        activateSection();
      }
    };

    window.addEventListener('wheel',        handleWheel,      { passive: false, capture: true });
    window.addEventListener('keydown',      handleKeyDown);
    window.addEventListener('lenis-scroll', handleLenisScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('wheel',        handleWheel, { capture: true } as EventListenerOptions);
      window.removeEventListener('keydown',      handleKeyDown);
      window.removeEventListener('lenis-scroll', handleLenisScroll);

      // FIX: ALWAYS restart lenis on cleanup — previously this
      // only ran if isStopped, but the check is unreliable during
      // React strict mode double-invoke and fast navigation
      ensureLenisRunning();
    };
  }, [enabled, containerRef, navigate, onSectionEnter, onSectionLeave, ensureLenisRunning]);

  // ══════════════════════════════════════════════════════════════
  //  MOBILE effect — swipe detection on container only
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    // FIX: Mobile gets its OWN lightweight effect:
    //   • Attaches to CONTAINER (not window)
    //   • NEVER calls preventDefault or stops lenis
    //   • Uses passive:true — browser handles scroll momentum
    //   • Only reads touch delta to navigate cards
    //   • IntersectionObserver still tracks visibility
    if (!enabled || !isMobile.current) return;

    const container = containerRef.current;
    if (!container) return;

    // ── Track visibility for dot-nav and enter/leave ────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            if (!isSectionActive.current && !isExitingRef.current) {
              isSectionActive.current = true;
              // FIX: On mobile we NEVER stop lenis
              onSectionEnter?.();
            }
          } else if (!entry.isIntersecting && isSectionActive.current) {
            isSectionActive.current = false;
            onSectionLeave?.();
          }
        });
      },
      {
        threshold: [0, 0.4, 0.8],
      },
    );

    observer.observe(container);

    // ── Touch handlers — attached to CONTAINER, fully passive ───
    const handleTouchStart = (e: TouchEvent) => {
      // FIX: Read touch start from the touch, no preventDefault ever
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSectionActive.current) return;

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const deltaX = touchStartX.current - e.changedTouches[0].clientX;

      // Ignore if swipe is more horizontal than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;

      // FIX: Raised minimum swipe to 80px on mobile
      // 60px was too sensitive — normal page scroll would trigger navigation
      if (Math.abs(deltaY) < 80) return;

      // FIX: Only navigate cards, never exit section on mobile
      // Let lenis/natural scroll handle exiting the section
      const next = currentIndexRef.current + (deltaY > 0 ? 1 : -1);

      if (next < 0 || next >= count) {
        // At boundary — do nothing, let natural scroll take over
        return;
      }

      const now = performance.now();
      if (isAnimatingRef.current || now < cooldownUntilRef.current) return;

      currentIndexRef.current  = next;
      isAnimatingRef.current   = true;
      cooldownUntilRef.current = now + 600; // slightly longer on mobile

      onNavigate(next);

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 600);
    };

    // FIX: passive:true — NEVER blocks native scroll on mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend',   handleTouchEnd,   { passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend',   handleTouchEnd);
      // FIX: No lenis.start() needed — we never stopped it
    };
  }, [enabled, containerRef, count, onNavigate, onSectionEnter, onSectionLeave]);

  return {
    navigateTo,
    currentIndexRef,
    isAnimatingRef,
    isSectionActive,
  };
}