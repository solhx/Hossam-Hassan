// src/components/sections/home/projects/ProjectCard.tsx
import Image from 'next/image';
import Link  from 'next/link';
import { Github, ArrowUpRight } from 'lucide-react';
import { cn }                   from '@/utils/utils';
import type { Project }         from '@/lib/mocks/projects';

const TAG_VARIANTS = [
  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  'bg-teal-500/10    text-teal-700    dark:text-teal-300    border-teal-500/20',
  'bg-green-500/10   text-green-700   dark:text-green-300   border-green-500/20',
  'bg-cyan-500/10    text-cyan-700    dark:text-cyan-300    border-cyan-500/20',
  'bg-emerald-400/10 text-emerald-600 dark:text-emerald-200 border-emerald-400/20',
  'bg-teal-400/10    text-teal-600    dark:text-teal-200    border-teal-400/20',
] as const;

interface ProjectCardProps {
  project:   Project;
  index:     number;
  isActive:  boolean;
  imageRef?: (el: HTMLDivElement | null) => void;
}

export function ProjectCard({
  project,
  index,
  isActive,
  imageRef,
}: ProjectCardProps) {
  return (
    <article
      aria-hidden={!isActive}
      aria-label={`Project: ${project.title}`}
      className={cn(
        'relative w-full h-full rounded-2xl overflow-hidden',
        'bg-white/95 dark:bg-neutral-900/85',
        'backdrop-blur-md',
        'border border-neutral-200/80 dark:border-white/[0.07]',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_32px_64px_-12px_rgba(0,120,80,0.14),0_8px_24px_-4px_rgba(0,120,80,0.09),0_0_0_1px_rgba(0,180,120,0.10)]',
        'dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_32px_64px_-12px_rgba(0,0,0,0.65),0_8px_24px_-4px_rgba(0,0,0,0.45),0_0_0_1px_rgba(16,185,129,0.07)]',
        'transition-shadow duration-500',
      )}
    >
      <div className="relative h-[54%] overflow-hidden">
        <div
          ref={imageRef}
          className="stack-card-image"
        >
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            priority={index === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
            className="object-cover object-top"
          />
        </div>

        <div
          aria-hidden="true"
          className={cn(
            'absolute inset-0 pointer-events-none',
            'bg-gradient-to-b from-black/5 via-transparent',
            'to-white/95 dark:to-neutral-900/95',
          )}
        />

        {project.featured && (
          <div className={cn(
            'absolute top-3 right-3 z-10',
            'px-2.5 py-0.5 rounded-full',
            'text-[10px] font-bold tracking-widest uppercase',
            'bg-emerald-500 text-white',
            'shadow-lg shadow-emerald-500/40',
          )}>
            Featured
          </div>
        )}

        <div
          aria-hidden="true"
          className={cn(
            'absolute top-3 left-3 z-10',
            'w-7 h-7 rounded-full',
            'flex items-center justify-center',
            'text-[10px] font-bold tabular-nums',
            'bg-black/35 dark:bg-black/55 text-white',
            'backdrop-blur-md border border-white/25',
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      <div className="relative h-[46%] px-5 pt-3 pb-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn(
            'text-sm sm:text-base lg:text-lg font-bold leading-snug',
            'text-neutral-900 dark:text-neutral-50',
            'line-clamp-2',
          )}>
            {project.title}
          </h3>

          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} source code on GitHub`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'w-8 h-8 rounded-full',
                  'flex items-center justify-center',
                  'bg-neutral-100 dark:bg-white/[0.05]',
                  'border border-neutral-200 dark:border-white/[0.07]',
                  'text-neutral-500 dark:text-neutral-400',
                  'hover:bg-neutral-800 dark:hover:bg-white/[0.12]',
                  'hover:text-white',
                  'hover:border-neutral-800 dark:hover:border-white/20',
                  'transition-all duration-200',
                )}
              >
                <Github size={12} aria-hidden="true" />
              </Link>
            )}
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'w-8 h-8 rounded-full',
                  'flex items-center justify-center',
                  'bg-emerald-500/10 border border-emerald-500/20',
                  'text-emerald-600 dark:text-emerald-400',
                  'hover:bg-emerald-500 hover:text-white',
                  'hover:border-emerald-500',
                  'hover:shadow-lg hover:shadow-emerald-500/30',
                  'transition-all duration-200',
                )}
              >
                <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        <p className={cn(
          'text-xs sm:text-sm leading-relaxed',
          'text-neutral-500 dark:text-neutral-400',
          'line-clamp-2 flex-1',
        )}>
          {project.description}
        </p>

        <div
          className="flex flex-wrap gap-1.5"
          aria-label={`Technologies: ${
            project.tags.slice(0, 5).join(', ')
          }${project.tags.length > 5 ? ` and ${project.tags.length - 5} more` : ''}`}
        >
          {project.tags.slice(0, 5).map((tag, ti) => (
            <span
              key={tag}
              className={cn(
                'px-2 py-0.5 rounded-full',
                'text-[10px] font-medium border',
                TAG_VARIANTS[ti % TAG_VARIANTS.length],
              )}
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 5 && (
            <span className="self-center text-[10px] text-neutral-400 dark:text-neutral-600">
              +{project.tags.length - 5}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
