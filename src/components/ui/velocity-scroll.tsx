// src/components/ui/velocity-scroll.tsx
'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRef, useEffect } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { cn } from '@/utils/utils';

interface VelocityScrollProps {
  children:         string;
  defaultVelocity?: number;
  className?:       string;
}

export function VelocityScroll({
  children,
  defaultVelocity = 3,
  className,
}: VelocityScrollProps) {
  const reduced = useReducedMotion();
  const baseX   = useMotionValue(0);

  /*
   * FIX: Read scroll from lenis-scroll event instead of useScroll().
   *
   * useScroll() reads window.scrollY directly via its own
   * IntersectionObserver/ResizeObserver. When Lenis is active,
   * window.scrollY is the NATIVE scroll position, but Lenis intercepts
   * scroll events and provides its own smoothed position.
   * Reading window.scrollY gives the unsmoothed position, which is
   * jerky and out of sync with the Lenis-driven GSAP ScrollTrigger.
   *
   * lenis-scroll event fires inside Lenis's RAF loop (which is driven
   * by GSAP's ticker) — same clock as everything else.
   */
  const lenisScrollY   = useMotionValue(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const { scroll } = (e as CustomEvent<{ scroll: number; velocity: number }>).detail;
      lenisScrollY.set(scroll);
    };
    window.addEventListener('lenis-scroll', handler as EventListener);
    return () => window.removeEventListener('lenis-scroll', handler as EventListener);
  }, [lenisScrollY]);

  const scrollVelocity = useVelocity(lenisScrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping:   50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [0, 1000],
    [0, 5],
    { clamp: false },
  );

  const directionFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;

    let moveBy = directionFactor.current * defaultVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);

    if (baseX.get() < -100) baseX.set(0);
    if (baseX.get() > 0)    baseX.set(-100);
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div
        className={cn('flex whitespace-nowrap gap-8 flex-nowrap', className)}
        style={{ x }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="text-5xl sm:text-7xl lg:text-8xl font-black opacity-10 dark:text-neutral-300 text-foreground select-none"
            aria-hidden={i > 0 ? 'true' : undefined}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}