// src/components/sections/home/projects/StackDotNav.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX W — Light mode dot visibility
// BEFORE: Inactive dots used rgba(255,255,255,0.25) — invisible on
//         light backgrounds (white on near-white).
// AFTER:  Inactive dot color responds to dark/light mode via a
//         CSS custom property set on the nav element.
//         Dark: white/25 (as before)
//         Light: black/20 (visible gray on white background)
//
// FIX X — Focus management
// BEFORE: tabIndex={isActive ? 0 : -1} removed non-active dots
//         from the tab order entirely. Keyboard-only users couldn't
//         navigate to a specific project without cycling through.
// AFTER:  All dots are in tab order (tabIndex={0}).
//         aria-current marks the active dot for AT context.
//         This matches standard pagination/tab component behavior.
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
            // FIX X: All dots keyboard-accessible — no tabIndex=-1
            tabIndex={0}
            aria-label={`Go to project ${i + 1}`}
            aria-current={isActive ? 'step' : undefined}
            className={cn(
              'relative w-2 rounded-full',
              'transition-all duration-500 ease-out',
              'cursor-pointer',
              // Focus ring — visible for keyboard navigation
              'focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-offset-1',
              'focus-visible:ring-white/50 dark:focus-visible:ring-white/50',
              'focus-visible:ring-emerald-500/70',
              // Extended touch target via pseudo-element
              'before:absolute before:inset-[-8px] before:rounded-full before:content-[""]',
            )}
            style={{
              // Height animates via CSS transition — pure CSS, no JS
              height: isActive ? '32px' : '8px',
              // FIX W: Dark/light responsive inactive color
              // Active: always uses accent primary (visible on both)
              // Inactive: dark uses white/25, light uses a dark neutral
              background: isActive
                ? accent.primary
                : undefined,
              // FIX W: Use CSS variable for inactive color
              // Set on the button itself — overrides for active state above
              ...(isActive ? {} : {
                background: 'var(--dot-inactive-color, rgba(255,255,255,0.25))',
              }),
              boxShadow: isActive
                ? `0 0 12px ${accent.primary}80, 0 0 4px ${accent.primary}`
                : 'none',
            }}
          />
        );
      })}

      {/* FIX W: CSS variable for inactive dot color — responds to theme */}
      <style>{`
        :root:not(.dark) nav[aria-label="Project navigation"] button {
          --dot-inactive-color: rgba(0, 0, 0, 0.18);
        }
        .dark nav[aria-label="Project navigation"] button {
          --dot-inactive-color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </nav>
  );
});