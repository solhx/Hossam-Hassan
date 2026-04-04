// src/components/sections/home/projects/StackCarousel.tsx
'use client';

import {
  useRef,
  useState,
  useCallback,
} from 'react';
import { StackCard }         from './StackCard';
import type { StackCardHandle } from './StackCard';
import { StackDotNav }       from './StackDotNav';
import { StackScrollCue }    from './StackScrollCue';
import { useStackAnimation } from './useStackAnimation';
import { useScrollCapture }  from './useScrollCapture';
import { PROJECT_ACCENTS }   from './constants';
import type { CardHandle, Project } from './types';

interface StackCarouselProps {
  projects:        Project[];
  sectionRef:      React.RefObject<HTMLElement | null>;
  reduced:         boolean;
  onSectionEnter?: () => void;
  onSectionLeave?: () => void;
  onAccentChange?: (index: number) => void;
}

export function StackCarousel({
  projects,
  sectionRef,
  reduced,
  onSectionEnter,
  onSectionLeave,
  onAccentChange,
}: StackCarouselProps) {
  const count = projects.length;

  // ── Dot nav state ──────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // ── Card handles — populated by onRegister callback ───────────
  const cardHandles = useRef<Array<StackCardHandle | null>>(
    Array(count).fill(null),
  );

  // ── Registration callback ──────────────────────────────────────
  const handleRegister = useCallback((
    index: number,
    handle: StackCardHandle | null,
  ) => {
    cardHandles.current[index] = handle;
  }, []);

  // ── Active change handler ──────────────────────────────────────
  const handleActiveChange = useCallback((index: number) => {
    // 1. Dot nav update
    setActiveIndex(index);
    activeIndexRef.current = index;

    // 2. Toggle card content visibility
    cardHandles.current.forEach((handle, i) => {
      handle?.setVisible(i === index);
    });

    // 3. Accessibility
    cardHandles.current.forEach((handle, i) => {
      if (handle?.shellEl) {
        handle.shellEl.setAttribute('aria-hidden', String(i !== index));
      }
    });

    // 4. Background accent
    onAccentChange?.(index);
  }, [onAccentChange]);

  // ── Animation system ───────────────────────────────────────────
  const { animateTransition } = useStackAnimation({
    count,
    cardHandles: cardHandles as React.MutableRefObject<(CardHandle | null)[]>,
    sectionRef,
    reduced,
    onActiveChange: handleActiveChange,
  });

  // ── Navigate ───────────────────────────────────────────────────
  const navigate = useCallback((nextIndex: number) => {
    const prev = activeIndexRef.current;
    if (nextIndex === prev) return;
    const clamped = Math.max(0, Math.min(count - 1, nextIndex));
    animateTransition(prev, clamped);
  }, [animateTransition, count]);

  // ── Scroll capture ─────────────────────────────────────────────
  const { navigateTo } = useScrollCapture({
    enabled:        !reduced,
    count,
    containerRef:   sectionRef,
    onNavigate:     navigate,
    onSectionEnter,
    onSectionLeave,
  });

  // ── Dot nav click ──────────────────────────────────────────────
  const handleDotClick = useCallback((index: number) => {
    navigateTo(index);
    navigate(index);
  }, [navigateTo, navigate]);

  return (
    // FIX 2: preserve-3d enables translateZ depth stacking.
    // Without this GSAP's z: -depthLevel * 20 is silently ignored
    // by the browser — all cards collapse to the same depth plane
    // and z-index values fight each other causing unpredictable layering.
    <div
      className="relative w-full h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >

      {/* Card stack — all cards mounted, never unmounted */}
      {projects.map((project, index) => {
        const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
        return (
          <StackCard
            key={project.id}
            project={project}
            index={index}
            accent={accent}
            total={count}
            reduced={reduced}
            isFirst={index === 0}
            onRegister={handleRegister}
          />
        );
      })}

      {/* Dot navigation */}
      <StackDotNav
        total={count}
        activeIndex={activeIndex}
        accents={PROJECT_ACCENTS}
        onDotClick={handleDotClick}
      />

      {/* Progress bar */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full h-[2px] z-50"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="stack-progress-fill"
          style={{
            width: `${(activeIndex / Math.max(1, count - 1)) * 100}%`,
            background: `linear-gradient(
              90deg,
              transparent,
              ${PROJECT_ACCENTS[activeIndex % PROJECT_ACCENTS.length].primary},
              rgba(255,255,255,0.8)
            )`,
          }}
        />
      </div>

      <StackScrollCue />
    </div>
  );
}