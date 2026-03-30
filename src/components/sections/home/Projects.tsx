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
import {
  ExternalLink,
  Github,
  Star,
  ChevronDown,
  Code2,
  Layers,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { ProjectPanelBg } from '@/components/ui/project-panel-bg';
import { projects } from '@/lib/portfolio-data';
import { cn, prefersReducedMotion } from '@/utils/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

// ─── Accent palette ───────────────────────────────────────────
const PROJECT_ACCENTS = [
  {
    glow: 'rgba(16,185,129,0.22)',
    spotlight: 'rgba(16,185,129,0.08)',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    counter: 'text-emerald-500/20',
    tag: 'from-emerald-500/0 via-emerald-500/60 to-emerald-500/0',
  },
  {
    glow: 'rgba(99,102,241,0.22)',
    spotlight: 'rgba(99,102,241,0.08)',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    counter: 'text-indigo-500/20',
    tag: 'from-indigo-500/0 via-indigo-500/60 to-indigo-500/0',
  },
  {
    glow: 'rgba(245,158,11,0.22)',
    spotlight: 'rgba(245,158,11,0.08)',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    counter: 'text-amber-500/20',
    tag: 'from-amber-500/0 via-amber-500/60 to-amber-500/0',
  },
  {
    glow: 'rgba(236,72,153,0.22)',
    spotlight: 'rgba(236,72,153,0.08)',
    badge: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    counter: 'text-pink-500/20',
    tag: 'from-pink-500/0 via-pink-500/60 to-pink-500/0',
  },
  {
    glow: 'rgba(14,165,233,0.22)',
    spotlight: 'rgba(14,165,233,0.08)',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    counter: 'text-sky-500/20',
    tag: 'from-sky-500/0 via-sky-500/60 to-sky-500/0',
  },
  {
    glow: 'rgba(168,85,247,0.22)',
    spotlight: 'rgba(168,85,247,0.08)',
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    counter: 'text-violet-500/20',
    tag: 'from-violet-500/0 via-violet-500/60 to-violet-500/0',
  },
] as const;

type Accent  = (typeof PROJECT_ACCENTS)[number];
type Project = (typeof projects)[number];

// ─── Easing ───────────────────────────────────────────────────
const EASE_OUT_EXPO   = [0.16, 1, 0.3, 1]     as const;
const EASE_IN_CUBIC   = [0.55, 0, 1, 0.45]    as const;
const EASE_SPRING_OUT = [0.34, 1.56, 0.64, 1] as const;

// ─── Framer variants ──────────────────────────────────────────
const wrapperVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: 'blur(4px)',
    transition: { duration: 0.22, ease: EASE_IN_CUBIC },
  },
};

const tagVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: EASE_SPRING_OUT },
  }),
  exit: { opacity: 0, scale: 0.75, transition: { duration: 0.12 } },
};

// ═══════════════════════════════════════════════════════════════
//  Noise Overlay
// ═══════════════════════════════════════════════════════════════
function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] opacity-[0.025] mix-blend-overlay"
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
//  Cursor Follower
// ═══════════════════════════════════════════════════════════════
function CursorFollower({ active }: { active: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef  = useRef<HTMLDivElement>(null);
  const posX      = useMotionValue(0);
  const posY      = useMotionValue(0);
  const springX   = useSpring(posX, { stiffness: 500, damping: 40 });
  const springY   = useSpring(posY, { stiffness: 500, damping: 40 });
  const trailX    = useSpring(posX, { stiffness: 150, damping: 25 });
  const trailY    = useSpring(posY, { stiffness: 150, damping: 25 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      posX.set(e.clientX);
      posY.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [posX, posY]);

  return (
    <>
      <motion.div
        ref={trailRef}
        className="pointer-events-none fixed z-[998] rounded-full border border-white/10 mix-blend-difference"
        style={{
          width: 40,
          height: 40,
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: active ? 0.6 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      <motion.div
        ref={cursorRef}
        className="pointer-events-none fixed z-[999] rounded-full bg-white mix-blend-difference"
        style={{
          width: 8,
          height: 8,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Root Section
// ═══════════════════════════════════════════════════════════════
export function Projects() {
  const sectionRef  = useRef<HTMLElement>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const panelRefs   = useRef<HTMLDivElement[]>([]);
  const bgRefs      = useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex]   = useState(0);
  const [cursorActive, setCursorActive] = useState(false);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const setPanelRef = useCallback(
    (el: HTMLDivElement | null, i: number) => {
      if (el) panelRefs.current[i] = el;
    },
    [],
  );

  const setBgRef = useCallback(
    (el: HTMLDivElement | null, i: number) => {
      if (el) bgRefs.current[i] = el;
    },
    [],
  );

  // ── GSAP pin + scrub ────────────────────────────────────────
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;

    const timer = setTimeout(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const count = projects.length;
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
              const newIndex = Math.round(
                self.progress * (count - 1),
              );
              setActiveIndex(newIndex);

              panelRefs.current.forEach((panel, i) => {
                if (!panel || i === 0) return;
                const panelProgress =
                  self.progress * (count - 1) - (i - 1);
                const clamped = Math.max(0, Math.min(1, panelProgress));
                panel.style.clipPath = `inset(${(1 - clamped) * 100}% 0% 0% 0%)`;
              });

              bgRefs.current.forEach((bg, i) => {
                if (!bg) return;
                const center = i / (count - 1);
                const dist   = self.progress - center;
                bg.style.transform = `scale(1.25) translateY(${dist * 22}%)`;
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

    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <>
      <NoiseOverlay />
      <CursorFollower active={cursorActive} />

      <section
        id="projects"
        ref={sectionRef}
        className="relative w-full"
        style={{ height: '100vh' }}
        onMouseEnter={() => setCursorActive(true)}
        onMouseLeave={() => setCursorActive(false)}
      >
        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Floating header */}
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
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 text-xs text-white/35 font-medium select-none pointer-events-none"
              >
                <span className="tracking-widest uppercase text-[10px]">
                  Scroll to explore
                </span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
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
    </>
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
  setBgRef:    (el: HTMLDivElement | null, i: number) => void;
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
  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = spotlightRef.current;
      if (!el) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      el.style.background = `radial-gradient(circle 600px at ${x}% ${y}%, ${accent.spotlight}, transparent 70%)`;
    },
    [accent.spotlight],
  );

  const handleMouseLeave = useCallback(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = 'transparent';
    }
  }, []);

  return (
    <div
      ref={(el) => setPanelRef(el, index)}
      className="absolute inset-0 w-full h-full"
      style={{
        clipPath:
          index === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        zIndex: index + 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-10 transition-[background] duration-300"
        aria-hidden="true"
      />

      {/* ── Background ── */}
      <div
        ref={(el) => setBgRef(el, index)}
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'scale(1.25) translateY(0%)' }}
      >
        {/* Animated gradient background */}
        <ProjectPanelBg index={index} isActive={isActive} />

        {/* Left scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-50/90 via-neutral-50/60 to-neutral-50/10 dark:from-neutral-950/94 dark:via-neutral-950/65 dark:to-neutral-950/15" />
        {/* Top scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/75 via-transparent to-transparent dark:from-neutral-950/80 dark:via-transparent dark:to-transparent" />
        {/* Bottom scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/55 via-transparent to-transparent dark:from-neutral-950/60 dark:via-transparent dark:to-transparent" />
        {/* Accent glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 50% 70% at 72% 55%, ${accent.glow}, transparent 65%)`,
          }}
        />
      </div>

      {/* ── Foreground ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 grid grid-cols-12 gap-6 xl:gap-12 items-center pt-40 pb-8">

          {/* Left: text */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-5">
            <AnimatePresence mode="wait">
              {isActive && (
                <ContentBlock
                  key={`cb-${project.id}`}
                  project={project}
                  index={index}
                  accent={accent}
                  reduced={reduced}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right: flip card */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-6 xl:col-start-7 flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key={`card-${project.id}`}
                  initial={
                    reduced ? false : { opacity: 0, x: 60, rotateY: -8 }
                  }
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={
                    reduced
                      ? {}
                      : { opacity: 0, x: -40, transition: { duration: 0.2 } }
                  }
                  transition={{
                    duration: 0.55,
                    ease: EASE_OUT_EXPO,
                    delay: 0.1,
                  }}
                  className="w-full max-w-[500px]"
                >
                  <FlipCard project={project} accent={accent} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Panel counter */}
      <div
        className={cn(
          'absolute top-[8.5rem] right-6 z-20 font-mono text-[11px] tracking-[0.22em] select-none uppercase',
          accent.counter,
        )}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')} /{' '}
        {String(projects.length).padStart(2, '0')}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Content Block
// ═══════════════════════════════════════════════════════════════
interface ContentBlockProps {
  project: Project;
  index: number;
  accent: Accent;
  reduced: boolean;
}

function ContentBlock({
  project,
  index,
  accent,
  reduced,
}: ContentBlockProps) {
  return (
    <motion.div
      variants={reduced ? undefined : wrapperVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-5 relative"
    >
      {/* Large background counter */}
      <motion.div
        variants={reduced ? undefined : lineVariants}
        className={cn(
          'absolute -top-8 -left-2 font-black select-none pointer-events-none',
          'text-[9rem] xl:text-[11rem] leading-none',
          accent.counter,
        )}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, '0')}
      </motion.div>

      {/* Featured badge */}
      {project.featured && (
        <motion.div
          variants={reduced ? undefined : lineVariants}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md text-emerald-400 border border-emerald-500/25 text-[10px] font-bold tracking-widest uppercase">
            <Star size={9} className="fill-current" />
            Featured Project
          </span>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        variants={reduced ? undefined : lineVariants}
        className="relative z-10 text-4xl xl:text-5xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 dark:text-white"
      >
        {project.title}
      </motion.h3>

      {/* Description glass card */}
      <motion.div
        variants={reduced ? undefined : lineVariants}
        className="relative z-10 rounded-xl px-4 py-3 backdrop-blur-sm border bg-black/[0.04] border-black/[0.07] dark:bg-white/[0.04] dark:border-white/[0.07]"
      >
        <p className="text-[14px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {project.description}
        </p>
      </motion.div>

      {/* Tech tags */}
      <motion.div
        variants={reduced ? undefined : lineVariants}
        className="relative z-10 flex flex-wrap gap-2"
      >
        {project.tags.map((tag, i) => (
          <motion.span
            key={tag}
            custom={i}
            variants={reduced ? undefined : tagVariants}
            className={cn(
              'relative px-3 py-1 text-[11px] font-semibold rounded-lg border overflow-hidden',
              'backdrop-blur-sm bg-white/[0.04]',
              accent.badge,
            )}
          >
            <motion.span
              className={cn(
                'absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r',
                accent.tag,
              )}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.4 + i * 0.05,
                duration: 0.5,
                ease: EASE_OUT_EXPO,
              }}
            />
            {tag}
          </motion.span>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div
        variants={reduced ? undefined : lineVariants}
        className="relative z-10 flex items-center gap-3 pt-1"
      >
        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="emerald"
            size="md"
            className="gap-2 shadow-xl shadow-emerald-950/50 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150"
          >
            <ExternalLink size={14} />
            Live Demo
          </Button>
        </a>
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="md"
            className="gap-2 backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 border-black/15 text-neutral-700 bg-black/[0.04] hover:bg-black/[0.08] hover:border-black/30 hover:text-neutral-900 dark:border-white/15 dark:text-white/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:hover:border-white/30 dark:hover:text-white"
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
//  Flip Card
// ═══════════════════════════════════════════════════════════════
function FlipCard({
  project,
  accent,
}: {
  project: Project;
  accent: Accent;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: 1400 }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      role="button"
      aria-label={`${project.title} — hover to see tech stack`}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: EASE_SPRING_OUT }}
      >
        {/* ── FRONT ── */}
        <div
          className="relative rounded-2xl overflow-hidden w-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: [
              '0 32px 80px -10px rgba(0,0,0,0.75)',
              '0 0 0 1px rgba(255,255,255,0.06)',
              'inset 0 1px 0 rgba(255,255,255,0.08)',
            ].join(', '),
          }}
        >
          <div
            className="absolute -inset-8 -z-10 rounded-3xl opacity-40 blur-3xl pointer-events-none"
            style={{ background: accent.glow }}
            aria-hidden="true"
          />

          <div className="relative w-full aspect-[16/10] overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 45vw, 90vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/10 to-transparent" />
            {project.featured && (
              <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold shadow-sm">
                <Star size={8} className="fill-current" />
                Featured
              </div>
            )}
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/50 text-[10px] font-medium border border-white/10">
              <Layers size={9} />
              Hover for stack
            </div>
          </div>

          <div className="relative px-5 py-4 bg-neutral-950/75 backdrop-blur-2xl border-t border-white/[0.06] overflow-hidden">
            <div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer-sweep_4s_ease-in-out_infinite] pointer-events-none"
              aria-hidden="true"
            />
            <p className="relative text-sm font-bold text-white">
              {project.title}
            </p>
            <p className="relative text-xs text-neutral-400 mt-0.5 line-clamp-1">
              {project.description}
            </p>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: [
              '0 32px 80px -10px rgba(0,0,0,0.75)',
              '0 0 0 1px rgba(255,255,255,0.08)',
              'inset 0 1px 0 rgba(255,255,255,0.10)',
            ].join(', '),
          }}
        >
          <div className="absolute inset-0">
            <Image
              src={project.image}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover scale-110 blur-md"
              sizes="(min-width: 1024px) 45vw, 90vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-sm" />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${accent.glow}, transparent 70%)`,
            }}
          />

          <div className="relative z-10 h-full flex flex-col p-6 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Code2 size={14} className="text-white/40" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                  Tech Stack
                </span>
              </div>
              <h4 className="text-xl font-extrabold text-white mt-2">
                {project.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 my-4">
              {project.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    flipped
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{
                    delay: flipped ? 0.3 + i * 0.055 : 0,
                    duration: 0.3,
                    ease: EASE_SPRING_OUT,
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border',
                    'backdrop-blur-md bg-white/[0.06]',
                    accent.badge,
                  )}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: accent.glow.replace('0.22', '0.9'),
                    }}
                  />
                  {tag}
                </motion.span>
              ))}
            </div>

            <div className="flex gap-2.5">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="emerald"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                >
                  <ExternalLink size={12} />
                  Live Demo
                </Button>
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs border-white/15 text-white/80 bg-white/[0.04] hover:bg-white/[0.08]"
                >
                  <Github size={12} />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Progress Rail
// ═══════════════════════════════════════════════════════════════
function ProgressRail({
  total,
  active,
}: {
  total: number;
  active: number;
}) {
  return (
    <div
      className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
      role="tablist"
      aria-label="Project navigation"
    >
      <div className="relative flex flex-col items-center gap-3 px-2 py-3 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.07]">
        <div
          className="absolute top-3 bottom-3 w-px bg-white/10 left-1/2 -translate-x-1/2 -z-10"
          aria-hidden="true"
        />
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={projects[i]?.title ?? `Project ${i + 1}`}
            className="relative flex items-center justify-center w-4 h-4"
          >
            {i === active && (
              <motion.div
                key={`pulse-${i}`}
                className="absolute inset-0 rounded-full border border-emerald-400/40"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: EASE_SPRING_OUT }}
              />
            )}
            <motion.div
              animate={
                i === active
                  ? { scale: 1.4, backgroundColor: '#10b981' }
                  : { scale: 1, backgroundColor: 'rgba(255,255,255,0.18)' }
              }
              transition={{ duration: 0.25, ease: EASE_SPRING_OUT }}
              className="w-1.5 h-1.5 rounded-full"
            />
          </div>
        ))}
      </div>

      <motion.span
        key={active}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-[10px] text-white/30 tracking-widest"
      >
        {String(active + 1).padStart(2, '0')}
      </motion.span>
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
          <MobileCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function MobileCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const accent  = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: EASE_OUT_EXPO,
      }}
    >
      <div
        style={{ perspective: 1000 }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        aria-label={`${project.title} — tap to ${flipped ? 'see preview' : 'see tech stack'}`}
      >
        <motion.div
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: EASE_SPRING_OUT }}
          className="relative"
        >
          {/* Front */}
          <div
            className="rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.07] shadow-xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
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
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 to-transparent" />
              {project.featured && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/85 text-white text-[10px] font-bold">
                  <Star size={8} className="fill-current" />
                  Featured
                </span>
              )}
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/40 text-[9px] border border-white/10">
                <Layers size={8} />
                Tap for stack
              </span>
            </div>
            <div className="p-5">
              <h3 className="text-[15px] font-bold text-white mb-1.5">
                {project.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-semibold rounded-md border backdrop-blur-sm bg-white/[0.04]',
                      accent.badge,
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2.5">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="emerald"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <ExternalLink size={12} /> Demo
                  </Button>
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 border-white/15 text-white/80 bg-white/[0.04]"
                  >
                    <Github size={12} /> Code
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-xl p-5 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${accent.glow}, transparent 70%)`,
              }}
            />
            <div className="relative z-10">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/30">
                Tech Stack
              </span>
              <h4 className="text-base font-bold text-white mt-1 mb-3">
                {project.title}
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      flipped
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.8 }
                    }
                    transition={{
                      delay: flipped ? 0.25 + i * 0.05 : 0,
                      duration: 0.28,
                      ease: EASE_SPRING_OUT,
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-white/[0.05]',
                      accent.badge,
                    )}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: accent.glow.replace('0.22', '0.9'),
                      }}
                    />
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[10px] text-white/25">
                Tap to flip back
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}