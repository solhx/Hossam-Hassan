// src/components/sections/home/projects/ProjectsBackground.tsx
//
// Pure presentational layer — renders all .projects-bg-* divs
// defined in globals.css. Zero JS animation cost: every layer
// runs on CSS keyframes entirely on the GPU.
//
// forwardRef: the parent GSAP timeline fades this whole node
// as one atomic layer via a single tween — one DOM write per
// frame instead of N individual child tweens.

import { forwardRef } from 'react';

export const ProjectsBackground = forwardRef<HTMLDivElement>(
  function ProjectsBackground(_, ref) {
    return (
      <div ref={ref} className="projects-bg-root" aria-hidden="true">

        {/* Layer 1 — static radial mesh gradient */}
        <div className="projects-bg-mesh" />

        {/* Layer 2 — animated ambient orbs (pure CSS keyframes) */}
        <div className="projects-bg-orb projects-bg-orb--a" />
        <div className="projects-bg-orb projects-bg-orb--b" />
        <div className="projects-bg-orb projects-bg-orb--c" />
        <div className="projects-bg-orb projects-bg-orb--d" />

        {/* Layer 3 — grid overlay */}
        <div className="projects-bg-grid" />

        {/* Layer 4 — grain / noise texture */}
        <div className="projects-bg-grain" />

        {/* Layer 5 — vignette */}
        <div className="projects-bg-vignette" />

        {/* Layer 6 — animated diagonal sweep */}
        <div className="projects-bg-sweep" />

        {/* Layer 7 — per-project accent ring */}
        <div className="projects-bg-accent-ring" />

        {/* Layer 8 — top edge shimmer (dark only, opacity:0 in light) */}
        <div className="projects-bg-edge-top" />

      </div>
    );
  },
);