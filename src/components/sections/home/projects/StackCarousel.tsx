'use client';

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
}                                  from 'react';
import { gsap }                    from 'gsap';
import { ScrollTrigger }           from 'gsap/ScrollTrigger';
import { ScrollToPlugin }          from 'gsap/ScrollToPlugin';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Github, ChevronDown } from 'lucide-react';
import Link                        from 'next/link';
import { cn }                      from '@/utils/utils';
import type { Project }            from '@/lib/mocks/projects';

import { ProjectCard }        from './ProjectCard';
import { ProjectsBackground } from './ProjectsBackground';
import { useScrollCapture }   from './useScrollCapture';
import { useReducedMotion }   from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SCROLL_PER_CARD = 1.5;

const INFO_SPRING = {
  type:      'spring',
  stiffness: 280,
  damping:   28,
  mass:      0.8,
} as const;

// ─── InfoPanel ────────────────────────────────────────────────────

const InfoPanel = memo(function InfoPanel({
  project,
  index,
  activeIndex,
}: {
  project:     Project;
  index:       number;
  total:       number;
  activeIndex: number;
}) {
  const isActive = index === activeIndex;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 24,  filter: 'blur(8px)'  }}
          animate={{ opacity: 1, y: 0,   filter: 'blur(0px)'  }}
          exit={{   opacity: 0, y: -16,  filter: 'blur(6px)'  }}
          transition={INFO_SPRING}
          className="flex flex-col gap-3 h-full"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3 className={cn(
            'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
            'font-extrabold leading-tight tracking-tight',
            'text-neutral-900 dark:text-white',
          )}>
            {project.title}
          </h3>

          <p className={cn(
            'text-sm sm:text-base leading-relaxed',
            'text-neutral-600 dark:text-neutral-400',
            'max-w-sm line-clamp-3',
          )}>
            {project.longDescription}
          </p>

          <div
            className="flex flex-wrap gap-1.5"
            aria-label={`Technologies: ${project.tags.join(', ')}`}
          >
            {project.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium',
                  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  'border border-emerald-500/20',
                )}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} live demo (opens in new tab)`}
                className={cn(
                  'group inline-flex items-center gap-2',
                  'px-5 py-2.5 rounded-full text-sm font-semibold',
                  'bg-emerald-500 hover:bg-emerald-400 text-white',
                  'shadow-lg shadow-emerald-500/25',
                  'hover:shadow-xl hover:shadow-emerald-500/35',
                  'transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
                )}
              >
                Live Demo
                <ArrowUpRight
                  size={14}
                  aria-hidden="true"
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                />
              </Link>
            )}
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} on GitHub (opens in new tab)`}
                className={cn(
                  'group inline-flex items-center gap-2',
                  'px-5 py-2.5 rounded-full text-sm font-semibold',
                  'bg-neutral-100 dark:bg-white/[0.06]',
                  'border border-neutral-200 dark:border-white/[0.10]',
                  'text-neutral-700 dark:text-neutral-300',
                  'hover:bg-neutral-200 dark:hover:bg-white/[0.10]',
                  'hover:border-neutral-300 dark:hover:border-white/20',
                  'transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
                )}
              >
                <Github size={14} aria-hidden="true" />
                Source
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── ProgressDots ─────────────────────────────────────────────────

const ProgressDots = memo(function ProgressDots({
  total,
  active,
  onDotClick,
}: {
  total:      number;
  active:     number;
  onDotClick: (i: number) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Project navigation"
      className="flex items-center gap-1.5 flex-shrink-0"
    >
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={`Go to project ${i + 1}`}
          onClick={() => onDotClick(i)}
          style={{
            width:        i === active ? '20px' : '6px',
            height:       '6px',
            background:   i === active
              ? 'rgb(16 185 129)'
              : 'rgba(255,255,255,0.2)',
            borderRadius: '9999px',
            flexShrink:   0,
            cursor:       'pointer',
            transition:   'width 500ms cubic-bezier(0.16,1,0.3,1), background 300ms ease',
            outline:      'none',
            border:       'none',
            padding:      0,
          }}
        />
      ))}
    </div>
  );
});

// ─── ScrollCue ────────────────────────────────────────────────────

const ScrollCue = memo(function ScrollCue({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y:  0 }}
          exit={{   opacity: 0, y:  8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          aria-hidden="true"
          className={cn(
            'absolute bottom-6 left-1/2 -translate-x-1/2 z-20',
            'flex flex-col items-center gap-1',
            'text-[11px] font-medium tracking-widest uppercase',
            'text-neutral-400 dark:text-neutral-500',
            'animate-[stack-cue-fade_2s_ease-in-out_2.5s_infinite]',
            'pointer-events-none select-none',
          )}
        >
          <span>Scroll</span>
          <ChevronDown size={13} />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Types ────────────────────────────────────────────────────────

interface StackCarouselProps {
  projects: Project[];
}

interface InitScrollTriggerParams {
  section:        HTMLElement;
  total:          number;
  prefersReduced: boolean;
  shellRefs:      React.MutableRefObject<(HTMLDivElement | null)[]>;
  revealRefs:     React.MutableRefObject<(HTMLDivElement | null)[]>;
  bloomRefs:      React.MutableRefObject<(HTMLDivElement | null)[]>;
  imageRefs:      React.MutableRefObject<(HTMLDivElement | null)[]>;
  bgRef:          React.MutableRefObject<HTMLDivElement | null>;
  activeIndexRef: React.MutableRefObject<number>;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowCue:     React.Dispatch<React.SetStateAction<boolean>>;
  captureScroll:  () => void;
  releaseScroll:  () => void;
}

// ─── initScrollTrigger ────────────────────────────────────────────

function initScrollTrigger(params: InitScrollTriggerParams): () => void {
  const {
    section, total, prefersReduced,
    shellRefs, revealRefs, bloomRefs, imageRefs, bgRef,
    activeIndexRef, setActiveIndex, setShowCue,
    captureScroll, releaseScroll,
  } = params;

  const pinEnd = `+=${(total - 1) * SCROLL_PER_CARD * 100}vh`;

  const updateIndex = (newIdx: number) => {
    if (activeIndexRef.current === newIdx) return;
    activeIndexRef.current = newIdx;
    setActiveIndex(newIdx);
  };

  if (prefersReduced) {
    const st = ScrollTrigger.create({
      trigger:    section,
      start:      'top top',
      end:        pinEnd,
      pin:        true,
      pinSpacing: true,
      onUpdate: (self) => {
        const idx = Math.min(Math.floor(self.progress * total), total - 1);
        updateIndex(idx);
      },
      onEnter:     captureScroll,
      onEnterBack: captureScroll,
      onLeave:     releaseScroll,
      onLeaveBack: releaseScroll,
    });
    ScrollTrigger.refresh();
    return () => { st.kill(); releaseScroll(); };
  }

  for (let i = 0; i < total; i++) {
    const shell  = shellRefs.current[i];
    const reveal = revealRefs.current[i];
    const bloom  = bloomRefs.current[i];
    const img    = imageRefs.current[i];
    if (!shell || !reveal) continue;
    if (i === 0) {
      gsap.set(shell,  { scale: 1, y: 0, opacity: 1 });
      gsap.set(reveal, { clipPath: 'inset(0% 0% 0% round 16px)' });
      if (img) gsap.set(img, { y: '0%' });
    } else {
      gsap.set(shell,  { scale: 0.94 - (i - 1) * 0.015, y: 20 + (i - 1) * 6, opacity: 0 });
      gsap.set(reveal, { clipPath: 'inset(100% 0% 0% round 16px)' });
      if (img) gsap.set(img, { y: '-6%' });
    }
    if (bloom) gsap.set(bloom, { opacity: 0, scale: 0.6 });
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger:       section,
      start:         'top top',
      end:           pinEnd,
      scrub:         2,
      pin:           true,
      pinSpacing:    true,
      anticipatePin: 1,
      fastScrollEnd: true,
      onEnter:     () => { captureScroll(); setShowCue(false); },
      onEnterBack: () => { captureScroll(); },
      onLeave:     () => { releaseScroll(); },
      onLeaveBack: () => { releaseScroll(); setShowCue(true); },
      onUpdate: (self) => {
        const idx = Math.min(Math.floor(self.progress * (total - 1) + 0.08), total - 1);
        updateIndex(idx);
      },
    },
  });

  for (let i = 0; i < total - 1; i++) {
    const outShell  = shellRefs.current[i];
    const outReveal = revealRefs.current[i];
    const inShell   = shellRefs.current[i + 1];
    const inReveal  = revealRefs.current[i + 1];
    const inBloom   = bloomRefs.current[i + 1];
    const inImg     = imageRefs.current[i + 1];
    if (!outShell || !outReveal || !inShell || !inReveal) continue;

    const L = `card${i}`;
    tl.addLabel(L);

    tl.call(() => {
      gsap.set(outShell,  { willChange: 'transform, opacity' });
      gsap.set(outReveal, { willChange: 'clip-path' });
      gsap.set(inShell,   { willChange: 'transform, opacity' });
      gsap.set(inReveal,  { willChange: 'clip-path' });
    }, [], L);

    tl.to(outReveal, { clipPath: 'inset(0% 0% 100% round 16px)', ease: 'power2.inOut', duration: 0.70 }, L);
    tl.to(outShell,  { scale: 0.88, y: -28, opacity: 0, ease: 'power2.inOut', duration: 0.75 }, L);
    tl.to(inShell,   { scale: 1, y: 0, opacity: 1, ease: 'power3.out', duration: 0.85 }, `${L}+=0.12`);
    tl.to(inReveal,  { clipPath: 'inset(0% 0% 0% round 16px)', ease: 'power3.out', duration: 0.80 }, `${L}+=0.18`);

    if (inImg)   tl.to(inImg,   { y: '0%', ease: 'power2.out', duration: 0.95 }, `${L}+=0.12`);
    if (inBloom) {
      tl.to(inBloom, { opacity: 0.55, scale: 1.0, ease: 'power1.in',  duration: 0.22 }, `${L}+=0.38`);
      tl.to(inBloom, { opacity: 0,    scale: 1.6, ease: 'power2.out', duration: 0.38 }, `${L}+=0.60`);
    }

    tl.call(() => {
      gsap.set(outShell,  { willChange: 'auto' });
      gsap.set(outReveal, { willChange: 'auto' });
      gsap.set(inShell,   { willChange: 'auto' });
      gsap.set(inReveal,  { willChange: 'auto' });
    }, [], `${L}+=0.98`);
  }

  const bgCtx = gsap.context(() => {
    if (bgRef.current) {
      gsap.fromTo(bgRef.current, { opacity: 0 }, {
        opacity: 1,
        ease:    'power1.out',
        scrollTrigger: {
          trigger: section,
          start:   'top 85%',
          end:     'top top',
          scrub:   true,
        },
      });
    }
  });

  requestAnimationFrame(() => ScrollTrigger.refresh(true));

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    bgCtx.revert();
    ScrollTrigger.getAll()
      .filter((st) => st.trigger === section)
      .forEach((st) => st.kill());
    releaseScroll();
    setActiveIndex(0);
    activeIndexRef.current = 0;
    setShowCue(true);
  };
}

// ─── StackCarousel ────────────────────────────────────────────────

export function StackCarousel({ projects }: StackCarouselProps) {

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const shellRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bloomRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs  = useRef<(HTMLDivElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showCue,     setShowCue]     = useState(true);

  const activeIndexRef = useRef(0);
  const stReadyRef     = useRef(false);

  const { captureScroll, releaseScroll } = useScrollCapture();
  const prefersReduced                   = useReducedMotion();
  const total                            = projects.length;

  const scrollToIndex = useCallback((targetIndex: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop   = section.getBoundingClientRect().top + window.scrollY;
    const targetScroll = sectionTop + targetIndex * SCROLL_PER_CARD * window.innerHeight;
    releaseScroll();
    gsap.to(window, {
      scrollTo:   { y: targetScroll, autoKill: false },
      duration:   0.7,
      ease:       'power2.inOut',
      overwrite:  'auto',
      onComplete: captureScroll,
    });
  }, [captureScroll, releaseScroll]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let rafId1: number, rafId2: number;
    let refreshTimeout: ReturnType<typeof setTimeout>;
    let cleanupFn: (() => void) | undefined;

    rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        const init = () => {
          cleanupFn = initScrollTrigger({
            section, total, prefersReduced,
            shellRefs, revealRefs, bloomRefs, imageRefs, bgRef,
            activeIndexRef, setActiveIndex, setShowCue,
            captureScroll, releaseScroll,
          });
          stReadyRef.current = true;
          refreshTimeout = setTimeout(() => {
            if (stReadyRef.current) ScrollTrigger.refresh(true);
          }, 400);
        };
        if (document.fonts?.ready) document.fonts.ready.then(init);
        else init();
      });
    });

    return () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
      clearTimeout(refreshTimeout);
      cleanupFn?.();
      stReadyRef.current = false;
    };
  }, [captureScroll, releaseScroll, prefersReduced, total]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (stReadyRef.current) ScrollTrigger.refresh(true);
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const section = sectionRef.current;
      if (!section) return;
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) releaseScroll();
      if (stReadyRef.current) requestAnimationFrame(() => ScrollTrigger.refresh(true));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [releaseScroll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      if (!section.contains(document.activeElement) && document.activeElement !== section) return;
      const cur = activeIndexRef.current;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); scrollToIndex(Math.min(cur + 1, total - 1)); }
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); scrollToIndex(Math.max(cur - 1, 0)); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [total, scrollToIndex]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      tabIndex={-1}
      aria-label={`Projects — ${total} projects. Use arrow keys or scroll to navigate.`}
      className="relative w-full h-screen h-screen"
    >
      <ProjectsBackground ref={bgRef} />

      <div className={cn(
        'relative z-10 w-full h-full',
        'flex flex-col lg:flex-row',
        'items-center justify-center',
        'px-4 sm:px-8 lg:px-14 xl:px-24',
        'gap-6 lg:gap-12 xl:gap-20',
        'max-w-7xl mx-auto',
      )}>

        {/* ── INFO PANEL ───────────────────────────────────────── */}
        <div className={cn(
          'relative z-10 flex flex-col',
          'w-full lg:w-[44%] xl:w-[40%]',
          'flex-shrink-0',
          'order-2 lg:order-1',
        )}>

          {/* Static header */}
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400">
              Portfolio
            </span>
            <h2 className={cn(
              'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
              'font-extrabold tracking-tight leading-none',
              'text-neutral-900 dark:text-white',
            )}>
              My{' '}
              <span className="gradient-text">Projects</span>
            </h2>
          </div>

          {/* Counter — updates with activeIndex */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400">
              {String(activeIndex + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(total).padStart(2, '0')}
            </span>
            <div
              aria-hidden="true"
              className="flex-1 h-px bg-gradient-to-r from-emerald-500/40 to-transparent"
            />
          </div>

          {/* Animated content — fixed height so nav never jumps */}
          <div className="relative h-[260px] sm:h-[280px] lg:h-[300px] mb-6">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className={cn(
                  'absolute inset-0',
                  i === activeIndex ? 'pointer-events-auto' : 'pointer-events-none',
                )}
              >
                <InfoPanel
                  project={project}
                  index={i}
                  total={total}
                  activeIndex={activeIndex}
                />
              </div>
            ))}
          </div>

          {/* Nav row — dots + progress bar, compact and left-aligned */}
          <div className="flex items-center mt-20 gap-2.5">
            <ProgressDots
              total={total}
              active={activeIndex}
              onDotClick={scrollToIndex}
            />
            {/* Progress bar — fixed width, never stretches */}
            <div
              aria-hidden="true"
              style={{
                width:        '56px',
                height:       '3px',
                borderRadius: '9999px',
                overflow:     'hidden',
                background:   'rgba(255,255,255,0.08)',
                flexShrink:    0,
              }}
            >
              <div
                style={{
                  height:       '100%',
                  borderRadius: '9999px',
                  background:   'linear-gradient(to right, rgb(16 185 129), rgb(45 212 191))',
                  width:        `${((activeIndex + 1) / total) * 100}%`,
                  transition:   'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

        </div>

        {/* ── CARD STACK ───────────────────────────────────────── */}
        <div
          className={cn(
            'relative',
            'w-full lg:w-[56%] xl:w-[60%]',
            'order-1 lg:order-2',
            'aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3]',
            'max-h-[380px] sm:max-h-[440px] lg:max-h-[500px] xl:max-h-[540px]',
          )}
          aria-label={`Showing: ${projects[activeIndex]?.title ?? ''}`}
        >
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => { shellRefs.current[i] = el; }}
              className="stack-card-shell"
              style={{ zIndex: i }}
            >
              <div
                ref={(el) => { bloomRefs.current[i] = el; }}
                className="stack-card-bloom"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, rgba(16,185,129,0.55) 0%, transparent 68%)',
                }}
              />
              <div
                ref={(el) => { revealRefs.current[i] = el; }}
                className="stack-card-reveal"
              >
                <ProjectCard
                  project={project}
                  index={i}
                  isActive={i === activeIndex}
                  imageRef={(el) => { imageRefs.current[i] = el; }}
                />
              </div>
            </div>
          ))}

          <ScrollCue visible={showCue && activeIndex === 0} />
        </div>

      </div>
    </section>
  );
}