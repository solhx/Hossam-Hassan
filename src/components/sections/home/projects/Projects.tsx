// src/components/sections/home/Projects.tsx
'use client';

import { useRef } from 'react';
import { projects } from '@/lib/mocks/projects';
import { ProjectCard } from './ProjectCard';
import { SectionHeading } from '@/components/ui/section-heading';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/utils/utils';

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <section
      id="projects"
      ref={containerRef}
      className="relative py-20 sm:py-28 lg:py-32"
      aria-label={`Projects showcase - ${projects.length} projects`}
    >
      {/* Background */}
      <ProjectsBackground prefersReduced={prefersReduced} isMobile={isMobile} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeading
          badge="Portfolio"
          title="Featured Projects"
          subtitle="A selection of projects I've worked on, showcasing my skills in full-stack development, UI/UX design, and modern web technologies."
          align="center"
        />

        {/* Projects List */}
        <div className="space-y-20 sm:space-y-28 lg:space-y-36">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              prefersReduced={prefersReduced}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Simplified Background Component
function ProjectsBackground({
  prefersReduced,
  isMobile,
}: {
  prefersReduced: boolean;
  isMobile: boolean;
}) {
  // Skip complex background on mobile or reduced motion
  if (isMobile || prefersReduced) {
    return (
      <div
        className={cn(
          'absolute inset-0 -z-10',
          'bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent',
          'dark:via-emerald-950/20'
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Static gradient mesh */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-gradient-to-br from-emerald-50/40 via-transparent to-teal-50/30',
          'dark:from-emerald-950/30 dark:via-transparent dark:to-teal-950/20'
        )}
      />

      {/* Subtle grid pattern */}
      <div className="projects-grid-pattern" />

      {/* Static orbs - no animation */}
      <div className="projects-orb projects-orb--primary" />
      <div className="projects-orb projects-orb--secondary" />

      {/* Top edge gradient line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-px',
          'bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent'
        )}
      />

      {/* Bottom edge gradient line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-px',
          'bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent'
        )}
      />
    </div>
  );
}