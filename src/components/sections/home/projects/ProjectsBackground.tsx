// src/components/sections/home/projects/ProjectsBackground.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX R — CSS custom property fallback for accent ring
// BEFORE: --project-accent-rgb was set via useEffect, meaning on
//         first render (before useEffect fires) the ring used
//         the CSS var default: oklch(0.40 0.14 148 / 0.10).
//         This caused a brief flash of the wrong accent color on
//         hydration, visible as a green ring before the prop arrived.
// AFTER:  The CSS variable is now also set via a style prop on the
//         root element directly, which React applies at render time
//         (before paint). The useEffect is removed entirely.
//         The ring is always correct from frame 1.
//
// FIX S — aria-hidden propagation
// BEFORE: aria-hidden was only on the root div. Screen readers could
//         still navigate into child divs in some browser/AT combos.
// AFTER:  Single aria-hidden="true" on root + role="presentation"
//         on the root to explicitly mark it as decorative.
// ─────────────────────────────────────────────────────────────────
import { memo } from 'react';

interface ProjectsBackgroundProps {
  accentRgb?: string;
}

export const ProjectsBackground = memo(function ProjectsBackground({
  accentRgb,
}: ProjectsBackgroundProps) {
  // FIX R: Set CSS variable directly in style prop — no useEffect needed.
  // React applies style props synchronously before paint, so the accent
  // ring color is always correct from frame 1 — no flash of wrong color.
  const accentVar = accentRgb
    ? `rgba(${accentRgb}, 0.12)`
    : `rgba(16, 185, 129, 0.12)`; // emerald fallback — matches PROJECT_ACCENTS[0]

  return (
    // FIX S: role="presentation" + aria-hidden on root
    <div
      role="presentation"
      aria-hidden="true"
      className="projects-bg-root"
      // FIX R: CSS variable set at render time via style prop
      style={{
        '--project-accent-rgb': accentVar,
      } as React.CSSProperties}
    >
      {/* Layer 1: Static mesh gradient structure */}
      <div className="projects-bg-mesh" />

      {/* Layer 2: Animated ambient orbs */}
      <div className="projects-bg-orb projects-bg-orb--a" />
      <div className="projects-bg-orb projects-bg-orb--b" />
      <div className="projects-bg-orb projects-bg-orb--c" />
      <div className="projects-bg-orb projects-bg-orb--d" />

      {/* Layer 3: Grid overlay with radial mask fade */}
      <div className="projects-bg-grid" />

      {/* Layer 4: Film grain / crosshatch texture */}
      <div className="projects-bg-grain" />

      {/* Layer 5: Vignette — focuses attention to center */}
      <div className="projects-bg-vignette" />

      {/* Layer 6: Animated sweep shimmer */}
      <div className="projects-bg-sweep" />

      {/* Layer 7: Per-project accent ring
          FIX R: Color comes from CSS var set above — no useEffect race */}
      <div className="projects-bg-accent-ring" />

      {/* Layer 8: Top edge shimmer — dark mode only via CSS */}
      <div className="projects-bg-edge-top" />
    </div>
  );
});