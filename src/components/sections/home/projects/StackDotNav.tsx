// src/components/sections/home/projects/StackDotNav.tsx
// ─────────────────────────────────────────────────────────────────
// Dot navigation indicator — pure CSS transitions, no GSAP, no FM
// Listens to activeIndex via prop (from React state in StackCarousel)
// ─────────────────────────────────────────────────────────────────
import { memo }  from 'react';
import { cn }    from '@/utils/utils';
import type { Accent } from './types';

interface StackDotNavProps {
  total:       number;
  activeIndex: number;
  accents:     Accent[];
  onDotClick:  (index: number) => void;
}

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
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === activeIndex;
        const accent   = accents[i % accents.length];

        return (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            tabIndex={isActive ? 0 : -1} // FIX 18: Focus only active dot, prevent trap
            aria-label={`Navigate to project ${i + 1}`}
            aria-current={isActive ? 'step' : undefined}
            className={cn(
              'relative w-2 rounded-full',
              'transition-all duration-500 ease-out',
              'cursor-pointer focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-white/50',
              // Touch target
              'before:absolute before:inset-[-8px] before:rounded-full',
            )}
            style={{
              // Height animates via CSS transition — no GSAP needed
              height:     isActive ? '32px' : '8px',
              background: isActive ? accent.primary : 'rgba(255,255,255,0.25)',
              // Glow effect on active dot — CSS box-shadow, not GSAP
              boxShadow:  isActive
                ? `0 0 12px ${accent.primary}80, 0 0 4px ${accent.primary}`
                : 'none',
            }}
          />
        );
      })}
    </nav>
  );
});