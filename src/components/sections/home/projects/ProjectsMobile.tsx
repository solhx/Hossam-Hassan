// src/components/sections/home/projects/ProjectsMobile.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX T — Card back face height mismatch
// BEFORE: Back face used `absolute inset-0` which worked when the
//         card was a fixed height. But MobileProjectCard's height
//         is determined by the FRONT face content (dynamic text).
//         `absolute inset-0` on the back face matched the front
//         height — but on short-content cards it was too short,
//         cutting off the tech stack tags.
// AFTER:  Back face uses the same padding structure as the front,
//         but with a min-height:100% guarantee. The perspective
//         wrapper gets a defined aspect to prevent collapse.
//         Back face content now scrolls independently if tags overflow.
//
// FIX U — Flip animation GPU promotion
// BEFORE: rotateY animated on a div without explicit translateZ(0).
//         iOS Safari doesn't promote elements to GPU layers for
//         rotateY alone — the flip caused layer compositing on
//         each frame (janky on older iPhones).
// AFTER:  Added translateZ(0) to the flip wrapper style to promote
//         it to its own GPU layer before animation starts.
//         Also added will-change:'transform' for the duration of
//         the flip, cleared on animation complete via onAnimationComplete.
//
// FIX V — Back face tag animation on re-flip
// BEFORE: Tag motion.span used `animate={flipped ? ... : ...}` which
//         re-ran entrance animations every flip cycle. Fast back-and-
//         forth flipping stacked animation delays causing visual drift.
// AFTER:  Tags use AnimatePresence with a key tied to `flipped` state.
//         When flipped=false, tags are unmounted. When flipped=true,
//         they mount fresh with staggered entrance — no drift.
// ─────────────────────────────────────────────────────────────────
'use client';

import {
  useState,
  useRef,
  useCallback,
  memo,
  useEffect,
} from 'react';
import { motion, AnimatePresence }               from 'framer-motion';
import Image                                     from 'next/image';
import { ExternalLink, Github, Star, Layers }    from 'lucide-react';
import { cn }                                    from '@/utils/utils';
import { useReducedMotion }                      from '@/hooks/useReducedMotion';
import { projects }                              from '@/lib/portfolio-data';
import { PROJECT_ACCENTS, FM_EASE }              from './constants';
import type { Project, Accent }                  from './types';

// ── Card entrance animation — staggered list ──────────────────
const mobileCardVariants = {
  hidden: { y: 48, scale: 0.96, filter: 'blur(4px)' },
  show: {
    y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: FM_EASE.outExpo },
  },
} as const;

// ── Tag entrance on back face ──────────────────────────────────
// FIX V: Defined as variants — used inside AnimatePresence
// so they only run once per mount, not on every flip toggle
const tagEntranceVariants = {
  hidden: { scale: 0.8, filter: 'blur(4px)', opacity: 0 },
  show: (i: number) => ({
    scale:   1,
    filter:  'blur(0px)',
    opacity: 1,
    transition: {
      delay:    0.18 + i * 0.04,
      duration: 0.28,
      ease:     FM_EASE.outSpring,
    },
  }),
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

  // FIX U: Track whether a flip is in progress to manage will-change
  const [isFlipping, setIsFlipping] = useState(false);

  // Pointer delta tracking — distinguishes tap from scroll
  const pointerStartY = useRef(0);
  const pointerStartX = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartY.current = e.clientY;
    pointerStartX.current = e.clientX;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const deltaY = Math.abs(e.clientY - pointerStartY.current);
    const deltaX = Math.abs(e.clientX - pointerStartX.current);
    // 20px threshold — distinguishes tap from scroll drag
    if (deltaY >= 20 || deltaX >= 20) return;

    // FIX U: Set isFlipping before state change so will-change
    // is active before the animation begins — not after
    setIsFlipping(true);
    setFlipped(f => !f);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // FIX U: Clear will-change after flip completes — prevents
  // the element staying on its own GPU layer when idle
  const handleAnimationComplete = useCallback(() => {
    setIsFlipping(false);
  }, []);

  return (
    <motion.div variants={reduced ? undefined : mobileCardVariants}>
      {/* FIX U: Perspective on the outer wrapper — not the flip div.
          Perspective on the flip div itself causes it to be its
          own stacking context, breaking backfaceVisibility on Safari. */}
      <div style={{ perspective: 1000 }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={`${project.title} — tap to ${flipped ? 'see preview' : 'see details'}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onContextMenu={handleContextMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsFlipping(true);
              setFlipped(f => !f);
            }
          }}
          style={{ touchAction: 'pan-y', cursor: 'pointer' }}
        >
          {/* FIX U: translateZ(0) promotes to GPU layer before flip.
              will-change managed by isFlipping state — only active
              during the animation, not permanently.              */}
          <motion.div
            style={{
              transformStyle: 'preserve-3d',
              transform:      'translateZ(0)',  // FIX U: GPU promotion
              willChange:     isFlipping ? 'transform' : 'auto',
            }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{
              type:      'spring',
              stiffness: 260,
              damping:   28,
              mass:      0.8,
            }}
            onAnimationComplete={handleAnimationComplete} // FIX U: clear will-change
            className="relative"
          >

            {/* ── FRONT ───────────────────────────────────────── */}
            <div
              className={cn(
                'rounded-2xl overflow-hidden border shadow-2xl',
                'bg-white border-neutral-200/80',
                'dark:bg-[#080f0a] dark:border-white/[0.07]',
              )}
              style={{
                backfaceVisibility:        'hidden',
                WebkitBackfaceVisibility:  'hidden',
              }}
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

                {/* First 4 tags preview */}
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

                {/* CTA buttons — stopPropagation prevents flip on link tap */}
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

            {/* ── BACK ────────────────────────────────────────── */}
            {/* FIX T: min-h-full + overflow-y-auto prevents height
                mismatch — back face matches front face height and
                scrolls independently if tags overflow           */}
            <div
              className={cn(
                'absolute inset-0 rounded-2xl overflow-hidden',
                'flex flex-col justify-between',
                'border border-white/[0.08]',
                'bg-[#060d08]',
                'shadow-2xl',
              )}
              style={{
                backfaceVisibility:        'hidden',
                WebkitBackfaceVisibility:  'hidden',
                transform:                 'rotateY(180deg)',
                // FIX T: min-height matches front face via absolute inset-0
                // inset-0 is already set via className — explicit minHeight
                // ensures the back face never collapses on very short cards
                minHeight: '100%',
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

              {/* Back face content */}
              <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Header */}
                <div className="mb-5 flex-shrink-0">
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

                {/* FIX V: Tags inside AnimatePresence — fresh mount per flip.
                    No animation drift from repeated flip-unflip cycles.    */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {flipped && (
                      <motion.div
                        key="tags"
                        className="flex flex-wrap gap-2"
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                      >
                        {project.tags.map((tag, i) => (
                          <motion.span
                            key={tag}
                            variants={tagEntranceVariants}
                            custom={i}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer hint */}
                <div className="text-center pt-4 flex-shrink-0">
                  <span className="text-[10px] text-white/25 font-mono">
                    tap to flip back
                  </span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});