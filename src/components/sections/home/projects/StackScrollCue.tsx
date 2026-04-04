// src/components/sections/home/projects/StackScrollCue.tsx
'use client';

import { memo }         from 'react';
import { motion }       from 'framer-motion';

export const StackScrollCue = memo(function StackScrollCue() {
  return (
    <motion.div
      aria-hidden="true"
      className={[
        'absolute bottom-8 left-1/2 -translate-x-1/2 z-50',
        'flex flex-col items-center gap-2 pointer-events-none',
      ].join(' ')}
      // Fade out after 3.5s automatically
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.8, delay: 3.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* UPGRADE: label breathes */}
      <motion.span
        className="dark:text-white/40 text-black/35 text-[10px] font-mono tracking-[0.22em] uppercase"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Scroll
      </motion.span>

      {/* UPGRADE: animated line with glow */}
      <div className="relative w-[1px] h-12 overflow-hidden">
        {/* Track */}
        <div className="absolute inset-0 dark:bg-white/10 bg-black/10" />

        {/* Moving fill line */}
        <motion.div
          className="absolute top-0 left-0 w-full"
          style={{
            height: '60%',
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.7), transparent)',
          }}
          animate={{ y: ['-100%', '250%'] }}
          transition={{
            duration:   1.4,
            repeat:     Infinity,
            ease:       'easeInOut',
            repeatDelay: 0.2,
          }}
        />
      </div>

      {/* UPGRADE: chevron bounce */}
      <motion.div
        className="flex flex-col items-center gap-[3px]"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span
          className="block w-[5px] h-[5px] border-r border-b dark:border-white/40 border-black/30 rotate-45"
        />
        <span
          className="block w-[5px] h-[5px] border-r border-b dark:border-white/20 border-black/15 rotate-45"
        />
      </motion.div>
    </motion.div>
  );
});