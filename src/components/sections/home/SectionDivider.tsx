'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function SectionDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative flex items-center justify-center py-8">
      {/* FIX: 20% → 30% opacity for visibility in light mode */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 dark:via-emerald-500/25 to-transparent"
        initial={{ width: 0 }}
        animate={isInView ? { width: '80%' } : {}}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 0.6, type: 'spring' }}
      />
    </div>
  );
}