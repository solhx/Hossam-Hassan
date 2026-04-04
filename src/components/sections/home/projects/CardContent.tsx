// src/components/sections/home/projects/CardContent.tsx
'use client';

import { memo }                                   from 'react';
import { motion, AnimatePresence }                from 'framer-motion';
import Image                                      from 'next/image';
import { ExternalLink, Github, Star, ArrowRight } from 'lucide-react';
import { cn }                                     from "@/utils/utils";
import { FM_EASE }                                from './constants';
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
    },
  }),
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
  return (
    <div className="absolute inset-0 z-10 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-8 lg:px-14 grid grid-cols-12 gap-8 items-center pt-36 pb-10">

        {/* ── Left: Text content ─────────────────────────── */}
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
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full',
                        'text-[9px] border',
                        // DARK: white tinted / LIGHT: accent tinted
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
                    // DARK: pure white / LIGHT: rich near-black
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
                    // DARK: muted white / LIGHT: readable dark neutral
                    'dark:text-white/60 text-neutral-600',
                  )}
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
                  {/* Live Demo — accent gradient */}
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      linkButtonClass,
                      // DARK: white text on accent / LIGHT: white text on deeper accent
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
                      // DARK: white glass / LIGHT: dark glass
                      'dark:bg-white/8 dark:border dark:border-white/12 dark:text-white/80',
                      'dark:hover:bg-white/14',
                      'bg-black/6 border border-black/10 text-neutral-700',
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

        {/* ── Right: Project image card ──────────────────── */}
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
                {/* ── Image card frame ───────────────────── */}
                <div
                  className={cn(
                    'relative rounded-2xl overflow-hidden border',
                    // DARK: accent-tinted border
                    // LIGHT: stronger border + white inner highlight
                    'dark:border-white/8',
                    'border-black/8',
                  )}
                  style={{
                    boxShadow: `
                      0 32px 64px -12px rgba(0,0,0,0.12),
                      0  8px 24px  -4px rgba(0,0,0,0.08),
                      0  0   0     1px  rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.20),
                      0  0   80px -20px rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.15)
                    `,
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      className="object-cover object-top"
                      priority={index < 3}
                    />
                    {/* DARK: dark gradient overlay */}
                    <div className="absolute inset-0 dark:block hidden bg-gradient-to-t from-black/30 to-transparent" />
                    {/* LIGHT: very light overlay — keeps image crisp */}
                    <div className="absolute inset-0 dark:hidden block bg-gradient-to-t from-white/10 to-transparent" />
                  </div>

                  {/* ── Card footer bar ─────────────────── */}
                  <div
                    className={cn(
                      'px-5 py-4 border-t',
                      // DARK: near-black footer
                      'dark:border-white/8',
                      // LIGHT: clean white footer with green tint
                      'border-black/6',
                    )}
                    style={{
                      background: `light-dark(
                        oklch(0.98 0.006 158 / 0.95),
                        rgba(10,10,10,0.92)
                      )`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-sm font-semibold truncate max-w-[60%]',
                          'dark:text-white/90 text-neutral-800',
                        )}
                      >
                        {project.title}
                      </span>
                      <span className={cn('text-xs font-mono', accent.text)}>
                        {project.tags[0]}
                      </span>
                    </div>
                  </div>

                  {/* ── Light mode: top inset highlight ─── */}
                  {/* Creates the "glass panel" depth illusion */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px dark:opacity-0 opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 70%, transparent)',
                    }}
                  />
                </div>

                {/* ── Reflection ──────────────────────── */}
                {/* DARK: accent-tinted reflection */}
                <div
                  className="absolute -bottom-8 left-4 right-4 h-16 rounded-2xl pointer-events-none dark:opacity-100 opacity-0"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(to bottom, rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.08), transparent)`,
                    filter:     'blur(12px)',
                    transform:  'scaleY(-0.4) translateY(100%)',
                  }}
                />

                {/* LIGHT: soft shadow instead of reflection */}
                <div
                  className="absolute -bottom-4 left-6 right-6 h-8 rounded-2xl pointer-events-none dark:opacity-0 opacity-100"
                  aria-hidden="true"
                  style={{
                    background: `rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.12)`,
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

const PROJECT_ACCENTS_MAP = [
  '16,185,129',
  '20,184,166',
  '132,204,22',
  '6,182,212',
  '34,197,94',
];