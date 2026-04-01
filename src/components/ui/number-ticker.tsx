"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/utils/utils";

interface NumberTickerProps {
  value:     number;
  suffix?:   string;
  prefix?:   string;
  duration?: number;
  className?: string;
}

export function NumberTicker({
  value,
  suffix   = "",
  prefix   = "",
  duration = 2,
  className,
}: NumberTickerProps) {
  const ref      = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // ✅ Start at value immediately if reduced motion is preferred —
  // avoids counting animation for users who find it distracting.
  // For normal users, start at 0 and count up.
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // ✅ Respect prefers-reduced-motion — skip animation entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    let animationFrame: number;

    const animate = (timestamp: number) => {
      const progress = Math.min(
        (timestamp - startTime) / (duration * 1000),
        1,
      );
      // Cubic ease-out — fast start, smooth finish
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // ✅ Guarantee exact final value
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      className={cn(
        // ✅ tabular-nums built-in — each digit same width, no layout shift
        // ✅ font-bold built-in — consistent weight
        "tabular-nums font-bold",
        className,
      )}
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