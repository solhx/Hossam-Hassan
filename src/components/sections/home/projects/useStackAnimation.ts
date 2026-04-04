// src/components/sections/home/projects/useStackAnimation.ts
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX E — Remove unsafe intersection type cast
// BEFORE: const prevHandle = cardHandles.current[i] as CardHandle & {
//           bloomEl?: HTMLDivElement | null;
//           revealEl?: HTMLDivElement | null;
//         }
//         This cast bypassed TypeScript — if bloomEl was genuinely
//         missing, GSAP would animate undefined without any error.
// AFTER:  CardHandle now has bloomEl + revealEl as first-class fields
//         (in types.ts). Access them directly — no cast needed.
//         TypeScript will catch null access at compile time.
//
// FIX I — Bloom cleanup on reduced motion toggle
// BEFORE: triggerBloom returned early for reduced=true but did NOT
//         kill existing tweens on bloomEl. If the user toggled
//         reduced motion mid-bloom, the tween continued running.
// AFTER:  Always kill existing bloomEl tweens before the guard.
//         gsap.killTweensOf(null) is a no-op, so safe when bloomEl
//         is null.
//
// FIX J — Timeline onComplete race
// BEFORE: onComplete set shell to brightness(1) but if animateTransition
//         was called again before the first tl completed (rapid scroll),
//         tl.kill() stopped the first tl mid-animation, leaving the
//         outgoing card at a partial state. The onComplete never fired,
//         so the card stayed at reduced brightness/scale permanently.
// AFTER:  tl.kill() followed by gsap.set() to reset any cards that
//         were mid-transition before starting the new timeline.
//         Uses a 'before-kill' snapshot to reset exactly those cards.
// ─────────────────────────────────────────────────────────────────
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

  // Stable ref to onActiveChange — avoids stale closure in GSAP callbacks
  const onActiveChange_ = useRef(onActiveChange);
  useEffect(() => { onActiveChange_.current = onActiveChange; });

  const rafId = useRef<number>(0);

  // ── FIX I: Bloom burst with proper cleanup ─────────────────────
  const triggerBloom = useCallback((index: number) => {
    const handle = cardHandles.current[index];

    // FIX I: Kill existing tweens BEFORE the reduced guard.
    // This stops any in-progress bloom if user toggles reduced motion.
    gsap.killTweensOf(handle?.bloomEl ?? null);

    if (!handle?.bloomEl || reduced) return;

    const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];

    // Update bloom color for this project
    handle.bloomEl.style.background =
      `radial-gradient(circle at 50% 50%, rgba(${accent.bloomRgb},0.22) 0%, rgba(${accent.bloomRgb},0.08) 45%, transparent 70%)`;

    gsap.fromTo(
      handle.bloomEl,
      { scale: 0.5, filter: 'brightness(2)' },
      {
        scale:     2.2,
        filter:    'brightness(0)',
        duration:  0.85,
        ease:      GSAP_EASE.bloom,
        overwrite: 'auto',
        onComplete: () => {
          // Reset to initial state — ready for next bloom
          gsap.set(handle.bloomEl, {
            scale:  0.5,
            filter: 'brightness(0)',
          });
        },
      },
    );
  }, [cardHandles, reduced]);

  // ── Depth stack positioning ────────────────────────────────────
  // Sets scale/y/z for ALL non-active cards relative to activeIndex.
  // Uses translateZ for depth ordering (compositor-only, no layout).
  const setDepthStack = useCallback((
    activeIndex: number,
    animated:    boolean,
  ) => {
    const { depth } = STACK_CONFIG;

    cardHandles.current.forEach((handle, i) => {
      if (!handle?.shellEl) return;

      const dist     = i - activeIndex;
      const isActive = dist === 0;
      if (isActive) return; // active card positioned by animateTransition

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
    // Reduced motion: instant state change, no animation
    if (reduced) {
      setDepthStack(nextIndex, false);
      onActiveChange_.current(nextIndex);
      return;
    }

    const prevHandle = cardHandles.current[prevIndex];
    const nextHandle = cardHandles.current[nextIndex];

    const { entry, exit } = STACK_CONFIG;

    // FIX J: Before killing the old timeline, snapshot which cards
    // were mid-transition and reset them to a clean state.
    // This prevents orphaned animations leaving cards at partial transforms.
    if (tl.current?.isActive()) {
      // Cards that were transitioning — reset to depth stack positions
      // so the new transition starts from a predictable state
      setDepthStack(activeRef.current, false);
    }

    tl.current?.kill();
    tl.current = gsap.timeline();

    // ── EXIT: outgoing card leaves upward ─────────────────────
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

    // ── ENTRY: incoming card rises from below ──────────────────
    if (nextHandle?.shellEl && nextHandle?.revealEl) {
      // Set starting position before animation
      gsap.set(nextHandle.shellEl, {
        scale:   entry.fromScale,
        y:       entry.fromTranslateY,
        z:       5,
        filter:  'brightness(1)',
        force3D: true,
      });

      // Clip-path starts fully covered (from bottom)
      gsap.set(nextHandle.revealEl, {
        clipPath: entry.fromClipPath,
        force3D:  true,
      });

      // Shell: scale up + translate to center
      tl.current.to(nextHandle.shellEl, {
        scale:    1,
        y:        0,
        z:        0,
        duration: entry.duration,
        ease:     GSAP_EASE.entryExpo,
        force3D:  true,
      }, 0.05);

      // Reveal: wipe from bottom → full reveal
      tl.current.to(nextHandle.revealEl, {
        clipPath: entry.toClipPath,
        duration: entry.duration,
        ease:     GSAP_EASE.entryExpo,
        force3D:  true,
      }, 0.05);
    }

    // React state update DURING animation at the visual crossover point.
    // Called when clip-path is ~80% complete — content appears as
    // it's revealed, not before (which would show old content through the wipe).
    tl.current.call(
      () => {
        activeRef.current = nextIndex;
        onActiveChange_.current(nextIndex);
      },
      [],
      entry.duration - 0.1,
    );

    // Restack remaining cards + trigger bloom at animation end
    tl.current.call(() => {
      setDepthStack(nextIndex, true);
      triggerBloom(nextIndex);
    }, [], entry.duration - 0.05);

  }, [cardHandles, reduced, setDepthStack, triggerBloom]);

  // ── Initialization ─────────────────────────────────────────────
  useEffect(() => {
    tl.current?.kill();
    tl.current = null;

    const section = sectionRef.current;
    if (!section) return;

    // Retry loop — waits for all card handles to be registered.
    // Each StackCard registers in its own useEffect (after mount),
    // so handles may not all be available on frame 0.
    const MAX_RETRIES = 16; // ~267ms at 60fps — enough for 5 cards
    let retryCount    = 0;

    const tryInit = () => {
      const allPopulated = cardHandles.current.every(
        (h) => h !== null && h.shellEl !== null,
      );

      if (!allPopulated) {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          rafId.current = requestAnimationFrame(tryInit);
        } else {
          console.warn(
            `[useStackAnimation] Handles not populated after ${MAX_RETRIES} frames.` +
            ` Check StackCard onRegister callbacks.`,
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
        initializedCount++;

        if (i === 0) {
          // Front card — full size, full brightness, at z=0
          gsap.set(handle.shellEl, {
            scale:   1,
            y:       0,
            z:       0,
            filter:  'brightness(1)',
            force3D: true,
          });
        } else {
          // Cards behind — progressively smaller, darker, deeper
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

        // Reveal wrapper — fully open (content visible) on init
        if (handle.revealEl) {
          gsap.set(handle.revealEl, {
            clipPath: STACK_CONFIG.entry.toClipPath,
          });
        }
      });

      // FIX J: Only fire initial active change if cards were set up.
      // If no handles were valid, firing this would set visible state
      // on cards that have no GSAP initial state — visible content
      // with no transform context.
      if (initializedCount > 0) {
        activeRef.current = 0;
        onActiveChange_.current(0);
      } else {
        console.warn('[useStackAnimation] No handles initialized. Stack may not display.');
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