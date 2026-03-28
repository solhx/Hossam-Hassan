'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  Zap,
  Briefcase,
  FolderOpen,
  Mail,
  Download,
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { ToggleTheme } from '@/components/common/ToggleTheme';

const navItems = [
  { label: 'Home', href: '#hero', icon: Home },
  { label: 'About', href: '#about', icon: User },
  { label: 'Skills', href: '#skills', icon: Zap },
  { label: 'Experience', href: '#experience', icon: Briefcase },
  { label: 'Projects', href: '#projects', icon: FolderOpen },
  { label: 'Contact', href: '#contact', icon: Mail },
];

export function FloatingAppBar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 400) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentScrollY);

      const sections = navItems.map((item) => item.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ═══ Desktop ═══ */}
      <motion.nav
        className="fixed bottom-6 left-1/2 z-50 hidden md:flex items-center"
        initial={{ y: 100, x: '-50%', opacity: 0 }}
        animate={{
          y: visible ? 0 : 100,
          x: '-50%',
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-1 px-2 py-2 rounded-full glass-strong shadow-2xl shadow-black/10 dark:shadow-black/40">
          {/* Logo */}
          <motion.button
            onClick={() => scrollTo('#hero')}
            className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm mr-1 cursor-pointer"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            H
          </motion.button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.href.slice(1);

            return (
              <motion.button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-neutral-200/80 dark:bg-white/[0.08] border border-neutral-300/50 dark:border-white/[0.08]"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10 overflow-hidden whitespace-nowrap text-xs"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}

          <div className="w-px h-6 bg-neutral-300 dark:bg-white/10 mx-1" />

          {/* Theme Toggle */}
          <div className="relative w-9 h-9">
            <ToggleTheme animationType="circle-spread" />
          </div>

          {/* Resume */}
          <motion.a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={12} />
            <span>Resume</span>
          </motion.a>
        </div>
      </motion.nav>

      {/* ═══ Mobile Dock ═══ */}
      <motion.nav
        className="fixed bottom-4 left-1/2 z-50 flex md:hidden items-center"
        initial={{ y: 100, x: '-50%', opacity: 0 }}
        animate={{
          y: visible ? 0 : 100,
          x: '-50%',
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-1 px-2 py-2 rounded-full glass-strong shadow-2xl shadow-black/10 dark:shadow-black/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.href.slice(1);

            return (
              <motion.button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className={cn(
                  'relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400'
                )}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
              </motion.button>
            );
          })}
          <div className="w-px h-6 bg-neutral-300 dark:bg-white/10 mx-0.5" />
          <div className="relative w-9 h-9">
            <ToggleTheme animationType="circle-spread" />
          </div>
        </div>
      </motion.nav>
    </>
  );
}