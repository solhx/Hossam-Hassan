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

function useIsMobile(breakpoint = 768): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, [breakpoint]);

  return isMobile;
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced    = useReducedMotion();
  const isMobile   = useIsMobile();

  // ── Keep a ref so callbacks always read the latest value ───────
  // FIX: Callbacks are created once (empty deps) but need to know
  // the current isMobile value without being recreated.
  // A ref solves this without adding isMobile to useCallback deps
  // (which would recreate the callback and cause StackCarousel to
  // re-render every time mobile state changes).
  const isMobileRef = useRef<boolean | null>(null);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const [accentRgb, setAccentRgb] = useState<string | undefined>(undefined);

  useEffect(() => {
    setAccentRgb(PROJECT_ACCENTS[0].bloomRgb);
  }, []);

  // ── Section enter — DESKTOP ONLY ───────────────────────────────
  // FIX: Previously this called lenis.stop() unconditionally.
  //
  // The call chain was:
  //   IntersectionObserver (mobile effect in useScrollCapture)
  //     → onSectionEnter?.()
  //       → handleSectionEnter()
  //         → lenis.stop()  ← froze ALL scrolling on mobile
  //
  // On mobile, lenis must NEVER be stopped — the mobile version of
  // useScrollCapture uses passive touch listeners and lets lenis
  // handle all scroll momentum naturally.
  //
  // On desktop, lenis.stop() is correct — it hands scroll control
  // to the wheel/keyboard capture logic in useScrollCapture so
  // each wheel tick navigates cards instead of scrolling the page.
  const handleSectionEnter = useCallback(() => {
    // Guard: never stop lenis on mobile
    if (isMobileRef.current) return;

    const lenis = getLenis();
    if (lenis) lenis.stop();
  }, []); // empty deps — reads isMobileRef.current at call time

  // ── Section leave — DESKTOP ONLY ───────────────────────────────
  // FIX: Same pattern — lenis.start() on mobile is a no-op
  // (we never stopped it) but calling it is harmless. The guard
  // is here for symmetry and clarity, not strict necessity.
  const handleSectionLeave = useCallback(() => {
    if (isMobileRef.current) return;

    const lenis = getLenis();
    if (lenis) lenis.start();
  }, []); // empty deps — reads isMobileRef.current at call time

  const handleAccentChange = useCallback((index: number) => {
    const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
    setAccentRgb(accent.bloomRgb);
  }, []);

  const sectionHeight = isMobile === false
    ? `${(projects.length + 1) * 100}vh`
    : 'auto';

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-label="Projects showcase"
      className="relative w-full"
      style={{ height: sectionHeight }}
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
        <ProjectsBackground accentRgb={accentRgb} />

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