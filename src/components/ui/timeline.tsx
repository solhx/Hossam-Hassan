'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/utils/utils';

interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  content: React.ReactNode;
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/5 via-emerald-500/25 to-emerald-500/5" />
      {items.map((item, index) => (
        <TimelineEntry key={index} item={item} index={index} />
      ))}
    </div>
  );
}

function TimelineEntry({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={cn(
        'relative mb-12 flex flex-col md:flex-row items-start',
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      )}
    >
      <motion.div
        className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 mt-1.5"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
      >
        <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-background" />
        <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500/20 animate-[pulse-ring_2s_ease-in-out_infinite]" />
      </motion.div>

      <motion.div
        className={cn(
          'ml-12 md:ml-0 md:w-[calc(50%-2rem)]',
          isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'
        )}
        initial={{ opacity: 0, x: isEven ? -60 : 60 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="group rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/5">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
            {item.period}
          </span>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 font-medium">
            {item.subtitle}
          </p>
          <div className="text-sm text-neutral-500 dark:text-neutral-500">
            {item.content}
          </div>
        </div>
      </motion.div>
    </div>
  );
}