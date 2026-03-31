"use client";
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cn } from "@/utils/utils";

interface VelocityScrollProps {
  children: string;
  defaultVelocity?: number;
  className?: string;
}

export function VelocityScroll({
  children,
  defaultVelocity = 3,
  className,
}: VelocityScrollProps) {
   const reduced = useReducedMotion(); 
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });
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
    if (baseX.get() > 0) baseX.set(-100);
  });

  const x = useTransform(baseX, (v) => `${v}%`);
  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div
        className={cn('flex whitespace-nowrap gap-8 flex-nowrap', className)}
        style={{ x }}
      >
        {Array.from({ length: 4 }).map((_, i) => ( // ✅ Was 6, now 4
          <span
            key={i}
            className="text-5xl sm:text-7xl lg:text-8xl font-black opacity-10 dark:text-neutral-300 text-foreground select-none"
            aria-hidden={i > 0 ? 'true' : undefined} // ✅ Only first is readable
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}