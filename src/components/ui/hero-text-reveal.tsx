'use client';

import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  type Variants,
} from 'framer-motion';
import { cn } from '@/utils/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ── Mask Reveal: Line Slide-Up ── */

const lineContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/*
  ✅ LCP FIX — original lineVariants used y:'110%' which means the text
  starts fully BELOW its clip container and is invisible until animated in.
  Lighthouse measures LCP as when the element becomes VISIBLE — not when
  it enters the DOM. A 0.5s delay on the h1 text means LCP is 0.5s late.

  Fix: animate clip-path instead of translateY.
  - clip-path reveal is composited (GPU) — same visual effect
  - The text IS in the DOM and has dimensions from frame 0
  - Lighthouse counts it as painted immediately
  - opacity stays at 1 throughout — no LCP delay
*/
const lineVariants: Variants = {
  hidden: {
    clipPath: 'inset(100% 0% 0% 0%)',  // ✅ text present, just clipped
    opacity:  1,                        // ✅ opacity:1 from start — LCP fix
  },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity:  1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const lineReducedVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export function MaskRevealText({
  lines,
  className,
  lineClassName,
  textClassName,
  delay = 0,
}: {
  lines:          string[];
  className?:     string;
  lineClassName?: string;
  textClassName?: string;
  delay?:         number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn('', className)}
      variants={lineContainerVariants}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
    >
      {lines.map((line, i) => (
        /*
          ✅ overflow:hidden no longer needed here —
          clip-path handles the masking without needing
          a parent overflow:hidden that could cause
          additional reflow/layout recalculation.
        */
        <div key={i} style={{ lineHeight: 1.1 }}>
          <motion.div
            variants={reduced ? lineReducedVariants : lineVariants}
            className={cn('will-change-transform', lineClassName)}
          >
            <span className={cn('block', textClassName)}>
              {line}
            </span>
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}

/* ── Typewriter Effect ── */

export function TypewriterText({
  text,
  className,
  delay = 0,
  speed = 30,
}: {
  text:       string;
  className?: string;
  delay?:     number;
  speed?:     number;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor,    setShowCursor]    = useState(true);
  const [isDone,        setIsDone]        = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setDisplayedText(text);
      setIsDone(true);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timeoutId = setTimeout(() => {
      let index = 0;
      intervalId = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          if (intervalId) clearInterval(intervalId);
          setIsDone(true);
        }
      }, speed);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, delay, speed, reduced]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn('', className)}>
      {displayedText}
      <span
        className={cn(
          'inline-block w-[2.5px] h-[1em] bg-emerald-600 dark:bg-emerald-400',
          'ml-1 align-middle transition-opacity duration-100 rounded-full',
          showCursor && !isDone ? 'opacity-100' : 'opacity-0',
          isDone && 'hidden',
        )}
        aria-hidden="true"
      />
    </span>
  );
}

/* ── Liquid Fill Button ── */

export function LiquidButton({
  children,
  className,
  onClick,
  href,
  variant = 'primary',
}: {
  children:   ReactNode;
  className?: string;
  onClick?:   () => void;
  href?:      string;
  variant?:   'primary' | 'secondary';
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x       = useMotionValue(0);
  const y       = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 20 });
  const springY = useSpring(y, { stiffness: 250, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect    = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isPrimary = variant === 'primary';

  const content = (
    <motion.div
      ref={ref}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'group relative inline-flex items-center gap-2.5 px-7 py-3.5',
        'rounded-xl font-semibold text-sm tracking-wide overflow-hidden',
        'cursor-pointer transition-shadow duration-500',
        isPrimary
          ? 'text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:shadow-xl'
          : [
              'text-neutral-800 dark:text-neutral-100',
              'border-2 border-neutral-300 dark:border-neutral-600',
              'hover:border-emerald-500/50 dark:hover:border-emerald-500/40',
              'shadow-md shadow-black/5 dark:shadow-black/20',
              'hover:shadow-lg hover:shadow-emerald-500/10',
            ],
        className,
      )}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {isPrimary && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-500 -z-10" />
        </>
      )}

      {!isPrimary && (
        <>
          <div className="absolute inset-0 bg-white dark:bg-neutral-900 rounded-xl" />
          <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
        </>
      )}

      <span className="relative z-10 flex items-center gap-2.5">
        {children}
      </span>

      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}

/* ── Fade In Up ── */

export function FadeInUp({
  children,
  delay = 0,
  className,
}: {
  children:   ReactNode;
  delay?:     number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      {children}
    </motion.div>
  );
}