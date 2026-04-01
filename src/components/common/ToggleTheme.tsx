// src/components/common/ToggleTheme.tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';
import { cn } from '@/utils/utils';

type AnimationType =
  | 'none'
  | 'circle-spread'
  | 'round-morph'
  | 'swipe-left'
  | 'swipe-up'
  | 'diag-down-right'
  | 'fade-in-out'
  | 'shrink-grow'
  | 'flip-x-in'
  | 'split-vertical'
  | 'swipe-right'
  | 'swipe-down'
  | 'wave-ripple'
  | 'mobile-fade'; // ← NEW: lightweight mobile animation type

interface ToggleThemeProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?:      number;
  animationType?: AnimationType;
}

export const ToggleTheme = React.memo(function ToggleTheme({
  className,
  duration      = 400,
  animationType = 'circle-spread',
  ...props
}: ToggleThemeProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef    = useRef<HTMLButtonElement>(null);
  const flipStyleRef = useRef<HTMLStyleElement | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  const applyThemeChange = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  /* ── Desktop animation configs ────────────────────────────────── */

  const runAnimation = useCallback(
    (x: number, y: number, maxRadius: number) => {
      const viewportWidth  = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (flipStyleRef.current) {
        flipStyleRef.current.remove();
        flipStyleRef.current = null;
      }

      const animationConfigs: Partial<Record<AnimationType, () => void>> = {
        'circle-spread': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration,
              easing:        'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'round-morph': () => {
          document.documentElement.animate(
            [
              { opacity: 0, transform: 'scale(0.8) rotate(5deg)' },
              { opacity: 1, transform: 'scale(1) rotate(0deg)'   },
            ],
            {
              duration:      duration * 1.2,
              easing:        'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'swipe-left': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `inset(0 0 0 ${viewportWidth}px)`,
                `inset(0 0 0 0)`,
              ],
            },
            {
              duration,
              easing:        'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'swipe-right': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `inset(0 ${viewportWidth}px 0 0)`,
                `inset(0 0 0 0)`,
              ],
            },
            {
              duration,
              easing:        'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'swipe-up': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `inset(${viewportHeight}px 0 0 0)`,
                `inset(0 0 0 0)`,
              ],
            },
            {
              duration,
              easing:        'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'swipe-down': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `inset(0 0 ${viewportHeight}px 0)`,
                `inset(0 0 0 0)`,
              ],
            },
            {
              duration,
              easing:        'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'diag-down-right': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `polygon(0 0, 0 0, 0 0, 0 0)`,
                `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
              ],
            },
            {
              duration:      duration * 1.5,
              easing:        'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'fade-in-out': () => {
          document.documentElement.animate(
            { opacity: [0, 1] },
            {
              duration:      duration * 0.5,
              easing:        'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        'shrink-grow': () => {
          document.documentElement.animate(
            [
              { transform: 'scale(0.9)', opacity: 0 },
              { transform: 'scale(1)',   opacity: 1 },
            ],
            {
              duration:      duration * 1.2,
              easing:        'cubic-bezier(0.19, 1, 0.22, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
          document.documentElement.animate(
            [
              { transform: 'scale(1)',    opacity: 1 },
              { transform: 'scale(1.05)', opacity: 0 },
            ],
            {
              duration:      duration * 1.2,
              easing:        'cubic-bezier(0.19, 1, 0.22, 1)',
              pseudoElement: '::view-transition-old(root)',
            },
          );
        },
        'flip-x-in': () => {
          const styleElement = document.createElement('style');
          styleElement.textContent = `
            ::view-transition-group(root) { perspective: 1000px; }
            ::view-transition-old(root) {
              transform-origin: center;
              animation: flip-out ${duration}ms forwards;
            }
            ::view-transition-new(root) {
              transform-origin: center;
              animation: flip-in ${duration}ms forwards;
            }
            @keyframes flip-out {
              from { transform: rotateY(0deg);   opacity: 1; }
              to   { transform: rotateY(-90deg); opacity: 0; }
            }
            @keyframes flip-in {
              from { transform: rotateY(90deg); opacity: 0; }
              to   { transform: rotateY(0deg);  opacity: 1; }
            }
          `;
          document.head.appendChild(styleElement);
          flipStyleRef.current = styleElement;
          setTimeout(() => {
            styleElement.remove();
            if (flipStyleRef.current === styleElement) flipStyleRef.current = null;
          }, duration + 100);
        },
        'split-vertical': () => {
          document.documentElement.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            {
              duration:      duration * 0.75,
              easing:        'ease-in',
              pseudoElement: '::view-transition-new(root)',
            },
          );
          document.documentElement.animate(
            [
              { clipPath: 'inset(0 0 0 0)',     transform: 'none'       },
              { clipPath: 'inset(0 40% 0 40%)', transform: 'scale(1.2)' },
              { clipPath: 'inset(0 50% 0 50%)', transform: 'scale(1)'   },
            ],
            {
              duration:      duration * 1.5,
              easing:        'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              pseudoElement: '::view-transition-old(root)',
            },
          );
        },
        'wave-ripple': () => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0% at 50% 50%)`,
                `circle(${maxRadius}px at 50% 50%)`,
              ],
            },
            {
              duration:      duration * 1.5,
              easing:        'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        },
        none: undefined,
      };

      animationConfigs[animationType]?.();
    },
    [duration, animationType],
  );

  /* ── Mobile animation — lightweight fade + scale ──────────────────
    
    WHY a separate mobile animation path:
    
    clip-path animations (circle-spread, wave-ripple, swipe-*)
    on mobile require the browser to:
    1. Snapshot the ENTIRE viewport as a texture (old state)
    2. Render the new state beneath it
    3. Animate the clip mask across all ~2M+ pixels per frame
    
    On a 390×844 iPhone screen at 3x DPR = 1170×2532 real pixels.
    Clipping that at 60fps = massive GPU fill-rate pressure.
    
    The mobile-fade animation uses ONLY opacity — the cheapest
    possible compositor property. The scale adds perceived smoothness
    without any clip calculation. Total GPU cost: near zero.
    
    Duration is shorter (280ms vs 400ms) because mobile users
    expect snappier responses and the animation covers less area.
  ────────────────────────────────────────────────────────────────── */

  const runMobileAnimation = useCallback(async () => {
    if (!document.startViewTransition) return false;

    const mobileDuration = Math.min(duration, 280);

    const transition = document.startViewTransition(() => {
      flushSync(applyThemeChange);
    });

    try {
      await transition.ready;

      // New state fades + scales up from 97% → 100%
      // Cheap: opacity + transform only — both composited
      document.documentElement.animate(
        [
          { opacity: 0, transform: 'scale(0.97)' },
          { opacity: 1, transform: 'scale(1)'    },
        ],
        {
          duration:      mobileDuration,
          easing:        'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          pseudoElement: '::view-transition-new(root)',
          fill:          'forwards',
        },
      );

      // Old state fades + scales down — gives depth feeling
      document.documentElement.animate(
        [
          { opacity: 1, transform: 'scale(1)'    },
          { opacity: 0, transform: 'scale(1.03)' },
        ],
        {
          duration:      mobileDuration * 0.8,
          easing:        'ease-in',
          pseudoElement: '::view-transition-old(root)',
          fill:          'forwards',
        },
      );

      return true;
    } catch {
      // View transition interrupted — theme still applied
      return false;
    }
  }, [applyThemeChange, duration]);

  /* ── Main toggle handler ──────────────────────────────────────── */

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Reduced motion: instant swap, no animation at all
    if (prefersReduced) {
      applyThemeChange();
      return;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    /* ── Mobile path ──────────────────────────────────────────────
      
      Uses View Transition API if available (Chrome Android 111+,
      Safari iOS 18+) with the lightweight fade+scale animation.
      
      Falls back to CSS transition via data-theme-transitioning
      for Firefox Android and older Safari iOS.
    ────────────────────────────────────────────────────────────── */
    if (isMobile) {
      if (document.startViewTransition) {
        // Try the lightweight mobile animation
        const animated = await runMobileAnimation();
        if (animated) return;
      }

      // CSS fallback for browsers without View Transition API
      // Uses the surgical selectors in globals.css
      document.documentElement.setAttribute('data-theme-transitioning', '');
      applyThemeChange();
      setTimeout(() => {
        document.documentElement.removeAttribute('data-theme-transitioning');
      }, 350);
      return;
    }

    /* ── Desktop path ─────────────────────────────────────────────
      
      Full View Transition with clip-path animations.
      Read button position BEFORE startViewTransition takes snapshot.
    ────────────────────────────────────────────────────────────── */
    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top  + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth  - left),
      Math.max(top,  window.innerHeight - top),
    );

    if (!document.startViewTransition) {
      // CSS fallback for desktop browsers without View Transition API
      document.documentElement.setAttribute('data-theme-transitioning', '');
      applyThemeChange();
      setTimeout(() => {
        document.documentElement.removeAttribute('data-theme-transitioning');
      }, 350);
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(applyThemeChange);
    });

    try {
      await transition.ready;
      runAnimation(x, y, maxRadius);
    } catch {
      // Transition interrupted — theme applied correctly
    }
  }, [applyThemeChange, runAnimation, runMobileAnimation]);

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      type="button"
      aria-label={
        mounted
          ? `Switch to ${isDark ? 'light' : 'dark'} mode`
          : 'Toggle theme'
      }
      className={cn(
        'p-2 rounded-full transition-colors duration-300',
        'cursor-pointer flex items-center justify-center',
        className,
      )}
      {...props}
    >
      {!mounted ? (
        <Moon
          className="text-neutral-500 dark:text-neutral-300 opacity-0"
          size={18}
          aria-hidden="true"
        />
      ) : isDark ? (
        <Sun
          className="text-neutral-500 dark:text-neutral-300"
          size={18}
          aria-hidden="true"
        />
      ) : (
        <Moon
          className="text-neutral-500 dark:text-neutral-300"
          size={18}
          aria-hidden="true"
        />
      )}
    </button>
  );
});

ToggleTheme.displayName = 'ToggleTheme';