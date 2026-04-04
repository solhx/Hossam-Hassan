// src/components/sections/home/projects/CardBackground.tsx
import { memo, useRef, useEffect } from 'react';
import type { Accent } from './types';

interface CardBackgroundProps {
  accent:   Accent;
  index:    number;
  imageRef: (el: HTMLDivElement | null) => void;
}

// ── Dark mode base gradients (cinema, deep) ──────────────────
const DARK_GRADIENT_PATTERNS = [
  `linear-gradient(135deg, oklch(0.10 0.04 158) 0%, oklch(0.14 0.06 152) 40%, oklch(0.11 0.03 160) 100%)`,
  `radial-gradient(ellipse 80% 80% at 50% 40%, oklch(0.16 0.07 150) 0%, oklch(0.10 0.03 158) 60%, oklch(0.08 0.02 162) 100%)`,
  `linear-gradient(180deg, oklch(0.09 0.02 162) 0%, oklch(0.15 0.06 153) 50%, oklch(0.12 0.04 156) 100%)`,
  `linear-gradient(105deg, oklch(0.18 0.08 149) 0%, oklch(0.12 0.04 156) 40%, oklch(0.09 0.02 162) 100%)`,
  `radial-gradient(ellipse 100% 100% at 30% 60%, oklch(0.15 0.06 153) 0%, oklch(0.09 0.02 162) 70%)`,
] as const;

// ── Light mode base gradients (airy, clean) ──────────────────
// Each uses a very subtle warm-white with the faintest green tint
// The accent bloom provides the color identity — base stays clean
const LIGHT_GRADIENT_PATTERNS = [
  `linear-gradient(135deg, oklch(0.98 0.006 160) 0%, oklch(0.96 0.012 154) 40%, oklch(0.97 0.008 158) 100%)`,
  `radial-gradient(ellipse 80% 80% at 50% 40%, oklch(0.97 0.010 152) 0%, oklch(0.98 0.005 158) 60%, oklch(0.99 0.003 162) 100%)`,
  `linear-gradient(180deg, oklch(0.99 0.004 162) 0%, oklch(0.96 0.012 153) 50%, oklch(0.97 0.008 156) 100%)`,
  `linear-gradient(105deg, oklch(0.95 0.015 149) 0%, oklch(0.97 0.010 156) 40%, oklch(0.99 0.003 162) 100%)`,
  `radial-gradient(ellipse 100% 100% at 30% 60%, oklch(0.96 0.012 153) 0%, oklch(0.99 0.003 162) 70%)`,
] as const;

export const CardBackground = memo(function CardBackground({
  accent,
  index,
  imageRef,
}: CardBackgroundProps) {
  const darkPattern  = DARK_GRADIENT_PATTERNS[index  % DARK_GRADIENT_PATTERNS.length];
  const lightPattern = LIGHT_GRADIENT_PATTERNS[index % LIGHT_GRADIENT_PATTERNS.length];

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
      className="absolute inset-[-8%] will-change-transform"
      style={{ transform: 'translateY(0%) translateZ(0)' }}
    >
      {/* ── Base gradient — dark mode ─────────────────────── */}
      {/* Hidden in light mode via the sibling light layer */}
      <div
        className="absolute inset-0 dark:block hidden"
        style={{ background: darkPattern }}
      />

      {/* ── Base gradient — light mode ────────────────────── */}
      {/* White glass surface with faint green tint */}
      <div
        className="absolute inset-0 dark:hidden block"
        style={{ background: lightPattern }}
      />

      {/* ── Accent bloom right — DARK: vivid / LIGHT: subtle ─ */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-40"
        style={{
          background: `radial-gradient(
            ellipse 65% 65% at 65% 50%,
            rgba(${accent.bloomRgb}, 0.16) 0%,
            rgba(${accent.bloomRgb}, 0.06) 50%,
            transparent 70%
          )`,
        }}
      />

      {/* ── Accent secondary bottom-left ─────────────────── */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-30"
        style={{
          background: `radial-gradient(
            ellipse 45% 45% at 20% 80%,
            rgba(${accent.bloomRgb}, 0.08) 0%,
            transparent 60%
          )`,
        }}
      />

      {/* ── Geometric lines ──────────────────────────────── */}
      {/* DARK: white 1.8% / LIGHT: dark green 2.5% — both subtle */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-0"
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

      {/* Light mode lines — dark tinted */}
      <div
        className="absolute inset-0 dark:opacity-0 opacity-100"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              ${45 + index * 15}deg,
              transparent                         0px,
              transparent                         47px,
              rgba(0, 80, 50, 0.025)              47px,
              rgba(0, 80, 50, 0.025)              48px
            )
          `,
        }}
      />

      {/* ── Top edge highlight ───────────────────────────── */}
      {/* DARK: bright accent line / LIGHT: white highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px dark:opacity-100 opacity-60"
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

      {/* Light mode: white top highlight for glass depth */}
      <div
        className="absolute top-0 left-0 right-0 h-px dark:opacity-0 opacity-100"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.9) 20%,
            rgba(255, 255, 255, 1.0) 50%,
            rgba(255, 255, 255, 0.9) 80%,
            transparent 100%
          )`,
        }}
      />

      {/* ── Bottom depth fade ────────────────────────────── */}
      {/* DARK: dark fade / LIGHT: white fade (maintains glass feel) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 dark:opacity-100 opacity-0"
        style={{
          background: `linear-gradient(to top, oklch(0.06 0.01 160 / 0.6) 0%, transparent 100%)`,
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-1/4 dark:opacity-0 opacity-100"
        style={{
          background: `linear-gradient(to top, oklch(0.92 0.015 158 / 0.5) 0%, transparent 100%)`,
        }}
      />

      {/* ── CSS crosshatch micro-texture ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-100 opacity-40"
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

      {/* ── Light mode: premium glass reflection ─────────── */}
      {/* A soft diagonal highlight — makes card feel like frosted glass */}
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-0 opacity-100"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.60) 0%,
            rgba(255, 255, 255, 0.20) 30%,
            rgba(255, 255, 255, 0.05) 60%,
            transparent 100%
          )`,
        }}
      />

      {/* ── Light mode: subtle drop shadow simulation ─────── */}
      {/* Inner bottom shadow creates depth on the glass card */}
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-0 opacity-100"
        style={{
          boxShadow: `
            inset 0 -1px 0 0 rgba(${accent.bloomRgb}, 0.15),
            inset 0  1px 0 0 rgba(255, 255, 255, 0.8)
          `,
          borderRadius: 'inherit',
        }}
      />
    </div>
  );
});