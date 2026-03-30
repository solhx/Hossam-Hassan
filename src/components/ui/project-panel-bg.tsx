'use client';

import { memo } from 'react';

// ─── Per-project color seeds ──────────────────────────────────
// We use CSS custom properties scoped per panel index so
// Tailwind dark: variants can switch them without any JS.
// Each panel gets a data-panel-index attribute and the
// CSS variables are set via inline style — static values
// that never change, so zero hydration issues.
const PANEL_THEMES = [
  // 0 — Emerald
  {
    darkBase:  'oklch(0.13 0 0)',
    lightBase: 'oklch(0.96 0.012 162)',
    darkOrb1:  'oklch(0.38 0.12 162)',
    lightOrb1: 'oklch(0.82 0.09 162)',
    darkOrb2:  'oklch(0.22 0.07 195)',
    lightOrb2: 'oklch(0.88 0.05 195)',
    darkOrb3:  'oklch(0.18 0.05 250)',
    lightOrb3: 'oklch(0.91 0.03 250)',
    darkMesh:  'oklch(0.28 0.09 162)',
    lightMesh: 'oklch(0.78 0.07 162)',
  },
  // 1 — Indigo
  {
    darkBase:  'oklch(0.12 0.01 265)',
    lightBase: 'oklch(0.95 0.015 265)',
    darkOrb1:  'oklch(0.35 0.14 265)',
    lightOrb1: 'oklch(0.80 0.10 265)',
    darkOrb2:  'oklch(0.22 0.08 290)',
    lightOrb2: 'oklch(0.87 0.06 290)',
    darkOrb3:  'oklch(0.18 0.05 220)',
    lightOrb3: 'oklch(0.92 0.03 220)',
    darkMesh:  'oklch(0.27 0.10 265)',
    lightMesh: 'oklch(0.76 0.08 265)',
  },
  // 2 — Amber
  {
    darkBase:  'oklch(0.13 0.01 75)',
    lightBase: 'oklch(0.96 0.015 75)',
    darkOrb1:  'oklch(0.40 0.12 75)',
    lightOrb1: 'oklch(0.85 0.09 75)',
    darkOrb2:  'oklch(0.24 0.07 50)',
    lightOrb2: 'oklch(0.90 0.06 50)',
    darkOrb3:  'oklch(0.19 0.05 30)',
    lightOrb3: 'oklch(0.93 0.03 30)',
    darkMesh:  'oklch(0.30 0.09 75)',
    lightMesh: 'oklch(0.80 0.07 75)',
  },
  // 3 — Pink
  {
    darkBase:  'oklch(0.13 0.01 340)',
    lightBase: 'oklch(0.96 0.012 340)',
    darkOrb1:  'oklch(0.38 0.13 340)',
    lightOrb1: 'oklch(0.83 0.09 340)',
    darkOrb2:  'oklch(0.22 0.07 315)',
    lightOrb2: 'oklch(0.89 0.05 315)',
    darkOrb3:  'oklch(0.18 0.05 290)',
    lightOrb3: 'oklch(0.92 0.03 290)',
    darkMesh:  'oklch(0.28 0.09 340)',
    lightMesh: 'oklch(0.78 0.07 340)',
  },
  // 4 — Sky
  {
    darkBase:  'oklch(0.12 0.01 220)',
    lightBase: 'oklch(0.95 0.014 220)',
    darkOrb1:  'oklch(0.36 0.12 220)',
    lightOrb1: 'oklch(0.82 0.09 220)',
    darkOrb2:  'oklch(0.22 0.07 200)',
    lightOrb2: 'oklch(0.88 0.05 200)',
    darkOrb3:  'oklch(0.18 0.05 250)',
    lightOrb3: 'oklch(0.92 0.03 250)',
    darkMesh:  'oklch(0.27 0.09 220)',
    lightMesh: 'oklch(0.77 0.07 220)',
  },
  // 5 — Violet
  {
    darkBase:  'oklch(0.12 0.01 295)',
    lightBase: 'oklch(0.95 0.015 295)',
    darkOrb1:  'oklch(0.37 0.14 295)',
    lightOrb1: 'oklch(0.81 0.10 295)',
    darkOrb2:  'oklch(0.22 0.08 315)',
    lightOrb2: 'oklch(0.87 0.06 315)',
    darkOrb3:  'oklch(0.18 0.05 265)',
    lightOrb3: 'oklch(0.91 0.04 265)',
    darkMesh:  'oklch(0.28 0.10 295)',
    lightMesh: 'oklch(0.76 0.08 295)',
  },
] as const;

interface ProjectPanelBgProps {
  index: number;
  isActive: boolean;
}

export const ProjectPanelBg = memo(function ProjectPanelBg({
  index,
}: ProjectPanelBgProps) {
  const t = PANEL_THEMES[index % PANEL_THEMES.length];

  // All color values are injected as CSS custom properties.
  // The .dark class on <html> switches which variable is active
  // via the CSS rules in globals.css — zero JS, zero hydration issue.
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
      {/* Layer 1: Base solid color — switched by CSS var via .dark */}
      <div className="panel-bg__base absolute inset-0" />

      {/* Layer 2: Mesh gradient */}
      <div
        className="panel-bg__mesh absolute inset-[-20%] pointer-events-none"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 14s ease infinite',
          animationDelay: `${index * -2.3}s`,
          willChange: 'background-position',
        }}
      />

      {/* Layer 3: Orb A */}
      <div
        className="panel-bg__orb panel-bg__orb--a absolute rounded-full pointer-events-none will-change-transform"
        aria-hidden="true"
        style={{
          width: '65%',
          height: '65%',
          left: '25%',
          top: '55%',
          translate: '-50% -50%',
          animationName: 'panel-orb-a',
          animationDuration: `${18 + index * 1.5}s`,
          animationDelay: `${index * -3.1}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode: 'both',
          transform: 'translateZ(0)',
        }}
      />

      {/* Layer 3: Orb B */}
      <div
        className="panel-bg__orb panel-bg__orb--b absolute rounded-full pointer-events-none will-change-transform"
        aria-hidden="true"
        style={{
          width: '45%',
          height: '45%',
          left: '72%',
          top: '35%',
          translate: '-50% -50%',
          animationName: 'panel-orb-b',
          animationDuration: `${14 + index * 1.2}s`,
          animationDelay: `${index * -1.7}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode: 'both',
          transform: 'translateZ(0)',
        }}
      />

      {/* Layer 3: Orb C */}
      <div
        className="panel-bg__orb panel-bg__orb--c absolute rounded-full pointer-events-none will-change-transform"
        aria-hidden="true"
        style={{
          width: '30%',
          height: '30%',
          left: '55%',
          top: '75%',
          translate: '-50% -50%',
          animationName: 'panel-orb-c',
          animationDuration: `${11 + index * 0.9}s`,
          animationDelay: `${index * -2.5}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationFillMode: 'both',
          transform: 'translateZ(0)',
        }}
      />

      {/* Layer 4: Grain texture — static, no theme dep */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '160px 160px',
        }}
      />

      {/* Layer 5: Grid lines — switched via CSS var */}
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