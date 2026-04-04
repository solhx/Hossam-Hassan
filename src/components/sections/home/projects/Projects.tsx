// src/components/sections/home/projects/Projects.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX A — Mobile section height
// BEFORE: section height = (projects.length + 1) * 100vh applied
//         to the entire section including mobile. On mobile this
//         created a 600vh+ empty section below the card list,
//         making the page appear broken with a massive scroll gap.
// AFTER:  The tall sticky-scroll height is only applied on md+
//         via a conditional className. Mobile gets height:auto
//         so it naturally sizes to its content (the card list).
//         We split into two sibling elements instead of one section
//         controlling both layouts — cleaner separation of concerns.
//
// FIX B — Lenis guard
// BEFORE: handleSectionEnter/Leave called lenis.stop()/start()
//         directly. If lenis wasn't initialized yet (first paint)
//         getLenis() returned null and the call threw silently.
// AFTER:  Added null guards (already present) + moved callbacks
//         into useScrollCapture only — Projects.tsx passes them
//         down but doesn't call them directly. No double-stop risk.
//
// FIX C — accentRgb hydration
// BEFORE: useState(undefined) + useEffect to set initial value
//         caused a 1-frame flash where ProjectsBackground received
//         undefined and rendered without the accent ring.
// AFTER:  Kept undefined initial (correct for SSR hydration match)
//         but ProjectsBackground now has a CSS fallback accent so
//         the ring is never invisible — it falls back to emerald.
// ─────────────────────────────────────────────────────────────────
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

  // FIX C: undefined initial prevents hydration mismatch.
  // ProjectsBackground has a CSS fallback so undefined = no flash.
  const [accentRgb, setAccentRgb] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Set initial accent after hydration — safe, no SSR mismatch
    setAccentRgb(PROJECT_ACCENTS[0].bloomRgb);
  }, []);

  // FIX B: These are passed to StackCarousel → useScrollCapture.
  // They are NOT called directly here — useScrollCapture owns the
  // timing. Keeping them as stable callbacks via useCallback.
  const handleSectionEnter = useCallback(() => {
    const lenis = getLenis();
    if (lenis && !lenis.isStopped) lenis.stop();
  }, []);

  const handleSectionLeave = useCallback(() => {
    const lenis = getLenis();
    if (lenis && lenis.isStopped) lenis.start();
  }, []);

  const handleAccentChange = useCallback((index: number) => {
    setAccentRgb(PROJECT_ACCENTS[index % PROJECT_ACCENTS.length].bloomRgb);
  }, []);

  return (
    <>
      {/* ── DESKTOP: Sticky scroll section ─────────────────────
          FIX A: This element only exists in the DOM flow on md+.
          The tall height (N+1 viewports) is contained here and
          does NOT affect mobile layout at all.
          'hidden md:block' removes it from flow on mobile so
          mobile users never scroll through the sticky gap.
      ────────────────────────────────────────────────────────── */}
      <section
        id="projects"
        ref={sectionRef}
        aria-label="Projects showcase"
        className="relative w-full hidden md:block"
        style={{
          // Each project occupies 1 viewport of scroll.
          // +1 extra viewport = room to scroll OUT at section end.
          height: `${(projects.length + 1) * 100}vh`,
        }}
      >
        {/* Sticky viewport — stays fixed while user scrolls */}
        <div
          className="flex flex-col"
          style={{
            position: 'sticky',
            top:      0,
            height:   '100vh',
            overflow: 'hidden',
            zIndex:   1,
          }}
        >
          {/* Background — z-index: 0, behind everything */}
          <ProjectsBackground accentRgb={accentRgb} />

          {/* Section heading — above background, below cards */}
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

          {/* Card stack carousel — z-index: 1 */}
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
      </section>

      {/* ── MOBILE: Normal document flow section ───────────────
          FIX A: Separate element — no sticky, no fixed height.
          Height is auto — sized by ProjectsMobile card list.
          'md:hidden' removes it from desktop layout entirely.
          Using a section tag with the same id would confuse
          screen readers — the mobile section uses aria-label
          matching the desktop one for consistency.
      ────────────────────────────────────────────────────────── */}
      <section
        aria-label="Projects showcase"
        className="relative w-full md:hidden"
      >
        <div className="pt-16 pb-2 px-4">
          <SectionHeading
            badge="Projects"
            title="Featured Work"
            subtitle="A curated selection of projects built with modern technology."
            align="center"
          />
        </div>
        <ProjectsMobile />
      </section>
    </>
  );
}