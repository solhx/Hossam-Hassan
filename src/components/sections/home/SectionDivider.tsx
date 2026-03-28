"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function SectionDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative flex items-center justify-center py-8">
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        initial={{ width: 0 }}
        animate={isInView ? { width: "80%" } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-primary"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 0.6, type: "spring" }}
      />
    </div>
  );
}