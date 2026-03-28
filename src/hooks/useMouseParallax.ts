'use client';

import { useEffect } from 'react';
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
  layerX: (range: number) => MotionValue<number>;
  layerY: (range: number) => MotionValue<number>;
  rotateY: MotionValue<number>;
  rotateX: MotionValue<number>;
}

export function useMouseParallax(
  stiffness = 40,
  damping = 25
): ParallaxValues {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness, damping, mass: 0.6 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 16);

      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [mouseX, mouseY]);

  const rotateY = useTransform(springX, [-1, 1], [-2, 2]);
  const rotateX = useTransform(springY, [-1, 1], [2, -2]);

  const layerX = (range: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(springX, [-1, 1], [range, -range]);
  const layerY = (range: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(springY, [-1, 1], [range, -range]);

  return {
    mouseX,
    mouseY,
    springX,
    springY,
    layerX,
    layerY,
    rotateY,
    rotateX,
  };
}