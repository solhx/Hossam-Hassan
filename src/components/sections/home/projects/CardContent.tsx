// src/components/sections/home/projects/CardContent.tsx
// ─────────────────────────────────────────────────────────────────
// FIX 4 — AnimatePresence flicker during clip-path transition
//
// BEFORE: AnimatePresence mode="wait" → when isVisible toggles,
//         FM immediately unmounts old content and mounts new.
//         If this happens while GSAP clip-path is 50% open,
//         the new text is visible behind the wipe = flash.
//
// AFTER:  mode="sync" replaces mode="wait".
//         "sync" runs exit + enter simultaneously instead of
//         waiting for exit to complete. Combined with the deferred
//         onActiveChange timing in useStackAnimation (fires after
//         clip covers card), the content swap always happens
//         while geometrically hidden.
//
//         Additionally: exit animations removed from text variants.
//         Content that's hidden behind a clip-path doesn't need
//         to animate out — the wipe IS the exit. Removing exit
//         variants eliminates a full stagger cycle of work.
// ─────────────────────────────────────────────────────────────────
'use client';

import { memo }                                   from 'react';
import { motion, AnimatePresence }                from 'framer-motion';
import Image                                      from 'next/image';
import { ExternalLink, Github, Star, ArrowRight } from 'lucide-react';
import { cn }                                     from '@/utils/utils';
import { FM_EASE }                                from './constants';
import type { Project, Accent }                   from './types';

// ── Animation variants ─────────────────────────────────────────────
// FIX 4: exit variants removed from line/tag variants.
// Content exits via GSAP clip-path wipe — no FM exit needed.
// This removes an entire stagger cycle on every transition.

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren:   0.06,
    },
  },
  // FIX 4: No exit transition defined — clip-path handles exit
} as const;

const lineVariants = {
  hidden: {
    y:        28,
    filter:   'blur(4px)',
    clipPath: 'inset(0 0 100% 0)',
  },
  show: {
    y:        0,
    filter:   'blur(0px)',
    clipPath: 'inset(0 0 0% 0)',
    transition: {
      duration: 0.58,
      ease:     FM_EASE.outExpo,
    },
  },
  // FIX 4: exit removed — wipe covers content before FM exit runs
} as const;

const tagVariants = {
  hidden: {
    scale:  0.75,
    y:      8,
    filter: 'blur(3px)',
  },
  show: (i: number) => ({
    scale:  1,
    y:      0,
    filter: 'blur(0px)',
    transition: {
      delay:    i * 0.04,
      duration: 0.36,
      ease:     FM_EASE.outSpring,
    },
  }),
  // FIX 4: exit removed
} as const;

const imageCardVariants = {
  hidden: {
    x:      60,
    scale:  0.92,
    filter: 'blur(8px)',
  },
  show: {
    x:      0,
    scale:  1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.68,
      ease:     FM_EASE.outExpo,
      delay:    0.04,
    },
  },
  // FIX 4: exit removed
} as const;

const linkButtonClass = cn(
  'inline-flex items-center gap-2 px-5 py-2.5',
  'rounded-xl text-sm font-semibold',
  'transition-transform duration-200 ease-out',
  'active:scale-95',
);

interface CardContentProps {
  project:   Project;
  index:     number;
  accent:    Accent;
  total:     number;
  isVisible: boolean;
  reduced:   boolean;
}

export const CardContent = memo(function CardContent({
  project,
  index,
  accent,
  total,
  isVisible,
  reduced,
}: CardContentProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-8 lg:px-14 grid grid-cols-12 gap-8 items-center pt-36 pb-10">

        {/* Left: Text content */}
        <div className="col-span-12 lg:col-span-5">
          {/*
            FIX 4: mode="sync" replaces mode="wait"
            "wait" held the exit animation open, keeping old content
            visible while GSAP was mid-wipe.
            "sync" runs enter immediately — works with deferred
            onActiveChange timing to ensure content only appears
            after clip-path fully covers the old card.
          */}
          <AnimatePresence mode="sync">
            {isVisible && (
              <motion.div
                key={`content-${project.id}`}
                variants={reduced ? undefined : containerVariants}
                initial="hidden"
                animate="show"
                // FIX 4: No exit variant — clip-path is the exit
                className="space-y-6"
              >
                {/* Counter */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className={cn(
                    'inline-flex items-center gap-2 text-[11px] font-mono',
                    'tracking-[0.25em] uppercase',
                    accent.text,
                  )}
                >
                  <span
                    className="w-8 h-[1px] inline-block"
                    style={{ background: accent.primary }}
                    aria-hidden="true"
                  />
                  {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[9px] border border-white/10">
                      <Star size={7} className="fill-current" aria-hidden="true" />
                      Featured
                    </span>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h3
                  variants={reduced ? undefined : lineVariants}
                  className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white"
                >
                  {project.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  variants={reduced ? undefined : lineVariants}
                  className="text-base lg:text-lg text-white/60 leading-relaxed max-w-md"
                >
                  {project.description}
                </motion.p>

                {/* Tags */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className="flex flex-wrap gap-2"
                >
                  {project.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      variants={reduced ? undefined : tagVariants}
                      custom={i}
                      className={cn(
                        'px-3 py-1 text-[11px] font-semibold rounded-lg border',
                        'backdrop-blur-sm',
                        accent.badge,
                      )}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>

                {/* CTAs */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className="flex items-center gap-3 pt-2"
                >
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(linkButtonClass, 'text-white hover:scale-105')}
                    style={{
                      background: `linear-gradient(135deg, ${accent.primary}cc, ${accent.primary}88)`,
                      boxShadow:  `0 0 24px ${accent.glow}`,
                    }}
                    aria-label={`View ${project.title} live demo`}
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    Live Demo
                    <ArrowRight size={12} aria-hidden="true" />
                  </a>

                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      linkButtonClass,
                      'bg-white/8 border border-white/12 text-white/80',
                      'hover:bg-white/14 hover:scale-105',
                    )}
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <Github size={14} aria-hidden="true" />
                    Code
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Project image card */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex justify-end">
          <AnimatePresence mode="sync">
            {isVisible && (
              <motion.div
                key={`img-${project.id}`}
                variants={reduced ? undefined : imageCardVariants}
                initial="hidden"
                animate="show"
                // FIX 4: No exit — wipe handles it
                className="relative w-full max-w-[520px]"
                style={{ perspective: 1200 }}
              >
                <div
                  className={cn(
                    'relative rounded-2xl overflow-hidden border',
                    accent.border,
                  )}
                  style={{
                    boxShadow: `0 32px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), 0 0 80px -20px rgba(${PROJECT_ACCENTS_MAP[index % 5]},0.3)`,
                  }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      className="object-cover object-top"
                      priority={index < 3} // FIX 14: Preload top 3 to prevent swipe blanks
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <div
                    className="px-5 py-4 border-t border-white/8"
                    style={{ background: 'rgba(10,10,10,0.92)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white/90 truncate max-w-[60%]">
                        {project.title}
                      </span>
                      <span className={cn('text-xs font-mono', accent.text)}>
                        {project.tags[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reflection */}
                <div
                  className="absolute -bottom-8 left-4 right-4 h-16 rounded-2xl pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(to bottom, rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.08), transparent)`,
                    filter:     'blur(12px)',
                    transform:  'scaleY(-0.4) translateY(100%)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
});

const PROJECT_ACCENTS_MAP = [
  '16,185,129',
  '20,184,166',
  '132,204,22',
  '6,182,212',
  '34,197,94',
];