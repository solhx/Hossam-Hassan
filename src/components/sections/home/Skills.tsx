// src/components/sections/home/Skills.tsx
'use client';
import React from 'react';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/ui/section-heading';
import { Marquee }        from '@/components/ui/marquee';
import { VelocityScroll } from '@/components/ui/velocity-scroll';
import { skills, skillCategories } from '@/lib/portfolio-data';
import { cn } from '@/utils/utils';

const Skills = React.memo(function Skills() {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState<string>('all');

  const filtered =
    active === 'all'
      ? skills
      : skills.filter((s) => s.category === active);

  return (
    <section
      id="skills"
      aria-label="Skills section"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-full pointer-events-none">
        <VelocityScroll defaultVelocity={2}>
          REACT • NEXT.JS • TYPESCRIPT • NODE.JS • MONGODB • TAILWIND •
        </VelocityScroll>
      </div>

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Skills & Tools"
          title="Tech Arsenal"
          subtitle="Technologies I use to build exceptional digital experiences."
        />

        {/* ── Filter buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
          role="group"
          aria-label="Filter skills by category"
        >
          <button
            onClick={() => setActive('all')}
            aria-pressed={active === 'all'}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer',
              // ✅ min touch target via padding — no global override needed
              'min-h-[44px]',
              active === 'all'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white border border-neutral-200 dark:border-neutral-700',
            )}
          >
            All
          </button>

          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              aria-pressed={active === cat.id}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer min-h-[44px]',
                active === cat.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white border border-neutral-200 dark:border-neutral-700',
              )}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* ── Skills grid ──
         * ✅ layout prop moved to individual items only — not the container.
         * Measuring the container on every filter change was triggering
         * Framer Motion to re-measure all children, which is expensive.
         */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 200,
                  // ✅ Separate, faster layout transition
                  layout: { duration: 0.2 },
                }}
              >
                <div className="group relative rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800">
                    <motion.div
                      className="h-full bg-emerald-500/40 rounded-full"
                      initial={{ width: 0 }}
                      animate={
                        isInView ? { width: `${skill.proficiency}%` } : {}
                      }
                      transition={{
                        duration: 1,
                        delay: 0.5,
                        ease: 'easeOut',
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl" aria-hidden="true">
                      {skill.icon}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {skill.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 capitalize">
                      {skill.category}
                    </span>
                    <span
                      className="text-xs font-mono text-emerald-600 dark:text-emerald-400"
                      aria-label={`${skill.proficiency} percent proficiency`}
                    >
                      {skill.proficiency}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Marquee ── */}
        <div className="mt-16" aria-hidden="true">
          <Marquee speed={25} className="py-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 mx-2"
              >
                <span className="text-lg">{skill.icon}</span>
                <span className="text-sm font-medium text-neutral-500 whitespace-nowrap">
                  {skill.name}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
});
Skills.displayName = 'Skills';
export { Skills };