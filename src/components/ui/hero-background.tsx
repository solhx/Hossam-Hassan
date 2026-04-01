// ✅ FIXED — src/components/ui/hero-background.tsx
'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ── Layer 1: Aurora Ribbons ── */

interface RibbonConfig {
  gradient:     string;
  darkGradient: string;
  className:    string;
  animate: {
    x?:      number[];
    y?:      number[];
    rotate?: number[];
    scaleX?: number[];
  };
  duration: number;
}

const ribbons: RibbonConfig[] = [
  {
    gradient:
      'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.25), rgba(6,182,212,0.20), transparent 95%)',
    darkGradient:
      'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.35), rgba(6,182,212,0.30), transparent 95%)',
    className: 'w-[140%] h-[6px] top-[22%] -left-[20%]',
    animate: {
      x:      [-100, 100, -100],
      rotate: [-2, 2, -2],
      scaleX: [1, 1.3, 1],
    },
    duration: 18,
  },
  {
    gradient:
      'linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.20), rgba(16,185,129,0.25), transparent 95%)',
    darkGradient:
      'linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.30), rgba(16,185,129,0.35), transparent 95%)',
    className: 'w-[120%] h-[4px] top-[38%] -left-[10%]',
    animate: {
      x:      [80, -120, 80],
      rotate: [1, -1.5, 1],
      scaleX: [1.1, 0.9, 1.1],
    },
    duration: 22,
  },
  {
    gradient:
      'linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.22), rgba(139,92,246,0.18), transparent 95%)',
    darkGradient:
      'linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.35), rgba(139,92,246,0.28), transparent 95%)',
    className: 'w-[160%] h-[3px] top-[58%] -left-[30%]',
    animate: {
      x:      [-60, 140, -60],
      rotate: [-1, 3, -1],
      scaleX: [0.8, 1.2, 0.8],
    },
    duration: 25,
  },
  {
    gradient:
      'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.18), rgba(6,182,212,0.22), rgba(139,92,246,0.15), transparent 95%)',
    darkGradient:
      'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.28), rgba(6,182,212,0.35), rgba(139,92,246,0.22), transparent 95%)',
    className: 'w-[130%] h-[4px] top-[73%] -left-[15%]',
    animate: {
      x:      [50, -80, 50],
      rotate: [2, -2, 2],
      scaleX: [1, 1.4, 1],
    },
    duration: 20,
  },
  {
    gradient:
      'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.15), rgba(139,92,246,0.12), transparent 95%)',
    darkGradient:
      'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.25), rgba(139,92,246,0.20), transparent 95%)',
    className: 'w-[150%] h-[2px] top-[48%] -left-[25%]',
    animate: {
      x:      [-80, 60, -80],
      rotate: [-1.5, 1, -1.5],
      scaleX: [0.9, 1.2, 0.9],
    },
    duration: 16,
  },
];

function AuroraRibbons({
  layerX,
  layerY,
}: {
  layerX: MotionValue<number>;
  layerY: MotionValue<number>;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ x: layerX, y: layerY }}
      aria-hidden="true"
    >
      {ribbons.map((ribbon, i) => (
        <motion.div
          key={i}
          className={`absolute ${ribbon.className} will-change-transform`}
          style={{ background: `var(--aurora-ribbon-${i})` }}
          animate={reduced ? {} : ribbon.animate}
          transition={{
            duration: ribbon.duration,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        >
          <div
            className="absolute inset-[-8px] blur-[60px] opacity-80"
            style={{ background: `var(--aurora-ribbon-${i})` }}
          />
        </motion.div>
      ))}

      <style>{`
        :root {
          ${ribbons
            .map((r, i) => `--aurora-ribbon-${i}: ${r.gradient};`)
            .join('\n          ')}
        }
        .dark {
          ${ribbons
            .map((r, i) => `--aurora-ribbon-${i}: ${r.darkGradient};`)
            .join('\n          ')}
        }
      `}</style>
    </motion.div>
  );
}

/* ── Layer 2: Floating Light Orbs ── */

interface OrbConfig {
  size:       string;
  position:   string;
  lightColor: string;
  darkColor:  string;
  animate:    { x: number[]; y: number[]; scale: number[] };
  duration:   number;
}

const lightOrbs: OrbConfig[] = [
  {
    size:       'w-[700px] h-[700px]',
    position:   'top-[-20%] left-[-15%]',
    lightColor: 'rgba(16,185,129,0.12)',
    darkColor:  'rgba(16,185,129,0.18)',
    animate: {
      x:     [0, 80, -40, 0],
      y:     [0, -50, 40, 0],
      scale: [1, 1.15, 0.9, 1],
    },
    duration: 22,
  },
  {
    size:       'w-[600px] h-[600px]',
    position:   'top-[25%] right-[-15%]',
    lightColor: 'rgba(6,182,212,0.10)',
    darkColor:  'rgba(6,182,212,0.15)',
    animate: {
      x:     [0, -70, 50, 0],
      y:     [0, 40, -60, 0],
      scale: [1, 0.85, 1.12, 1],
    },
    duration: 26,
  },
  {
    size:       'w-[550px] h-[550px]',
    position:   'bottom-[-15%] left-[20%]',
    lightColor: 'rgba(139,92,246,0.08)',
    darkColor:  'rgba(139,92,246,0.14)',
    animate: {
      x:     [0, 50, -70, 0],
      y:     [0, -40, 30, 0],
      scale: [1, 1.08, 0.88, 1],
    },
    duration: 24,
  },
  {
    size:       'w-[400px] h-[400px]',
    position:   'top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2',
    lightColor: 'rgba(16,185,129,0.06)',
    darkColor:  'rgba(16,185,129,0.10)',
    animate: {
      x:     [0, 30, -30, 0],
      y:     [0, -20, 20, 0],
      scale: [1, 1.1, 0.95, 1],
    },
    duration: 20,
  },
];

function FloatingOrbs({
  layerX,
  layerY,
}: {
  layerX: MotionValue<number>;
  layerY: MotionValue<number>;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ x: layerX, y: layerY }}
      aria-hidden="true"
    >
      {lightOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.size} ${orb.position} blur-[100px] will-change-transform`}
          style={{ background: `var(--hero-orb-${i})` }}
          animate={reduced ? {} : orb.animate}
          transition={{
            duration: orb.duration,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}
      <style>{`
        :root {
          ${lightOrbs
            .map((o, i) => `--hero-orb-${i}: ${o.lightColor};`)
            .join('\n          ')}
        }
        .dark {
          ${lightOrbs
            .map((o, i) => `--hero-orb-${i}: ${o.darkColor};`)
            .join('\n          ')}
        }
      `}</style>
    </motion.div>
  );
}

/* ── Layer 3: Spotlight ── */

function Spotlight({
  springX,
  springY,
}: {
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 45%, var(--spotlight-color) 0%, transparent 70%)',
        x: springX,
        y: springY,
      }}
      aria-hidden="true"
    >
      <style>{`
        :root  { --spotlight-color: rgba(16, 185, 129, 0.06); }
        .dark  { --spotlight-color: rgba(16, 185, 129, 0.10); }
      `}</style>
    </motion.div>
  );
}

/* ── Layer 4: Mesh Noise ── */

function MeshNoise() {
  return (
    <div
      className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045] pointer-events-none mix-blend-overlay"
      aria-hidden="true"
      style={{
        backgroundImage:  `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize:   '256px 256px',
      }}
    />
  );
}

/* ── Layer 5: Depth Fog ── */

function DepthFog() {
  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 h-[20%] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to bottom, var(--color-background) 0%, transparent 100%)',
          opacity:    0.3,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[25%] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to top, var(--color-background) 0%, transparent 100%)',
          opacity:    0.7,
        }}
      />
    </>
  );
}

/* ── Layer 6: Dust Particles ── */

function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const reduced   = useReducedMotion();

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 8000), 80); // ✅ reduced from 100→80
    return Array.from({ length: count }, () => ({
      x:          Math.random() * width,
      y:          Math.random() * height,
      vy:         -(Math.random() * 0.2 + 0.08),
      vx:         (Math.random() - 0.5) * 0.15,
      radius:     Math.random() * 1.5 + 0.4,
      opacity:    Math.random() * 0.4 + 0.1,
      opacityDir: (Math.random() > 0.5 ? 1 : -1) * 0.002,
      hue:        150 + (Math.random() - 0.5) * 40,
    }));
  }, []);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width  = canvas.parentElement?.clientWidth  ?? window.innerWidth;
    let height = canvas.parentElement?.clientHeight ?? window.innerHeight;
    const dpr  = Math.min(window.devicePixelRatio, 1.5); // ✅ cap at 1.5 (was 2)

    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let particles = initParticles(width, height);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10)        { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10)          p.x = width + 10;
        if (p.x > width + 10)   p.x = -10;

        p.opacity += p.opacityDir;
        if (p.opacity >= 0.5 || p.opacity <= 0.05) p.opacityDir *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 50%, 70%, ${p.opacity})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      width  = canvas.parentElement?.clientWidth  ?? window.innerWidth;
      height = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      particles = initParticles(width, height);
    };

    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, initParticles]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-70 dark:opacity-80"
      aria-hidden="true"
    />
  );
}

/* ── Composed Export ── */

interface HeroBackgroundProps {
  layerX:     MotionValue<number>;
  layerY:     MotionValue<number>;
  layerXSlow: MotionValue<number>;
  layerYSlow: MotionValue<number>;
  springX:    MotionValue<number>;
  springY:    MotionValue<number>;
}

export const HeroBackground = memo(function HeroBackground({
  layerX,
  layerY,
  layerXSlow,
  layerYSlow,
  springX,
  springY,
}: HeroBackgroundProps) {
  return (
    <>
      <FloatingOrbs  layerX={layerX}     layerY={layerY}     />
      <AuroraRibbons layerX={layerXSlow} layerY={layerYSlow} />
      <Spotlight     springX={springX}   springY={springY}   />
      <DustParticles />
      <MeshNoise />
      <DepthFog />
    </>
  );
});