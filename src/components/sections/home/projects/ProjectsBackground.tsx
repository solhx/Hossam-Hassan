
// src/components/sections/home/projects/ProjectsBackground.tsx
// ─────────────────────────────────────────────────────────────────
// PURE CSS BACKGROUND — zero image dependencies, zero GSAP
//
// Design system:
// Layer 0: deep-green base (oklch)
// Layer 1: static mesh radial gradients (structure)
// Layer 2: animated ambient orbs (life)
// Layer 3: grid overlay with mask fade (texture)
// Layer 4: noise grain (premium feel)
// Layer 5: vignette (content focus)
// Layer 6: sweep shimmer (subtle movement)
// Layer 7: per-project accent ring (identity)
//
// The accent ring is the ONLY layer that changes per project.
// It uses a CSS variable + opacity transition (compositor-only).
// No repaints, no layout work, no GSAP timelines.
//
// memo(): this component receives only `accentColor` which changes
// 5 times max (once per project). Prevents unnecessary re-renders
// from parent state changes.
// ─────────────────────────────────────────────────────────────────
import { memo, useEffect, useRef } from 'react';

interface ProjectsBackgroundProps {
  // Raw RGB values "r,g,b" — injected as CSS variable for accent ring
  // Example: "16,185,129" for emerald-500
  accentRgb?: string;
}

export const ProjectsBackground = memo(function ProjectsBackground({
  accentRgb,
}: ProjectsBackgroundProps) {
  const accentRingRef = useRef<HTMLDivElement>(null);

  // ── Accent ring color update ────────────────────────────────────
  // When accentRgb changes (new project active), update the CSS
  // variable on the accent ring element.
  //
  // WHY NOT inline style on the div:
  // React would re-render the entire component to update the style.
  // Direct DOM mutation via useEffect avoids the re-render.
  // The CSS transition handles the smooth color change automatically.
  useEffect(() => {
    const el = accentRingRef.current;
    if (!el || !accentRgb) return;

    // Set CSS custom property directly on the element
    // CSS transition on the parent element handles smooth fade
    el.style.setProperty(
      '--project-accent-rgb',
      `rgba(${accentRgb}, 0.12)`,
    );
  }, [accentRgb]);

  return (
    // Layer 0: Root container with base deep-green
    <div className="projects-bg-root" aria-hidden="true">

      {/* Layer 1: Static mesh gradient structure */}
      <div className="projects-bg-mesh" />

      {/* Layer 2: Animated ambient orbs */}
      {/* Each orb has its own drift animation (different duration) */}
      {/* filter:blur creates soft edges cheaply */}
      <div className="projects-bg-orb projects-bg-orb--a" />
      <div className="projects-bg-orb projects-bg-orb--b" />
      <div className="projects-bg-orb projects-bg-orb--c" />
      <div className="projects-bg-orb projects-bg-orb--d" />

      {/* Layer 3: Grid overlay with radial mask fade */}
      <div className="projects-bg-grid" />

      {/* Layer 4: Film grain noise texture */}
      <div className="projects-bg-grain" />

      {/* Layer 5: Vignette — focuses attention to center */}
      <div className="projects-bg-vignette" />

      {/* Layer 6: Animated sweep shimmer */}
      <div className="projects-bg-sweep" />

      {/* Layer 7: Per-project accent ring */}
      {/* CSS variable --project-accent-rgb is set via useEffect */}
      {/* opacity:1 always — color change via CSS var */}
      <div
        ref={accentRingRef}
        className="projects-bg-accent-ring"
      />

    </div>
  );
});