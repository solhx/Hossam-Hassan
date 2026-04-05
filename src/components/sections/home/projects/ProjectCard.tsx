// src/components/sections/home/projects/ProjectCard.tsx
'use client';

import { useRef, memo, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Github, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { Project } from '@/lib/mocks/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  prefersReduced: boolean;
  isMobile: boolean;
}

// Custom easing as tuple (required by Framer Motion types)
const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Animation variants with proper typing
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: easeOut,
    },
  }),
};

// Tag animation variants
const tagVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.05,
      ease: easeOut,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: {
      duration: 0.2,
      ease: easeOut,
    },
  },
};

// Number of tags to show initially
const INITIAL_TAGS_COUNT = 6;

export const ProjectCard = memo(function ProjectCard({
  project,
  index,
  total,
  prefersReduced,
  isMobile,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showAllTags, setShowAllTags] = useState(false);

  // Scroll-based parallax (desktop only, non-reduced motion)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // Subtle parallax transform for image - disabled on mobile/reduced motion
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile || prefersReduced ? ['0%', '0%'] : ['5%', '-5%']
  );

  // Subtle scale effect on scroll
  const cardScale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    prefersReduced || isMobile ? [1, 1, 1, 1] : [0.97, 1, 1, 0.97]
  );

  const isEven = index % 2 === 0;
  const hasMoreTags = project.tags.length > INITIAL_TAGS_COUNT;
  const hiddenTagsCount = project.tags.length - INITIAL_TAGS_COUNT;

  // Tags to display based on expanded state
  const visibleTags = showAllTags
    ? project.tags
    : project.tags.slice(0, INITIAL_TAGS_COUNT);

  // Toggle tags expansion
  const toggleTags = useCallback(() => {
    setShowAllTags((prev) => !prev);
  }, []);

  return (
    <motion.article
      ref={cardRef}
      variants={prefersReduced ? undefined : cardVariants}
      initial={prefersReduced ? undefined : 'hidden'}
      whileInView={prefersReduced ? undefined : 'visible'}
      viewport={{ once: true, margin: '-100px' }}
      style={{
        scale: cardScale,
      }}
      className="relative project-card"
    >
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center'
        )}
      >
        {/* Image Section */}
        <motion.div
          className={cn(
            'relative lg:col-span-7',
            'aspect-[16/10] rounded-2xl lg:rounded-3xl overflow-hidden',
            'shadow-2xl shadow-black/10 dark:shadow-black/30',
            'ring-1 ring-black/5 dark:ring-white/5',
            // Alternate layout on desktop
            isEven ? 'lg:order-1' : 'lg:order-2'
          )}
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          {/* Image container with parallax */}
          <motion.div
            className="absolute inset-[-10%] project-image-wrapper"
            style={{ y: imageY }}
          >
            <Image
              src={project.image}
              alt={`Screenshot of ${project.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 58vw, 700px"
              className="object-cover"
              loading={index < 2 ? 'eager' : 'lazy'}
              quality={90}
            />
          </motion.div>

          {/* Gradient overlay */}
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-t from-black/40 via-transparent to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            )}
          />

          {/* Project number badge */}
          <div className="absolute top-4 left-4 z-10 project-number-badge">
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </div>

          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-4 right-4 z-10 featured-badge">
              Featured
            </div>
          )}

          {/* Quick action overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/60 backdrop-blur-sm',
              'opacity-0 hover:opacity-100',
              'transition-opacity duration-300',
              'cursor-pointer'
            )}
          >
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-2 px-6 py-3',
                  'bg-white text-black rounded-full',
                  'font-semibold text-sm',
                  'hover:bg-emerald-400 transition-colors duration-200'
                )}
              >
                <ExternalLink size={16} />
                View Live
              </Link>
            )}
          </div>
        </motion.div>

        {/* Content Section */}
        <div
          className={cn(
            'lg:col-span-5 flex flex-col gap-5',
            isEven ? 'lg:order-2' : 'lg:order-1',
            !isEven && 'lg:text-right lg:items-end'
          )}
        >
          {/* Title */}
          <motion.h3
            custom={0.1}
            variants={prefersReduced ? undefined : contentVariants}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, margin: '-50px' }}
            className={cn(
              'text-2xl sm:text-3xl lg:text-4xl',
              'font-bold tracking-tight leading-tight',
              'text-neutral-900 dark:text-white'
            )}
          >
            {project.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            custom={0.2}
            variants={prefersReduced ? undefined : contentVariants}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, margin: '-50px' }}
            className={cn(
              'text-base sm:text-lg leading-relaxed',
              'text-neutral-600 dark:text-neutral-400',
              'max-w-lg',
              !isEven && 'lg:ml-auto'
            )}
          >
            {project.description}
          </motion.p>

          {/* Tags */}
          <motion.div
            custom={0.3}
            variants={prefersReduced ? undefined : contentVariants}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, margin: '-50px' }}
            className={cn('flex flex-wrap gap-2', !isEven && 'lg:justify-end')}
            aria-label={`Technologies: ${project.tags.join(', ')}`}
          >
            <AnimatePresence mode="popLayout">
              {visibleTags.map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  custom={tagIndex}
                  variants={prefersReduced ? undefined : tagVariants}
                  initial={prefersReduced ? undefined : 'hidden'}
                  animate="visible"
                  exit="exit"
                  layout
                  className="project-tag"
                >
                  {tag}
                </motion.span>
              ))}
            </AnimatePresence>

            {/* Show more / Show less button */}
            {hasMoreTags && (
              <motion.button
                type="button"
                onClick={toggleTags}
                layout
                className={cn(
                  'project-tag cursor-pointer',
                  'hover:bg-emerald-500/20 hover:border-emerald-500/40',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                  'transition-colors duration-200',
                  'inline-flex items-center gap-1'
                )}
                aria-expanded={showAllTags}
                aria-label={
                  showAllTags
                    ? 'Show fewer technologies'
                    : `Show ${hiddenTagsCount} more technologies`
                }
              >
                {showAllTags ? (
                  <>
                    Show less
                    <ChevronDown
                      size={14}
                      className="rotate-180 transition-transform duration-200"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    +{hiddenTagsCount} more
                    <ChevronDown
                      size={14}
                      className="transition-transform duration-200"
                      aria-hidden="true"
                    />
                  </>
                )}
              </motion.button>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            custom={0.4}
            variants={prefersReduced ? undefined : contentVariants}
            initial={prefersReduced ? undefined : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, margin: '-50px' }}
            className={cn(
              'flex items-center gap-3 flex-wrap pt-2',
              !isEven && 'lg:justify-end'
            )}
          >
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} live demo (opens in new tab)`}
                className="project-btn-primary group"
              >
                Live Demo
                <ArrowUpRight
                  size={16}
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
                aria-label={`View ${project.title} source code on GitHub (opens in new tab)`}
                className="project-btn-secondary group"
              >
                <Github size={16} aria-hidden="true" />
                Source Code
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Separator line (except for last item) */}
      {index < total - 1 && (
        <div
          className="project-separator mt-20 sm:mt-28 lg:mt-36"
          aria-hidden="true"
        />
      )}
    </motion.article>
  );
});

ProjectCard.displayName = 'ProjectCard';