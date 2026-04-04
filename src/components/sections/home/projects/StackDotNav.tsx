// src/components/sections/home/projects/StackDotNav.tsx
'use client';

import { memo, useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { cn }                from '@/utils/utils';
import type { Accent }       from './types';

interface StackDotNavProps {
  total:       number;
  activeIndex: number;
  accents:     Accent[];
  onDotClick:  (index: number) => void;
}

// ── Single dot with magnetic hover ────────────────────────────────
const NavDot = memo(function NavDot({
  index,
  isActive,
  accent,
  onDotClick,
}: {
  index:      number;
  isActive:   boolean;
  accent:     Accent;
  onDotClick: (i: number) => void;
}) {
  const scaleValue = useMotionValue(1);
  const scale      = useSpring(scaleValue, { stiffness: 300, damping: 20 });
  const xValue     = useMotionValue(0);
  const x          = useSpring(xValue, { stiffness: 400, damping: 25 });

  const handleMouseEnter = useCallback(() => {
    if (!isActive) {
      scaleValue.set(1.5);
      xValue.set(-3); // slight leftward magnetic pull toward center
    } else {
      scaleValue.set(1.1);
    }
  }, [isActive, scaleValue, xValue]);

  const handleMouseLeave = useCallback(() => {
    scaleValue.set(1);
    xValue.set(0);
  }, [scaleValue, xValue]);

  return (
    <motion.button
      onClick={() => onDotClick(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={isActive ? 0 : -1}
      aria-label={`Navigate to project ${index + 1}`}
      aria-current={isActive ? 'step' : undefined}
      className={cn(
        'relative w-2 rounded-full cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        'before:absolute before:inset-[-10px] before:rounded-full',
      )}
      style={{ x, scale }}
      animate={{
        height:     isActive ? 32 : 8,
        background: isActive ? accent.primary : 'rgba(255,255,255,0.25)',
        boxShadow:  isActive
          ? `0 0 16px ${accent.primary}99, 0 0 6px ${accent.primary}, 0 0 2px ${accent.primary}`
          : 'none',
      }}
      transition={{
        height:     { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        background: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        boxShadow:  { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* UPGRADE: active dot has inner pulse ring */}
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: accent.primary }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
});

export const StackDotNav = memo(function StackDotNav({
  total,
  activeIndex,
  accents,
  onDotClick,
}: StackDotNavProps) {
  return (
    <nav
      aria-label="Project navigation"
      className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
    >
      {Array.from({ length: total }, (_, i) => (
        <NavDot
          key={i}
          index={i}
          isActive={i === activeIndex}
          accent={accents[i % accents.length]}
          onDotClick={onDotClick}
        />
      ))}
    </nav>
  );
});