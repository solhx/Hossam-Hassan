// src/components/sections/home/projects/CardContent.tsx
'use client';

import { memo, useRef }                           from 'react';
import { motion, AnimatePresence, useSpring,
         useTransform, useMotionValue }            from 'framer-motion';
import Image                                      from 'next/image';
import { ExternalLink, Github, Star, ArrowRight } from 'lucide-react';
import { cn }                                     from '@/utils/utils';
import { FM_EASE }                                from './constants';
import type { Project, Accent }                   from './types';

// ── Animation variants ─────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren:   0.05,
    },
  },
} as const;

// UPGRADE: lines now have a slight x drift + blur + clip
const lineVariants = {
  hidden: {
    y:        32,
    x:        -8,
    filter:   'blur(6px)',
    clipPath: 'inset(0 0 100% 0)',
    opacity:  0,
  },
  show: {
    y:        0,
    x:        0,
    filter:   'blur(0px)',
    clipPath: 'inset(0 0 0% 0)',
    opacity:  1,
    transition: {
      duration: 0.62,
      ease:     FM_EASE.outExpo,
    },
  },
} as const;

// UPGRADE: tags spring in with individual x offsets
const tagVariants = {
  hidden: {
    scale:   0.70,
    y:       10,
    x:       -6,
    filter:  'blur(4px)',
    opacity: 0,
  },
  show: (i: number) => ({
    scale:   1,
    y:       0,
    x:       0,
    filter:  'blur(0px)',
    opacity: 1,
    transition: {
      delay:    i * 0.045,
      duration: 0.40,
      ease:     FM_EASE.outSpring,
    },
  }),
} as const;

// UPGRADE: image enters from further right with more blur
const imageCardVariants = {
  hidden: {
    x:       80,
    y:       12,
    scale:   0.90,
    filter:  'blur(12px)',
    opacity: 0,
  },
  show: {
    x:       0,
    y:       0,
    scale:   1,
    filter:  'blur(0px)',
    opacity: 1,
    transition: {
      duration: 0.75,
      ease:     FM_EASE.outExpo,
      delay:    0.06,
    },
  },
} as const;

// UPGRADE: counter line has its own entrance
const counterVariants = {
  hidden: { width: 0, opacity: 0 },
  show: {
    width: 32,
    opacity: 1,
    transition: { duration: 0.55, ease: FM_EASE.outExpo, delay: 0.08 },
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

  // ── UPGRADE: Image card hover tilt ───────────────────────────
  // Independent of the GSAP shell tilt — this is a React/FM tilt
  // on the image card only (right panel) for extra depth feel
  const imageCardRef   = useRef<HTMLDivElement>(null);
  const mouseX         = useMotionValue(0);
  const mouseY         = useMotionValue(0);
  const rotateXSpring  = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 80, damping: 18 });
  const rotateYSpring  = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 80, damping: 18 });
  const scaleSpring    = useSpring(1, { stiffness: 200, damping: 20 });

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = imageCardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
    scaleSpring.set(1.025);
  };

  const handleImageMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scaleSpring.set(1);
  };

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
                className="space-y-5"
              >

                {/* ── UPGRADE: Counter with animated line ──── */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className={cn(
                    'inline-flex items-center gap-3 text-[11px] font-mono',
                    'tracking-[0.25em] uppercase',
                    accent.text,
                  )}
                >
                  {/* Animated line — grows from 0 to 32px */}
                  <motion.span
                    variants={reduced ? undefined : counterVariants}
                    className="inline-block h-[1px] shrink-0 overflow-hidden"
                    style={{ background: accent.primary }}
                    aria-hidden="true"
                  />

                  {/* UPGRADE: counter morphs with a tiny flip */}
                  <motion.span
                    key={`counter-${index}`}
                    initial={reduced ? false : { y: -14, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0,   opacity: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.38, ease: FM_EASE.snapBack, delay: 0.12 }}
                    className="tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </motion.span>

                  <span className="opacity-30">/</span>

                  <span className="opacity-50">
                    {String(total).padStart(2, '0')}
                  </span>

                  {project.featured && (
                    <motion.span
                      initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.35, ease: FM_EASE.outSpring, delay: 0.2 }}
                      className={cn(
                        'inline-flex items-center gap-1 ml-1 px-2 py-0.5',
                        'rounded-full text-[9px] border',
                        'dark:bg-white/10 dark:text-white/60 dark:border-white/10',
                        'bg-black/5 text-black/40 border-black/10',
                      )}
                    >
                      <Star size={7} className="fill-current" aria-hidden="true" />
                      Featured
                    </motion.span>
                  )}
                </motion.div>

                {/* ── Title ──────────────────────────────── */}
                <motion.h3
                  variants={reduced ? undefined : lineVariants}
                  className={cn(
                    'text-3xl lg:text-4xl xl:text-5xl font-bold',
                    'leading-[1.08] tracking-tight',
                    'dark:text-white text-neutral-900',
                  )}
                >
                  {project.title}
                </motion.h3>

                {/* ── Description ────────────────────────── */}
                <motion.p
                  variants={reduced ? undefined : lineVariants}
                  className={cn(
                    'text-base lg:text-lg leading-relaxed max-w-md',
                    'dark:text-white/60 text-neutral-600',
                  )}
                >
                  {project.description}
                </motion.p>

                {/* ── UPGRADE: Tag wave ──────────────────── */}
                {/* Each tag springs in with staggered x + scale */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className="flex flex-wrap gap-2"
                >
                  {project.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      variants={reduced ? undefined : tagVariants}
                      custom={i}
                      whileHover={reduced ? undefined : {
                        scale:  1.08,
                        y:     -2,
                        transition: { duration: 0.18, ease: FM_EASE.outSpring },
                      }}
                      className={cn(
                        'px-3 py-1 text-[11px] font-semibold rounded-lg border',
                        'backdrop-blur-sm cursor-default',
                        accent.badge,
                      )}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>

                {/* ── CTAs ───────────────────────────────── */}
                <motion.div
                  variants={reduced ? undefined : lineVariants}
                  className="flex items-center gap-3 pt-2"
                >
                  {/* Live Demo */}
                  <motion.a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(linkButtonClass, 'text-white')}
                    style={{
                      background: `linear-gradient(135deg, ${accent.primary}ee, ${accent.primary}aa)`,
                      boxShadow:  `0 0 24px ${accent.glow}, 0 4px 12px rgba(0,0,0,0.15)`,
                    }}
                    whileHover={reduced ? undefined : {
                      scale: 1.05,
                      boxShadow: `0 0 36px ${accent.glow}, 0 8px 20px rgba(0,0,0,0.2)`,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.96 }}
                    aria-label={`View ${project.title} live demo`}
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    Live Demo
                    <motion.span
                      animate={reduced ? undefined : { x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRight size={12} aria-hidden="true" />
                    </motion.span>
                  </motion.a>

                  {/* GitHub */}
                  <motion.a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      linkButtonClass,
                      'dark:bg-white/8 dark:border dark:border-white/12 dark:text-white/80',
                      'dark:hover:bg-white/14',
                      'bg-black/6 border border-black/10 text-neutral-700',
                      'hover:bg-black/10',
                    )}
                    whileHover={reduced ? undefined : {
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.96 }}
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <Github size={14} aria-hidden="true" />
                    Code
                  </motion.a>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Image card with hover tilt ─────────── */}
        <div className="col-span-12 lg:col-span-6 lg:col-start-7 flex justify-end">
          <AnimatePresence mode="sync">
            {isVisible && (
              <motion.div
                key={`img-${project.id}`}
                variants={reduced ? undefined : imageCardVariants}
                initial="hidden"
                animate="show"
                className="relative w-full max-w-[520px]"
                style={{ perspective: 1000 }}
              >
                {/* UPGRADE: FM tilt wrapper on the image card */}
                <motion.div
                  ref={imageCardRef}
                  onMouseMove={handleImageMouseMove}
                  onMouseLeave={handleImageMouseLeave}
                  style={{
                    rotateX:      rotateXSpring,
                    rotateY:      rotateYSpring,
                    scale:        scaleSpring,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className={cn(
                      'relative rounded-2xl overflow-hidden border',
                      'dark:border-white/8 border-black/8',
                    )}
                    style={{
                      boxShadow: `
                        0 32px 64px -12px rgba(0,0,0,0.12),
                        0  8px 24px  -4px rgba(0,0,0,0.08),
                        0  0   0     1px  rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.20),
                        0  0  80px -20px  rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.15)
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
                      <div className="absolute inset-0 dark:block hidden bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute inset-0 dark:hidden block bg-gradient-to-t from-white/10 to-transparent" />

                      {/* UPGRADE: shimmer overlay on image — subtle moving light */}
                      {!reduced && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(
                              105deg,
                              transparent 40%,
                              rgba(255,255,255,0.06) 50%,
                              transparent 60%
                            )`,
                            backgroundSize: '200% 100%',
                            animation: 'imageShimmer 3.5s ease-in-out infinite',
                          }}
                        />
                      )}
                    </div>

                    {/* Footer bar */}
                    <div
                      className={cn(
                        'px-5 py-4 border-t',
                        'dark:border-white/8 border-black/6',
                      )}
                      style={{
                        background: `light-dark(
                          oklch(0.98 0.006 158 / 0.95),
                          rgba(10,10,10,0.92)
                        )`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-sm font-semibold truncate max-w-[60%]',
                          'dark:text-white/90 text-neutral-800',
                        )}>
                          {project.title}
                        </span>
                        <span className={cn('text-xs font-mono', accent.text)}>
                          {project.tags[0]}
                        </span>
                      </div>
                    </div>

                    {/* Top inset highlight (light mode glass) */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px dark:opacity-0 opacity-100 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 80%, transparent)',
                      }}
                    />
                  </div>

                  {/* UPGRADE: accent glow beneath card — reacts to tilt */}
                  <motion.div
                    className="absolute -bottom-6 left-8 right-8 h-12 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.25), transparent 70%)`,
                      filter:     'blur(16px)',
                      rotateX:    rotateXSpring,
                      scaleX:     scaleSpring,
                    }}
                  />
                </motion.div>

                {/* Dark mode reflection */}
                <div
                  className="absolute -bottom-8 left-4 right-4 h-16 rounded-2xl pointer-events-none dark:opacity-100 opacity-0"
                  style={{
                    background: `linear-gradient(to bottom, rgba(${PROJECT_ACCENTS_MAP[index % 5]}, 0.08), transparent)`,
                    filter:     'blur(12px)',
                    transform:  'scaleY(-0.4) translateY(100%)',
                  }}
                />

                {/* Light mode shadow */}
                <div
                  className="absolute -bottom-4 left-6 right-6 h-8 rounded-2xl pointer-events-none dark:opacity-0 opacity-100"
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