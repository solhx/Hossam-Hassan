"use client";

import { cn } from "@/utils/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  speed?: number;
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  className,
  reverse = false,
  speed = 30,
  pauseOnHover = true,
}: MarqueeProps) {
  return (
    <div
      className={cn("group flex overflow-hidden [--gap:1rem] gap-[var(--gap)]", className)}
    >
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
           aria-hidden={i === 1 ? 'true' : undefined} 
          className={cn(
            "flex shrink-0 gap-[var(--gap)] min-w-full items-center justify-around",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{
            animation: `marquee ${speed}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}