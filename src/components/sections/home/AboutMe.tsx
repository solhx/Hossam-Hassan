'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code2, Coffee, Rocket, Heart, Terminal, Globe } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { LightGrid } from '@/components/ui/light-grid';
import { siteConfig } from '@/lib/portfolio-data';

const highlights = [
  { icon: <Code2 size={22} />, title: 'Clean Code Advocate', description: 'Writing maintainable, scalable, and well-documented code is my passion.' },
  { icon: <Rocket size={22} />, title: 'Performance First', description: 'Every millisecond matters. I optimize for speed, accessibility, and SEO.' },
  { icon: <Coffee size={22} />, title: 'Continuous Learner', description: 'Always exploring new technologies, patterns, and best practices.' },
  { icon: <Heart size={22} />, title: 'User-Centric Design', description: 'Building interfaces that delight users with smooth interactions.' },
  { icon: <Terminal size={22} />, title: 'Full-Stack Mindset', description: 'From database design to pixel-perfect UIs, I handle the full stack.' },
  { icon: <Globe size={22} />, title: 'Open Source', description: 'Giving back to the community through open-source contributions.' },
];

export function AboutMe() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden">
      <LightGrid />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="About Me"
          title="Passionate Developer"
          subtitle="Full-Stack Developer based in Cairo, Egypt, with 5+ years of experience."
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              I specialize in the{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                MERN stack
              </span>{' '}
              and modern frontend frameworks like{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Next.js
              </span>{' '}
              and{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                TypeScript
              </span>
              . I love creating premium digital experiences with cutting-edge
              animations, smooth interactions, and pixel-perfect designs.
            </p>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When I&apos;m not coding, you&apos;ll find me exploring new
              technologies, contributing to open-source projects, or writing
              technical articles.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {siteConfig.availability}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              <div className="group h-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:bg-emerald-500/15 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}