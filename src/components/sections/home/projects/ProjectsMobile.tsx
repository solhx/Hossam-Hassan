// src/components/sections/home/projects/ProjectsMobile.tsx
'use client';

import {
  useState,
  useRef,
  useCallback,
  memo,
}                                               from 'react';
import { motion }                               from 'framer-motion';
import Image                                    from 'next/image';
import { ExternalLink, Github, Star, Layers }   from 'lucide-react';
import { cn }                                   from '@/utils/utils';
import { useReducedMotion }                     from '@/hooks/useReducedMotion';
import { projects }                             from '@/lib/portfolio-data';
import { PROJECT_ACCENTS, FM_EASE }             from './constants';
import type { Project, Accent }                 from './types';

// ── Card entrance variants ─────────────────────────────────────
const mobileCardVariants = {
  hidden: {
    y:      48,
    scale:  0.96,
    filter: 'blur(4px)',
    opacity: 0,
  },
  show: {
    y:       0,
    scale:   1,
    filter:  'blur(0px)',
    opacity: 1,
    transition: { duration: 0.55, ease: FM_EASE.outExpo },
  },
} as const;

// ── Container ──────────────────────────────────────────────────
export function ProjectsMobile() {
  const reduced = useReducedMotion();

  return (
    <div className="md:hidden w-full">
      <motion.div
        // FIX: pt-32 → pt-6 — pt-32 was 128px of dead space on mobile
        // The section heading already has pt-16 in Projects.tsx
        // so we only need a small gap here between heading and cards
        className="max-w-lg mx-auto px-4 pt-6 pb-24 space-y-5"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        transition={{ staggerChildren: 0.09, delayChildren: 0.04 }}
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

// ── Single card ────────────────────────────────────────────────
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

  // ── FIX: Tap detection rewritten ────────────────────────────
  // PROBLEM WITH PREVIOUS APPROACH:
  //   onPointerDown fires immediately on touch start.
  //   The browser hasn't decided if this is a scroll or a tap yet.
  //   By capturing pointerdown on the card, we interfere with
  //   the browser's native scroll detection pipeline.
  //
  // NEW APPROACH: touchstart / touchend only
  //   touchstart records position but does NOT preventDefault.
  //   This lets the browser keep full control of scroll.
  //   touchend checks delta — if small = tap = flip.
  //   No pointer events on the card wrapper at all.
  //
  // WHY touchstart instead of pointerdown:
  //   On iOS Safari, pointerdown is synthesized from touchstart
  //   but with a slight delay. Using touchstart directly gives
  //   us the earliest possible position snapshot without
  //   interfering with scroll gesture recognition.

  const touchStartY   = useRef(0);
  const touchStartX   = useRef(0);
  const touchStartTime = useRef(0);
  // Track if scroll happened between touch start and end
  const didScrollRef  = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current    = e.touches[0].clientY;
    touchStartX.current    = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    didScrollRef.current   = false;
  }, []);

  // If touch moves more than 8px in any direction = scroll intent
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    if (deltaY > 8 || deltaX > 8) {
      didScrollRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Ignore if scroll happened
    if (didScrollRef.current) return;

    const elapsed = Date.now() - touchStartTime.current;
    const deltaY  = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    const deltaX  = Math.abs(e.changedTouches[0].clientX - touchStartX.current);

    // Tap = small movement + short duration (< 300ms)
    // Long press or large movement = not a tap
    if (deltaY < 12 && deltaX < 12 && elapsed < 300) {
      setFlipped(f => !f);
    }
  }, []);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped(f => !f);
    }
  }, []);

  // Prevent context menu on long-press
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
          // FIX: touch handlers instead of pointer handlers
          // touchstart/move/end don't block native scroll
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          style={{
            // FIX: touchAction changed from 'pan-y' to 'manipulation'
            // 'pan-y'        → only allows vertical panning — horizontal
            //                  flip gesture on card gets confused with
            //                  horizontal scroll on some iOS versions.
            // 'manipulation' → disables double-tap zoom (removes 300ms
            //                  delay) but allows ALL pan directions.
            //                  Our touchMove handler decides intent.
            touchAction: 'manipulation',
            cursor:      'pointer',
            userSelect:  'none',
            // FIX: -webkit-tap-highlight-color removes the blue
            // flash on iOS when tapping the card
            WebkitTapHighlightColor: 'transparent',
          }}
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

            {/* ── FRONT ──────────────────────────────────── */}
            <div
              className={cn(
                'rounded-2xl overflow-hidden border shadow-xl',
                'bg-white border-neutral-200/80',
                'dark:bg-[#080f0a] dark:border-white/[0.07]',
              )}
              style={{
                backfaceVisibility:       'hidden',
                WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
              }}
            >
              {/* Project image */}
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw"
                  loading="lazy"
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(
                      ellipse 70% 70% at 50% 100%,
                      ${accent.glow},
                      transparent 70%
                    )`,
                  }}
                />

                {/* Featured badge */}
                {project.featured && (
                  <span className={cn(
                    'absolute top-3 left-3',
                    'inline-flex items-center gap-1 px-2.5 py-1',
                    'rounded-full bg-black/50 backdrop-blur-md',
                    'text-white text-[10px] font-bold',
                    'border border-white/10',
                  )}>
                    <Star size={8} className="fill-white" aria-hidden="true" />
                    Featured
                  </span>
                )}

                {/* Flip hint */}
                <span className={cn(
                  'absolute bottom-3 right-3',
                  'inline-flex items-center gap-1.5 px-2.5 py-1',
                  'rounded-full bg-black/40 backdrop-blur-md',
                  'text-white/50 text-[9px]',
                  'border border-white/10',
                )}>
                  <Layers size={8} aria-hidden="true" />
                  Tap for stack
                </span>
              </div>

              {/* Card body */}
              <div className="p-5">
                {/* Accent line */}
                <div
                  className="w-8 h-[2px] rounded-full mb-3"
                  style={{ background: accent.primary }}
                  aria-hidden="true"
                />

                <h3 className={cn(
                  'text-base font-bold leading-snug mb-2',
                  'text-neutral-900 dark:text-white',
                )}>
                  {project.title}
                </h3>

                <p className={cn(
                  'text-sm leading-relaxed mb-4',
                  'text-neutral-500 dark:text-white/50',
                )}>
                  {project.description}
                </p>

                {/* Tags row — first 4 only */}
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
                    <span className={cn(
                      'px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border',
                      'border-black/10 text-neutral-400',
                      'dark:border-white/10 dark:text-white/40',
                    )}>
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>

                {/* CTA buttons */}
                {/* FIX: stopPropagation on BOTH touchstart and touchend
                    Previous code stopped pointer events but touch events
                    on links were still bubbling to the card wrapper,
                    triggering accidental flips when tapping links */}
                <div className="flex gap-2.5">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="flex-1"
                    aria-label={`View ${project.title} live`}
                  >
                    <span
                      className={cn(
                        'w-full inline-flex items-center justify-center gap-1.5',
                        'px-4 py-2.5 rounded-xl text-sm font-semibold text-white',
                        'transition-transform duration-150 active:scale-95',
                        'select-none',
                      )}
                      style={{
                        background: `linear-gradient(
                          135deg,
                          ${accent.primary}dd,
                          ${accent.primary}88
                        )`,
                      }}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Demo
                    </span>
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="flex-1"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <span
                      className={cn(
                        'w-full inline-flex items-center justify-center gap-1.5',
                        'px-4 py-2.5 rounded-xl text-sm font-semibold',
                        'border transition-transform duration-150 active:scale-95',
                        'select-none',
                        'bg-black/5 border-black/10 text-neutral-700',
                        'dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/60',
                      )}
                    >
                      <Github size={13} aria-hidden="true" />
                      Code
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* ── BACK ───────────────────────────────────── */}
            <div
              className={cn(
                'absolute inset-0 rounded-2xl overflow-hidden p-6',
                'flex flex-col justify-between',
                'border border-white/[0.08]',
                'shadow-2xl',
                // Light mode back
                'bg-[#f5faf6] dark:bg-[#060d08]',
                'border-neutral-200 dark:border-white/[0.08]',
              )}
              style={{
                backfaceVisibility:       'hidden',
                WebkitBackfaceVisibility: 'hidden' as React.CSSProperties['WebkitBackfaceVisibility'],
                transform:                'rotateY(180deg)',
              }}
            >
              {/* Accent glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                  background: `radial-gradient(
                    ellipse 90% 90% at 50% 50%,
                    rgba(${accent.bloomRgb}, 0.10),
                    transparent 70%
                  )`,
                }}
              />

              {/* Grid texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                aria-hidden="true"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(${accent.bloomRgb}, 0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(${accent.bloomRgb}, 0.04) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Back content */}
              <div className="relative z-10">
                <div className="mb-5">
                  <span className={cn(
                    'text-[9px] font-bold tracking-[0.25em] uppercase',
                    'text-black/30 dark:text-white/30',
                  )}>
                    Tech Stack
                  </span>
                  <h4 className="text-lg font-bold mt-1 leading-snug text-neutral-900 dark:text-white">
                    {project.title}
                  </h4>
                  <div
                    className="w-12 h-[2px] rounded-full mt-2"
                    style={{ background: accent.primary }}
                    aria-hidden="true"
                  />
                </div>

                {/* All tags with stagger-in animation on flip */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.8, filter: 'blur(4px)', opacity: 0 }}
                      animate={
                        flipped
                          ? { scale: 1,   filter: 'blur(0px)', opacity: 1 }
                          : { scale: 0.8, filter: 'blur(4px)', opacity: 0 }
                      }
                      transition={{
                        delay:    flipped ? 0.18 + i * 0.045 : 0,
                        duration: 0.30,
                        ease:     FM_EASE.outSpring,
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        'px-3 py-1.5 rounded-xl text-[11px] font-semibold border',
                        'bg-black/[0.04] border-black/10 text-neutral-700',
                        'dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white/75',
                      )}
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

              {/* Flip back hint */}
              <div className="relative z-10 text-center pt-4">
                <span className="text-[10px] font-mono text-black/25 dark:text-white/25">
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