'use client';

import { useRef, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, MapPin, Sparkles, Download, Send } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { siteConfig, stats } from '@/lib/portfolio-data';
import { HeroBackground } from '@/components/ui/hero-background';
import {
  MaskRevealText,
  TypewriterText,
  LiquidButton,
  FadeInUp,
} from '@/components/ui/hero-text-reveal';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const HeroScene = lazy(() =>
  import('@/components/ui/hero-scene').then((m) => ({ default: m.HeroScene }))
);

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 2.6,
    },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  const { layerX, layerY, springX, springY, rotateX, rotateY } =
    useMouseParallax(40, 25);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ═══ BACKGROUND ═══ */}

      {/* Three.js — MORE visible now */}
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 to-transparent" />
        }
      >
        <HeroScene className="opacity-40 dark:opacity-50" />
      </Suspense>

      {/* Aurora + Orbs + Spotlight + Dust + Noise + Fog */}
      <HeroBackground
        layerX={layerX}
        layerY={layerY}
        springX={springX}
        springY={springY}
      />

      {/* NO text isolation overlay — background stays fully visible */}

      {/* ═══ CONTENT ═══ */}
      <motion.div
        style={
          reduced
            ? {}
            : { y: contentY, opacity: contentOpacity, scale: contentScale }
        }
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Badge */}
        <FadeInUp delay={0.3}>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] backdrop-blur-md shadow-sm shadow-emerald-500/5">
            <div className="relative flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 uppercase">
              {siteConfig.availability}
            </span>
            <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </FadeInUp>

        {/* Title */}
        <motion.div
          style={
            reduced
              ? {}
              : { rotateX, rotateY, transformPerspective: 1200 }
          }
          className="will-change-transform mb-6"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
            <MaskRevealText
              lines={["Hi, I'm"]}
              textClassName="text-foreground dark:text-neutral-300"
              lineClassName="pb-1"
              delay={0.5}
            />
            <MaskRevealText
              lines={[siteConfig.name]}
              textClassName="gradient-text"
              lineClassName="pb-1"
              delay={0.7}
            />
          </h1>
        </motion.div>

        {/* Subtitle */}
        <FadeInUp delay={1.3} className="mb-4">
          <p className="text-lg sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto font-medium leading-relaxed">
            <TypewriterText
              text="Full-Stack Developer crafting premium digital experiences with modern web technologies."
              delay={1.4}
              speed={25}
            />
          </p>
        </FadeInUp>

        {/* Location */}
        <FadeInUp delay={2.0}>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-12">
            <MapPin size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span className="tracking-wide font-medium">{siteConfig.location}</span>
          </div>
        </FadeInUp>

        {/* CTAs */}
        <FadeInUp
          delay={2.2}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <LiquidButton
            variant="primary"
            onClick={() =>
              document
                .getElementById('contact')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Send size={16} />
            Get in Touch
          </LiquidButton>

          <LiquidButton variant="secondary" href={siteConfig.resumeUrl}>
            <Download size={16} />
            Download Resume
          </LiquidButton>
        </FadeInUp>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerChild}
              className="text-center"
            >
              <NumberTicker
                value={stat.value}
                suffix="+"
                className="text-2xl sm:text-3xl font-bold dark:text-neutral-300 text-foreground"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 tracking-wide uppercase font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={() =>
          document
            .getElementById('about')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-neutral-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2 }}
        aria-label="Scroll to next section"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ArrowDown size={16} strokeWidth={1.5} />
        </motion.div>
      </motion.button>
    </section>
  );
}