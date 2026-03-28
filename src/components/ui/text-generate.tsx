"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/utils";

interface TextGenerateProps {
  words: string;
  className?: string;
  delay?: number;
}

export function TextGenerate({ words, className, delay = 0 }: TextGenerateProps) {
  const [started, setStarted] = useState(false);
  const wordArray = words.split(" ");

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn("font-bold", className)}>
      <AnimatePresence>
        {started &&
          wordArray.map((word, idx) => (
            <motion.span
              key={`${word}-${idx}`}
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}
      </AnimatePresence>
    </div>
  );
}