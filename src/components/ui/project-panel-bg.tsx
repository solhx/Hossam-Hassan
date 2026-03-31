'use client';

import { memo } from 'react';

// ─── All-green panel themes ───────────────────────────────────
// Six green-family hue shifts: emerald → teal → lime → green → cyan → mint
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
  index: number;
  isActive: boolean;
}

export const ProjectPanelBg = memo(function ProjectPanelBg({
  index,
}: ProjectPanelBgProps) {
  const t = PANEL_THEMES[index % PANEL_THEMES.length];

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
      {/* Layer 1: Base */}
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

      {/* Layer 4: Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '160px 160px',
        }}
      />

      {/* Layer 5: Grid lines */}
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