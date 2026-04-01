// src/components/common/Footer.tsx
'use client';
import React from 'react';
import { Github, Linkedin, Mail, ArrowUp, Heart } from 'lucide-react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { siteConfig, socialLinks } from '@/lib/portfolio-data';
import { cn } from '@/utils/utils';

// ✅ Removed: import { motion } from 'framer-motion'
// Replaced all motion.a and motion.button with CSS transitions.
// Saves ~50KB JS on mobile, removes 2 non-composited animation warnings.
// CSS hover/active is indistinguishable from whileHover/whileTap here.

const iconMap: Record<string, React.ReactNode> = {
  github:   <Github            size={18} />,
  linkedin: <Linkedin          size={18} />,
  mail:     <Mail              size={18} />,
  whatsapp: <IconBrandWhatsapp size={18} />,
};

const Footer = React.memo(function Footer() {
  const scrollToTop = () => {
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* ── Top row ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
              H
            </div>
            <div>
              <p className="font-bold dark:text-neutral-100 text-foreground">
                {siteConfig.name}
              </p>
              <p className="text-sm text-neutral-500">{siteConfig.title}</p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              /*
                ✅ Replaced motion.a (whileHover + whileTap) with plain <a>.
                CSS handles:
                  hover:scale-110        → replaces whileHover={{ scale: 1.1 }}
                  hover:-translate-y-0.5 → replaces whileHover={{ y: -2 }}
                  active:scale-95        → replaces whileTap={{ scale: 0.95 }}
                transition-transform duration-150 — same feel, zero JS cost.
              */
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className={cn(
                  'p-2.5 rounded-xl',
                  'bg-neutral-100 dark:bg-neutral-800',
                  'text-neutral-500',
                  'hover:text-emerald-600 dark:hover:text-emerald-400',
                  'hover:bg-emerald-500/10',
                  // ✅ CSS replaces Framer Motion whileHover/whileTap
                  'hover:scale-110 hover:-translate-y-0.5',
                  'active:scale-95',
                  'transition-all duration-150',
                  // ✅ GPU compositing — prevents non-composited warning
                  'will-change-transform',
                )}
              >
                {iconMap[link.icon] ?? <Mail size={18} />}
              </a>
            ))}
          </div>

          {/* Back to top */}
          {/*
            ✅ Replaced motion.button (whileHover + whileTap) with <button>.
            CSS active:scale-95 + hover:scale-105 are composited transforms
            — identical feel, no Framer Motion runtime cost.
          */}
          <button
            onClick={scrollToTop}
            type="button"
            aria-label="Back to top of page"
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'text-sm font-medium rounded-xl cursor-pointer',
              'bg-neutral-100 dark:bg-neutral-800',
              'text-neutral-500',
              'hover:text-foreground hover:bg-emerald-500/10',
              // ✅ CSS replaces whileHover={{ scale: 1.05 }} / whileTap
              'hover:scale-105 active:scale-95',
              'transition-all duration-150',
              'will-change-transform',
            )}
          >
            <ArrowUp size={16} aria-hidden="true" />
            Back to top
          </button>
        </div>

        {/* ── Bottom row ───────────────────────────────────────────── */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 flex items-center gap-1">
            © {new Date().getFullYear()} {siteConfig.name}. Built with
            <Heart
              size={12}
              className="text-emerald-500 fill-emerald-500 mx-0.5"
              aria-hidden="true"
            />
            and lots of coffee.
          </p>
          <p className="text-xs text-neutral-400">
            Next.js • React • TypeScript • Tailwind CSS
          </p>
        </div>

      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export { Footer };