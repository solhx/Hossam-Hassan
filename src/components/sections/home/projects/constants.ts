// src/components/sections/home/projects/constants.ts
// ─────────────────────────────────────────────────────────────────
// PURE DATA — no Framer Motion imports, no GSAP imports.
// CHANGE: No structural changes — this file was already correct.
//         Only added PROJECT_ACCENTS_RGB_MAP export so CardContent
//         can import it instead of maintaining its own copy.
//         Previously CardContent had a hardcoded PROJECT_ACCENTS_MAP
//         array that duplicated bloomRgb values and could drift
//         out of sync with PROJECT_ACCENTS. Now there's one source.
// ─────────────────────────────────────────────────────────────────

import type { Accent } from './types';

// ── Accent palette ───────────────────────────────────────────────
export const PROJECT_ACCENTS: Accent[] = [
  {
    // Urban Nile — emerald
    primary:  '#10b981',
    glow:     'rgba(16,185,129,0.20)',
    bloomRgb: '16,185,129',
    badge:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border:   'border-emerald-500/20 dark:border-emerald-500/15',
    text:     'text-emerald-600 dark:text-emerald-400',
  },
  {
    // LMS — teal
    primary:  '#14b8a6',
    glow:     'rgba(20,184,166,0.20)',
    bloomRgb: '20,184,166',
    badge:    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    border:   'border-teal-500/20 dark:border-teal-500/15',
    text:     'text-teal-600 dark:text-teal-400',
  },
  {
    // 3D Portfolio — lime
    primary:  '#84cc16',
    glow:     'rgba(132,204,22,0.18)',
    bloomRgb: '132,204,22',
    badge:    'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
    border:   'border-lime-500/20 dark:border-lime-500/15',
    text:     'text-lime-600 dark:text-lime-400',
  },
  {
    // ShopHub — cyan
    primary:  '#06b6d4',
    glow:     'rgba(6,182,212,0.18)',
    bloomRgb: '6,182,212',
    badge:    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    border:   'border-cyan-500/20 dark:border-cyan-500/15',
    text:     'text-cyan-600 dark:text-cyan-400',
  },
  {
    // FlowState — green
    primary:  '#22c55e',
    glow:     'rgba(34,197,94,0.18)',
    bloomRgb: '34,197,94',
    badge:    'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    border:   'border-green-500/20 dark:border-green-500/15',
    text:     'text-green-600 dark:text-green-400',
  },
];

// ── CHANGE: Derived bloomRgb map — single source of truth ────────
// CardContent imports this instead of maintaining its own array.
// Derived at module load time — zero runtime cost.
// If PROJECT_ACCENTS order changes, this auto-updates.
export const PROJECT_ACCENTS_RGB_MAP: string[] = PROJECT_ACCENTS.map(
  (a) => a.bloomRgb,
);

// ── Depth stack config ───────────────────────────────────────────
export const STACK_CONFIG = {
  active: {
    scale:      1.0,
    translateY: 0,
    translateZ: 0,
  },
  depth: {
    scaleStep:      0.055,
    translateYStep: 16,
    maxDepth:       3,
    brightnessStep: 0.08,
  },
  entry: {
    fromScale:      0.90,
    fromTranslateY: 44,
    fromClipPath:   'inset(100% 0 0 0 round 24px)',
    toClipPath:     'inset(0% 0% 0% 0% round 24px)',
    duration:       0.72,
  },
  exit: {
    toScale:      0.88,
    toTranslateY: -60,
    duration:     0.55,
  },
} as const;

// ── GSAP easing ──────────────────────────────────────────────────
export const GSAP_EASE = {
  entryExpo:   'power4.out',
  exitCubic:   'power2.inOut',
  depthSpring: 'power3.out',
  bloom:       'power2.out',
  snap:        'power3.inOut',
} as const;

// ── Framer Motion easing ─────────────────────────────────────────
// Used ONLY for content micro-animations — never panel containers.
export const FM_EASE = {
  outExpo:   [0.16, 1, 0.3,  1]    as const,
  outSpring: [0.34, 1.56, 0.64, 1] as const,
  inCubic:   [0.55, 0,   1, 0.45]  as const,
  smooth:    [0.25, 0.46, 0.45, 0.94] as const,
} as const;