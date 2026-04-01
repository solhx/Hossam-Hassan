// src/components/common/FloatingAppBar.tsx
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
import Link          from 'next/link';
import { cn }        from '@/utils/utils';
import { ToggleTheme } from '@/components/common/ToggleTheme';

/* ── Types ──────────────────────────────────────────────────────── */

interface NavItem {
  label:          string;
  href?:          string;
  icon:           React.ReactNode;
  onClick?:       () => void;
  isThemeToggle?: boolean;
}

/* ── Config ─────────────────────────────────────────────────────── */

const NAV_SECTIONS = [
  { label: 'Home',       href: '#hero',       icon: <Home       size={18} /> },
  { label: 'About',      href: '#about',      icon: <User       size={18} /> },
  { label: 'Skills',     href: '#skills',     icon: <Zap        size={18} /> },
  { label: 'Experience', href: '#experience', icon: <Briefcase  size={18} /> },
  { label: 'Projects',   href: '#projects',   icon: <FolderOpen size={18} /> },
  { label: 'Contact',    href: '#contact',    icon: <Mail       size={18} /> },
] as const;

/* ── IconContainer — desktop magnification dock ─────────────────── */

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
  const ref     = useRef<HTMLDivElement>(null);
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

/* ── Mobile Dock Item ───────────────────────────────────────────── */

const MobileDockItem = React.memo(function MobileDockItem({
  item,
  index,
  onClose,
}: {
  item:    NavItem;
  index:   number;
  onClose: () => void;
}) {
  const handleClick = useCallback(() => {
    item.onClick?.();
    // Close dock after navigation on mobile for better UX
    if (item.href?.startsWith('#')) {
      setTimeout(onClose, 150);
    }
  }, [item, onClose]);

  const baseClasses = cn(
    'relative w-12 h-12 rounded-2xl flex items-center justify-center',
    'cursor-pointer',
    'bg-neutral-100/80 dark:bg-white/[0.06]',
    'hover:bg-emerald-50 dark:hover:bg-emerald-500/[0.12]',
    'border border-neutral-200/60 dark:border-white/[0.08]',
    'hover:border-emerald-300/60 dark:hover:border-emerald-500/30',
    'transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
  );

  /*
    FIX: Item animation variants defined outside render
    Each item staggers in when dock opens, staggers out when it closes.
    Using variants (not inline animate objects) is more performant —
    Framer Motion can batch variant updates.
  */
  const itemVariants = {
    hidden: {
      opacity: 0,
      x:       -20,
      scale:   0.7,
    },
    visible: {
      opacity:    1,
      x:          0,
      scale:      1,
      transition: {
        delay:     index * 0.04,
        type:      'spring' as const,
        stiffness: 400,
        damping:   28,
      },
    },
    exit: {
      opacity:    0,
      x:          -12,
      scale:      0.8,
      transition: {
        delay:    (8 - index) * 0.025, // reverse stagger on exit
        duration: 0.15,
      },
    },
  };

  const content = (
    <div
      className="flex items-center justify-center text-neutral-600 dark:text-neutral-300"
      aria-hidden="true"
    >
      {item.icon}
    </div>
  );

  if (item.isThemeToggle) {
    return (
      <motion.div variants={itemVariants} className="flex flex-col items-center gap-1">
        <div className={baseClasses}>
          <ToggleTheme
            animationType="fade-in-out"
            className="!p-0 w-full h-full rounded-2xl bg-transparent"
          />
        </div>
        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium tracking-wide">
          {item.label}
        </span>
      </motion.div>
    );
  }

  if (item.href && !item.href.startsWith('#')) {
    return (
      <motion.div variants={itemVariants} className="flex flex-col items-center gap-1">
        <Link
          href={item.href}
          aria-label={item.label}
          rel="noopener noreferrer"
          target={item.href.startsWith('http') ? '_blank' : '_self'}
          className={baseClasses}
        >
          {content}
        </Link>
        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium tracking-wide">
          {item.label}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="flex flex-col items-center gap-1">
      <motion.button
        aria-label={item.label}
        onClick={handleClick}
        className={baseClasses}
        whileTap={{ scale: 0.85 }}
      >
        {content}
      </motion.button>
      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium tracking-wide">
        {item.label}
      </span>
    </motion.div>
  );
});

/* ── Mobile Dock — NEW toggle-based design ──────────────────────── */

/*
  BEFORE: Always rendered, translated off-screen, infinite shimmer loop
  AFTER:  
  - Circular FAB (Floating Action Button) always visible
  - Dock panel only MOUNTED when open (saves memory + animation cost)
  - AnimatePresence unmounts dock when closed (no offscreen animations)
  - Backdrop closes dock when tapped outside
  - Proper ARIA: aria-expanded, aria-controls, role="dialog"
*/

const MobileDock = React.memo(function MobileDock({
  items,
  navVisible,
}: {
  items:      NavItem[];
  navVisible: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeDoc   = useCallback(() => setIsOpen(false), []);

  // Close dock when navbar hides (user scrolled down fast)
  useEffect(() => {
    if (!navVisible) setIsOpen(false);
  }, [navVisible]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDoc();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeDoc]);

  // Prevent body scroll when dock is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fabVariants = {
    hidden:  { scale: 0, opacity: 0 },
    visible: {
      scale:      1,
      opacity:    1,
      transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
    },
    exit: {
      scale:      0,
      opacity:    0,
      transition: { duration: 0.15 },
    },
  };

  const dockVariants = {
    hidden: {
      x:       -60,
      opacity: 0,
      scale:   0.9,
    },
    visible: {
      x:          0,
      opacity:    1,
      scale:      1,
      transition: {
        type:       'spring' as const,
        stiffness:  350,
        damping:    30,
        /*
          staggerChildren here staggers the ITEMS inside the dock.
          The dock container itself animates first, then items follow.
        */
        staggerChildren:  0.04,
        delayChildren:    0.08,
      },
    },
    exit: {
      x:       -40,
      opacity: 0,
      scale:   0.92,
      transition: {
        duration:        0.2,
        staggerChildren: 0.025,
      },
    },
  };

  return (
    <>
      {/* ── Backdrop — closes dock when tapped outside ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-[2px]"
            onClick={closeDoc}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── FAB — always visible, toggles the dock ── */}
      <AnimatePresence mode="wait">
        {navVisible && (
          <motion.button
            key="mobile-fab"
            variants={fabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={toggleOpen}
            className={cn(
              'fixed bottom-6 left-5 z-50 md:hidden',
              'w-12 h-12 rounded-full',
              'flex items-center justify-center',
              'shadow-lg shadow-black/20 dark:shadow-black/40',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
              /*
                Two visual states:
                - Closed: glass pill with Menu icon
                - Open:   emerald fill with X icon
              */
              isOpen
                ? 'bg-emerald-500 text-white border border-emerald-400'
                : [
                    'bg-white/85 dark:bg-neutral-900/85',
                    'backdrop-blur-xl',
                    'border border-white/30 dark:border-white/[0.12]',
                    'text-neutral-700 dark:text-neutral-300',
                  ],
            )}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-dock"
            whileTap={{ scale: 0.88 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.div>

            {/* Pulse ring — only when closed, draws attention */}
            {!isOpen && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-500/40"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{
                  duration:   2,
                  repeat:     Infinity,
                  ease:       'easeOut',
                  repeatDelay: 1,
                }}
                aria-hidden="true"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Dock panel — ONLY mounted when open ── */}
      {/*
        WHY AnimatePresence + conditional mount (not just animate visibility):
        When closed, the component is UNMOUNTED from the DOM.
        This means:
        - Zero Framer Motion subscriptions running
        - Zero requestAnimationFrame loops
        - Zero GPU layers
        - Memory freed immediately
        
        vs the old approach (translate off-screen):
        - All animations still running
        - GPU layers still allocated
        - Framer Motion still tracking spring values
      */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="mobile-dock"
            id="mobile-nav-dock"
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
            variants={dockVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed bottom-6 left-5 z-50 md:hidden',
              'flex flex-col items-center gap-2',
              'p-3 rounded-3xl',
              'bg-white/80 dark:bg-neutral-900/80',
              'backdrop-blur-2xl',
              'border border-white/30 dark:border-white/[0.10]',
              'shadow-2xl shadow-black/15 dark:shadow-black/50',
              /*
                margin-bottom accounts for FAB height (48px) + gap (8px)
                so dock appears above the FAB button
              */
              'mb-16',
            )}
            style={{ WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}
          >
            {/* Ambient glow behind dock */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl rounded-full" />
            </div>

            {/* Nav items — use motion.div with inherited variants */}
            {items.map((item, index) => (
              <MobileDockItem
                key={item.label}
                item={item}
                index={index}
                onClose={closeDoc}
              />
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
});

/* ── Main Component ─────────────────────────────────────────────── */

const FloatingAppBar = React.memo(function FloatingAppBar() {
  const [visible,    setVisible]    = useState(true);
  const [scrolled,   setScrolled]   = useState(false);
  const [navHovered, setNavHovered] = useState(false);

  const lastScrollYRef = useRef(0);
  const navRef         = useRef<HTMLElement>(null);

  const mouseX     = useMotionValue(Infinity);
  const navMouseX  = useMotionValue(0);
  const smoothNavX = useSpring(navMouseX, { stiffness: 250, damping: 30 });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const shouldHide     = currentScrollY > lastScrollYRef.current && currentScrollY > 400;

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

  const scrollTo = useCallback((href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /*
    FIX: Compute glassClasses with useMemo — was recomputing cn() on
    every render including scroll events (every ~16ms while scrolling)
  */
  const glassClasses = useMemo(() => cn(
    'rounded-full overflow-visible isolate [will-change:transform,opacity]',
    'border transition-[background-color,border-color,box-shadow] duration-700 ease-out',
    scrolled
      ? 'bg-white/75 dark:bg-neutral-900/75 backdrop-blur-2xl border-white/30 dark:border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]'
      : 'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl  border-white/20 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
  ), [scrolled]);

  const mobileItems: NavItem[] = useMemo(() => [
    ...NAV_SECTIONS.map((s) => ({
      label:   s.label,
      href:    s.href,
      icon:    s.icon,
      onClick: () => scrollTo(s.href),
    })),
    {
      label:         'Theme',
      isThemeToggle: true,
      icon:          null,
    },
    {
      label: 'Resume',
      href:  '/Hossam-Hassan-Resume.pdf',
      icon:  <Download size={18} />,
    },
  ], [scrollTo]);

  return (
    <>
      {/* ── Desktop ambient glow ── */}
      <motion.div
        className="fixed bottom-6 left-1/2 z-40 hidden md:block pointer-events-none"
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

      {/* ── Desktop navbar ── */}
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
          'fixed bottom-6 left-1/2 z-50 hidden md:flex items-center',
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
        {/* Shimmer sweep — desktop only, paused when not hovered */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          {/*
            FIX: Shimmer only animates when navHovered.
            When not hovered, animate prop is empty object {} — 
            Framer Motion pauses the animation entirely.
            Previously ran Infinity regardless of visibility.
          */}
          <motion.div
            className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white/[0.07] dark:via-white/[0.04] to-transparent skew-x-[-20deg]"
            animate={navHovered ? { x: ['-100%', '500%'] } : {}}
            transition={{
              duration:    5,
              repeat:      Infinity,
              repeatDelay: 7,
              ease:        'easeInOut',
            }}
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
              opacity: 1,
              scale:   1,
              rotate:  0,
              transition: {
                delay:     0.2,
                type:      'spring',
                stiffness: 300,
                damping:   20,
              },
            }}
            whileHover={{
              scale:      1.15,
              boxShadow:  '0 0 20px rgba(16,185,129,0.45)',
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

          <motion.div
            className="w-px h-5 flex-shrink-0 bg-gradient-to-b from-transparent via-neutral-300 dark:via-white/15 to-transparent"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1, transition: { delay: 0.3, duration: 0.4 } }}
            aria-hidden="true"
          />

          {NAV_SECTIONS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10, scale: 0.8, filter: 'blur(4px)' }}
              animate={{
                opacity: 1,
                y:       0,
                scale:   1,
                filter:  'blur(0px)',
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

          <motion.div
            className="w-px h-5 flex-shrink-0 bg-gradient-to-b from-transparent via-neutral-300 dark:via-white/15 to-transparent"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1, transition: { delay: 0.7, duration: 0.4 } }}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale:   1,
              transition: { delay: 0.75, type: 'spring', stiffness: 300, damping: 20 },
            }}
          >
            <IconContainer mouseX={mouseX} label="Toggle Theme" isThemeToggle />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.6, x: 10 }}
            animate={{
              opacity: 1,
              scale:   1,
              x:       0,
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
                  scale:      1.08,
                  boxShadow:  '0 0 24px rgba(16,185,129,0.4)',
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-500 ease-out pointer-events-none"
                  aria-hidden="true"
                />
                <Download size={12} className="relative z-10 flex-shrink-0" aria-hidden="true" />
                <span className="relative z-10">Resume</span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* ── Mobile Dock — NEW toggle-based ── */}
      <MobileDock items={mobileItems} navVisible={visible} />
    </>
  );
});

FloatingAppBar.displayName = 'FloatingAppBar';
export { FloatingAppBar };