// src/components/common/FloatingAppBar.tsx
'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
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
  Menu,
  X,
} from 'lucide-react';
import Link            from 'next/link';
import { cn }          from '@/utils/utils';
import { ToggleTheme } from '@/components/common/ToggleTheme';

/* ── Types ────────────────────────────────────────────────────── */

interface NavItem {
  label:          string;
  href?:          string;
  icon:           React.ReactNode;
  onClick?:       () => void;
  isThemeToggle?: boolean;
}

/* ── Config ───────────────────────────────────────────────────── */

const NAV_SECTIONS = [
  { label: 'Home',       href: '#hero',       icon: <Home       size={18} /> },
  { label: 'About',      href: '#about',      icon: <User       size={18} /> },
  { label: 'Skills',     href: '#skills',     icon: <Zap        size={18} /> },
  { label: 'Experience', href: '#experience', icon: <Briefcase  size={18} /> },
  { label: 'Projects',   href: '#projects',   icon: <FolderOpen size={18} /> },
  { label: 'Contact',    href: '#contact',    icon: <Mail       size={18} /> },
];

/* ── useIsMobileReady ─────────────────────────────────────────── */

// ✅ Three states:
//   null  = not yet measured (SSR / hydration) → render nothing
//   true  = confirmed mobile                   → render mobile UI
//   false = confirmed desktop                  → render desktop UI
//
// Combining "mounted" and "isMobile" into one state prevents the
// double-false race condition where two separate useState(false)
// hooks both need to flip true before anything renders.
function useIsMobileReady(breakpoint = 768): boolean | null {
  const [state, setState] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setState(window.innerWidth < breakpoint);
    check(); // measure immediately after mount

    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, [breakpoint]);

  return state;
}

/* ── IconContainer — magnification (desktop only) ────────────── */

function IconContainer({
  mouseX,
  label,
  icon,
  href,
  onClick,
  isThemeToggle = false,
}: {
  mouseX:         MotionValue<number>;
  label:          string;
  icon?:          React.ReactNode;
  href?:          string;
  onClick?:       () => void;
  isThemeToggle?: boolean;
}) {
  const ref               = useRef<HTMLDivElement>(null);
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

  const tooltip = (
    <AnimatePresence>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 6,  x: '-50%' }}
          animate={{ opacity: 1, y: 0,  x: '-50%' }}
          exit={{    opacity: 0, y: 3,  x: '-50%' }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute -top-9 left-1/2 z-50 pointer-events-none',
            'whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium',
            'bg-white/90 dark:bg-neutral-800/90',
            'border border-neutral-200/80 dark:border-white/10',
            'text-neutral-700 dark:text-neutral-200',
            'shadow-lg backdrop-blur-md',
          )}
          role="tooltip"
        >
          {label}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/90 dark:bg-neutral-800/90 border-r border-b border-neutral-200/80 dark:border-white/10" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  const containerClasses = cn(
    'relative flex items-center justify-center rounded-full',
    'cursor-pointer transition-colors duration-200',
    'bg-neutral-200/50 dark:bg-white/[0.06]',
    'hover:bg-neutral-300/60 dark:hover:bg-white/[0.1]',
    'backdrop-blur-sm',
  );

  if (isThemeToggle) {
    return (
      <motion.div
        ref={ref}
        style={{ width, height } as MotionStyle}
        className={containerClasses}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {tooltip}
        <ToggleTheme
          animationType="circle-spread"
          className="!p-0 w-full h-full rounded-full bg-transparent"
        />
      </motion.div>
    );
  }

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
          {tooltip}
          <motion.div
            style={{ width: iconSize, height: iconSize }}
            className="flex items-center justify-center text-neutral-600 dark:text-neutral-400"
            aria-hidden="true"
          >
            {icon}
          </motion.div>
        </motion.div>
      </Link>
    );
  }

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
      {tooltip}
      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center text-neutral-600 dark:text-neutral-400 transition-colors duration-200"
        aria-hidden="true"
      >
        {icon}
      </motion.div>
    </motion.button>
  );
}

/* ── Mobile dock item ─────────────────────────────────────────── */

function MobileDockItem({
  item,
  onAction,
}: {
  item:     NavItem;
  onAction: () => void;
}) {
  const baseClasses = cn(
    'relative w-11 h-11 rounded-full flex items-center justify-center',
    'cursor-pointer transition-colors duration-200',
    'hover:bg-neutral-300/50 dark:hover:bg-white/[0.08]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
    'touch-target',
  );

  if (item.isThemeToggle) {
    return (
      <div className={baseClasses}>
        <ToggleTheme
          animationType="circle-spread"
          className="!p-0 w-full h-full rounded-full bg-transparent"
        />
      </div>
    );
  }

  if (item.href && !item.href.startsWith('#')) {
    return (
      <Link
        href={item.href}
        aria-label={item.label}
        rel="noopener noreferrer"
        target={item.href.startsWith('http') ? '_blank' : '_self'}
        className={baseClasses}
        onClick={onAction}
      >
        <div
          className="flex items-center justify-center text-neutral-600 dark:text-neutral-400"
          aria-hidden="true"
        >
          {item.icon}
        </div>
      </Link>
    );
  }

  return (
    <motion.button
      aria-label={item.label}
      onClick={() => {
        item.onClick?.();
        onAction();
      }}
      className={baseClasses}
      whileTap={{ scale: 0.82 }}
    >
      <div
        className="flex items-center justify-center text-neutral-600 dark:text-neutral-400"
        aria-hidden="true"
      >
        {item.icon}
      </div>
    </motion.button>
  );
}

/* ── Mobile trigger button ────────────────────────────────────── */

function MobileTriggerButton({
  isOpen,
  onClick,
}: {
  isOpen:  boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-dock"
      className={cn(
        'fixed z-[9999]',
        'w-12 h-12 rounded-full',
        'flex items-center justify-center',
        'bg-gradient-to-br from-emerald-400 to-emerald-600',
        'text-white shadow-lg shadow-emerald-500/30',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
        'touch-target',
      )}
      style={{ bottom: '20px', left: '20px' }}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate:  90,  scale: 0.5 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="menu"
            initial={{ opacity: 0, rotate:  90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: -90,  scale: 0.5 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <Menu size={20} strokeWidth={2.5} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Mobile vertical dock ─────────────────────────────────────── */

function MobileVerticalDock({
  items,
  isOpen,
  onClose,
}: {
  items:   NavItem[];
  isOpen:  boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: 'rgba(0,0,0,0.15)' }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Ambient glow */}
      <motion.div
        className="fixed z-[9997] pointer-events-none"
        style={{ bottom: '16px', left: '16px' }}
        animate={{
          opacity: isOpen ? 1 : 0,
          x:       isOpen ? 0 : -40,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        aria-hidden="true"
      >
        <div className="w-12 h-56 rounded-full bg-emerald-500/[0.07] dark:bg-emerald-500/[0.09] blur-2xl" />
      </motion.div>

      {/* Dock panel */}
      <motion.nav
        id="mobile-nav-dock"
        aria-label="Mobile navigation"
        className={cn(
          'fixed z-[9998] flex flex-col items-center gap-1',
          'py-2 px-1.5 rounded-2xl',
          'bg-white/65 dark:bg-neutral-900/65',
          'backdrop-blur-xl',
          'border border-white/25 dark:border-white/[0.1]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'isolate',
          isOpen ? '[will-change:transform,opacity]' : '',
        )}
        style={{
          bottom:               '80px',
          left:                 '16px',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        }}
        initial={false}
        animate={{
          x:             isOpen ? 0    : -80,
          opacity:       isOpen ? 1    : 0,
          scale:         isOpen ? 1    : 0.85,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        transition={{
          type:      'spring',
          stiffness: 320,
          damping:   28,
          opacity:   { duration: 0.2 },
        }}
      >
        {/* Shimmer */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute left-0 w-full h-[30%] bg-gradient-to-b from-transparent via-white/[0.06] dark:via-white/[0.03] to-transparent"
            style={{ animation: 'shimmer-sweep-vertical 6s ease-in-out 8s infinite' }}
          />
        </div>

        {items.map((item, index) => (
          <motion.div
            key={item.label}
            animate={{
              opacity: isOpen ? 1   : 0,
              x:       isOpen ? 0   : -12,
              scale:   isOpen ? 1   : 0.7,
            }}
            transition={{
              delay:     isOpen ? index * 0.04 : 0,
              type:      'spring',
              stiffness: 400,
              damping:   25,
            }}
            className="relative"
          >
            <MobileDockItem item={item} onAction={onClose} />
          </motion.div>
        ))}
      </motion.nav>
    </>
  );
}

/* ── Mobile portal wrapper ────────────────────────────────────── */

function MobileNavPortal({
  items,
  isOpen,
  onOpen,
  onClose,
}: {
  items:   NavItem[];
  isOpen:  boolean;
  onOpen:  () => void;
  onClose: () => void;
}) {
  const isMobileReady = useIsMobileReady();

  // ✅ Only render when CONFIRMED mobile (true, not null, not false)
  if (isMobileReady !== true) return null;

  return createPortal(
    <>
      <MobileTriggerButton isOpen={isOpen} onClick={isOpen ? onClose : onOpen} />
      <MobileVerticalDock  items={items}   isOpen={isOpen} onClose={onClose} />
    </>,
    document.body,
  );
}

/* ── Main component ───────────────────────────────────────────── */

export function FloatingAppBar() {
  const [visible,    setVisible]    = useState(true);
  const [scrolled,   setScrolled]   = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const lastScrollYRef = useRef(0);
  const navRef         = useRef<HTMLElement>(null);
  const mouseX         = useMotionValue(Infinity);
  const navMouseX      = useMotionValue(0);
  const smoothNavX     = useSpring(navMouseX, { stiffness: 250, damping: 30 });

  // ✅ null=unknown, false=desktop, true=mobile
  const isMobileReady = useIsMobileReady();

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const shouldHide =
      currentScrollY > lastScrollYRef.current && currentScrollY > 400;

    if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
      setMobileOpen(false);
    }

    setVisible((prev) => {
      const next = !shouldHide;
      return prev === next ? prev : next;
    });

    setScrolled((prev) => {
      const next = currentScrollY > 80;
      return prev === next ? prev : next;
    });

    lastScrollYRef.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo    = useCallback((href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const openMobile  = useCallback(() => setMobileOpen(true),  []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const glassClasses = cn(
    'rounded-full overflow-visible isolate [will-change:transform,opacity]',
    'border transition-[background-color,border-color,box-shadow] duration-700 ease-out',
    scrolled
      ? 'bg-white/75 dark:bg-neutral-900/75 backdrop-blur-2xl border-white/30 dark:border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
      : 'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl  border-white/20 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
  );

  const mobileItems: NavItem[] = [
    ...NAV_SECTIONS.map((s) => ({
      label:   s.label,
      href:    s.href,
      icon:    s.icon,
      onClick: () => scrollTo(s.href),
    })),
    { label: 'Theme',  isThemeToggle: true,  icon: null },
    { label: 'Resume', href: '/Hossam-Hassan-Resume.pdf', icon: <Download size={18} /> },
  ];

  return (
    <>
      {/* ════════════════════════════════════
          DESKTOP — only when confirmed desktop
          isMobileReady === false means "measured + desktop"
      ════════════════════════════════════ */}
      {isMobileReady === false && (
        <>
          {/* Desktop ambient glow */}
          <motion.div
            className="fixed bottom-6 left-1/2 z-40 pointer-events-none"
            initial={{ x: '-50%', opacity: 0 }}
            animate={{
              x:       '-50%',
              opacity: visible ? 1 : 0,
              y:       visible ? 0 : 80,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            aria-hidden="true"
          >
            <motion.div
              className="w-80 h-14 rounded-full bg-emerald-500/[0.07] dark:bg-emerald-500/[0.09] blur-2xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Desktop navbar */}
          <motion.nav
            ref={navRef}
            aria-label="Main navigation"
            onMouseMove={(e) => {
              navMouseX.set(
                e.clientX - (navRef.current?.getBoundingClientRect().left ?? 0),
              );
              setNavHovered(true);
            }}
            onMouseEnter={() => setNavHovered(true)}
            onMouseLeave={() => {
              setNavHovered(false);
              navMouseX.set(0);
            }}
            className={cn(
              'fixed bottom-6 left-1/2 z-50 flex items-center',
              glassClasses,
            )}
            style={{
              WebkitBackdropFilter: scrolled
                ? 'blur(40px) saturate(180%)'
                : 'blur(24px) saturate(150%)',
            }}
            initial={{ y: 100, x: '-50%', opacity: 0, scale: 0.85 }}
            animate={{
              y:         visible ? 0   : 100,
              x:         '-50%',
              opacity:   visible ? 1   : 0,
              scale:     visible ? 1   : 0.85,
              boxShadow: navHovered
                ? '0 0 0 1px rgba(16,185,129,0.2), 0 8px 40px rgba(0,0,0,0.12), 0 0 30px rgba(16,185,129,0.08)'
                : '0 0 0 1px transparent, 0 8px 32px rgba(0,0,0,0.08), 0 0 0px transparent',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Shimmer */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              <div
                className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/[0.07] dark:via-white/[0.04] to-transparent skew-x-[-20deg]"
                style={{ animation: 'shimmer-sweep 5s ease-in-out 7s infinite' }}
              />
            </div>

            {/* Mouse-following glow */}
            <motion.div
              className="absolute top-0 h-full w-44 pointer-events-none rounded-full"
              style={{
                x:          smoothNavX,
                translateX: '-50%',
                background:
                  'radial-gradient(ellipse 88px 44px at center, rgba(16,185,129,0.12) 0%, transparent 70%)',
              }}
              animate={{ opacity: navHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            />

            {/* Dock content */}
            <motion.div
              className="flex items-center gap-2 px-3 py-2 relative z-10"
              onMouseMove={(e) => mouseX.set(e.pageX)}
              onMouseLeave={() => mouseX.set(Infinity)}
            >
              {/* Logo */}
              <motion.button
                onClick={() => scrollTo('#hero')}
                aria-label="Scroll to top"
                className="group relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer overflow-hidden"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{
                  opacity: 1, scale: 1, rotate: 0,
                  transition: { delay: 0.2, type: 'spring', stiffness: 300, damping: 20 },
                }}
                whileHover={{
                  scale: 1.15,
                  boxShadow: '0 0 20px rgba(16,185,129,0.45)',
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.85, rotate: -15 }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-500 ease-out pointer-events-none"
                  aria-hidden="true"
                />
                <span className="relative z-10" aria-hidden="true">H</span>
              </motion.button>

              {/* Divider */}
              <motion.div
                className="w-px h-5 flex-shrink-0 bg-gradient-to-b from-transparent via-neutral-300 dark:via-white/15 to-transparent"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1, transition: { delay: 0.3, duration: 0.4 } }}
                aria-hidden="true"
              />

              {/* Nav items */}
              {NAV_SECTIONS.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10, scale: 0.8, filter: 'blur(4px)' }}
                  animate={{
                    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
                    transition: {
                      delay:     0.35 + index * 0.06,
                      type:      'spring',
                      stiffness: 400,
                      damping:   25,
                    },
                  }}
                >
                  <IconContainer
                    mouseX={mouseX}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => scrollTo(item.href)}
                  />
                </motion.div>
              ))}

              {/* Divider */}
              <motion.div
                className="w-px h-5 flex-shrink-0 bg-gradient-to-b from-transparent via-neutral-300 dark:via-white/15 to-transparent"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1, transition: { delay: 0.7, duration: 0.4 } }}
                aria-hidden="true"
              />

              {/* Theme toggle */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1, scale: 1,
                  transition: { delay: 0.75, type: 'spring', stiffness: 300, damping: 20 },
                }}
              >
                <IconContainer mouseX={mouseX} label="Toggle Theme" isThemeToggle />
              </motion.div>

              {/* Resume */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, x: 10 }}
                animate={{
                  opacity: 1, scale: 1, x: 0,
                  transition: { delay: 0.82, type: 'spring', stiffness: 300, damping: 22 },
                }}
              >
                <Link
                  href="/Hossam-Hassan-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Resume (opens PDF)"
                >
                  <motion.div
                    className="group relative flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white cursor-pointer overflow-hidden"
                    whileHover={{
                      scale: 1.08,
                      boxShadow: '0 0 24px rgba(16,185,129,0.4)',
                      transition: { type: 'spring', stiffness: 400, damping: 15 },
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-500 ease-out pointer-events-none"
                      aria-hidden="true"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-emerald-400/50"
                      initial={{ scale: 1, opacity: 0 }}
                      whileHover={{
                        scale:   [1, 1.5],
                        opacity: [0.7, 0],
                        transition: { duration: 0.8, repeat: Infinity },
                      }}
                      aria-hidden="true"
                    />
                    <Download size={12} className="relative z-10 flex-shrink-0" aria-hidden="true" />
                    <span className="relative z-10">Resume</span>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.nav>
        </>
      )}

      {/* ════════════════════════════════════
          MOBILE portal — only when isMobileReady === true
      ════════════════════════════════════ */}
      <MobileNavPortal
        items={mobileItems}
        isOpen={mobileOpen}
        onOpen={openMobile}
        onClose={closeMobile}
      />
    </>
  );
}