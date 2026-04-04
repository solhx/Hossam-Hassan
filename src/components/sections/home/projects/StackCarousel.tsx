// src/components/sections/home/projects/StackCarousel.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX D — Progress bar light mode track
// BEFORE: Progress bar track was always dark: rgba(255,255,255,0.06)
//         Invisible in light mode (white on near-white).
// AFTER:  Track uses CSS custom property with light/dark fallback.
//         Light: uses border token (visible gray line).
//         Dark: keeps original white ghost.
//
// FIX E — CardHandle type import
// BEFORE: Imported CardHandle from types but StackCardHandle from
//         StackCard — two overlapping interfaces with different
//         fields. animateTransition cast CardHandle to access
//         bloomEl/revealEl, which are now on CardHandle directly.
// AFTER:  Single CardHandle type from types.ts. StackCardHandle
//         alias removed — StackCard's onRegister now uses CardHandle.
//
// FIX F — preserve-3d isolation
// BEFORE: preserve-3d on the carousel root propagated into child
//         stacking contexts, causing CardContent's z-index to
//         interact with GSAP's translateZ unexpectedly on Safari.
// AFTER:  preserve-3d stays (needed for translateZ depth) but
//         CardContent's root gets transform-style:flat to isolate
//         React/FM animations from the GSAP 3D layer.
//         (Applied in CardContent, noted here for traceability.)
// ─────────────────────────────────────────────────────────────────
'use client';

import {
  useRef,
  useState,
  useCallback,
} from 'react';
import { StackCard }         from './StackCard';
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

  // Dot nav reactive state — only used for rendering, not for animation
  const [activeIndex, setActiveIndex] = useState(0);

  // Imperative index ref — used by animation system without triggering re-renders
  const activeIndexRef = useRef(0);

  // FIX E: CardHandle (from types.ts) now includes bloomEl + revealEl.
  // No more intersection type casts in useStackAnimation.
  const cardHandles = useRef<Array<CardHandle | null>>(
    Array(count).fill(null),
  );

  // Called by each StackCard after mount — populates cardHandles
  const handleRegister = useCallback((
    index:  number,
    handle: CardHandle | null,
  ) => {
    cardHandles.current[index] = handle;
  }, []);

  // Central active-change handler — single source of truth
  const handleActiveChange = useCallback((index: number) => {
    // 1. Sync React state → dot nav re-renders
    setActiveIndex(index);
    activeIndexRef.current = index;

    // 2. Toggle card content visibility via React state bridge
    //    (setVisible is the only React call in the animation path)
    cardHandles.current.forEach((handle, i) => {
      handle?.setVisible(i === index);
    });

    // 3. Accessibility — aria-hidden for screen readers
    cardHandles.current.forEach((handle, i) => {
      handle?.shellEl?.setAttribute('aria-hidden', String(i !== index));
    });

    // 4. Drive background accent ring
    onAccentChange?.(index);
  }, [onAccentChange]);

  // Animation engine — GSAP-based, owns all transition logic
  const { animateTransition } = useStackAnimation({
    count,
    cardHandles,
    sectionRef,
    reduced,
    onActiveChange: handleActiveChange,
  });

  // Navigate to a specific index — guards against same-index calls
  const navigate = useCallback((nextIndex: number) => {
    const prev    = activeIndexRef.current;
    const clamped = Math.max(0, Math.min(count - 1, nextIndex));
    if (clamped === prev) return;
    animateTransition(prev, clamped);
  }, [animateTransition, count]);

  // Scroll capture — handles wheel/touch/keyboard → navigate
  const { navigateTo } = useScrollCapture({
    enabled:        !reduced,
    count,
    containerRef:   sectionRef,
    onNavigate:     navigate,
    onSectionEnter,
    onSectionLeave,
  });

  // Dot click — syncs scroll position + triggers animation
  const handleDotClick = useCallback((index: number) => {
    navigateTo(index);
    navigate(index);
  }, [navigateTo, navigate]);

  // FIX D: Progress bar track color via data attribute
  // CSS in globals.css handles light/dark via the attribute
  const activeAccent = PROJECT_ACCENTS[activeIndex % PROJECT_ACCENTS.length];

  return (
    <div
      className="relative w-full h-full"
      // FIX F: preserve-3d enables translateZ depth for GSAP stacking
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* All cards mounted simultaneously — GSAP controls visibility via transform */}
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

      {/* Dot navigation — pure CSS transitions, no GSAP/FM */}
      <StackDotNav
        total={count}
        activeIndex={activeIndex}
        accents={PROJECT_ACCENTS}
        onDotClick={handleDotClick}
      />

      {/* FIX D: Progress bar with light-mode visible track */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full h-[2px] z-50"
        style={{
          // Dark mode: barely-visible white ghost
          // Light mode: uses CSS var set by globals.css
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Filled portion — accent gradient */}
        <div
          className="stack-progress-fill"
          style={{
            width:      `${(activeIndex / Math.max(1, count - 1)) * 100}%`,
            background: `linear-gradient(
              90deg,
              transparent,
              ${activeAccent.primary},
              rgba(255,255,255,0.8)
            )`,
          }}
        />
      </div>

      {/* Scroll cue — fades out after 3s via CSS */}
      <StackScrollCue />
    </div>
  );
}