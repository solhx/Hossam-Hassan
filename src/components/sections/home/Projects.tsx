'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Github, Star, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { projects } from '@/lib/portfolio-data';
import { cn, prefersReducedMotion } from '@/utils/utils';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: true, margin: '-80px' });

  const setCardRef = useCallback(
    (el: HTMLDivElement | null, index: number) => {
      if (el) cardsRef.current[index] = el;
    },
    []
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Only run horizontal scroll on desktop
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const cards = cardsRef.current.filter(Boolean);

      // Staggered entrance
      gsap.fromTo(
        cards,
        { y: 80, opacity: 0, rotateY: -10 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
        }
      );

      // Horizontal scroll
      const totalScroll = track.scrollWidth - window.innerWidth;

      const scrollTween = gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Parallax on card images
      cards.forEach((card) => {
        const img = card.querySelector('.card-image');
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        );
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div ref={headerRef} className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <SectionHeading
          badge="Projects"
          title="Featured Work"
          subtitle="Scroll horizontally to explore projects built with modern technologies."
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="hidden md:flex items-center justify-center gap-2 text-sm text-neutral-400"
        >
          <span>Scroll to explore</span>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight size={16} />
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop horizontal track */}
      <div
        ref={trackRef}
        className="hidden md:flex gap-8 pl-[max(2rem,calc((100vw-72rem)/2))] pr-16 will-change-transform"
      >
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            setRef={setCardRef}
          />
        ))}
      </div>

      {/* Mobile vertical stack */}
      <div className="md:hidden max-w-lg mx-auto px-4 space-y-6 mt-8">
        {projects.map((project, index) => (
          <MobileProjectCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

/* ═══ Desktop Card — 3D Tilt + Animated Gradient Border ═══ */

interface ProjectCardProps {
  project: (typeof projects)[number];
  index: number;
  setRef: (el: HTMLDivElement | null, index: number) => void;
}

function ProjectCard({ project, index, setRef }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height;
    const y = (e.clientX - rect.left) / rect.width;
    setTilt({ x: (x - 0.5) * -20, y: (y - 0.5) * 20 });
  };

  return (
    <div
      ref={(el) => {
        cardRef.current = el;
        setRef(el, index);
      }}
      className="flex-shrink-0 w-[420px] perspective-[1000px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      <motion.div
        className="gradient-border-animated rounded-2xl overflow-hidden h-full"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="relative rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden h-full flex flex-col">
          {/* Light reflection */}
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.1 : 0,
              background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 - tilt.x * 2}%, rgba(109,244,173,0.3) 0%, transparent 60%)`,
            }}
          />

          {/* Image */}
          <div className="relative w-full aspect-[16/10] overflow-hidden">
            <div className="card-image absolute inset-0">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700"
                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                sizes="420px"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent dark:from-neutral-950/90" />

            {project.featured && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-semibold flex items-center gap-1 z-10">
                <Star size={10} className="fill-current" />
                Featured
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-4 flex-1">
              {project.description}
            </p>

            {/* Animated tech badges */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {project.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  viewport={{ once: true }}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="emerald" size="sm" className="w-full">
                  <ExternalLink size={14} />
                  Live Demo
                </Button>
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Github size={14} />
                  Code
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══ Mobile Card ═══ */

function MobileProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      <div className="relative w-full aspect-video">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100 mb-1.5">
          {project.title}
        </h3>
        <p className="text-sm text-neutral-500 mb-3">{project.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="emerald" size="sm" className="w-full">
              <ExternalLink size={14} />
              Demo
            </Button>
          </a>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full">
              <Github size={14} />
              Code
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}