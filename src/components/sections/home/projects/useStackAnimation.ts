// src/components/sections/home/projects/useStackAnimation.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap }                           from 'gsap';
import { ScrollTrigger }                  from 'gsap/ScrollTrigger';
import type { CardHandle }                from './types';
import {
  STACK_CONFIG,
  GSAP_EASE,
  PROJECT_ACCENTS,
} from './constants';

gsap.registerPlugin(ScrollTrigger);

interface UseStackAnimationOptions {
  count:          number;
  cardHandles:    React.MutableRefObject<(CardHandle | null)[]>;
  sectionRef:     React.RefObject<HTMLElement | null>;
  reduced:        boolean;
  onActiveChange: (index: number) => void;
}

export function useStackAnimation({
  count,
  cardHandles,
  sectionRef,
  reduced,
  onActiveChange,
}: UseStackAnimationOptions) {
  const progressRef     = useRef(0);
  const activeRef       = useRef(0);
  const tl              = useRef<gsap.core.Timeline | null>(null);
  const onActiveChange_ = useRef(onActiveChange);
  const rafId           = useRef<number>(0);

  useEffect(() => { onActiveChange_.current = onActiveChange; });

  // ── Bloom burst ────────────────────────────────────────────────
  const triggerBloom = useCallback((index: number) => {
    const handle = (cardHandles.current[index] as CardHandle & {
      bloomEl?: HTMLDivElement | null
    });
    if (!handle?.bloomEl || reduced) {
      gsap.killTweensOf(handle?.bloomEl);
      return;
    }

    const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];

    gsap.set(handle.bloomEl, { scale: 0.5, filter: 'brightness(2)' });

    gsap.to(handle.bloomEl, {
      scale:     2.2,
      filter:    'brightness(0)',
      duration:  0.85,
      ease:      GSAP_EASE.bloom,
      overwrite: 'auto',
      onComplete: () => {
        gsap.set(handle.bloomEl!, { clearProps: 'scale,filter' });
      },
    });

    handle.bloomEl.style.background =
      `radial-gradient(circle at 50% 50%, rgba(${accent.bloomRgb}, 0.22) 0%, rgba(${accent.bloomRgb}, 0.08) 45%, transparent 70%)`;
  }, [cardHandles, reduced]);

  // ── Depth stack — translateZ instead of zIndex ─────────────────
  const setDepthStack = useCallback((
    activeIndex: number,
    animated:    boolean,
  ) => {
    const { depth } = STACK_CONFIG;

    cardHandles.current.forEach((handle, i) => {
      if (!handle?.shellEl) return;

      const dist     = i - activeIndex;
      const isActive = dist === 0;
      if (isActive) return;

      const isBehind   = dist > 0;
      const depthLevel = Math.min(Math.abs(dist), depth.maxDepth);
      const scale      = 1 - depthLevel * depth.scaleStep;
      const translateY = isBehind
        ? depthLevel * depth.translateYStep
        : -(depthLevel * depth.translateYStep);
      const brightness = Math.max(0.3, 1 - depthLevel * depth.brightnessStep);
      const translateZ = -depthLevel * 20;

      const props = {
        scale,
        y:       translateY,
        z:       translateZ,
        filter:  `brightness(${brightness})`,
        force3D: true,
      };

      if (animated && !reduced) {
        gsap.to(handle.shellEl, {
          ...props,
          duration: 0.65,
          ease:     GSAP_EASE.depthSpring,
        });
      } else {
        gsap.set(handle.shellEl, props);
      }
    });
  }, [cardHandles, reduced]);

  // ── Transition ─────────────────────────────────────────────────
  const animateTransition = useCallback((
    prevIndex: number,
    nextIndex: number,
  ) => {
    if (reduced) {
      setDepthStack(nextIndex, false);
      onActiveChange_.current(nextIndex);
      return;
    }

    const prevHandle = cardHandles.current[prevIndex] as CardHandle & {
      revealEl?: HTMLDivElement | null;
      bloomEl?:  HTMLDivElement | null;
    };
    const nextHandle = cardHandles.current[nextIndex] as CardHandle & {
      revealEl?: HTMLDivElement | null;
      bloomEl?:  HTMLDivElement | null;
    };

    const { entry, exit } = STACK_CONFIG;

    tl.current?.kill();
    tl.current = gsap.timeline({
      onComplete: () => {
        if (nextHandle?.shellEl) {
          gsap.set(nextHandle.shellEl, {
            scale:  1,
            y:      0,
            z:      0,
            filter: 'brightness(1)',
          });
        }
      },
    });

    // EXIT: outgoing card
    if (prevHandle?.shellEl) {
      tl.current.to(prevHandle.shellEl, {
        scale:    exit.toScale,
        y:        exit.toTranslateY,
        z:        -5,
        filter:   'brightness(0.6)',
        duration: exit.duration,
        ease:     GSAP_EASE.exitCubic,
        force3D:  true,
      }, 0);
    }

    // ENTRY: incoming card
    if (nextHandle?.shellEl && nextHandle?.revealEl) {
      gsap.set(nextHandle.shellEl, {
        scale:   entry.fromScale,
        y:       entry.fromTranslateY,
        z:       5,
        filter:  'brightness(1)',
        force3D: true,
      });

      gsap.set(nextHandle.revealEl, {
        clipPath: entry.fromClipPath,
        force3D:  true,
      });

      tl.current.to(nextHandle.shellEl, {
        scale:    1,
        y:        0,
        z:        0,
        duration: entry.duration,
        ease:     GSAP_EASE.entryExpo,
        force3D:  true,
      }, 0.05);

      tl.current.to(nextHandle.revealEl, {
        clipPath: entry.toClipPath,
        duration: entry.duration,
        ease:     GSAP_EASE.entryExpo,
        force3D:  true,
      }, 0.05);
    }

    // FIX 4: Defer React state update until clip-path covers old card
    tl.current.call(
      () => { onActiveChange_.current(nextIndex); },
      [],
      entry.duration - 0.1,
    );

    tl.current.call(() => {
      setDepthStack(nextIndex, true);
      triggerBloom(nextIndex);
    }, [], entry.duration - 0.05);

  }, [cardHandles, reduced, setDepthStack, triggerBloom]);

  // ── Initialization ─────────────────────────────────────────────
  useEffect(() => {
    // Kill any existing timeline on re-run (reduced toggle etc.)
    tl.current?.kill();
    tl.current = null;

    const section = sectionRef.current;
    if (!section) return;

    // FIX 3: Proper retry loop — re-checks population on every frame.
    // Previous code called initializeCards directly on retry, meaning
    // if handles were STILL null on frame 2, GSAP received null refs
    // silently and the stack was never set up beyond card 0.
    const MAX_RETRIES = 12;
    let retryCount = 0;

    const tryInit = () => {
      const allPopulated = cardHandles.current.every(
        (h) => h !== null && h.shellEl !== null,
      );

      if (!allPopulated) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          // ✅ Re-checks population each frame instead of blindly calling initializeCards
          rafId.current = requestAnimationFrame(tryInit);
        } else {
          console.warn(
            `[StackCarousel] Card handles not populated after ${MAX_RETRIES} frames. ` +
            `Check that StackCard onRegister is being called correctly.`
          );
        }
        return;
      }

      initializeCards();
    };

    rafId.current = requestAnimationFrame(tryInit);

    function initializeCards() {
      let initializedCount = 0;

      cardHandles.current.forEach((handle, i) => {
        if (!handle?.shellEl) return;

        // Track how many cards were actually set up
        initializedCount++;

        if (i === 0) {
          gsap.set(handle.shellEl, {
            scale:   1,
            y:       0,
            z:       0,
            filter:  'brightness(1)',
            force3D: true,
          });
        } else {
          const depthLevel = Math.min(i, STACK_CONFIG.depth.maxDepth);
          gsap.set(handle.shellEl, {
            scale:   1 - depthLevel * STACK_CONFIG.depth.scaleStep,
            y:       depthLevel * STACK_CONFIG.depth.translateYStep,
            z:       -depthLevel * 20,
            filter:  `brightness(${Math.max(
              0.3,
              1 - depthLevel * STACK_CONFIG.depth.brightnessStep,
            )})`,
            force3D: true,
          });
        }

        const h = handle as CardHandle & { revealEl?: HTMLDivElement | null };
        if (h.revealEl) {
          gsap.set(h.revealEl, {
            clipPath: STACK_CONFIG.entry.toClipPath,
          });
        }
      });

      // FIX 4: Guard — only fire onActiveChange if card 0 was actually initialized.
      // Previous code fired unconditionally even if all handles were null/skipped,
      // meaning setVisible(false) was called on cards that had no GSAP state yet.
      if (initializedCount > 0) {
        onActiveChange_.current(0);
      } else {
        console.warn('[StackCarousel] initializeCards ran but no handles were valid.');
      }
    }

    return () => {
      cancelAnimationFrame(rafId.current);
      tl.current?.kill();
    };
  }, [cardHandles, count, sectionRef, reduced]);

  return {
    animateTransition,
    progressRef,
    activeRef,
  };
}