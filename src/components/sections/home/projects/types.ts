// src/components/sections/home/projects/types.ts
// ─────────────────────────────────────────────────────────────────
// CHANGE: Added bloomEl + revealEl to CardHandle directly.
// BEFORE: useStackAnimation cast CardHandle to an intersection type
//         (CardHandle & { bloomEl?: ... revealEl?: ... }) inline,
//         which meant TypeScript couldn't verify the shape and
//         the cast was silently unsafe — if a handle was missing
//         bloomEl, GSAP would animate undefined without error.
// AFTER:  bloomEl and revealEl are first-class fields on CardHandle.
//         useStackAnimation accesses them directly with no cast.
//         StackCard populates both via the registration callback.
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

// CardHandle — the imperative API surface GSAP operates on.
// All fields except setVisible are raw DOM refs (GSAP-owned).
// setVisible is the React state bridge (React-owned).
// They must never cross: GSAP does not call setState,
// React does not write style directly.
export interface CardHandle {
  shellEl:    HTMLDivElement | null; // outer transform shell — GSAP scale/y/z
  imageEl:    HTMLDivElement | null; // background parallax layer — GSAP y
  bloomEl:    HTMLDivElement | null; // burst overlay — GSAP scale/filter
  revealEl:   HTMLDivElement | null; // clip-path reveal wrapper — GSAP clipPath
  setVisible: (v: boolean) => void;  // React state bridge — content visibility
}

// Accent — per-project color identity.
// bloomRgb is the raw RGB triple for rgba() construction in GSAP/CSS.
// badge/border/text are Tailwind class strings for React components.
export interface Accent {
  primary:  string; // hex — used in inline style (boxShadow, background)
  glow:     string; // rgba string — used in boxShadow
  bloomRgb: string; // "r,g,b" triple — used in rgba() via GSAP + CSS vars
  badge:    string; // Tailwind classes — tag pills
  border:   string; // Tailwind classes — card border
  text:     string; // Tailwind classes — accent text
}