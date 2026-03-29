'use client';

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type Variants,
} from 'framer-motion';
import { ExternalLink, Github, Star, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { projects } from '@/lib/portfolio-data';
import { cn, prefersReducedMotion } from '@/utils/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

// ─── Accent palette ───────────────────────────────────────────
const PROJECT_ACCENTS = [
  {
    glow: 'rgba(16,185,129,0.20)',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  },
  {
    glow: 'rgba(99,102,241,0.20)',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  },
  {
    glow: 'rgba(245,158,11,0.20)',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  },
  {
    glow: 'rgba(236,72,153,0.20)',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/25',
  },
  {
    glow: 'rgba(14,165,233,0.20)',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  },
  {
    glow: 'rgba(168,85,247,0.20)',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
  },
] as const;

type Accent = (typeof PROJECT_ACCENTS)[number];
type Project = (typeof projects)[number];

// ─── Typed easing tuples ──────────────────────────────────────
const EASE_OUT_EXPO   = [0.16, 1, 0.3, 1]     as const;
const EASE_IN_CUBIC   = [0.55, 0, 1, 0.45]    as const;
const EASE_SPRING_OUT = [0.34, 1.56, 0.64, 1] as const;

// ─── Framer Motion Variants ───────────────────────────────────
const wrapperVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0, y: -16, filter: 'blur(4px)',
    transition: { duration: 0.25, ease: EASE_IN_CUBIC },
  },
};

const tagVariants: Variants = {
  hidden: { opacity: 0, scale: 0.75, y: 6 },
  show: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: EASE_SPRING_OUT },
  }),
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.12 } },
};

// ═══════════════════════════════════════════════════════════════
//  Root Section
// ═══════════════════════════════════════════════════════════════
export function Projects() {
  const sectionRef   = useRef<HTMLElement>(null);
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const panelRefs    = useRef<HTMLDivElement[]>([]);
  const bgRefs       = useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const setPanelRef  = useCallback((el: HTMLDivElement | null, i: number) => {
    if (el) panelRefs.current[i] = el;
  }, []);

  const setBgRef = useCallback((el: HTMLDivElement | null, i: number) => {
    if (el) bgRefs.current[i] = el;
  }, []);

  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;

    // Small delay to ensure Lenis proxy is registered in SmoothScroll.tsx
    const timer = setTimeout(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const count = projects.length;

        // ── APPROACH: use a scrubbed tween on a counter variable
        //    rather than GSAP pin, then manually set which panel
        //    is active based on scroll progress.
        //    This avoids the Lenis/pin conflict entirely.

        const proxy = { index: 0 };

        const masterTween = gsap.to(proxy, {
          index: count - 1,
          ease: 'none',
          scrollTrigger: {
            id: 'projects-master',
            trigger: section,
            start: 'top top',
            end: () => `+=${(count - 1) * window.innerHeight}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.8,
            snap: {
              snapTo: 1 / (count - 1),
              duration: { min: 0.3, max: 0.5 },
              delay: 0.05,
              ease: 'power2.inOut',
            },
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Drive active index from scroll progress
              const newIndex = Math.round(self.progress * (count - 1));
              setActiveIndex(newIndex);

              // Drive clip-path for each panel directly from progress
              panelRefs.current.forEach((panel, i) => {
                if (!panel) return;
                if (i === 0) return; // first panel always visible

                // Panel i becomes fully visible when progress >= i/(count-1)
                const panelProgress = self.progress * (count - 1) - (i - 1);
                const clampedProgress = Math.max(0, Math.min(1, panelProgress));

                // clipPath: inset(100%→0%) as clampedProgress goes 0→1
                const insetPct = (1 - clampedProgress) * 100;
                panel.style.clipPath = `inset(${insetPct}% 0% 0% 0%)`;
              });

              // Drive background parallax
              bgRefs.current.forEach((bg, i) => {
                if (!bg) return;
                // Each bg moves -12% to +12% over the section's scroll range
                // centered around when its panel is active
                const panelCenter = i / (count - 1);
                const dist = self.progress - panelCenter;
                const yPct = dist * 24; // total range = 24%
                bg.style.transform = `scale(1.25) translateY(${yPct}%)`;
              });
            },
          },
        });

        return () => {
          masterTween.kill();
          ScrollTrigger.getById('projects-master')?.kill();
        };
      });

      return () => mm.revert();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [reduced]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '100vh' }}
    >
      {/* Floating section header */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-8 sm:pt-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            badge="Projects"
            title="Featured Work"
            subtitle="A curated selection of projects built with modern technology."
            className="mb-0"
            align="center"
          />
        </div>
      </div>

      {/* Desktop stage */}
      <div
        ref={wrapperRef}
        className="hidden md:block relative w-full h-full overflow-hidden"
      >
        {projects.map((project, index) => (
          <Panel
            key={project.id}
            project={project}
            index={index}
            isActive={activeIndex === index}
            accent={PROJECT_ACCENTS[index % PROJECT_ACCENTS.length]}
            setPanelRef={setPanelRef}
            setBgRef={setBgRef}
            reduced={reduced}
          />
        ))}

        <ProgressRail total={projects.length} active={activeIndex} />

        {/* Scroll cue */}
        <AnimatePresence>
          {activeIndex === 0 && (
            <motion.div
              key="scroll-cue"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 text-xs text-white/40 font-medium select-none pointer-events-none"
            >
              <span>Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={14} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <MobileStack />
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Panel
// ═══════════════════════════════════════════════════════════════
interface PanelProps {
  project: Project;
  index: number;
  isActive: boolean;
  accent: Accent;
  setPanelRef: (el: HTMLDivElement | null, i: number) => void;
  setBgRef: (el: HTMLDivElement | null, i: number) => void;
  reduced: boolean;
}

function Panel({
  project,
  index,
  isActive,
  accent,
  setPanelRef,
  setBgRef,
  reduced,
}: PanelProps) {
  // Mouse tilt for preview card
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 160, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left - rect.width  / 2) / rect.width)  *  12);
      mouseY.set(((e.clientY - rect.top  - rect.height / 2) / rect.height) * -12);
    },
    [mouseX, mouseY, reduced],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={(el) => setPanelRef(el, index)}
      className="absolute inset-0 w-full h-full"
      style={{
        // Panel 0 visible by default; others start fully clipped
        clipPath: index === 0
          ? 'inset(0% 0% 0% 0%)'
          : 'inset(100% 0% 0% 0%)',
        zIndex: index + 1,
      }}
    >
      {/* ── Background layer (inline style driven by GSAP onUpdate) ── */}
      <div
        ref={(el) => setBgRef(el, index)}
        className="absolute inset-0 will-change-transform"
        // Initial transform matches GSAP starting state
        style={{ transform: 'scale(1.25) translateY(0%)' }}
      >
        <Image
          src={project.image}
          alt=""
          aria-hidden="true"
          fill
          className="object-cover"
          sizes="100vw"
          priority={index === 0}
          loading={index === 0 ? 'eager' : 'lazy'}
        />

        {/* Left-heavy scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/92 via-neutral-950/60 to-neutral-950/20" />

        {/* Top scrim — keeps floating SectionHeading legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/75 via-transparent to-transparent" />

        {/* Bottom scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 via-transparent to-transparent" />

        {/* Accent glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 50% 70% at 72% 55%, ${accent.glow}, transparent 68%)`,
          }}
        />
      </div>

      {/* ── Foreground content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-12 gap-6 xl:gap-10 items-center pt-40 pb-8">

          {/* Left: text */}
          <div className="col-span-12 lg:col-span-5">
            <AnimatePresence mode="wait">
              {isActive && (
                <ContentBlock
                  key={`cb-${project.id}`}
                  project={project}
                  accent={accent}
                  reduced={reduced}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right: tiltable card */}
          <div className="col-span-12 lg:col-span-7 flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key={`card-${project.id}`}
                  initial={reduced ? false : { opacity: 0, x: 60, rotateY: -8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={reduced ? {} : {
                    opacity: 0,
                    x: -40,
                    transition: { duration: 0.22 },
                  }}
                  transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.1 }}
                  className="w-full max-w-[480px]"
                  style={{ perspective: 1200, rotateX: springY, rotateY: springX }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <PreviewCard project={project} accent={accent} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Panel counter */}
      <div
        className="absolute top-[8rem] right-6 z-20 font-mono text-[11px] tracking-[0.2em] text-white/20 select-none"
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Content Block
// ═══════════════════════════════════════════════════════════════
function ContentBlock({
  project,
  accent,
  reduced,
}: {
  project: Project;
  accent: Accent;
  reduced: boolean;
}) {
  return (
    <motion.div
      variants={reduced ? undefined : wrapperVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-5"
    >
      {project.featured && (
        <motion.div variants={reduced ? undefined : lineVariants}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold tracking-widest uppercase">
            <Star size={10} className="fill-current" />
            Featured Project
          </span>
        </motion.div>
      )}

      <motion.h3
        variants={reduced ? undefined : lineVariants}
        className="text-4xl xl:text-[2.75rem] font-extrabold text-white leading-[1.08] tracking-tight"
      >
        {project.title}
      </motion.h3>

      <motion.p
        variants={reduced ? undefined : lineVariants}
        className="text-[15px] leading-relaxed text-neutral-300 max-w-sm"
      >
        {project.description}
      </motion.p>

      <motion.div
        variants={reduced ? undefined : lineVariants}
        className="flex flex-wrap gap-2"
      >
        {project.tags.map((tag, i) => (
          <motion.span
            key={tag}
            custom={i}
            variants={reduced ? undefined : tagVariants}
            className={cn(
              'px-2.5 py-1 text-[11px] font-semibold rounded-lg border',
              accent.badge,
            )}
          >
            {tag}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        variants={reduced ? undefined : lineVariants}
        className="flex items-center gap-3 pt-1"
      >
        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="emerald"
            size="md"
            className="gap-2 shadow-lg shadow-emerald-950/40 hover:-translate-y-0.5 transition-transform duration-150"
          >
            <ExternalLink size={14} />
            Live Demo
          </Button>
        </a>
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="md"
            className="gap-2 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/35 hover:-translate-y-0.5 transition-transform duration-150"
          >
            <Github size={14} />
            Source Code
          </Button>
        </a>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Preview Card
// ═══════════════════════════════════════════════════════════════
function PreviewCard({ project, accent }: { project: Project; accent: Accent }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: [
          '0 40px 80px -12px rgba(0,0,0,0.8)',
          '0 0 0 1px rgba(255,255,255,0.07)',
          'inset 0 1px 0 rgba(255,255,255,0.08)',
        ].join(', '),
      }}
    >
      {/* Accent halo */}
      <div
        className="absolute -inset-6 -z-10 rounded-3xl opacity-40 blur-3xl pointer-events-none"
        style={{ background: accent.glow }}
        aria-hidden="true"
      />

      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 45vw, 90vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/65 via-transparent to-transparent" />
      </div>

      {/* Glass footer */}
      <div className="relative px-5 py-4 bg-neutral-950/80 backdrop-blur-xl border-t border-white/[0.07] overflow-hidden">
        <div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer-sweep_3.5s_ease-in-out_infinite] pointer-events-none"
          aria-hidden="true"
        />
        <p className="relative text-sm font-semibold text-white">{project.title}</p>
        <p className="relative text-xs text-neutral-400 mt-0.5 line-clamp-1">
          {project.description}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Progress Rail
// ═══════════════════════════════════════════════════════════════
function ProgressRail({ total, active }: { total: number; active: number }) {
  return (
    <div
      className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4"
      role="tablist"
      aria-label="Project navigation"
    >
      <div
        className="absolute top-2.5 bottom-2.5 w-px bg-white/10 left-1/2 -translate-x-1/2 -z-10"
        aria-hidden="true"
      />
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={projects[i]?.title ?? `Project ${i + 1}`}
          className="relative flex items-center justify-center w-5 h-5"
        >
          <motion.div
            animate={
              i === active
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            transition={{ duration: 0.25, ease: EASE_SPRING_OUT }}
            className="absolute inset-0 rounded-full border border-emerald-400/60"
          />
          <motion.div
            animate={
              i === active
                ? { scale: 1.3, backgroundColor: '#10b981' }
                : { scale: 1,   backgroundColor: 'rgba(255,255,255,0.2)' }
            }
            transition={{ duration: 0.25, ease: EASE_SPRING_OUT }}
            className="w-2 h-2 rounded-full"
          />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Mobile Stack
// ═══════════════════════════════════════════════════════════════
function MobileStack() {
  return (
    <div className="md:hidden w-full h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 pt-36 pb-14 space-y-5">
        {projects.map((project, index) => (
          <MobileCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}

function MobileCard({ project, index }: { project: Project; index: number }) {
  const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE_OUT_EXPO }}
      className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/[0.08] shadow-md"
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
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
        {project.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold">
            <Star size={9} className="fill-current" />
            Featured
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-bold text-neutral-900 dark:text-neutral-50 mb-1.5">
          {project.title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[11px] font-semibold rounded-md border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2.5">
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="emerald" size="sm" className="w-full gap-1.5">
              <ExternalLink size={13} /> Demo
            </Button>
          </a>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Github size={13} /> Code
            </Button>
          </a>
        </div>
      </div>
    </motion.article>
  );
}