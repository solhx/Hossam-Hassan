// src/components/sections/home/projects/CardBackground.tsx

import { memo, useRef, useEffect }       from 'react';
import type { Accent } from './types';

interface CardBackgroundProps {
  accent:   Accent;
  index:    number;
  imageRef: (el: HTMLDivElement | null) => void;
}

const GRADIENT_PATTERNS = [
  `linear-gradient(135deg, oklch(0.10 0.04 158) 0%, oklch(0.14 0.06 152) 40%, oklch(0.11 0.03 160) 100%)`,
  `radial-gradient(ellipse 80% 80% at 50% 40%, oklch(0.16 0.07 150) 0%, oklch(0.10 0.03 158) 60%, oklch(0.08 0.02 162) 100%)`,
  `linear-gradient(180deg, oklch(0.09 0.02 162) 0%, oklch(0.15 0.06 153) 50%, oklch(0.12 0.04 156) 100%)`,
  `linear-gradient(105deg, oklch(0.18 0.08 149) 0%, oklch(0.12 0.04 156) 40%, oklch(0.09 0.02 162) 100%)`,
  `radial-gradient(ellipse 100% 100% at 30% 60%, oklch(0.15 0.06 153) 0%, oklch(0.09 0.02 162) 70%)`,
] as const;

export const CardBackground = memo(function CardBackground({
  accent,
  index,
  imageRef,
}: CardBackgroundProps) {
  const pattern = GRADIENT_PATTERNS[index % GRADIENT_PATTERNS.length];

  const imageElRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    imageRef(imageElRef.current);
    return () => {
      if (imageElRef.current) imageElRef.current.style.willChange = 'auto';
    };
  }, [imageRef]);

  return (
    <div
      ref={imageElRef}
      className="absolute inset-[-8%] will-change-transform" // FIX 19: Managed lifetime
      style={{ transform: 'translateY(0%) translateZ(0)' }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: pattern }} />

      {/* Accent bloom — right side */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse 65% 65% at 65% 50%,
            rgba(${accent.bloomRgb}, 0.16) 0%,
            rgba(${accent.bloomRgb}, 0.06) 50%,
            transparent 70%
          )`,
        }}
      />

      {/* Accent secondary — bottom-left */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse 45% 45% at 20% 80%,
            rgba(${accent.bloomRgb}, 0.08) 0%,
            transparent 60%
          )`,
        }}
      />

      {/*
        FIX 6: Geometric lines — pure CSS gradient (no SVG, no data URI)
        CSS repeating-gradient is computed by GPU mathematically.
        Zero texture size, zero upload cost, zero rasterization.
        Moves with translateY for free during parallax.
      */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              ${45 + index * 15}deg,
              transparent                         0px,
              transparent                         47px,
              rgba(255, 255, 255, 0.018)          47px,
              rgba(255, 255, 255, 0.018)          48px
            )
          `,
        }}
      />

      {/* Top edge highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            rgba(${accent.bloomRgb}, 0.35) 30%,
            rgba(${accent.bloomRgb}, 0.55) 50%,
            rgba(${accent.bloomRgb}, 0.35) 70%,
            transparent 100%
          )`,
        }}
      />

      {/* Bottom depth fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, oklch(0.06 0.01 160 / 0.6) 0%, transparent 100%)`,
        }}
      />

      {/*
        FIX 6: CSS crosshatch replaces SVG noise entirely.
        Two overlapping 45deg gradients create a micro-texture.
        Pure math — GPU renders at any scale with zero memory.
        No repaint on translateY changes (gradient moves with layer).
      */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(
               45deg,
               transparent 49.5%,
               rgba(255,255,255,0.022) 49.5%,
               rgba(255,255,255,0.022) 50.5%,
               transparent 50.5%
            ),
            linear-gradient(
              -45deg,
              transparent 49.5%,
              rgba(255,255,255,0.022) 49.5%,
              rgba(255,255,255,0.022) 50.5%,
              transparent 50.5%
            )
          `,
          backgroundSize: '6px 6px',
          mixBlendMode:   'overlay',
        }}
      />
    </div>
  );
});