// src/components/ui/project-panel-bg.tsx
'use client';

import { memo, useEffect, useRef } from 'react';

const PANEL_THEMES = [
  // 0 — Emerald (hue 162)
  {
    darkBase:  'oklch(0.10 0.015 162)',
    lightBase: 'oklch(0.96 0.012 162)',
    darkOrb1:  'oklch(0.35 0.13 162)',
    lightOrb1: 'oklch(0.80 0.09 162)',
    darkOrb2:  'oklch(0.20 0.07 175)',
    lightOrb2: 'oklch(0.87 0.05 175)',
    darkOrb3:  'oklch(0.16 0.05 148)',
    lightOrb3: 'oklch(0.91 0.03 148)',
    darkMesh:  'oklch(0.25 0.09 162)',
    lightMesh: 'oklch(0.76 0.07 162)',
  },
  // 1 — Teal (hue 185)
  {
    darkBase:  'oklch(0.10 0.014 185)',
    lightBase: 'oklch(0.96 0.011 185)',
    darkOrb1:  'oklch(0.34 0.12 185)',
    lightOrb1: 'oklch(0.79 0.09 185)',
    darkOrb2:  'oklch(0.20 0.07 200)',
    lightOrb2: 'oklch(0.87 0.05 200)',
    darkOrb3:  'oklch(0.16 0.05 168)',
    lightOrb3: 'oklch(0.91 0.03 168)',
    darkMesh:  'oklch(0.25 0.09 185)',
    lightMesh: 'oklch(0.75 0.07 185)',
  },
  // 2 — Lime (hue 128)
  {
    darkBase:  'oklch(0.10 0.014 128)',
    lightBase: 'oklch(0.97 0.012 128)',
    darkOrb1:  'oklch(0.38 0.14 128)',
    lightOrb1: 'oklch(0.83 0.10 128)',
    darkOrb2:  'oklch(0.22 0.07 145)',
    lightOrb2: 'oklch(0.89 0.05 145)',
    darkOrb3:  'oklch(0.17 0.05 110)',
    lightOrb3: 'oklch(0.92 0.03 110)',
    darkMesh:  'oklch(0.27 0.10 128)',
    lightMesh: 'oklch(0.78 0.08 128)',
  },
  // 3 — Green (hue 142)
  {
    darkBase:  'oklch(0.10 0.015 142)',
    lightBase: 'oklch(0.96 0.012 142)',
    darkOrb1:  'oklch(0.36 0.13 142)',
    lightOrb1: 'oklch(0.81 0.09 142)',
    darkOrb2:  'oklch(0.21 0.07 158)',
    lightOrb2: 'oklch(0.88 0.05 158)',
    darkOrb3:  'oklch(0.16 0.05 125)',
    lightOrb3: 'oklch(0.91 0.03 125)',
    darkMesh:  'oklch(0.26 0.09 142)',
    lightMesh: 'oklch(0.77 0.07 142)',
  },
  // 4 — Cyan-green (hue 175)
  {
    darkBase:  'oklch(0.10 0.013 175)',
    lightBase: 'oklch(0.96 0.011 175)',
    darkOrb1:  'oklch(0.34 0.12 175)',
    lightOrb1: 'oklch(0.80 0.08 175)',
    darkOrb2:  'oklch(0.20 0.07 190)',
    lightOrb2: 'oklch(0.87 0.05 190)',
    darkOrb3:  'oklch(0.16 0.05 158)',
    lightOrb3: 'oklch(0.91 0.03 158)',
    darkMesh:  'oklch(0.25 0.08 175)',
    lightMesh: 'oklch(0.76 0.07 175)',
  },
  // 5 — Mint (hue 155)
  {
    darkBase:  'oklch(0.10 0.014 155)',
    lightBase: 'oklch(0.96 0.011 155)',
    darkOrb1:  'oklch(0.35 0.12 155)',
    lightOrb1: 'oklch(0.80 0.09 155)',
    darkOrb2:  'oklch(0.21 0.07 170)',
    lightOrb2: 'oklch(0.87 0.05 170)',
    darkOrb3:  'oklch(0.16 0.05 138)',
    lightOrb3: 'oklch(0.91 0.03 138)',
    darkMesh:  'oklch(0.25 0.09 155)',
    lightMesh: 'oklch(0.76 0.07 155)',
  },
] as const;

interface ProjectPanelBgProps {
  index:    number;
  isActive: boolean;
}

export const ProjectPanelBg = memo(function ProjectPanelBg({
  index,
  isActive,
}: ProjectPanelBgProps) {
  const t = PANEL_THEMES[index % PANEL_THEMES.length];

  // ─── Refs for imperative animation pause/resume ───────────────
  // WHY: CSS animation-play-state is the ONLY way to pause a CSS
  // @keyframes animation without removing it from the DOM.
  // Using React state to toggle it causes a re-render + style
  // recalculation — exactly what we're trying to avoid.
  // Direct DOM mutation via ref is instantaneous and paint-only.
  const orbARef  = useRef<HTMLDivElement>(null);
  const orbBRef  = useRef<HTMLDivElement>(null);
  const orbCRef  = useRef<HTMLDivElement>(null);
  const meshRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ✅ CRITICAL FIX: Pause CSS animations on inactive panels.
    //
    // Original: ALL 6 panels animate simultaneously (24 GPU layers).
    // The browser hits its compositor layer budget and emergency-flattens
    // layers mid-scroll → visual flicker.
    //
    // Fix: Only the active panel runs animations. Inactive panels are
    // frozen via animation-play-state: paused. This reduces live GPU
    // layers from 24 → 4 (3 orbs + 1 mesh for the active panel only).
    //
    // animation-play-state:paused does NOT reset the animation —
    // it freezes it in place. When the panel becomes active again,
    // it resumes from where it stopped, so there's no jump.
    const state = isActive ? 'running' : 'paused';

    const els = [orbARef.current, orbBRef.current, orbCRef.current, meshRef.current];
    for (const el of els) {
      if (el) el.style.animationPlayState = state;
    }
  }, [isActive]);

  // ✅ CSS custom properties — set once, never change per render.
  // These drive the panel-bg__* classes in globals.css.
  const cssVars = {
    '--pb-base-dark':  t.darkBase,
    '--pb-base-light': t.lightBase,
    '--pb-orb1-dark':  t.darkOrb1,
    '--pb-orb1-light': t.lightOrb1,
    '--pb-orb2-dark':  t.darkOrb2,
    '--pb-orb2-light': t.lightOrb2,
    '--pb-orb3-dark':  t.darkOrb3,
    '--pb-orb3-light': t.lightOrb3,
    '--pb-mesh-dark':  t.darkMesh,
    '--pb-mesh-light': t.lightMesh,
  } as React.CSSProperties;

  return (
    <div
      className="panel-bg absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={cssVars}
    >
      {/* ── Layer 1: Base ── */}
      <div className="panel-bg__base absolute inset-0" />

      {/* ── Layer 2: Mesh gradient ── */}
      <div
        ref={meshRef}
        className="panel-bg__mesh absolute inset-[-20%] pointer-events-none"
        style={{
          backgroundSize: '200% 200%',
          // ✅ FIX: Remove willChange:'background-position'.
          //
          // willChange on a background-position animation promotes the
          // element to a compositor layer. But background-position is NOT
          // a compositor-eligible property — the browser promotes it,
          // then has to repaint it on the GPU every frame anyway.
          // Net result: you get ALL the memory cost of a compositor layer
          // with NONE of the performance benefit.
          //
          // The animation is purely visual (slowly shifting gradient).
          // It runs fine as a regular paint-layer update.
          animationName:            'gradient-shift',
          animationDuration:        '14s',
          animationTimingFunction:  'ease',
          animationIterationCount:  'infinite',
          animationDelay:           `${index * -2.3}s`,
          // ✅ Start paused — useEffect above will set to 'running' if active.
          // This prevents a 1-frame flash of the running state before the
          // effect fires (especially on panel index 0 which starts active).
          animationPlayState:       isActive ? 'running' : 'paused',
          animationFillMode:        'none',
          // ✅ FIX: Remove animationFillMode:'both'.
          //
          // 'both' tells the browser to apply the first keyframe BEFORE
          // the animation starts (forwards) and the last keyframe AFTER
          // it ends (backwards). On a panel that starts inactive, 'both'
          // forces the browser to compute and hold the keyframe state even
          // while paused — wasting GPU memory. 'none' means the element
          // uses its natural style when not in an active keyframe range.
        }}
      />

      {/* ── Layer 3: Orb A ── */}
      <div
        ref={orbARef}
        className="panel-bg__orb panel-bg__orb--a absolute rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          width:  '65%',
          height: '65%',
          left:   '25%',
          top:    '55%',
          // ✅ FIX: Merge translate into transform.
          //
          // Original used BOTH the CSS `translate` shorthand property
          // AND a `transform` property on the same element. These are
          // SEPARATE CSS properties that the browser applies in sequence:
          //   1. translate: '-50% -50%'  (CSS translate property)
          //   2. transform: 'translateZ(0)' (CSS transform property)
          //
          // The CSS transform property DOES NOT include the translate
          // property's effect — they stack independently. This means
          // the element was being translated twice AND promoted to a
          // compositor layer that didn't account for the first translate.
          // Result: incorrect position + layer bounds mismatch → flicker.
          //
          // Fix: put everything into a single transform. The browser
          // creates ONE compositor layer with the correct bounds.
          transform: 'translate(-50%, -50%) translateZ(0)',
          // ✅ Keep will-change ONLY on the active panel's orbs.
          // useEffect sets animationPlayState; we also need will-change
          // to be present for the compositor to pre-promote the layer
          // BEFORE the first animation frame. But only for active panels.
          // Inactive panels should NOT have will-change — it wastes GPU.
          // We handle this via the 'panel-bg__orb' class in CSS below.
          animationName:           'panel-orb-a',
          animationDuration:       `${18 + index * 1.5}s`,
          animationDelay:          `${index * -3.1}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode:       'none', // ✅ was 'both' — see mesh note above
          animationPlayState:      isActive ? 'running' : 'paused',
        }}
      />

      {/* ── Layer 3: Orb B ── */}
      <div
        ref={orbBRef}
        className="panel-bg__orb panel-bg__orb--b absolute rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          width:  '45%',
          height: '45%',
          left:   '72%',
          top:    '35%',
          transform: 'translate(-50%, -50%) translateZ(0)', // ✅ merged
          animationName:           'panel-orb-b',
          animationDuration:       `${14 + index * 1.2}s`,
          animationDelay:          `${index * -1.7}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode:       'none',
          animationPlayState:      isActive ? 'running' : 'paused',
        }}
      />

      {/* ── Layer 3: Orb C ── */}
      <div
        ref={orbCRef}
        className="panel-bg__orb panel-bg__orb--c absolute rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          width:  '30%',
          height: '30%',
          left:   '55%',
          top:    '75%',
          transform: 'translate(-50%, -50%) translateZ(0)', // ✅ merged
          animationName:           'panel-orb-c',
          animationDuration:       `${11 + index * 0.9}s`,
          animationDelay:          `${index * -2.5}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode:       'none',
          animationPlayState:      isActive ? 'running' : 'paused',
        }}
      />

      {/* ── Layer 4: Grain ── */}
      {/*
        ✅ FIX: Render grain as a CSS background on a pseudo-element
        via a utility class instead of inline SVG data URI.

        The inline SVG data URI is re-parsed by the browser on every
        render because React treats inline style objects as new references.
        Even though memo() prevents React re-renders, parent clipPath
        changes (from GSAP) cause the browser to re-evaluate style
        inheritance for all children — re-parsing the SVG each time.

        Moving it to a CSS class means it's parsed ONCE at stylesheet
        load time and cached as a style rule.
      */}
      <div
        className="panel-bg__grain absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Layer 5: Grid lines ── */}
      <div
        className="panel-bg__grid absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 85% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
    </div>
  );
});