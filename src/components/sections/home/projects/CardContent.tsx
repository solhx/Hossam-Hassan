// src/components/sections/home/projects/CardContent.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX N — Remove duplicate PROJECT_ACCENTS_MAP
// BEFORE: CardContent defined its own PROJECT_ACCENTS_MAP array
//         with hardcoded bloomRgb values. These could drift out of
//         sync with PROJECT_ACCENTS in constants.ts silently —
//         a color change in constants wouldn't update CardContent.
// AFTER:  Import PROJECT_ACCENTS_RGB_MAP from constants.ts.
//         Single source of truth — derived from PROJECT_ACCENTS.
//
// FIX O — light-dark() CSS function compatibility
// BEFORE: Card footer used light-dark() which requires the
//         color-scheme property to be set. Without it, some
//         browsers (Firefox <120) render the first value always.
// AFTER:  Split into two separate elements with dark:/light:
//         Tailwind classes — wider browser support, same visual.
//
// FIX F (continued) — transform-style flat for content
// The wrapping div in StackCard already applies transformStyle:flat.
// CardContent itself doesn't need any change — the isolation is
// at the wrapper level. Noted here for traceability.
// ─────────────────────────────────────────────────────────────────
'use client';

import { memo }                                   from 'react';
import { motion, AnimatePresence }                from 'framer-motion';
import Image                                      from 'next/image';
import { ExternalLink, Github, Star, ArrowRight } from 'lucide-react';
import { cn }                                     from '@/utils/utils';
// FIX N: Import from constants — single source of truth
import { FM_EASE, PROJECT_ACCENTS_RGB_MAP }       from './constants';
import type { Project, Accent }                   from './types';

// ── Animation variants ─────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.055,
      delayChildren:   0.06,
    },
  },
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
    },}),
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
} as const;

const linkButtonClass = cn(
  'inline-flex items-center gap-2 px-5 py-2.5',
  'rounded-xl text-sm font-semibold',
  'transition-all duration-200 ease-out',
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
  // FIX N: Use imported map — no local duplicate
  const bloomRgb = PROJECT_ACCENTS_RGB_MAP[index % PROJECT_ACCENTS_RGB_MAP.length];

  return (
    <div className="absolute inset-0 z-10 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-8 lg:px-14 grid grid-cols-12 gap-8 items-center pt-36 pb-10">

        {/* ── Left: Text content ─────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-5">
          <AnimatePresence mode="sync">
            {isVisible && (
              <motion.div
                key={`content-${project.id}`}
                variants={reduced ? undefined : containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Counter + featured badge */}
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
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full',
                        'text-[9px] border',
                        'dark:bg-white/10 dark:text-white/60 dark:border-white/10',
                        'bg-black/5 text-black/40 border-black/10',
                      )}
                    >
                      <Star size={7} className="fill-current" aria-hidden="true" />
                      Featured
                    </span>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h3
                  variants={reduced ? undefined : lineVariants}
                  className={cn(
                    'text-3xl lg:text-4xl xl:text-5xl font-bold',
                    'leading-[1.1] tracking-tight',
                    'dark:text-white text-neutral-900',
                  )}
                >
                  {project.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  variants={reduced ? undefined : lineVariants}
                  className={cn(
                    'text-base lg:text-lg leading-relaxed max-w-md',
                    'dark:text-white/60 text-neutral-600',
                  )}
                >
                  {project.description}
                </motion.p>

                {/* Tech tags */}
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

                {/* CTA buttons */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className="flex items-center gap-3 pt-2"
                >
                  {/* Live demo — accent gradient */}
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      linkButtonClass,
                      'text-white hover:scale-105 hover:brightness-110',
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${accent.primary}ee, ${accent.primary}aa)`,
                      boxShadow:  `0 0 24px ${accent.glow}, 0 4px 12px rgba(0,0,0,0.15)`,
                    }}
                    aria-label={`View ${project.title} live demo`}
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    Live Demo
                    <ArrowRight size={12} aria-hidden="true" />
                  </a>

                  {/* GitHub — glass button */}
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      linkButtonClass,
                      'hover:scale-105',
                      'dark:bg-white/[0.08] dark:border dark:border-white/[0.12] dark:text-white/80',
                      'dark:hover:bg-white/[0.14]',
                      'bg-black/[0.06] border border-black/10 text-neutral-700',
                      'hover:bg-black/10',
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

        {/* ── Right: Project image card ─────────────────────────── */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex justify-end">
          <AnimatePresence mode="sync">
            {isVisible && (
              <motion.div
                key={`img-${project.id}`}
                variants={reduced ? undefined : imageCardVariants}
                initial="hidden"
                animate="show"
                className="relative w-full max-w-[520px]"
                style={{ perspective: 1200 }}
              >
                {/* Image card frame */}
                <div
                  className={cn(
                    'relative rounded-2xl overflow-hidden border',
                    'dark:border-white/[0.08]',
                    'border-black/[0.08]',
                  )}
                  style={{
                    // FIX N: Use imported bloomRgb — no duplicate map
                    boxShadow: `
                      0 32px 64px -12px rgba(0,0,0,0.12),
                      0  8px 24px  -4px rgba(0,0,0,0.08),
                      0  0   0     1px  rgba(${bloomRgb}, 0.20),
                      0  0   80px -20px rgba(${bloomRgb}, 0.15)
                    `,
                  }}
                >
                  {/* Project screenshot */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      className="object-cover object-top"
                      priority={index < 3}
                    />
                    {/* Dark mode overlay */}
                    <div className="absolute inset-0 dark:block hidden bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Light mode overlay — keeps image crisp */}
                    <div className="absolute inset-0 dark:hidden block bg-gradient-to-t from-white/10 to-transparent" />
                  </div>

                  {/* Card footer bar
                      FIX O: Replaced light-dark() CSS function with
                      two separate divs (dark:/non-dark Tailwind classes)
                      for wider browser support (Firefox <120).        */}

                  {/* Dark mode footer */}
                  <div
                    className={cn(
                      'hidden dark:flex px-5 py-4 border-t',
                      'border-white/[0.08]',
                      'items-center justify-between',
                    )}
                    style={{ background: 'rgba(10,10,10,0.92)' }}
                  >
                    <span className="text-sm font-semibold truncate max-w-[60%] text-white/90">
                      {project.title}
                    </span>
                    <span className={cn('text-xs font-mono', accent.text)}>
                      {project.tags[0]}
                    </span>
                  </div>

                  {/* Light mode footer */}
                  <div
                    className={cn(
                      'flex dark:hidden px-5 py-4 border-t',
                      'border-black/[0.06]',
                      'items-center justify-between',
                    )}
                    style={{ background: 'oklch(0.98 0.006 158 / 0.95)' }}
                  >
                    <span className="text-sm font-semibold truncate max-w-[60%] text-neutral-800">
                      {project.title}
                    </span>
                    <span className={cn('text-xs font-mono', accent.text)}>
                      {project.tags[0]}
                    </span>
                  </div>

                  {/* Light mode: top inset glass highlight */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px dark:opacity-0 opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 80%, transparent)',
                    }}
                  />
                </div>

                {/* Dark mode reflection */}
                <div
                  className="absolute -bottom-8 left-4 right-4 h-16 rounded-2xl pointer-events-none dark:block hidden"
                  aria-hidden="true"
                  style={{
                    // FIX N: Use imported bloomRgb
                    background: `linear-gradient(to bottom, rgba(${bloomRgb}, 0.08), transparent)`,
                    filter:     'blur(12px)',
                    transform:  'scaleY(-0.4) translateY(100%)',
                  }}
                />

                {/* Light mode: soft accent shadow */}
                <div
                  className="absolute -bottom-4 left-6 right-6 h-8 rounded-2xl pointer-events-none dark:hidden block"
                  aria-hidden="true"
                  style={{
                    background: `rgba(${bloomRgb}, 0.12)`,
                    filter:     'blur(16px)',
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