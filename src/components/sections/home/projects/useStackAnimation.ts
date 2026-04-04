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
  // ── NEW: mouse tilt state ──────────────────────────────────────
  const mouseTiltTl     = useRef<gsap.core.Tween | null>(null);
  const tiltActiveIndex = useRef(0);

  useEffect(() => { onActiveChange_.current = onActiveChange; });

  // ── UPGRADE: Multi-ring bloom burst ───────────────────────────
  // Instead of a single orb scaling up, 3 rings ripple outward
  // Each ring is a separate GSAP tween staggered by 0.18s
  const triggerBloom = useCallback((index: number) => {
    const handle = cardHandles.current[index] as CardHandle & {
      bloomEl?: HTMLDivElement | null;
    };
    if (!handle?.bloomEl || reduced) return;

    const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
    const { bloom } = STACK_CONFIG;
    const el = handle.bloomEl;

    gsap.killTweensOf(el);

    // Update bloom color
    el.style.background = `radial-gradient(
      circle at 50% 50%,
      rgba(${accent.bloomRgb}, 0.28) 0%,
      rgba(${accent.bloomRgb}, 0.10) 40%,
      transparent 65%
    )`;

    // Ring 1 — fast, bright core burst
    gsap.fromTo(el,
      { scale: 0.3, filter: 'brightness(2.5) blur(0px)', opacity: 1 },
      {
        scale:    bloom.maxScale * 0.7,
        filter:   'brightness(0.8) blur(2px)',
        opacity:  0,
        duration: bloom.duration * 0.75,
        ease:     GSAP_EASE.bloom,
        overwrite: 'auto',
      },
    );

    // Ring 2 — medium, delayed
    const ring2 = el.cloneNode(true) as HTMLDivElement;
    ring2.style.position  = 'absolute';
    ring2.style.inset     = '0';
    ring2.style.zIndex    = '48';
    ring2.style.pointerEvents = 'none';
    el.parentElement?.appendChild(ring2);

    gsap.fromTo(ring2,
      { scale: 0.2, filter: 'brightness(1.5) blur(0px)', opacity: 0.7 },
      {
        scale:    bloom.maxScale,
        filter:   'brightness(0) blur(8px)',
        opacity:  0,
        duration: bloom.duration,
        delay:    bloom.stagger,
        ease:     GSAP_EASE.bloom,
        onComplete: () => ring2.remove(),
      },
    );

    // Ring 3 — slow outer ripple
    const ring3 = el.cloneNode(true) as HTMLDivElement;
    ring3.style.position  = 'absolute';
    ring3.style.inset     = '0';
    ring3.style.zIndex    = '47';
    ring3.style.pointerEvents = 'none';
    el.parentElement?.appendChild(ring3);

    gsap.fromTo(ring3,
      { scale: 0.1, filter: 'brightness(1) blur(0px)', opacity: 0.4 },
      {
        scale:    bloom.maxScale * 1.3,
        filter:   'brightness(0) blur(16px)',
        opacity:  0,
        duration: bloom.duration * 1.4,
        delay:    bloom.stagger * 2,
        ease:     GSAP_EASE.bloom,
        onComplete: () => ring3.remove(),
      },
    );

    // Reset original after all rings done
    gsap.set(el, {
      clearProps: 'scale,filter,opacity',
      delay: bloom.duration + bloom.stagger * 2 + 0.1,
    });
  }, [cardHandles, reduced]);

  // ── Depth stack ────────────────────────────────────────────────
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
        rotateX: 0,
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

  // ── UPGRADE: Mouse tilt on active card ────────────────────────
  // Tracks mouse globally, tilts only the active card shell
  // Feels like the card is a physical object reacting to light
  const setupMouseTilt = useCallback((activeIndex: number) => {
    if (reduced) return;

    tiltActiveIndex.current = activeIndex;

    const handleMouseMove = (e: MouseEvent) => {
      const handle = cardHandles.current[tiltActiveIndex.current];
      if (!handle?.shellEl) return;

      // Normalize to -1 → 1
      const nx = (e.clientX / window.innerWidth)  * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      const { tilt } = STACK_CONFIG;

      mouseTiltTl.current?.kill();
      mouseTiltTl.current = gsap.to(handle.shellEl, {
        rotateY:  nx *  tilt.maxRotateY,
        rotateX:  ny * -tilt.maxRotateX,
        z:        tilt.maxTranslateZ * (1 - Math.abs(nx) * 0.3),
        duration: 0.9,
        ease:     'power2.out',
        overwrite: 'auto',
        force3D:  true,
      });

      // Parallax the image layer opposite direction
      const imgHandle = handle as CardHandle & { imageEl?: HTMLDivElement | null };
      if (imgHandle.imageEl) {
        gsap.to(imgHandle.imageEl, {
          x:        nx * -12,
          y:        ny * -8,
          duration: 1.2,
          ease:     'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const handleMouseLeave = () => {
      const handle = cardHandles.current[tiltActiveIndex.current];
      if (!handle?.shellEl) return;

      // Spring back to neutral
      gsap.to(handle.shellEl, {
        rotateX: 0,
        rotateY: 0,
        z:       0,
        duration: 1.2,
        ease:    GSAP_EASE.tiltSpring,
        overwrite: 'auto',
        force3D: true,
      });

      const imgHandle = handle as CardHandle & { imageEl?: HTMLDivElement | null };
      if (imgHandle.imageEl) {
        gsap.to(imgHandle.imageEl, {
          x: 0, y: 0,
          duration: 1.0,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    };

    window.addEventListener('mousemove',  handleMouseMove,  { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove',  handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cardHandles, reduced]);

  // ── UPGRADE: Cinematic transition ─────────────────────────────
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
            scale:   1,
            y:       0,
            z:       0,
            rotateX: 0,
            rotateY: 0,
            filter:  'brightness(1)',
          });
        }
        // Re-attach tilt after transition completes
        tiltActiveIndex.current = nextIndex;
      },
    });

    // ── EXIT: outgoing card ──────────────────────────────────────
    // UPGRADE: slight rotateX gives a "flipping away" depth feel
    if (prevHandle?.shellEl) {
      tl.current.to(prevHandle.shellEl, {
        scale:    exit.toScale,
        y:        exit.toTranslateY,
        z:        -8,
        rotateX:  exit.toRotateX,  // NEW: tips backward
        filter:   'brightness(0.5)',
        duration: exit.duration,
        ease:     GSAP_EASE.exitCubic,
        force3D:  true,
      }, 0);
    }

    // ── ENTRY: incoming card ─────────────────────────────────────
    // UPGRADE: starts slightly rotated, springs to flat
    if (nextHandle?.shellEl && nextHandle?.revealEl) {
      gsap.set(nextHandle.shellEl, {
        scale:   entry.fromScale,
        y:       entry.fromTranslateY,
        z:       8,
        rotateX: -3,    // NEW: leans forward on entry
        rotateY:  1.5,  // NEW: slight horizontal lean
        filter:  'brightness(1.05)',
        force3D: true,
      });

      gsap.set(nextHandle.revealEl, {
        clipPath: entry.fromClipPath,
        force3D:  true,
      });

      // Shell animation — springs to neutral with slight overshoot
      tl.current.to(nextHandle.shellEl, {
        scale:   1,
        y:       0,
        z:       0,
        rotateX: 0,
        rotateY: 0,
        filter:  'brightness(1)',
        duration: entry.duration,
        ease:    GSAP_EASE.entryExpo,
        force3D: true,
      }, 0.04);

      // ── UPGRADE: wipe uses richer ease ──────────────────────
      tl.current.to(nextHandle.revealEl, {
        clipPath: entry.toClipPath,
        duration: entry.duration * 0.95,
        ease:     GSAP_EASE.wipe,
        force3D:  true,
      }, 0.04);
    }

    // Deferred React update (content swap hidden behind wipe)
    tl.current.call(
      () => { onActiveChange_.current(nextIndex); },
      [],
      entry.duration - 0.12,
    );

    // Depth reposition + bloom
    tl.current.call(() => {
      setDepthStack(nextIndex, true);
      triggerBloom(nextIndex);
    }, [], entry.duration - 0.06);

  }, [cardHandles, reduced, setDepthStack, triggerBloom]);

  // ── Initialization ─────────────────────────────────────────────
  useEffect(() => {
    tl.current?.kill();
    tl.current = null;

    const section = sectionRef.current;
    if (!section) return;

    const MAX_RETRIES = 12;
    let retryCount    = 0;
    let tiltCleanup: (() => void) | undefined;

    const tryInit = () => {
      const allPopulated = cardHandles.current.every(
        (h) => h !== null && h.shellEl !== null,
      );

      if (!allPopulated) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          rafId.current = requestAnimationFrame(tryInit);
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
        initializedCount++;

        if (i === 0) {
          gsap.set(handle.shellEl, {
            scale:   1,
            y:       0,
            z:       0,
            rotateX: 0,
            rotateY: 0,
            filter:  'brightness(1)',
            force3D: true,
          });
        } else {
          const depthLevel = Math.min(i, STACK_CONFIG.depth.maxDepth);
          gsap.set(handle.shellEl, {
            scale:   1 - depthLevel * STACK_CONFIG.depth.scaleStep,
            y:       depthLevel * STACK_CONFIG.depth.translateYStep,
            z:       -depthLevel * 20,
            rotateX: 0,
            rotateY: 0,
            filter:  `brightness(${Math.max(
              0.3,
              1 - depthLevel * STACK_CONFIG.depth.brightnessStep,
            )})`,
            force3D: true,
          });
        }

        const h = handle as CardHandle & { revealEl?: HTMLDivElement | null };
        if (h.revealEl) {
          gsap.set(h.revealEl, { clipPath: STACK_CONFIG.entry.toClipPath });
        }
      });

      if (initializedCount > 0) {
        onActiveChange_.current(0);
        // Start mouse tilt on card 0
        tiltCleanup = setupMouseTilt(0);
      }
    }

    return () => {
      cancelAnimationFrame(rafId.current);
      tl.current?.kill();
      mouseTiltTl.current?.kill();
      tiltCleanup?.();
    };
  }, [cardHandles, count, sectionRef, reduced, setupMouseTilt]);

  return {
    animateTransition,
    progressRef,
    activeRef,
  };
}