// src/components/sections/home/projects/constants.ts
import type { Accent } from './types';

export const PROJECT_ACCENTS: Accent[] = [
  {
    primary:  '#10b981',
    glow:     'rgba(16,185,129,0.20)',
    bloomRgb: '16,185,129',
    badge:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border:   'border-emerald-500/20 dark:border-emerald-500/15',
    text:     'text-emerald-600 dark:text-emerald-400',
  },
  {
    primary:  '#14b8a6',
    glow:     'rgba(20,184,166,0.20)',
    bloomRgb: '20,184,166',
    badge:    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    border:   'border-teal-500/20 dark:border-teal-500/15',
    text:     'text-teal-600 dark:text-teal-400',
  },
  {
    primary:  '#84cc16',
    glow:     'rgba(132,204,22,0.18)',
    bloomRgb: '132,204,22',
    badge:    'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20',
    border:   'border-lime-500/20 dark:border-lime-500/15',
    text:     'text-lime-600 dark:text-lime-400',
  },
  {
    primary:  '#06b6d4',
    glow:     'rgba(6,182,212,0.18)',
    bloomRgb: '6,182,212',
    badge:    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    border:   'border-cyan-500/20 dark:border-cyan-500/15',
    text:     'text-cyan-600 dark:text-cyan-400',
  },
  {
    primary:  '#22c55e',
    glow:     'rgba(34,197,94,0.18)',
    bloomRgb: '34,197,94',
    badge:    'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    border:   'border-green-500/20 dark:border-green-500/15',
    text:     'text-green-600 dark:text-green-400',
  },
];

export const STACK_CONFIG = {
  active: {
    scale:      1.0,
    translateY: 0,
    translateZ: 0,
    blur:       0,
  },
  depth: {
    scaleStep:      0.055,
    translateYStep: 16,
    maxDepth:       3,
    brightnessStep: 0.08,
  },
  entry: {
    fromScale:      0.88,
    fromTranslateY: 56,
    // ── UPGRADE: diagonal wipe instead of straight bottom-up ──
    // Feels more cinematic — slides in from bottom-left corner
    fromClipPath: 'inset(100% 0% 0% 0% round 28px)',
    toClipPath:   'inset(0% 0% 0% 0% round 28px)',
    duration:     0.78,
  },
  exit: {
    toScale:        0.86,
    toTranslateY:   -72,
    // ── UPGRADE: slight rotation on exit for depth feel ───────
    toRotateX:      4,
    duration:       0.52,
  },
  // ── NEW: tilt config for mouse parallax ───────────────────────
  tilt: {
    maxRotateX:   8,   // degrees
    maxRotateY:   10,  // degrees
    maxTranslateZ: 30, // px — card lifts toward viewer
    stiffness:    60,
    damping:      20,
  },
  // ── NEW: multi-ring bloom config ──────────────────────────────
  bloom: {
    rings:    3,          // number of ripple rings
    duration: 1.1,        // seconds per ring
    stagger:  0.18,       // delay between rings
    maxScale: 2.8,
  },
} as const;

export const PARALLAX_CONFIG = {
  imageMultiplier: 0.18,
  textMultiplier:  0.08,
} as const;

export const SCROLL_CONFIG = {
  snapDuration:  { min: 0.45, max: 0.65 },
  scrubStrength: 0.9,
  velocityDecay: 0.88,
} as const;

export const GSAP_EASE = {
  // ── UPGRADE: richer easing curves ─────────────────────────────
  entryExpo:   'expo.out',          // ultra-fast deceleration
  exitCubic:   'power2.inOut',
  depthSpring: 'power3.out',
  bloom:       'power2.out',
  snap:        'power3.inOut',
  // NEW: for the diagonal wipe — feels like fabric pulling
  wipe:        'power4.inOut',
  // NEW: for the tilt spring back
  tiltSpring:  'elastic.out(1, 0.5)',
} as const;

export const FM_EASE = {
  outExpo:    [0.16, 1,    0.3,  1]    as const,
  outSpring:  [0.34, 1.56, 0.64, 1]   as const,
  inCubic:    [0.55, 0,    1,    0.45] as const,
  smooth:     [0.25, 0.46, 0.45, 0.94] as const,
  // NEW: for counter morph
  snapBack:   [0.175, 0.885, 0.32, 1.275] as const,
} as const;