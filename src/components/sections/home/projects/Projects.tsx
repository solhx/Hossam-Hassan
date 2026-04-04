// src/components/sections/home/projects/Projects.tsx
'use client';

import { useEffect, useState } from 'react';
import { projects }            from '@/lib/mocks/projects';
import { StackCarousel }       from './StackCarousel';

export function Projects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ── FIX: Use requestAnimationFrame instead of setTimeout(0) ──
    //
    // setTimeout(0) fires before the browser repaints.
    // requestAnimationFrame fires after the browser has committed
    // the current frame to the screen — meaning the skeleton div
    // has been painted and its dimensions are stable.
    //
    // This matters because StackCarousel reads sectionRef dimensions
    // immediately on mount for ScrollTrigger initialisation.
    // If we mount before the skeleton dimensions are committed,
    // getBoundingClientRect() may return 0 for offsetTop.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div
        id="projects"
        aria-hidden="true"
        className="relative w-full h-screen projects-bg-root"
      />
    );
  }

  return <StackCarousel projects={projects} />;
}