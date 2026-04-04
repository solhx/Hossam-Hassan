// src/components/sections/home/projects/StackCard.tsx
// ─────────────────────────────────────────────────────────────────
// FIXES APPLIED:
//
// FIX 1 — Race Condition (useImperativeHandle removed entirely)
// BEFORE: useImperativeHandle + manual ref assignment = two systems
//         fighting each other. StrictMode double-invoke overwrote
//         refs mid-mount. GSAP received stale/null DOM nodes.
// AFTER:  Single registration point via useEffect after mount.
//         Parent passes onRegister callback (not forwardRef).
//         Cleanup nulls the slot on unmount — no leaks.
//
// FIX 3 — Layout Thrashing (inline zIndex removed)
// BEFORE: shellEl.style.zIndex = String(...) triggers reflow.
//         zIndex reads force the browser to resolve the stacking
//         context before compositing — blocks GPU.
// AFTER:  Initial zIndex set ONCE in CSS (style prop on mount).
//         GSAP never writes zIndex again — uses translateZ for
//         3D stacking order (compositor-only, no reflow).
// ─────────────────────────────────────────────────────────────────
'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  memo,
} from 'react';
import { CardBackground } from './CardBackground';
import { CardContent }    from './CardContent';
import type { Project, Accent } from './types';

// ── Handle type ────────────────────────────────────────────────────
// Flat interface — no forwardRef, no useImperativeHandle.
// Parent receives this via onRegister callback after mount.
export interface StackCardHandle {
  shellEl:   HTMLDivElement | null;
  imageEl:   HTMLDivElement | null;
  bloomEl:   HTMLDivElement | null;
  revealEl:  HTMLDivElement | null;
  setVisible: (v: boolean) => void;
}

interface StackCardProps {
  project:    Project;
  index:      number;
  accent:     Accent;
  total:      number;
  reduced:    boolean;
  isFirst:    boolean;
  // FIX 1: Registration callback replaces forwardRef entirely
  // Called once after mount with populated DOM refs + setVisible
  // Called with null on unmount for clean slot nulling
  onRegister: (index: number, handle: StackCardHandle | null) => void;
}

// memo: only re-renders when isFirst or project changes
// index/accent/total are stable after mount
export const StackCard = memo(function StackCard({
  project,
  index,
  accent,
  total,
  reduced,
  isFirst,
  onRegister,
}: StackCardProps) {

  // ── GSAP-owned DOM refs ────────────────────────────────────────
  const shellRef  = useRef<HTMLDivElement>(null);
  const imageRef  = useRef<HTMLDivElement>(null);
  const bloomRef  = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  // ── React-owned visibility state ──────────────────────────────
  const [isVisible, setIsVisible] = useState(isFirst);

  // Stable identity — never recreated after mount
  const setVisible = useCallback((v: boolean) => {
    setIsVisible(v);
  }, []);

// ── FIX 11: StrictMode + will-change fix ──────────────────────
// Guard prevents double-register. will-change:auto cleanup.
const registeredRef = useRef(false);

useEffect(() => {
  const handle = {
    shellEl:   shellRef.current,
    imageEl:   imageRef.current,
    bloomEl:   bloomRef.current,
    revealEl:  revealRef.current,
    setVisible,
  };
  if (handle.shellEl && !registeredRef.current) {
    registeredRef.current = true;
    onRegister(index, handle);
    // Activate compositor layer
    if (shellRef.current) shellRef.current.style.willChange = 'transform';
  }
  return () => {
    registeredRef.current = false;
    onRegister(index, null);
    // Reset layer — prevent memory bloat
    if (shellRef.current) shellRef.current.style.willChange = 'auto';
  };
}, [index]); // onRegister stable via parent []

  return (
    // ── Shell: GSAP-owned ─────────────────────────────────────────
    //
    // FIX 3: zIndex set ONCE here as initial inline style.
    // GSAP NEVER writes zIndex after this — uses translateZ instead.
    //
    // WHY translateZ for stacking:
    // translateZ creates depth in the 3D compositing layer.
    // z-index writes trigger stacking context recalculation
    // which forces a layout pass. translateZ is compositor-only.
    //
    // Initial values:
    // isFirst → z: 0 (front, no depth offset needed)
    // others  → z: -index * 10 (pushed back proportionally)
    // GSAP will set exact translateZ values on first init
    <div
      ref={shellRef}
      aria-hidden={!isFirst}
      className="absolute inset-0 will-change-transform"  // Phase 3b: static compositor hint
      style={{
        // FIX 3: One-time zIndex to establish initial stacking.
        zIndex:          isFirst ? 10 : Math.max(1, 5 - index),
        transform:       'scale(1) translateY(0px) translateZ(0)',
        transformOrigin: 'center center',
        backfaceVisibility:        'hidden',
        WebkitBackfaceVisibility:  'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
      }}
    >

      {/* Background gradient layer — GSAP parallax target */}
      <CardBackground
        accent={accent}
        index={index}
        imageRef={(el) => {
          (imageRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
      />

      {/* Clip-path reveal wrapper — GSAP wipe animation target */}
      <div
        ref={revealRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transform:  'translateZ(0)',
          clipPath:   'inset(0% 0% 0% 0% round 24px)',  // Phase 3a: Consistent round
        }}
      >
        {/* Content: React/FM only — GSAP never enters this subtree */}
        <CardContent
          project={project}
          index={index}
          accent={accent}
          total={total}
          isVisible={isVisible}
          reduced={reduced}
        />
      </div>

      {/* Bloom burst — GSAP: scale + brightness (no opacity) */}
      <div
        ref={bloomRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-full will-change-transform"
        style={{
          transform:  'scale(0.5) translateZ(0)',
          filter:     'brightness(0)',
          background: `radial-gradient(circle at 50% 50%, rgba(${accent.bloomRgb},0.22) 0%, transparent 70%)`,
          zIndex:     50,
        }}
      />

    </div>
  );
});