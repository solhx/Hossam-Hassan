"use client";

import { cn } from "@/utils/utils";

interface LightGridProps {
  className?: string;
}

export function LightGrid({ className }: LightGridProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Radial glow at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-primary/20 animate-[float_6s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-primary/30 animate-[float_7s_ease-in-out_infinite_2s]" />
    </div>
  );
}