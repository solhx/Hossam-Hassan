// src/components/sections/home/projects/constants.ts
// ─────────────────────────────────────────────────────────────────
// PURE DATA — no Framer Motion imports, no GSAP imports
// Animation variants live in CardContent.tsx (FM scope only)
// GSAP timing lives in useStackAnimation.ts (GSAP scope only)
// ─────────────────────────────────────────────────────────────────

import type { Accent } from './types';

// ── Accent palette ───────────────────────────────────────────────
// Each project gets a unique color identity
// bloomRgb is used by GSAP for the burst effect (no opacity hack)
export const PROJECT_ACCENTS: Accent[] = [
  {
    // Urban Nile — emerald (brand identity: streetwear, growth)
    primary:  '#10b981',
    glow:     'rgba(16,185,129,0.20)',
    bloomRgb: '16,185,129',
    badge:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border:   'border-emerald-500/20 dark:border-emerald-500/15',
    text:     'text-emerald-600 dark:text-emerald-400',
  },
  {
    // LMS — teal (education, trust, clarity)
    primary:  '#14b8a6',
    glow:     'rgba(20,184,166,0.20)',
    bloomRgb: '20,184,166',
    badge:    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    border:   'border-teal-500/20 dark:border-teal-500/15',
    text:     'text-teal-600 dark:text-teal-400',
  },
  {
    // 3D Portfolio — lime (creative, bold, forward)
    primary:  '#84cc16',
    glow:     'rgba(132,204,22,0.18)',
    bloomRgb: '132,204,22',
    badge:    'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
    border:   'border-lime-500/20 dark:border-lime-500/15',
    text:     'text-lime-600 dark:text-lime-400',
  },
  {
    // ShopHub — cyan (commerce, speed, digital)
    primary:  '#06b6d4',
    glow:     'rgba(6,182,212,0.18)',
    bloomRgb: '6,182,212',
    badge:    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    border:   'border-cyan-500/20 dark:border-cyan-500/15',
    text:     'text-cyan-600 dark:text-cyan-400',
  },
  {
    // FlowState — green (SaaS, productivity, clean)
    primary:  '#22c55e',
    glow:     'rgba(34,197,94,0.18)',
    bloomRgb: '34,197,94',
    badge:    'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    border:   'border-green-500/20 dark:border-green-500/15',
    text:     'text-green-600 dark:text-green-400',
  },
];

// ── Depth stack config ───────────────────────────────────────────
// These are the ONLY values GSAP uses for the stack
// Defined here so they're easy to tune without touching animation code
export const STACK_CONFIG = {
  // Active card
  active: {
    scale:      1.0,
    translateY: 0,
    translateZ: 0,
    blur:       0,
  },
  // Cards behind active (per-step reduction)
  depth: {
    scaleStep:      0.055,  // each card behind = -0.055 scale
    translateYStep: 16,     // px — each card behind = +16px down
    maxDepth:       3,      // only animate 3 cards behind
    brightnessStep: 0.08,   // filter: brightness — no opacity!
  },
  // Entry animation for incoming active card
  entry: {
    fromScale:      0.90,
    fromTranslateY: 44,    // px
    fromClipPath:   'inset(100% 0 0 0 round 24px)',
    toClipPath:     'inset(0% 0% 0% 0% round 24px)',  // Phase 3a: Consistent
    duration:       0.72,
  },
  // Exit animation for outgoing active card
  exit: {
    toScale:      0.88,
    toTranslateY: -60,     // px
    duration:     0.55,
  },
} as const;

// ── Parallax config ──────────────────────────────────────────────
export const PARALLAX_CONFIG = {
  imageMultiplier: 0.18,   // image moves 18% of scroll delta
  textMultiplier:  0.08,   // text moves 8% of scroll delta
} as const;

// ── Scroll capture config ────────────────────────────────────────
export const SCROLL_CONFIG = {
  snapDuration:    { min: 0.45, max: 0.65 },
  scrubStrength:   0.9,
  velocityDecay:   0.88,
} as const;

// ── GSAP easing ──────────────────────────────────────────────────
// Defined as strings for GSAP (not Framer Motion arrays)
export const GSAP_EASE = {
  entryExpo:  'power4.out',     // fast deceleration — cinematic landing
  exitCubic:  'power2.inOut',   // smooth departure
  depthSpring: 'power3.out',    // stack depth repositioning
  bloom:      'power2.out',     // bloom burst
  snap:       'power3.inOut',   // snap positioning
} as const;

// ── Framer Motion easing ─────────────────────────────────────────
// Used ONLY for content micro-animations (text, tags, links)
// NEVER applied to panel containers
export const FM_EASE = {
  outExpo:   [0.16, 1, 0.3,  1]  as const,
  outSpring: [0.34, 1.56, 0.64, 1] as const,
  inCubic:   [0.55, 0,   1, 0.45] as const,
  smooth:    [0.25, 0.46, 0.45, 0.94] as const,
} as const;