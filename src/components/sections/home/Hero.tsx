'use client';

import { useRef, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, MapPin, Sparkles, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextGenerate } from '@/components/ui/text-generate';
import { NumberTicker } from '@/components/ui/number-ticker';
import { siteConfig, stats } from '@/lib/portfolio-data';

const HeroScene = lazy(() =>
  import('@/components/ui/hero-scene').then((m) => ({ default: m.HeroScene }))
);

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 to-transparent" />
        }
      >
        <HeroScene className="opacity-40 dark:opacity-50" />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {siteConfig.availability}
          </span>
          <Sparkles size={14} className="text-emerald-500" />
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-2">
            <span className="text-foreground">Hi, I&apos;m</span>
            <br />
            <span className="gradient-text">{siteConfig.name}</span>
          </h1>
        </motion.div>

        <div className="mt-6 mb-4">
          <TextGenerate
            words="Full-Stack Developer crafting premium digital experiences with modern web technologies."
            className="text-lg sm:text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 max-w-3xl mx-auto font-medium"
            delay={800}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-10"
        >
          <MapPin size={14} className="text-emerald-500" />
          <span>{siteConfig.location}</span>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            variant="glow"
            size="lg"
            onClick={() =>
              document
                .getElementById('contact')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Send size={18} />
            Get in Touch
          </Button>
          <a href={siteConfig.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              <Download size={18} />
              Download Resume
            </Button>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <NumberTicker
                value={stat.value}
                suffix="+"
                className="text-2xl sm:text-3xl text-foreground"
              />
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() =>
          document
            .getElementById('about')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-neutral-400 hover:text-emerald-500 transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <span className="text-xs font-medium tracking-wider uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  );
}