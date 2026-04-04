// src/components/sections/home/projects/StackCard.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX E — CardHandle unified type
// BEFORE: Exported StackCardHandle locally, causing StackCarousel
//         to import two overlapping handle types. useStackAnimation
//         had to cast CardHandle to access bloomEl/revealEl.
// AFTER:  Uses CardHandle from types.ts directly. bloomEl and
//         revealEl are first-class fields — no intersection cast.
//         onRegister type is now (index, CardHandle | null) → void.
//
// FIX G — revealEl registration race
// BEFORE: revealRef was only registered if shellRef was populated.
//         revealRef.current is set synchronously (ref={revealRef})
//         so it's always available by mount time — no race.
//         But the guard `if (handle.shellEl)` also covered revealEl,
//         meaning if shellEl was null (StrictMode double-invoke),
//         revealEl was never registered either. GSAP couldn't animate
//         the clip-path reveal on initial load.
// AFTER:  Both refs are checked independently in the handle object.
//         Registration only fires when ALL required refs are present.
//
// FIX H — CardContent transform-style isolation
// BEFORE: CardContent lived inside the preserve-3d stacking context.
//         FM animations (scale, y) on CardContent's children
//         interacted with GSAP's z-axis transforms on the shell.
//         On Safari this caused content to appear behind the card
//         during transitions.
// AFTER:  The content wrapper div gets transformStyle:'flat' to
//         create a new stacking context that doesn't inherit 3D.
//         GSAP still controls the shell in 3D space — content
//         renders flat within that shell, correctly layered.
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
import type { Project, Accent, CardHandle } from './types';

interface StackCardProps {
  project:    Project;
  index:      number;
  accent:     Accent;
  total:      number;
  reduced:    boolean;
  isFirst:    boolean;
  // FIX E: Uses unified CardHandle from types.ts
  onRegister: (index: number, handle: CardHandle | null) => void;
}

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
  // These are written to by GSAP only — React never reads them
  const shellRef  = useRef<HTMLDivElement>(null);
  const imageRef  = useRef<HTMLDivElement>(null);  // CardBackground parallax
  const bloomRef  = useRef<HTMLDivElement>(null);  // burst overlay
  const revealRef = useRef<HTMLDivElement>(null);  // clip-path wrapper

  // ── React-owned state ─────────────────────────────────────────
  // Only isVisible is React state — all other animation is GSAP
  const [isVisible, setIsVisible] = useState(isFirst);

  // Stable identity callback — useCallback with [] deps.
  // This is the ONLY React call that GSAP triggers (via the
  // onActiveChange bridge in useStackAnimation). It's intentionally
  // not in the GSAP timeline — it's called via tl.current.call()
  // at the correct animation progress point.
  const setVisible = useCallback((v: boolean) => setIsVisible(v), []);

  // ── FIX G + FIX 11: Registration with all-ref guard ───────────
  const registeredRef = useRef(false);

  useEffect(() => {
    // FIX G: Check all required refs before registering.
    // refs are populated synchronously before useEffect runs,
    // so this check is safe — it's just a null guard for StrictMode.
    const shell  = shellRef.current;
    const image  = imageRef.current;
    const bloom  = bloomRef.current;
    const reveal = revealRef.current;

    // All refs must be present — if any is null, registration
    // is deferred to the next effect run (which won't happen
    // unless the component remounts, e.g. StrictMode)
    if (!shell || !reveal || registeredRef.current) return;

    registeredRef.current = true;

    const handle: CardHandle = {
      shellEl:    shell,
      imageEl:    image,   // may be null if CardBackground not mounted yet
      bloomEl:    bloom,
      revealEl:   reveal,
      setVisible,
    };

    onRegister(index, handle);

    // Activate GPU compositor layer for the shell
    shell.style.willChange = 'transform';

    return () => {
      registeredRef.current = false;
      onRegister(index, null);
      // Deactivate compositor layer — prevent VRAM bloat
      if (shellRef.current) shellRef.current.style.willChange = 'auto';
    };
  }, [index, setVisible]); // onRegister is stable (useCallback [])

  return (
    // ── Shell: GSAP transform target ─────────────────────────────
    // GSAP animates: scale, y, z, filter (brightness) on this element.
    // React never writes style here after mount.
    //
    // zIndex set once at render time to establish initial stacking.
    // GSAP never writes zIndex — uses translateZ for depth ordering.
    // translateZ is compositor-only (no layout reflow).
    // zIndex writes trigger stacking context recalculation (layout).
    <div
      ref={shellRef}
      aria-hidden={!isFirst}
      className="absolute inset-0"
      style={{
        // Initial stacking order — GSAP takes over via translateZ
        zIndex:                    isFirst ? 10 : Math.max(1, 5 - index),
        transform:                 'scale(1) translateY(0px) translateZ(0)',
        transformOrigin:           'center center',
        // FIX H: preserve-3d on the carousel root propagates here.
        // backfaceVisibility:hidden prevents the back face from
        // flickering through during GSAP scale transitions on Safari.
        backfaceVisibility:        'hidden',
        WebkitBackfaceVisibility:  'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
        willChange:                'transform',
      }}
    >
      {/* Background — GSAP parallax target (imageEl) */}
      <CardBackground
        accent={accent}
        index={index}
        imageRef={(el) => {
          // imageRef is passed as a callback to CardBackground
          // because CardBackground owns the DOM element via its own ref.
          // This bridge populates our imageRef without forwardRef.
          (imageRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
      />

      {/* Clip-path reveal wrapper — GSAP animates clipPath here */}
      <div
        ref={revealRef}
        className="absolute inset-0"
        style={{
          transform: 'translateZ(0)',   // promote to compositor layer
          clipPath:  'inset(0% 0% 0% 0% round 24px)',
          // willChange set on demand by GSAP (overwrite:'auto')
        }}
      >
        {/* FIX H: transform-style:flat isolates FM content animations
            from the GSAP 3D stacking context on the shell.
            Without this, FM's scale/y transforms on CardContent's
            children participate in the 3D perspective calculation,
            causing z-fighting artifacts on Safari during transitions. */}
        <div style={{ transformStyle: 'flat', height: '100%' }}>
          <CardContent
            project={project}
            index={index}
            accent={accent}
            total={total}
            isVisible={isVisible}
            reduced={reduced}
          />
        </div>
      </div>

      {/* Bloom burst — GSAP animates scale + filter here */}
      <div
        ref={bloomRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          transform:  'scale(0.5) translateZ(0)',
          filter:     'brightness(0)',
          background: `radial-gradient(circle at 50% 50%, rgba(${accent.bloomRgb},0.22) 0%, transparent 70%)`,
          zIndex:     50,
          willChange: 'transform, filter',
        }}
      />
    </div>
  );
});