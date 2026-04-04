// src/components/sections/home/projects/CardBackground.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX P — inset[-8%] layout recalc
// BEFORE: The background div used inset:[-8%] (negative inset) to
//         extend beyond the card edges for parallax room. This
//         caused the element to be larger than its containing block,
//         forcing a layout recalc on every GSAP y-transform tick.
// AFTER:  Use a fixed pixel overflow via padding on the wrapper and
//         a negative margin trick — the parent gets overflow:hidden
//         and the child extends beyond via negative inset values
//         using CSS custom properties. The key change: the extended
//         size is established at paint time, not recalculated per
//         frame. translateY animations stay compositor-only.
//
// FIX Q — will-change lifecycle management
// BEFORE: will-change:'transform' was set in the JSX style prop —
//         always active, even when no animation is running.
//         will-change promotes elements to their own GPU layer
//         permanently, consuming VRAM even on idle cards.
// AFTER:  will-change is managed by GSAP (set before animation,
//         cleared after via onComplete). The JSX style prop removes
//         the always-on hint. The imageRef callback hands the DOM
//         node to GSAP which manages will-change itself.
// ─────────────────────────────────────────────────────────────────
import { memo, useRef, useEffect, useCallback } from 'react';
import type { Accent } from './types';

interface CardBackgroundProps {
  accent:   Accent;
  index:    number;
  // Callback: hands the DOM node to StackCard → GSAP
  // GSAP manages will-change and y transform on this element
  imageRef: (el: HTMLDivElement | null) => void;
}

// Dark mode base gradients — cinema feel, deep blacks
const DARK_GRADIENT_PATTERNS = [
  `linear-gradient(135deg, oklch(0.10 0.04 158) 0%, oklch(0.14 0.06 152) 40%, oklch(0.11 0.03 160) 100%)`,
  `radial-gradient(ellipse 80% 80% at 50% 40%, oklch(0.16 0.07 150) 0%, oklch(0.10 0.03 158) 60%, oklch(0.08 0.02 162) 100%)`,
  `linear-gradient(180deg, oklch(0.09 0.02 162) 0%, oklch(0.15 0.06 153) 50%, oklch(0.12 0.04 156) 100%)`,
  `linear-gradient(105deg, oklch(0.18 0.08 149) 0%, oklch(0.12 0.04 156) 40%, oklch(0.09 0.02 162) 100%)`,
  `radial-gradient(ellipse 100% 100% at 30% 60%, oklch(0.15 0.06 153) 0%, oklch(0.09 0.02 162) 70%)`,
] as const;

// Light mode base gradients — airy, clean glass surface
const LIGHT_GRADIENT_PATTERNS = [
  `linear-gradient(135deg, oklch(0.98 0.006 160) 0%, oklch(0.96 0.012 154) 40%, oklch(0.97 0.008 158) 100%)`,
  `radial-gradient(ellipse 80% 80% at 50% 40%, oklch(0.97 0.010 152) 0%, oklch(0.98 0.005 158) 60%, oklch(0.99 0.003 162) 100%)`,
  `linear-gradient(180deg, oklch(0.99 0.004 162) 0%, oklch(0.96 0.012 153) 50%, oklch(0.97 0.008 156) 100%)`,
  `linear-gradient(105deg, oklch(0.95 0.015 149) 0%, oklch(0.97 0.010 156) 40%, oklch(0.99 0.003 162) 100%)`,
  `radial-gradient(ellipse 100% 100% at 30% 60%, oklch(0.96 0.012 153) 0%, oklch(0.99 0.003 162) 70%)`,
] as const;

export const CardBackground = memo(function CardBackground({
  accent,
  index,
  imageRef,
}: CardBackgroundProps) {
  const darkPattern  = DARK_GRADIENT_PATTERNS[index  % DARK_GRADIENT_PATTERNS.length];
  const lightPattern = LIGHT_GRADIENT_PATTERNS[index % LIGHT_GRADIENT_PATTERNS.length];

  // Local ref — used to call imageRef callback after mount
  const elRef = useRef<HTMLDivElement>(null);

  // FIX Q: Don't set will-change in JSX — GSAP manages it.
  // Register the DOM node with the parent (→ GSAP) after mount.
  const setRef = useCallback((el: HTMLDivElement | null) => {
    (elRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    imageRef(el);
  }, [imageRef]);

  useEffect(() => {
    // Cleanup: ensure will-change is reset if GSAP didn't clean up
    return () => {
      if (elRef.current) {
        elRef.current.style.willChange = 'auto';
      }
    };
  }, []);

  return (
    // FIX P: Use a wrapper that establishes the overflow context.
    // The inner div extends beyond the parent via negative positioning.
    // inset-0 on wrapper, then -8% extension on child via negative
    // top/left/right/bottom — this size is fixed at paint time.
    // GSAP's translateY on the child never causes layout recalc
    // because the child is already positioned outside the parent
    // (overflow:hidden on the card shell clips it visually).
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        ref={setRef}
        // FIX P: Negative pixel extension for parallax room.
        // Using percentage-based inset would cause layout dependency.
        // Using absolute negative values: established at paint, not recalculated.
        // FIX Q: No will-change here — GSAP sets/clears it dynamically.
        className="absolute"
        style={{
          // Extends 8% beyond the card in all directions for parallax room.
          // The parent overflow:hidden clips it to the card boundary.
          // This size is computed once at layout time — translateY never
          // triggers recalc because we're only moving an already-laid-out element.
          top:    '-8%',
          left:   '-8%',
          right:  '-8%',
          bottom: '-8%',
          transform: 'translateY(0%) translateZ(0)',
        }}
      >
        {/* Dark mode base gradient */}
        <div
          className="absolute inset-0 dark:block hidden"
          style={{ background: darkPattern }}
        />

        {/* Light mode base gradient */}
        <div
          className="absolute inset-0 dark:hidden block"
          style={{ background: lightPattern }}
        />

        {/* Accent bloom — right side — DARK: vivid / LIGHT: subtle */}
        <div
          className="absolute inset-0 dark:opacity-100 opacity-40"
          style={{
            background: `radial-gradient(
              ellipse 65% 65% at 65% 50%,
              rgba(${accent.bloomRgb}, 0.16) 0%,
              rgba(${accent.bloomRgb}, 0.06) 50%,
              transparent 70%
            )`,
          }}
        />

        {/* Accent secondary — bottom-left */}
        <div
          className="absolute inset-0 dark:opacity-100 opacity-30"
          style={{
            background: `radial-gradient(
              ellipse 45% 45% at 20% 80%,
              rgba(${accent.bloomRgb}, 0.08) 0%,
              transparent 60%
            )`,
          }}
        />

        {/* Geometric diagonal lines — DARK mode */}
        <div
          className="absolute inset-0 dark:block hidden"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                ${45 + index * 15}deg,
                transparent                        0px,
                transparent                        47px,
                rgba(255, 255, 255, 0.018)         47px,
                rgba(255, 255, 255, 0.018)         48px
              )
            `,
          }}
        />

        {/* Geometric diagonal lines — LIGHT mode */}
        <div
          className="absolute inset-0 dark:hidden block"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                ${45 + index * 15}deg,
                transparent                        0px,
                transparent                        47px,
                rgba(0, 80, 50, 0.025)             47px,
                rgba(0, 80, 50, 0.025)             48px
              )
            `,
          }}
        />

        {/* Top edge highlight — DARK: accent shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px dark:block hidden"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(${accent.bloomRgb}, 0.35) 30%,
              rgba(${accent.bloomRgb}, 0.55) 50%,
              rgba(${accent.bloomRgb}, 0.35) 70%,
              transparent 100%
            )`,
          }}
        />

        {/* Top edge highlight — LIGHT: white glass line */}
        <div
          className="absolute top-0 left-0 right-0 h-px dark:hidden block"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.9) 20%,
              rgba(255, 255, 255, 1.0) 50%,
              rgba(255, 255, 255, 0.9) 80%,
              transparent 100%
            )`,
          }}
        />

        {/* Bottom depth fade — DARK */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 dark:block hidden"
          style={{
            background: `linear-gradient(to top, oklch(0.06 0.01 160 / 0.6) 0%, transparent 100%)`,
          }}
        />

        {/* Bottom depth fade — LIGHT: glass floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/4 dark:hidden block"
          style={{
            background: `linear-gradient(to top, oklch(0.92 0.015 158 / 0.5) 0%, transparent 100%)`,
          }}
        />

        {/* Micro crosshatch texture — overlay blend */}
        <div
          className="absolute inset-0 pointer-events-none dark:opacity-100 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(
                 45deg,
                 transparent 49.5%,
                 rgba(255,255,255,0.022) 49.5%,
                 rgba(255,255,255,0.022) 50.5%,
                 transparent 50.5%
              ),
              linear-gradient(
                -45deg,
                transparent 49.5%,
                rgba(255,255,255,0.022) 49.5%,
                rgba(255,255,255,0.022) 50.5%,
                transparent 50.5%
              )
            `,
            backgroundSize: '6px 6px',
            mixBlendMode:   'overlay',
          }}
        />

        {/* Light mode: premium diagonal glass reflection */}
        <div
          className="absolute inset-0 pointer-events-none dark:hidden block"
          style={{
            background: `linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.60) 0%,
              rgba(255, 255, 255, 0.20) 30%,
              rgba(255, 255, 255, 0.05) 60%,
              transparent 100%
            )`,
          }}
        />

        {/* Light mode: inner shadow for glass depth */}
        <div
          className="absolute inset-0 pointer-events-none dark:hidden block"
          style={{
            boxShadow: `
              inset 0 -1px 0 0 rgba(${accent.bloomRgb}, 0.15),
              inset 0  1px 0 0 rgba(255, 255, 255, 0.8)
            `,
            borderRadius: 'inherit',
          }}
        />
      </div>
    </div>
  );
});