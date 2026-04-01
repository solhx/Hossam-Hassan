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
  | 'wave-ripple';

interface ToggleThemeProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?:      number;
  animationType?: AnimationType;
}

/* ── Canvas circle-spread fallback ───────────────────────────────── */

function runCanvasCircleSpread(
  x:        number,
  y:        number,
  duration: number,
  onStart:  () => void,
): Promise<void> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const dpr    = Math.min(window.devicePixelRatio, 2);
    const W      = window.innerWidth;
    const H      = window.innerHeight;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;

    Object.assign(canvas.style, {
      position:      'fixed',
      inset:         '0',
      width:         `${W}px`,
      height:        `${H}px`,
      zIndex:        '999999',
      pointerEvents: 'none',
      willChange:    'transform',
      transform:     'translateZ(0)',
    });

    /*
      FIX: get context BEFORE the null check, then narrow the type
      with a proper if-guard. TypeScript can track the narrowing
      through the closure ONLY if we use a const with a definite
      non-null type inside the guarded block.
      
      We cast to CanvasRenderingContext2D after the null check
      so every use inside frame() is typed as non-null.
    */
    const rawCtx = canvas.getContext('2d');

    if (!rawCtx) {
      // Canvas 2D not available — apply theme instantly
      onStart();
      resolve();
      return;
    }

    // After this point ctx is guaranteed non-null
    // We assign to a new const so TypeScript tracks the narrowing
    // across the frame() closure without re-checking each time
    const ctx: CanvasRenderingContext2D = rawCtx;

    ctx.scale(dpr, dpr);

    // Read old background color BEFORE applying new theme
    const oldBgComputed = getComputedStyle(document.body).backgroundColor;

    // Fallback color if getComputedStyle returns empty string
    const isDarkNow     = document.documentElement.classList.contains('dark');
    const fallbackColor = isDarkNow ? '#171717' : '#ffffff';
    const fillColor     = oldBgComputed || fallbackColor;

    // Fill canvas with old background — covers entire viewport
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, W, H);

    // Mount canvas on top of page
    document.body.appendChild(canvas);

    // Apply new theme instantly underneath the canvas
    onStart();

    const maxRadius = Math.hypot(
      Math.max(x, W - x),
      Math.max(y, H - y),
    );

    const startTime = performance.now();

    const easeInOut = (t: number): number =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function frame(now: number) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeInOut(progress);
      const radius   = eased * maxRadius;

      // ctx is CanvasRenderingContext2D here — no null check needed
      ctx.clearRect(0, 0, W, H);

      // Redraw old background covering full viewport
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle                = fillColor;
      ctx.fillRect(0, 0, W, H);

      // Cut expanding circle hole to reveal new theme beneath
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

/* ── Component ───────────────────────────────────────────────────── */

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

  /* ── View Transition animation configs ───────────────────────── */

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
            if (flipStyleRef.current === styleElement) {
              flipStyleRef.current = null;
            }
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

  /* ── Main toggle handler ──────────────────────────────────────── */

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) {
      applyThemeChange();
      return;
    }

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top  + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth  - left),
      Math.max(top,  window.innerHeight - top),
    );

    // Path 1: View Transition API — Chrome/Edge/Safari 18+
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        flushSync(applyThemeChange);
      });
      try {
        await transition.ready;
        runAnimation(x, y, maxRadius);
      } catch {
        // Interrupted — theme still applied
      }
      return;
    }

    // Path 2: Canvas fallback — Firefox, Safari iOS 17-, all others
    if (animationType === 'none') {
      applyThemeChange();
      return;
    }

    if (animationType === 'fade-in-out') {
      document.body.style.transition = 'opacity 0.2s ease';
      document.body.style.opacity    = '0';
      setTimeout(() => {
        applyThemeChange();
        document.body.style.opacity = '1';
        setTimeout(() => {
          document.body.style.transition = '';
        }, 200);
      }, 150);
      return;
    }

    // All other types — canvas circle-spread
    await runCanvasCircleSpread(x, y, duration, applyThemeChange);

  }, [applyThemeChange, runAnimation, animationType, duration]);

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