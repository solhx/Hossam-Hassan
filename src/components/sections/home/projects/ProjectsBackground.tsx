// src/components/sections/home/projects/ProjectsBackground.tsx
import { memo, useEffect, useRef } from 'react';

interface ProjectsBackgroundProps {
  accentRgb?: string;
}

export const ProjectsBackground = memo(function ProjectsBackground({
  accentRgb,
}: ProjectsBackgroundProps) {
  const accentRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = accentRingRef.current;
    if (!el || !accentRgb) return;
    el.style.setProperty(
      '--project-accent-rgb',
      `rgba(${accentRgb}, 0.12)`,
    );
  }, [accentRgb]);

  return (
    <div className="projects-bg-root" aria-hidden="true">

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

      {/* Layer 7: Per-project accent ring */}
      <div
        ref={accentRingRef}
        className="projects-bg-accent-ring"
      />

      {/* Layer 8: Top edge shimmer — dark mode only via CSS */}
      <div className="projects-bg-edge-top" />

    </div>
  );
});