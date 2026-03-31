'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  type Variants,
} from 'framer-motion';
import {
  CheckCircle2,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  Code2,
  X,
  ZoomIn,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { experiences } from '@/lib/portfolio-data';
import type { Experience } from '@/lib/mocks/experience';
import { cn } from '@/utils/utils';

// ─────────────────────────────────────────────
// Emerald palette
// ─────────────────────────────────────────────

const ACCENT = {
  bar:     'bg-gradient-to-b from-emerald-400 to-emerald-600',
  badge:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  icon:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  tech:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15 hover:bg-emerald-500/20',
  dot:     'bg-emerald-500',
  dotGlow: 'shadow-[0_0_14px_rgba(16,185,129,0.55)]',
  glow:    'hover:shadow-emerald-500/10',
  line:    'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600',
  pulse:   'bg-emerald-500',
};

// ─────────────────────────────────────────────
// Role icons
// ─────────────────────────────────────────────

function RoleIcon({ id }: { id: string }) {
  const map: Record<string, React.ReactNode> = {
    'future-interns':  <Code2         size={17} />,
    'elevvo-intern':   <Briefcase      size={17} />,
    'codveda-intern':  <Code2         size={17} />,
    'gdsc-track-lead': <Users          size={17} />,
    'route-diploma':   <GraduationCap  size={17} />,
  };
  return <>{map[id] ?? <Building2 size={17} />}</>;
}

// ─────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────

const EASE_QUART: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const cardVariants: Variants = {
  hiddenLeft:  { opacity: 0, x: -56, scale: 0.97 },
  hiddenRight: { opacity: 0, x:  56, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: EASE_QUART,
      staggerChildren: 0.07,
    },
  },
};

const rowVariants: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const badgeVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'backOut' as const },
  },
};

const dotVariants: Variants = {
  hidden:  { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 18,
      delay: 0.15,
    },
  },
};

const headingVariants: Variants = {
  hidden:  { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

// Lightbox backdrop
const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// Lightbox image panel
const lightboxVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.88, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_QUART },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 16,
    transition: { duration: 0.22, ease: 'easeIn' as const },
  },
};

// ─────────────────────────────────────────────
// Lightbox component
// ─────────────────────────────────────────────

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function Lightbox({ src, alt, onClose }: LightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Keyboard close ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Body scroll lock — no jump on close ──
  useEffect(() => {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  const prevOverflow     = document.body.style.overflow;
  const prevPaddingRight = document.body.style.paddingRight;

  // ✅ Use documentElement instead of body for better browser compat
  document.body.style.overflow     = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;

  // ✅ Also prevent iOS Safari from scrolling via touch
  const preventDefault = (e: TouchEvent) => e.preventDefault();
  document.addEventListener('touchmove', preventDefault, { passive: false });

  return () => {
    document.body.style.overflow     = prevOverflow;
    document.body.style.paddingRight = prevPaddingRight;
    document.removeEventListener('touchmove', preventDefault);
  };
}, []);


  // ── Prevent scroll leaking to body ──
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const preventLeak = (e: WheelEvent | TouchEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop    = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;

      if (e instanceof WheelEvent) {
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
      e.stopPropagation();
    };

    el.addEventListener('wheel',     preventLeak as EventListener, { passive: false });
    el.addEventListener('touchmove', preventLeak as EventListener, { passive: false });

    return () => {
      el.removeEventListener('wheel',     preventLeak as EventListener);
      el.removeEventListener('touchmove', preventLeak as EventListener);
    };
  }, []);

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/85 backdrop-blur-md',
        'flex items-start justify-center',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={`Full size image: ${alt}`}
    >
      {/* Close button — fixed to viewport */}
      <button
        onClick={onClose}
        aria-label="Close image"
        className={cn(
          'fixed top-4 right-4 z-[60]',
          'w-10 h-10 rounded-full',
          'flex items-center justify-center',
          'bg-black/60 hover:bg-black/90',
          'text-white backdrop-blur-sm',
          'border border-white/25',
          'transition-all duration-200',
          'hover:scale-110 active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        )}
      >
        <X size={20} />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          'w-full h-full',
          'overflow-y-auto overscroll-contain',
          'flex justify-center',
          'px-4 py-16 sm:py-20',
        )}
        onClick={onClose}
      >
        {/* Image panel */}
        <motion.div
          variants={lightboxVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative w-full max-w-5xl',
            'h-fit self-start',
            'rounded-2xl overflow-hidden',
            'shadow-2xl shadow-black/70',
            'border border-white/10',
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1200}
            className="w-full h-auto block"
            priority
          />

          {/* Caption */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'px-4 py-3',
              'bg-gradient-to-t from-black/75 to-transparent',
              'text-white/80 text-xs font-medium',
            )}
          >
            {alt}
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <p
        aria-hidden="true"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/40 text-xs pointer-events-none"
      >
        Scroll to see full image · Click outside or press Esc to close
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// ExperienceCard
// ─────────────────────────────────────────────

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  isLeft: boolean;
}

function ExperienceCard({ experience, index, isLeft }: ExperienceCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '0px 0px -80px 0px' });
  const initial  = isLeft ? 'hiddenLeft' : 'hiddenRight';

  // Lightbox state — local to each card, no global state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox  = useCallback(() => setLightboxOpen(true),  []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  return (
    <>
      {/* ── Lightbox portal ── rendered via AnimatePresence */}
      <AnimatePresence>
        {lightboxOpen && experience.image && (
          <Lightbox
            src={experience.image}
            alt={`${experience.company} — ${experience.role}`}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'relative flex w-full items-start',
          'md:gap-8',
          isLeft ? 'md:flex-row' : 'md:flex-row-reverse',
        )}
      >
        <motion.article
          ref={cardRef}
          aria-label={`${experience.role} at ${experience.company}`}
          variants={cardVariants}
          initial={initial}
          animate={isInView ? 'visible' : initial}
          className={cn(
            'group relative w-full md:w-[calc(50%-2rem)]',
            'overflow-hidden rounded-2xl',
            'flex flex-col',
            'bg-white dark:bg-neutral-900',
            'border border-neutral-200/80 dark:border-neutral-800',
            'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
            'shadow-sm hover:shadow-xl',
            ACCENT.glow,
            'transition-all duration-500',
          )}
        >

          {/* ── Cover image — clickable ── */}
          {experience.image && (
            <motion.div
              variants={rowVariants}
              className="relative w-full h-48 flex-shrink-0 overflow-hidden"
            >
              <Image
                src={experience.image}
                alt={`${experience.company} cover`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={index === 0}
              />

              {/* Bottom scrim */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-900 via-white/20 dark:via-neutral-900/20 to-transparent"
              />

              {/* ── Click-to-expand overlay ──
               * Sits on top of the image.
               * Shows a zoom icon + "View full image" hint on hover.
               * Clicking opens the lightbox.
               */}
              <button
                onClick={openLightbox}
                aria-label={`View full image for ${experience.company}`}
                className={cn(
                  'absolute inset-0 w-full h-full',
                  'flex flex-col items-center justify-center gap-2',
                  // Invisible by default, fades in on hover
                  'bg-black/0 hover:bg-black/40',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-300',
                  'cursor-zoom-in',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-emerald-500 focus-visible:ring-inset',
                )}
              >
                <ZoomIn
                  size={28}
                  className="text-white drop-shadow-lg"
                  aria-hidden="true"
                />
                <span className="text-white text-xs font-semibold drop-shadow-lg tracking-wide">
                  View full image
                </span>
              </button>
            </motion.div>
          )}

          {/* ── Body row: [accent bar | text content] ── */}
          <div className="flex flex-row flex-1">

            {/* Accent bar */}
            <div
              aria-hidden="true"
              className={cn(
                'w-1.5 flex-shrink-0',
                ACCENT.bar,
                experience.image
                  ? 'rounded-bl-2xl'
                  : 'rounded-tl-2xl rounded-bl-2xl',
                'transition-[width] duration-500 group-hover:w-2',
              )}
            />

            {/* Text content */}
            <div className="flex flex-col flex-1 min-w-0 gap-4 p-5 sm:p-6">

              {/* Header */}
              <motion.header variants={rowVariants}>
                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        ACCENT.icon,
                      )}
                    >
                      <RoleIcon id={experience.id} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
                        {experience.role}
                      </h3>
                      <p className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        <Building2 size={12} aria-hidden="true" />
                        {experience.company}
                      </p>
                    </div>
                  </div>

                  {/* Period badge */}
                  <time
                    dateTime={experience.period}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1.5',
                      'px-2.5 py-1 rounded-lg',
                      'text-xs font-semibold border',
                      ACCENT.badge,
                    )}
                  >
                    <Calendar size={11} aria-hidden="true" />
                    <span className="hidden sm:inline">{experience.period}</span>
                    <span className="sm:hidden">
                      {experience.period.split('–')[0].trim()}
                    </span>
                  </time>
                </div>
              </motion.header>

              {/* Divider */}
              <motion.hr
                variants={rowVariants}
                className="border-0 h-px bg-neutral-100 dark:bg-neutral-800"
              />

              {/* Description */}
              <motion.p
                variants={rowVariants}
                className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed"
              >
                {experience.description}
              </motion.p>

              {/* Achievements */}
              <motion.ul
                variants={rowVariants}
                aria-label="Key achievements"
                className="space-y-2"
              >
                {experience.achievements.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400"
                  >
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 flex-shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </motion.ul>

              {/* Tech badges */}
              <motion.div
                variants={rowVariants}
                aria-label="Technologies used"
                className="flex flex-wrap gap-1.5 pt-1"
              >
                {experience.technologies.map((tech, i) => (
                  <motion.span
                    key={tech}
                    variants={badgeVariants}
                    transition={{
                      duration: 0.28,
                      delay: i * 0.045,
                      ease: 'backOut' as const,
                    }}
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-md',
                      'text-xs font-medium border',
                      'transition-colors duration-200 cursor-default',
                      ACCENT.tech,
                    )}
                  >
                    {tech}
                  </motion.span>
                ))}
              </motion.div>

            </div>
          </div>
        </motion.article>

        {/* Centre dot — desktop only */}
        <div
          aria-hidden="true"
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-7 items-center justify-center"
        >
          <span
            className={cn(
              'absolute w-5 h-5 rounded-full opacity-25',
              ACCENT.pulse,
              'animate-[pulse-ring_2.5s_ease-in-out_infinite]',
            )}
          />
          <motion.div
            variants={dotVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={cn(
              'w-5 h-5 rounded-full z-10',
              ACCENT.dot,
              ACCENT.dotGlow,
              'ring-4 ring-background',
            )}
          />
        </div>

        {/* Desktop spacer */}
        <div aria-hidden="true" className="hidden md:block md:w-[calc(50%-2rem)]" />
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Progress line
// ─────────────────────────────────────────────

function ProgressLine() {
  const railRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 75%', 'end 25%'],
  });

  const smoothed   = useSpring(scrollYProgress, { stiffness: 70, damping: 18, restDelta: 0.001 });
  const fillHeight = useTransform(smoothed, [0, 1], ['0%', '100%']);

  return (
    <div
      ref={railRef}
      aria-hidden="true"
      className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 hidden md:block w-px"
    >
      <div className="relative h-full w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
        <motion.div
          style={{ height: fillHeight }}
          className={cn(
            'absolute top-0 left-0 w-full rounded-full',
            ACCENT.line,
            'shadow-[0_0_8px_rgba(16,185,129,0.4)]',
          )}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Mobile item
// ─────────────────────────────────────────────

function MobileItem({ experience, index }: { experience: Experience; index: number }) {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  return (
    <div ref={ref} className="relative pl-6 mb-10">
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800"
      />
      <motion.div
        aria-hidden="true"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
        className={cn(
          'absolute -left-[7px] top-6 w-3.5 h-3.5 rounded-full',
          ACCENT.dot,
          ACCENT.dotGlow,
          'ring-2 ring-background',
        )}
      />
      <ExperienceCard experience={experience} index={index} isLeft={true} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────

export function Experience() {
  const headingRef      = useRef<HTMLDivElement>(null);
  const isHeadingInView = useInView(headingRef, { once: true, margin: '-40px' });

  return (
    <section
      id="experience"
      aria-label="Experience — Career Journey"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 dot-pattern pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        <motion.div
          ref={headingRef}
          variants={headingVariants}
          initial="hidden"
          animate={isHeadingInView ? 'visible' : 'hidden'}
        >
          <SectionHeading
            badge="Experience"
            title="Career Journey"
            subtitle="A timeline of my professional growth and key achievements."
          />
        </motion.div>

        {/* Desktop */}
        <div className="relative hidden md:block mt-16">
          <ProgressLine />
          <div className="flex flex-col gap-14">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.id} experience={exp} index={i} isLeft={i % 2 === 0} />
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="mt-12 md:hidden">
          {experiences.map((exp, i) => (
            <MobileItem key={exp.id} experience={exp} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}