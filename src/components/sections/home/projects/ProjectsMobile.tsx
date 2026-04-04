// src/components/sections/home/projects/ProjectsMobile.tsx
// ─────────────────────────────────────────────────────────────────
// FIX 8 — Mobile flip gesture conflict
//
// BEFORE: onClick={handleFlip}
//         Problems:
//         1. 300ms tap delay on iOS (browser waits for double-tap)
//         2. CSS scroll-snap momentum scroll triggers onClick
//            → accidental flips while scrolling
//         3. No way to distinguish scroll intent from tap intent
//
// AFTER:  onPointerDown + onPointerUp with delta check.
//         If pointer moved < 10px between down and up = tap = flip.
//         If pointer moved >= 10px = scroll = ignore.
//         No delay — pointerup fires immediately.
//         Works with both mouse and touch (pointer events API).
// ─────────────────────────────────────────────────────────────────
'use client';

import { useState, useRef, useCallback, memo } from 'react';
import { motion }                               from 'framer-motion';
import Image                                    from 'next/image';
import { ExternalLink, Github, Star, Layers }   from 'lucide-react';
import { cn }                                   from '@/utils/utils';
import { useReducedMotion }                     from '@/hooks/useReducedMotion';
import { projects }                             from '@/lib/portfolio-data';
import { PROJECT_ACCENTS, FM_EASE }             from './constants';
import type { Project, Accent }                 from './types';

const mobileCardVariants = {
  hidden: { y: 48, scale: 0.96, filter: 'blur(4px)' },
  show: {
    y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: FM_EASE.outExpo },
  },
} as const;

export function ProjectsMobile() {
  const reduced = useReducedMotion();

  return (
    <div className="md:hidden w-full">
      <motion.div
        className="max-w-lg mx-auto px-4 pt-32 pb-20 space-y-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        transition={{ staggerChildren: 0.10, delayChildren: 0.05 }}
      >
        {projects.map((project, index) => (
          <MobileProjectCard
            key={project.id}
            project={project}
            index={index}
            reduced={reduced}
          />
        ))}
      </motion.div>
    </div>
  );
}

const MobileProjectCard = memo(function MobileProjectCard({
  project,
  index,
  reduced,
}: {
  project: Project;
  index:   number;
  reduced: boolean;
}) {
  const accent                = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length] as Accent;
  const [flipped, setFlipped] = useState(false);

  // ── FIX 8: Pointer delta tracking ─────────────────────────────
  // Track pointer start position to distinguish tap from scroll
  const pointerStartY = useRef(0);
  const pointerStartX = useRef(0);

  // FIX 8: pointerdown records start position
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartY.current = e.clientY;
    pointerStartX.current = e.clientX;
  }, []);

  // FIX 15: Increased threshold prevents scroll-flip conflicts
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const deltaY = Math.abs(e.clientY - pointerStartY.current);
    const deltaX = Math.abs(e.clientX - pointerStartX.current);

    if (deltaY >= 20 || deltaX >= 20) return; // FIX 15: 20px threshold

    setFlipped(f => !f);
  }, []);

  // FIX 8: Prevent context menu on long-press (common on mobile cards)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <motion.div variants={reduced ? undefined : mobileCardVariants}>
      <div style={{ perspective: 1000 }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={`${project.title} — tap to ${flipped ? 'see preview' : 'see details'}`}
          // FIX 8: pointer events replace onClick
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onContextMenu={handleContextMenu}
          // Keyboard support unchanged
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setFlipped(f => !f);
            }
          }}
          // FIX 8: touch-action:pan-y allows vertical scroll
          // but we handle the flip via pointer delta check above
          style={{ touchAction: 'pan-y', cursor: 'pointer' }}
        >
          <motion.div
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{
              type:      'spring',
              stiffness: 260,
              damping:   28,
              mass:      0.8,
            }}
            className="relative"
          >

            {/* ── FRONT ─────────────────────────────────────── */}
            <div
              className={cn(
                'rounded-2xl overflow-hidden border shadow-2xl',
                'bg-white border-neutral-200/80',
                'dark:bg-[#080f0a] dark:border-white/[0.07]',
              )}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw"
                  loading="lazy"
                />
                // src/components/sections/home/projects/ProjectsMobile.tsx
// (continued from front face image section)
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 70% 70% at 50% 100%, ${accent.glow}, transparent 70%)`,
                  }}
                />

                {project.featured && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                    <Star size={8} className="fill-white" aria-hidden="true" />
                    Featured
                  </span>
                )}

                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/50 text-[9px] border border-white/10">
                  <Layers size={8} aria-hidden="true" />
                  Tap for stack
                </span>
              </div>

              <div className="p-5">
                {/* Accent line */}
                <div
                  className="w-8 h-[2px] rounded-full mb-3"
                  style={{ background: accent.primary }}
                  aria-hidden="true"
                />

                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 leading-snug">
                  {project.title}
                </h3>

                <p className="text-sm text-neutral-500 dark:text-white/50 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tags — first 4 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border',
                        accent.badge,
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border border-white/10 text-white/40 dark:border-white/10">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>

                {/* CTA buttons */}
                {/* FIX 8: stopPropagation prevents button taps
                    from bubbling to the card's pointerUp handler
                    (which would trigger a flip on link tap) */}
                <div className="flex gap-2.5">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    className="flex-1"
                    aria-label={`View ${project.title} live`}
                  >
                    <button
                      className={cn(
                        'w-full inline-flex items-center justify-center gap-1.5',
                        'px-4 py-2.5 rounded-xl text-sm font-semibold text-white',
                        'transition-transform duration-150 active:scale-95',
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${accent.primary}dd, ${accent.primary}88)`,
                      }}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Demo
                    </button>
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    className="flex-1"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <button
                      className={cn(
                        'w-full inline-flex items-center justify-center gap-1.5',
                        'px-4 py-2.5 rounded-xl text-sm font-semibold',
                        'border transition-transform duration-150 active:scale-95',
                        'bg-white/5 border-white/10 text-white/70',
                        'dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/60',
                      )}
                    >
                      <Github size={13} aria-hidden="true" />
                      Code
                    </button>
                  </a>
                </div>
              </div>
            </div>

            {/* ── BACK ──────────────────────────────────────── */}
            <div
              className={cn(
                'absolute inset-0 rounded-2xl overflow-hidden p-6',
                'flex flex-col justify-between',
                'border border-white/[0.08]',
                'bg-[#060d08]',
                'shadow-2xl',
              )}
              style={{
                backfaceVisibility:       'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform:                'rotateY(180deg)',
              }}
            >
              {/* Accent glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 90% 90% at 50% 50%, rgba(${accent.bloomRgb}, 0.12), transparent 70%)`,
                }}
                aria-hidden="true"
              />

              {/* Grid texture */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-5">
                  <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30">
                    Tech Stack
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1 leading-snug">
                    {project.title}
                  </h4>
                  <div
                    className="w-12 h-[2px] rounded-full mt-2"
                    style={{ background: accent.primary }}
                    aria-hidden="true"
                  />
                </div>

                {/* All tags — animate in on flip */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, filter: 'blur(4px)' }}
                      animate={
                        flipped
                          ? { scale: 1,   filter: 'blur(0px)' }
                          : { scale: 0.8, filter: 'blur(4px)' }
                      }
                      transition={{
                        delay:    flipped ? 0.18 + i * 0.04 : 0,
                        duration: 0.28,
                        ease:     FM_EASE.outSpring,
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border bg-white/[0.05] border-white/[0.08] text-white/75"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: accent.primary }}
                        aria-hidden="true"
                      />
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Footer hint */}
              <div className="relative z-10 text-center pt-4">
                <span className="text-[10px] text-white/25 font-mono">
                  tap to flip back
                </span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});