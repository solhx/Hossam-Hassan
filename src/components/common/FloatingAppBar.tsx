'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
   type MotionStyle, 
} from 'framer-motion';
import {
  Home,
  User,
  Zap,
  Briefcase,
  FolderOpen,
  Mail,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/utils';
import { ToggleTheme } from '@/components/common/ToggleTheme';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  isThemeToggle?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */

const NAV_SECTIONS = [
  { label: 'Home',       href: '#hero',       icon: <Home size={18} /> },
  { label: 'About',      href: '#about',      icon: <User size={18} /> },
  { label: 'Skills',     href: '#skills',     icon: <Zap size={18} /> },
  { label: 'Experience', href: '#experience', icon: <Briefcase size={18} /> },
  { label: 'Projects',   href: '#projects',   icon: <FolderOpen size={18} /> },
  { label: 'Contact',    href: '#contact',    icon: <Mail size={18} /> },
];

/* ═══════════════════════════════════════════════════════════════
   ICON CONTAINER — Magnification (desktop, grows UPWARD)
   ═══════════════════════════════════════════════════════════════ */

function IconContainer({
  mouseX,
  label,
  icon,
  href,
  isActive = false,
  onClick,
  isThemeToggle = false,
}: {
  mouseX: MotionValue<number>;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  isThemeToggle?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync  = useTransform(distance, [-150, 0, 150], [38, 62, 38]);
  const heightSync = useTransform(distance, [-150, 0, 150], [38, 62, 38]);
  const iconSync   = useTransform(distance, [-150, 0, 150], [16, 26, 16]);

  const width    = useSpring(widthSync,  { mass: 0.1, stiffness: 150, damping: 12 });
  const height   = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 });
  const iconSize = useSpring(iconSync,   { mass: 0.1, stiffness: 150, damping: 12 });

  const tooltipAndDot = (
    <>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 3, x: '-50%' }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute -top-9 left-1/2 z-50 pointer-events-none',
              'whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium',
              'bg-white/90 dark:bg-neutral-800/90',
              'border border-neutral-200/80 dark:border-white/10',
              'text-neutral-700 dark:text-neutral-200',
              'shadow-lg backdrop-blur-md'
            )}
          >
            {label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/90 dark:bg-neutral-800/90 border-r border-b border-neutral-200/80 dark:border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="desktop-active-dot"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        )}
      </AnimatePresence>
    </>
  );

  const containerClasses = cn(
    'relative flex items-center justify-center rounded-full',
    'cursor-pointer transition-colors duration-200',
    isActive
      ? 'bg-emerald-500/10 border border-emerald-500/20'
      : 'bg-neutral-200/50 dark:bg-white/[0.06] hover:bg-neutral-300/60 dark:hover:bg-white/[0.1]',
    'backdrop-blur-sm'
  );

  /* ✅ FIX: Theme toggle — <motion.div> wrapper (NOT button)
     ToggleTheme has its own <button>. No outer interactive element needed. */
  if (isThemeToggle) {
    return (
      <motion.div
        ref={ref}
           style={{ width, height } as MotionStyle}  
        className={containerClasses}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        // ✅ No onClick, no role="button" — ToggleTheme handles interaction
      >
        {tooltipAndDot}
        <ToggleTheme
          animationType="circle-spread"
          className="!p-0 w-full h-full rounded-full bg-transparent"
        />
      </motion.div>
    );
  }

  /* External / download link */
  if (href && !href.startsWith('#')) {
    return (
      <Link
        href={href}
        aria-label={label}
        rel="noopener noreferrer"
        target={href.startsWith('http') ? '_blank' : '_self'}
      >
        <motion.div
          ref={ref}
            style={{ width, height } as MotionStyle}
          className={containerClasses}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {tooltipAndDot}
          <motion.div
            style={{ width: iconSize, height: iconSize }}
            className="flex items-center justify-center text-neutral-600 dark:text-neutral-400"
          >
            {icon}
          </motion.div>
        </motion.div>
      </Link>
    );
  }

  /* Scroll / action button */
  return (
    <motion.button
      aria-label={label}
      onClick={onClick}
       style={{ width, height } as MotionStyle}
      className={containerClasses}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.88 }}
    >
      <div ref={ref} className="absolute inset-0 rounded-full" />
      {tooltipAndDot}
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className={cn(
          'flex items-center justify-center transition-colors duration-200',
          isActive
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-neutral-600 dark:text-neutral-400'
        )}
      >
        {icon}
      </motion.div>
    </motion.button>
  );
}
/* ═══════════════════════════════════════════════════════════════
   MOBILE VERTICAL DOCK ITEM
   ═══════════════════════════════════════════════════════════════ */

function MobileDockItem({ item }: { item: NavItem }) {
  const [hovered, setHovered] = useState(false);

  const tooltipAndDot = (
    <>
      {/* Tooltip — right side */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none',
              'whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium',
              'bg-white/90 dark:bg-neutral-800/90',
              'border border-neutral-200/80 dark:border-white/10',
              'text-neutral-700 dark:text-neutral-200',
              'shadow-lg backdrop-blur-md'
            )}
          >
            {item.label}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-white/90 dark:bg-neutral-800/90 border-l border-b border-neutral-200/80 dark:border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active dot — right side */}
      <AnimatePresence>
        {item.isActive && (
          <motion.div
            layoutId="mobile-active-dot"
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-emerald-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        )}
      </AnimatePresence>
    </>
  );

  const baseClasses = cn(
    'relative w-10 h-10 rounded-full flex items-center justify-center',
    'cursor-pointer transition-colors duration-200',
    item.isActive
      ? 'bg-emerald-500/10 border border-emerald-500/20'
      : 'hover:bg-neutral-300/50 dark:hover:bg-white/[0.08]'
  );

  /* ✅ FIX: Theme toggle — use <div> wrapper, NOT <button>
     ToggleTheme renders its own <button> internally.
     Wrapping it in another <button> = nested buttons = hydration error. */
  if (item.isThemeToggle) {
    return (
      <div
        className={baseClasses}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {tooltipAndDot}
        {/* ToggleTheme provides its own <button> — no wrapper button needed */}
        <ToggleTheme
          animationType="circle-spread"
          className="!p-0 w-full h-full rounded-full bg-transparent"
        />
      </div>
    );
  }

  /* External link */
  if (item.href && !item.href.startsWith('#')) {
    return (
      <Link
        href={item.href}
        aria-label={item.label}
        rel="noopener noreferrer"
        target={item.href.startsWith('http') ? '_blank' : '_self'}
        className={baseClasses}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {tooltipAndDot}
        <div
          className={cn(
            'flex items-center justify-center transition-colors duration-200',
            item.isActive
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-neutral-600 dark:text-neutral-400'
          )}
        >
          {item.icon}
        </div>
      </Link>
    );
  }

  /* Regular scroll button */
  return (
    <motion.button
      aria-label={item.label}
      onClick={item.onClick}
      className={baseClasses}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.82 }}
    >
      {tooltipAndDot}
      <div
        className={cn(
          'flex items-center justify-center transition-colors duration-200',
          item.isActive
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-neutral-600 dark:text-neutral-400'
        )}
      >
        {item.icon}
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE VERTICAL DOCK CONTAINER
   ═══════════════════════════════════════════════════════════════ */

function MobileVerticalDock({
  items,
  visible,
}: {
  items: NavItem[];
  visible: boolean;
}) {
  return (
    <>
      {/* Ambient glow */}
      <motion.div
        className="fixed bottom-4 left-4 z-40 block md:hidden pointer-events-none"
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -40 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        <div className="w-12 h-56 rounded-full bg-emerald-500/[0.07] dark:bg-emerald-500/[0.09] blur-2xl" />
      </motion.div>

      {/* Dock */}
      <motion.div
        className={cn(
          'fixed bottom-4 left-4 z-50 flex md:hidden flex-col items-center gap-1',
          'py-2 px-1.5 rounded-2xl',
          'bg-white/65 dark:bg-neutral-900/65',
          'backdrop-blur-xl',
          'border border-white/25 dark:border-white/[0.1]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'isolate [will-change:transform,opacity]',
          'overflow-visible' // needed so tooltips aren't clipped
        )}
        style={{ WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
        initial={{ x: -80, opacity: 0, scale: 0.85 }}
        animate={{
          x: visible ? 0 : -80,
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.85,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Vertical shimmer sweep */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute left-0 w-full h-[30%] bg-gradient-to-b from-transparent via-white/[0.06] dark:via-white/[0.03] to-transparent"
            animate={{ y: ['-100%', '500%'] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatDelay: 8,
              ease: 'easeInOut' as const,
            }}
          />
        </div>

        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -12, scale: 0.7 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: {
                delay: 0.3 + index * 0.05,
                type: 'spring' as const,
                stiffness: 400,
                damping: 25,
              },
            }}
            className="relative"
          >
            <MobileDockItem item={item} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function FloatingAppBar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [visible, setVisible]             = useState(true);
  const [scrolled, setScrolled]           = useState(false);
  const [navHovered, setNavHovered]       = useState(false);

  const lastScrollYRef = useRef(0);
  const navRef         = useRef<HTMLElement>(null);
  const prevActiveRef  = useRef('hero');

  /* mouseX for dock magnification */
  const mouseX = useMotionValue(Infinity);

  /* mouseX for nav glow follow */
  const navMouseX  = useMotionValue(0);
  const smoothNavX = useSpring(navMouseX, { stiffness: 250, damping: 30 });

  /* ── Scroll handler ── */
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollYRef.current && currentScrollY > 400) {
      setVisible(false);
    } else {
      setVisible(true);
    }
    setScrolled(currentScrollY > 80);
    lastScrollYRef.current = currentScrollY;

    const sections = NAV_SECTIONS.map((s) => s.href.slice(1));
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.getBoundingClientRect().top <= 200) {
        setActiveSection(sections[i]);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    prevActiveRef.current = activeSection;
  }, [activeSection]);

  const scrollTo = useCallback((href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ── Glass classes ── */
  const glassClasses = cn(
    'rounded-full overflow-visible isolate [will-change:transform,opacity]',
    'border transition-[background-color,border-color,box-shadow] duration-700 ease-out',
    scrolled
      ? 'bg-white/75 dark:bg-neutral-900/75 backdrop-blur-2xl border-white/30 dark:border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
      : 'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-white/20 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
  );

  /* ── Mobile items ── */
  const mobileItems: NavItem[] = [
    ...NAV_SECTIONS.map((s) => ({
      label: s.label,
      href: s.href,
      icon: s.icon,
      isActive: activeSection === s.href.slice(1),
      onClick: () => scrollTo(s.href),
    })),
    {
      label: 'Theme',
      isThemeToggle: true,
      icon: null,
    },
    {
      label: 'Resume',
      href: '/Hossam-Hassan-Resume.pdf',
      icon: <Download size={18} />,
    },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP — AMBIENT GLOW
          ══════════════════════════════════════════ */}
      <motion.div
        className="fixed bottom-6 left-1/2 z-40 hidden md:block pointer-events-none"
        initial={{ x: '-50%', opacity: 0 }}
        animate={{ x: '-50%', opacity: visible ? 1 : 0, y: visible ? 0 : 80 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        <motion.div
          className="w-80 h-14 rounded-full bg-emerald-500/[0.07] dark:bg-emerald-500/[0.09] blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      </motion.div>

      {/* ══════════════════════════════════════════
          DESKTOP NAVBAR
          ══════════════════════════════════════════ */}
      <motion.nav
        ref={navRef}
        onMouseMove={(e) => {
          navMouseX.set(
            e.clientX - (navRef.current?.getBoundingClientRect().left ?? 0)
          );
          setNavHovered(true);
        }}
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => {
          setNavHovered(false);
          navMouseX.set(0);
        }}
        className={cn(
          'fixed bottom-6 left-1/2 z-50 hidden md:flex items-center',
          glassClasses
        )}
        style={{
          WebkitBackdropFilter: scrolled
            ? 'blur(40px) saturate(180%)'
            : 'blur(24px) saturate(150%)',
        }}
        initial={{ y: 100, x: '-50%', opacity: 0, scale: 0.85 }}
        animate={{
          y: visible ? 0 : 100,
          x: '-50%',
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.85,
          boxShadow: navHovered
            ? '0 0 0 1px rgba(16,185,129,0.2), 0 8px 40px rgba(0,0,0,0.12), 0 0 30px rgba(16,185,129,0.08)'
            : '0 0 0 1px transparent, 0 8px 32px rgba(0,0,0,0.08), 0 0 0px transparent',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Shimmer sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/[0.07] dark:via-white/[0.04] to-transparent skew-x-[-20deg]"
            animate={{ x: ['-100%', '500%'] }}
            transition={{
              duration: 5, repeat: Infinity, repeatDelay: 7,
              ease: 'easeInOut' as const,
            }}
          />
        </div>

        {/* Mouse-following glow */}
        <motion.div
          className="absolute top-0 h-full w-44 pointer-events-none rounded-full"
          style={{
            x: smoothNavX,
            translateX: '-50%',
            background:
              'radial-gradient(ellipse 88px 44px at center, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
          animate={{ opacity: navHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* ══ DOCK CONTENT
            ✅ FIX 1: items-center (not items-end) so all icons sit
            on the same horizontal axis. Magnification grows UPWARD
            because the icons push against the center baseline.
            ══ */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2 relative z-10"
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
        >
          {/* Logo */}
          <motion.button
            onClick={() => scrollTo('#hero')}
            className="group relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer overflow-hidden"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: 1, scale: 1, rotate: 0,
              transition: { delay: 0.2, type: 'spring' as const, stiffness: 300, damping: 20 },
            }}
            whileHover={{
              scale: 1.15,
              boxShadow: '0 0 20px rgba(16,185,129,0.45)',
              transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
            }}
            whileTap={{ scale: 0.85, rotate: -15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-500 ease-out pointer-events-none" />
            <span className="relative z-10">H</span>
          </motion.button>

          {/* Divider */}
          <motion.div
            className="w-px h-5 flex-shrink-0 bg-gradient-to-b from-transparent via-neutral-300 dark:via-white/15 to-transparent"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1, transition: { delay: 0.3, duration: 0.4 } }}
          />

          {/* Nav section icons */}
          {NAV_SECTIONS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10, scale: 0.8, filter: 'blur(4px)' }}
              animate={{
                opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
                transition: {
                  delay: 0.35 + index * 0.06,
                  type: 'spring' as const, stiffness: 400, damping: 25,
                },
              }}
            >
              <IconContainer
                mouseX={mouseX}
                label={item.label}
                icon={item.icon}
                isActive={activeSection === item.href.slice(1)}
                onClick={() => scrollTo(item.href)}
              />
            </motion.div>
          ))}

          {/* Divider */}
          <motion.div
            className="w-px h-5 flex-shrink-0 bg-gradient-to-b from-transparent via-neutral-300 dark:via-white/15 to-transparent"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1, transition: { delay: 0.7, duration: 0.4 } }}
          />

          {/* ✅ FIX 2: Theme toggle uses real <ToggleTheme /> inside IconContainer */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1, scale: 1,
              transition: { delay: 0.75, type: 'spring' as const, stiffness: 300, damping: 20 },
            }}
          >
            <IconContainer
              mouseX={mouseX}
              label="Toggle Theme"
              isThemeToggle
            />
          </motion.div>

          {/* Resume */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, x: 10 }}
            animate={{
              opacity: 1, scale: 1, x: 0,
              transition: { delay: 0.82, type: 'spring' as const, stiffness: 300, damping: 22 },
            }}
          >
            <Link
              href="/Hossam-Hassan-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Resume"
            >
              <motion.div
                className="group relative flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white cursor-pointer overflow-hidden"
                whileHover={{
                  scale: 1.08,
                  boxShadow: '0 0 24px rgba(16,185,129,0.4)',
                  transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-500 ease-out pointer-events-none" />
                <motion.div
                  className="absolute inset-0 rounded-full border border-emerald-400/50"
                  initial={{ scale: 1, opacity: 0 }}
                  whileHover={{
                    scale: [1, 1.5],
                    opacity: [0.7, 0],
                    transition: { duration: 0.8, repeat: Infinity },
                  }}
                />
                <Download size={12} className="relative z-10 flex-shrink-0" />
                <span className="relative z-10">Resume</span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* ══════════════════════════════════════════
          MOBILE — VERTICAL DOCK
          ══════════════════════════════════════════ */}
      <MobileVerticalDock items={mobileItems} visible={visible} />
    </>
  );
}