"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function ThreeDCard({
  children,
  className,
  containerClassName,
}: ThreeDCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    setRotateX((-y / rect.height) * 20);
    setRotateY((x / rect.width) * 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      className={cn("perspective-[1000px]", containerClassName)}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className={cn(
          "relative rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10",
          className
        )}
        animate={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Light reflection effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${50 + rotateY * 2}% ${50 - rotateX * 2}%, rgba(124,58,237,0.12) 0%, transparent 60%)`,
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}

export function ThreeDCardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-6 [transform-style:preserve-3d]", className)}>
      {children}
    </div>
  );
}

export function ThreeDCardItem({
  children,
  className,
  translateZ = 0,
}: {
  children: ReactNode;
  className?: string;
  translateZ?: number;
}) {
  return (
    <div
      className={cn("", className)}
      style={{ transform: `translateZ(${translateZ}px)` }}
    >
      {children}
    </div>
  );
}