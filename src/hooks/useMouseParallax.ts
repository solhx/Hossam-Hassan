// ✅ FIXED — src/hooks/useMouseParallax.ts
'use client';

import { useEffect, useMemo } from 'react';
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { prefersReducedMotion } from '@/utils/utils';

interface ParallaxValues {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  // ✅ Pre-computed values at fixed ranges — no hook-in-function violation
  layerX: MotionValue<number>; // range = xRange param
  layerY: MotionValue<number>; // range = yRange param
  layerXSlow: MotionValue<number>; // range = xRange * 0.55 (for ribbons)
  layerYSlow: MotionValue<number>; // range = yRange * 0.55 (for ribbons)
  rotateY: MotionValue<number>;
  rotateX: MotionValue<number>;
}

export function useMouseParallax(
  stiffness = 40,
  damping = 25,
  xRange = 35,
  yRange = 25,
): ParallaxValues {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = useMemo(
    () => ({ stiffness, damping, mass: 0.6 }),
    [stiffness, damping],
  );

  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // ✅ All useTransform calls at top level — no Rules of Hooks violation
  const layerX     = useTransform(springX, [-1, 1], [xRange,        -xRange]);
  const layerY     = useTransform(springY, [-1, 1], [yRange,        -yRange]);
  const layerXSlow = useTransform(springX, [-1, 1], [xRange * 0.55, -(xRange * 0.55)]);
  const layerYSlow = useTransform(springY, [-1, 1], [yRange * 0.55, -(yRange * 0.55)]);
  const rotateY    = useTransform(springX, [-1, 1], [-2, 2]);
  const rotateX    = useTransform(springY, [-1, 1], [2, -2]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const x = (e.clientX / window.innerWidth)  * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        mouseX.set(x);
        mouseY.set(y);
      });
    };

    // ✅ passive: true — improves scroll performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  return {
    mouseX,
    mouseY,
    springX,
    springY,
    layerX,
    layerY,
    layerXSlow,
    layerYSlow,
    rotateY,
    rotateX,
  };
}