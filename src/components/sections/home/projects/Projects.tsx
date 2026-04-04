// src/components/sections/home/projects/Projects.tsx
'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { motion }                                    from 'framer-motion';
import { SectionHeading }                            from '@/components/ui/section-heading';
import { projects }                                  from '@/lib/portfolio-data';
import { useReducedMotion }                          from '@/hooks/useReducedMotion';
import { getLenis }                                  from '@/components/common/SmoothScroll';
import { StackCarousel }                             from './StackCarousel';
import { ProjectsMobile }                            from './ProjectsMobile';
import { ProjectsBackground }                        from './ProjectsBackground';
import { PROJECT_ACCENTS, FM_EASE }                  from './constants';

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced    = useReducedMotion();

  // ── Active accent — drives background accent ring ───────────────
  // FIX 17: undefined initial prevents hydration mismatch
  const [accentRgb, setAccentRgb] = useState<string | undefined>(undefined);

  // Set initial on mount
  useEffect(() => {
    setAccentRgb(PROJECT_ACCENTS[0].bloomRgb);
  }, []);

  const handleSectionEnter = useCallback(() => {
    const lenis = getLenis();
    if (lenis) lenis.stop();
  }, []);

  const handleSectionLeave = useCallback(() => {
    const lenis = getLenis();
    if (lenis) lenis.start();
  }, []);

  // Called by StackCarousel when active project changes
  const handleAccentChange = useCallback((index: number) => {
    const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
    setAccentRgb(accent.bloomRgb);
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Projects showcase"
      className="relative w-full"
      style={{
        // FIX 1: Each project needs 100vh of scroll room to navigate through.
        // +1 extra viewport gives room to scroll OUT of the section at the end.
        // Without this the sticky container has no scroll space — navigate() never fires.
        height: `${(projects.length + 1) * 100}vh`,
      }}
    >

      {/* ── DESKTOP ──────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col"
        style={{
          position: 'sticky',
          top:      0,
          height:   '100vh',
          overflow: 'hidden',
          zIndex:   1,
        }}
      >
        {/* Section-wide background — sits behind everything */}
        <ProjectsBackground accentRgb={accentRgb} />

        {/* Heading — above background (z-30) */}
        <motion.div
          className="absolute top-0 left-0 right-0 z-30 pt-10 pointer-events-none"
          initial={{ filter: 'blur(8px)', y: -20 }}
          whileInView={{ filter: 'blur(0px)', y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.75, ease: FM_EASE.outExpo }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <SectionHeading
              badge="Projects"
              title="Featured Work"
              subtitle="A curated selection of projects built with modern technology."
              className="mb-0"
              align="center"
            />
          </div>
        </motion.div>

        {/* Card stack — z-index above background */}
        <div className="relative w-full h-full" style={{ zIndex: 1 }}>
          <StackCarousel
            projects={projects}
            sectionRef={sectionRef}
            reduced={reduced}
            onSectionEnter={handleSectionEnter}
            onSectionLeave={handleSectionLeave}
            onAccentChange={handleAccentChange}
          />
        </div>
      </div>

      {/* ── MOBILE ───────────────────────────────────────────── */}
      <div className="md:hidden">
        <div className="pt-16 pb-2 px-4">
          <SectionHeading
            badge="Projects"
            title="Featured Work"
            subtitle="A curated selection of projects built with modern technology."
            align="center"
          />
        </div>
        <ProjectsMobile />
      </div>

    </section>
  );
}