// src/components/ui/number-ticker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn, prefersReducedMotion } from "@/utils/utils";

interface NumberTickerProps {
  value:     number;
  suffix?:   string;
  prefix?:   string;
  duration?: number;
  className?: string;
}

export function NumberTicker({
  value,
  suffix    = "",
  prefix    = "",
  duration  = 2,
  className,
}: NumberTickerProps) {
  const ref      = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [displayValue, setDisplayValue] = useState(0);

  // ✅ Track the last integer we rendered.
  // The RAF loop still runs every frame for timing accuracy,
  // but setState is only called when the floor value changes.
  // This reduces re-renders from ~120/sec to at most value/sec
  // (e.g. a value of 50 = max 50 re-renders over the animation).
  const prevIntRef = useRef(-1);

  useEffect(() => {
    if (!isInView) return;

    // ✅ Skip animation for users who prefer reduced motion —
    // show the final value immediately with no counting effect
    if (prefersReducedMotion()) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    let animationFrame: number;

    const animate = (timestamp: number) => {
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // ✅ Cubic ease-out — identical curve to original
      const eased   = 1 - Math.pow(1 - progress, 3);
      const nextInt = progress < 1
        ? Math.floor(eased * value)
        : value; // ✅ Guarantee exact final value — no floating point drift

      // ✅ Only call setState when the displayed integer changes.
      // Between integer changes, the RAF continues running (for
      // accurate timing) but React does zero reconciliation work.
      if (nextInt !== prevIntRef.current) {
        prevIntRef.current = nextInt;
        setDisplayValue(nextInt);
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    // ✅ Reset ref so the animation starts clean on each trigger
    prevIntRef.current = -1;
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      className={cn("tabular-nums font-bold", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
}