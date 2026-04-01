// ✅ FULLY UPDATED — src/components/sections/home/Hero.tsx
'use client';
import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, MapPin, Sparkles, Download, Send } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { siteConfig, stats } from '@/lib/portfolio-data';
import { HeroBackground } from '@/components/ui/hero-background';
import { HeroFallback } from '@/components/ui/HeroFallback';
import {
  MaskRevealText,
  TypewriterText,
  LiquidButton,
  FadeInUp,
} from '@/components/ui/hero-text-reveal';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ── Lazy Three.js scene (heavy, not needed for LCP) ──────────────────
const HeroScene = lazy(() =>
  import('@/components/ui/hero-scene').then((m) => ({ default: m.HeroScene }))
);

// ── Animation variants ───────────────────────────────────────────────
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 2.4,
    },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

// Reduced motion variants — instant appearance
const reducedStaggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
};
const reducedStaggerChild = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.1 } },
};

const Hero = React.memo(function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // ── Hydration-safe mobile/scene detection ────────────────────────
  // useState(false) ensures server and first client render BOTH
  // render <HeroFallback> — zero hydration mismatch possible.
  // useEffect runs after hydration, then swaps to HeroScene on desktop.
  const [showScene, setShowScene] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !reduced) {
      setShowScene(true);
    }
  }, [reduced]);

  // ── Scroll parallax ──────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY       = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentScale   = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  // ✅ Updated hook call — ranges as params, not inline functions
  const {
    layerX,
    layerY,
    layerXSlow,
    layerYSlow,
    springX,
    springY,
    rotateX,
    rotateY,
  } = useMouseParallax(40, 25, 35, 25);

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Hero section"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
      // ✅ min-h-[100svh] uses small viewport height unit — prevents
      //    mobile browser chrome (address bar) from cutting off content
    >
      {/* ── BACKGROUND LAYERS ──────────────────────────────────────── */}

      {/*
        ✅ Hydration-safe pattern:
        - showScene starts as false on BOTH server and client
        - After hydration, useEffect sets showScene=true on desktop only
        - Server: <HeroFallback />
        - Client first render: <HeroFallback /> ← matches server ✅
        - Client after effect: <HeroScene /> (desktop) or <HeroFallback /> (mobile)
      */}
      {showScene ? (
        <Suspense fallback={<HeroFallback />}>
          <HeroScene className="opacity-40 dark:opacity-50" />
        </Suspense>
      ) : (
        <HeroFallback />
      )}

      {/* Aurora + Orbs + Spotlight + Dust + Noise */}
      <HeroBackground
        layerX={layerX}
        layerY={layerY}
        layerXSlow={layerXSlow}
        layerYSlow={layerYSlow}
        springX={springX}
        springY={springY}
      />

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <motion.div
        style={
          reduced
            ? {}
            : { y: contentY, opacity: contentOpacity, scale: contentScale }
        }
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-24"
        // ✅ Added py-* for safe spacing on mobile — prevents content
        //    touching nav bar at top or scroll indicator at bottom
      >
        {/* ── Availability Badge ──────────────────────────────────── */}
        <FadeInUp delay={reduced ? 0 : 0.3}>
          <div
            className="
              inline-flex items-center gap-2 px-4 py-2 mb-8 sm:mb-10
              rounded-full border border-emerald-500/30
              bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12]
              backdrop-blur-md shadow-sm shadow-emerald-500/5
            "
          >
            {/* Pulsing dot */}
            <div
              className="relative flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 uppercase">
              {siteConfig.availability}
            </span>
            <Sparkles
              size={12}
              className="text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>
        </FadeInUp>

        {/* ── Heading ─────────────────────────────────────────────── */}
        <motion.div
          style={
            reduced
              ? {}
              : { rotateX, rotateY, transformPerspective: 1200 }
          }
          className="will-change-transform mb-4 sm:mb-6"
        >
          {/*
            ✅ Single <h1> with sr-only full name for screen readers,
            visual split into two lines for the reveal animation.
            This ensures accessibility without affecting the visual design.
          */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none"
            aria-label={`Hi, I'm ${siteConfig.name}`}
          >
            <MaskRevealText
              lines={["Hi, I'm"]}
              textClassName="text-foreground dark:text-neutral-300"
              lineClassName="pb-1"
              delay={reduced ? 0 : 0.5}
              aria-hidden="true"
            />
            <MaskRevealText
              lines={[siteConfig.name]}
              textClassName="gradient-text"
              lineClassName="pb-1"
              delay={reduced ? 0 : 0.7}
              aria-hidden="true"
            />
          </h1>
        </motion.div>

        {/* ── Subtitle / Typewriter ────────────────────────────────── */}
        <FadeInUp delay={reduced ? 0 : 1.3} className="mb-3 sm:mb-4">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0">
            {/*
              ✅ Reduced max font on mobile (text-base instead of text-lg).
              Added px-2 on mobile to prevent text touching screen edges.
            */}
            <TypewriterText
              text="Full-Stack Developer crafting premium digital experiences with modern web technologies."
              delay={reduced ? 0 : 1.4}
              speed={25}
            />
          </p>
        </FadeInUp>

        {/* ── Location ─────────────────────────────────────────────── */}
        <FadeInUp delay={reduced ? 0 : 2.0}>
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-8 sm:mb-12">
            <MapPin
              size={13}
              className="text-emerald-600 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            {/* ✅ shrink-0 on icon prevents squishing on narrow screens */}
            <span className="tracking-wide font-medium">
              {siteConfig.location}
            </span>
          </div>
        </FadeInUp>

        {/* ── CTA Buttons ──────────────────────────────────────────── */}
        <FadeInUp
          delay={reduced ? 0 : 2.2}
          className="flex flex-col xs:flex-row sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 sm:px-0"
          // ✅ flex-col on smallest screens, flex-row from xs up.
          // px-4 ensures buttons don't touch edges on narrow phones.
        >
          <LiquidButton
            variant="primary"
            className="w-full xs:w-auto sm:w-auto"
            // ✅ Full width on mobile, auto on larger screens
            onClick={() =>
              document
                .getElementById('contact')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Send size={16} aria-hidden="true" />
            Get in Touch
          </LiquidButton>

          <LiquidButton
            variant="secondary"
            className="w-full xs:w-auto sm:w-auto"
            href={siteConfig.resumeUrl}
          >
            <Download size={16} aria-hidden="true" />
            Download Resume
          </LiquidButton>
        </FadeInUp>

        {/* ── Stats Grid ───────────────────────────────────────────── */}
        <motion.div
          variants={reduced ? reducedStaggerContainer : staggerContainer}
          initial="hidden"
          animate="visible"
          className="
            grid grid-cols-2 sm:grid-cols-4
            gap-x-4 gap-y-6 sm:gap-8
            max-w-xs sm:max-w-2xl mx-auto
          "
          // ✅ Explicit gap-x and gap-y for mobile.
          // max-w-xs on mobile prevents 2-col grid from being too wide.
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={reduced ? reducedStaggerChild : staggerChild}
              className="text-center"
            >
              <NumberTicker
                value={stat.value}
                suffix="+"
                className="text-2xl sm:text-3xl font-bold dark:text-neutral-300 text-foreground"
              />
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1 sm:mt-1.5 tracking-wide uppercase font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ─────────────────────────────────────────── */}
      <motion.button
        onClick={() =>
          document
            .getElementById('about')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        className="
          absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10
          flex flex-col items-center gap-1.5 sm:gap-2
          text-neutral-400 dark:text-neutral-500
          hover:text-emerald-600 dark:hover:text-emerald-400
          transition-colors duration-300 cursor-pointer
          p-2 rounded-lg
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-emerald-500 focus-visible:ring-offset-2
        "
        // ✅ Added padding and focus ring for keyboard accessibility
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 3.2 }}
        aria-label="Scroll to About section"
      >
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase select-none">
          Scroll
        </span>
        <motion.div
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        >
          <ArrowDown size={16} strokeWidth={1.5} />
        </motion.div>
      </motion.button>
    </section>
  );
});

Hero.displayName = 'Hero';
export { Hero };