// src/components/sections/home/projects/types.ts
// ─────────────────────────────────────────────────────────────────
// CLEAN TYPE LAYER — no imports from lib, no circular deps
// ─────────────────────────────────────────────────────────────────

export interface Project {
  id:              string;
  title:           string;
  description:     string;
  longDescription: string;
  image:           string;
  tags:            string[];
  liveUrl:         string;
  githubUrl:       string;
  featured:        boolean;
}

export interface Accent {
  primary:   string;  // hex or oklch — used in CSS vars
  glow:      string;  // rgba — radial glow behind active card
  bloomRgb:  string;  // "r,g,b" — used in JS for dynamic gradients
  badge:     string;  // tailwind classes for tags
  border:    string;  // tailwind classes for card border
  text:      string;  // tailwind classes for accent text
}

// Ref handle exposed from StackCard to StackCarousel
// GSAP touches these elements directly — React never animates them
export interface CardHandle {
  // The outer shell GSAP scales/translates for depth
  shellEl:    HTMLDivElement | null;
  // The image layer GSAP moves for parallax (faster)
  imageEl:    HTMLDivElement | null;
  // The bloom burst GSAP triggers on activation
  bloomEl:    HTMLDivElement | null;
  // The clip-path reveal wrapper GSAP animates on entry
  revealEl:   HTMLDivElement | null;
}

export type ScrollDirection = 'up' | 'down' | 'none';

export interface AnimationState {
  activeIndex: number;
  prevIndex:   number;
  progress:    number; // 0–1 scrub progress
  velocity:    number; // signed scroll velocity
  direction:   ScrollDirection;
}