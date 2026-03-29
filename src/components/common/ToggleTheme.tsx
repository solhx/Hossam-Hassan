'use client';

import { Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  duration?: number;
  animationType?: AnimationType;
}

export const ToggleTheme = ({
  className,
  duration = 400,
  animationType = 'circle-spread',
  ...props
}: ToggleThemeProps) => {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // ✅ FIX: Track injected style for cleanup
  const flipStyleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // ✅ FIX: Clean up flip-x-in style on unmount
  useEffect(() => {
    return () => {
      flipStyleRef.current?.remove();
    };
  }, []);

  const applyThemeChange = useCallback(() => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  }, [isDark]);

  const runAnimation = useCallback(
    (x: number, y: number, maxRadius: number) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // ✅ FIX: Clean up previous flip style before potentially adding new one
      if (flipStyleRef.current) {
        flipStyleRef.current.remove();
        flipStyleRef.current = null;
      }

      const animationConfigs: Record<
        AnimationType,
        (() => void) | undefined
      > = {
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
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        },

        'round-morph': () => {
          document.documentElement.animate(
            [
              { opacity: 0, transform: 'scale(0.8) rotate(5deg)' },
              { opacity: 1, transform: 'scale(1) rotate(0deg)' },
            ],
            {
              duration: duration * 1.2,
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              pseudoElement: '::view-transition-new(root)',
            }
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
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
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
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
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
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
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
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
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
              duration: duration * 1.5,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        },

        'fade-in-out': () => {
          document.documentElement.animate(
            { opacity: [0, 1] },
            {
              duration: duration * 0.5,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        },

        'shrink-grow': () => {
          document.documentElement.animate(
            [
              { transform: 'scale(0.9)', opacity: 0 },
              { transform: 'scale(1)', opacity: 1 },
            ],
            {
              duration: duration * 1.2,
              easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
          document.documentElement.animate(
            [
              { transform: 'scale(1)', opacity: 1 },
              { transform: 'scale(1.05)', opacity: 0 },
            ],
            {
              duration: duration * 1.2,
              easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
              pseudoElement: '::view-transition-old(root)',
            }
          );
        },

        'flip-x-in': () => {
          // ✅ FIX: Track style element for cleanup
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
              from { transform: rotateY(0deg); opacity: 1; }
              to { transform: rotateY(-90deg); opacity: 0; }
            }
            @keyframes flip-in {
              from { transform: rotateY(90deg); opacity: 0; }
              to { transform: rotateY(0deg); opacity: 1; }
            }
          `;
          document.head.appendChild(styleElement);
          flipStyleRef.current = styleElement;

          // ✅ FIX: Auto-cleanup after animation completes
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
              duration: duration * 0.75,
              easing: 'ease-in',
              pseudoElement: '::view-transition-new(root)',
            }
          );
          document.documentElement.animate(
            [
              { clipPath: 'inset(0 0 0 0)', transform: 'none' },
              { clipPath: 'inset(0 40% 0 40%)', transform: 'scale(1.2)' },
              { clipPath: 'inset(0 50% 0 50%)', transform: 'scale(1)' },
            ],
            {
              duration: duration * 1.5,
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              pseudoElement: '::view-transition-old(root)',
            }
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
              duration: duration * 1.5,
              easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        },

        none: undefined,
      };

      animationConfigs[animationType]?.();
    },
    [duration, animationType]
  );

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // Fallback: no View Transitions API or reduced motion
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      applyThemeChange();
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(applyThemeChange);
    });

    await transition.ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    runAnimation(x, y, maxRadius);
  }, [applyThemeChange, runAnimation]);

  return (
    // ✅ FIX: Use <button> instead of <div> for accessibility
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        'p-2 rounded-full transition-colors duration-300',
        'cursor-pointer flex items-center justify-center',
        className
      )}
      {...props}
    >
      {isDark ? (
        <Sun className="text-neutral-500 dark:text-neutral-300" size={18} />
      ) : (
        <Moon className="text-neutral-500 dark:text-neutral-300" size={18} />
      )}
    </button>
    // ✅ FIX: Removed duplicate inline <style> — already in globals.css
  );
};