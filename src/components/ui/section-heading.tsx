// src/components/ui/section-heading.tsx
'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/utils/utils';

interface SectionHeadingProps {
  badge?:     string;
  title:      string;
  subtitle?:  string;
  className?: string;
  align?:     'left' | 'center';
}

/*
 * FIX: Removed double animation system.
 *
 * BEFORE: Component used BOTH:
 *   1. useInView() → isInView boolean → animate={isInView ? {...} : {}}
 *   2. The parent (Projects.tsx) wrapped this in a motion.div
 *      with its own whileInView={{ opacity:1, y:0 }}
 *
 * This caused two problems:
 *   a) Both systems ran simultaneously on the same elements
 *   b) useInView with once:true kept the ref alive permanently,
 *      consuming an IntersectionObserver entry for the lifetime
 *      of the page even after the animation completed.
 *
 * FIX: Use whileInView directly on the motion elements.
 * whileInView is handled entirely by Framer Motion's internal
 * IntersectionObserver — no manual ref needed, observer is
 * automatically disconnected after once:true fires.
 *
 * The parent motion.div wrapper in Projects.tsx handles the
 * heading entrance as a whole unit. The individual elements
 * here animate their own entrance independently.
 *
 * WHY keep individual whileInView here (not just rely on parent):
 * SectionHeading is used in OTHER sections too (About, Skills,
 * Experience). Those sections don't have the parent motion wrapper.
 * The component must be self-contained.
 */
export function SectionHeading({
  badge,
  title,
  subtitle,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-16',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {badge && (
        <motion.span
          /*
           * viewport.once:true → IntersectionObserver auto-disconnects
           * after animation fires. Zero ongoing observer cost.
           *
           * viewport.margin:'-80px' → fires 80px before element
           * reaches viewport. Gives FM time to start the animation
           * before the element is fully visible — smoother entrance.
           *
           * amount:0 → trigger as soon as ANY part of the element
           * enters the viewport (not waiting for full visibility).
           */
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px', amount: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        >
          {badge}
        </motion.span>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px', amount: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
      >
        <span className="gradient-text">{title}</span>
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px', amount: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-2xl text-base sm:text-lg text-neutral-500 dark:text-neutral-400 mx-auto"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}