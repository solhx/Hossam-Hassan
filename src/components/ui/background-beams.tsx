'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn, prefersReducedMotion } from '@/utils/utils';

interface Beam {
  x: number; y: number; vx: number; vy: number;
  length: number; opacity: number; hue: number;
}

export function BackgroundBeams({ className, beamCount = 8 }: { className?: string; beamCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  const initBeams = useCallback((w: number, h: number) => {
    beamsRef.current = Array.from({ length: beamCount }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      length: 100 + Math.random() * 200,
      opacity: 0.06 + Math.random() * 0.12,
      hue: 155 + Math.random() * 15,
    }));
  }, [beamCount]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initBeams(canvas.offsetWidth, canvas.offsetHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
  window.addEventListener('mousemove', handleMouse, { passive: true });

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      beamsRef.current.forEach((b) => {
        const dx = b.x - mouseRef.current.x;
        const dy = b.y - mouseRef.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150 && d > 0) { b.vx += (dx / d) * 0.3; b.vy += (dy / d) * 0.3; }
        b.x += b.vx; b.y += b.vy; b.vx *= 0.99; b.vy *= 0.99;
        if (b.x < 0 || b.x > w) b.vx *= -1;
        if (b.y < 0 || b.y > h) b.vy *= -1;
        b.x = Math.max(0, Math.min(w, b.x));
        b.y = Math.max(0, Math.min(h, b.y));

        const angle = Math.atan2(b.vy, b.vx);
        const g = ctx.createLinearGradient(b.x, b.y, b.x + Math.cos(angle) * b.length, b.y + Math.sin(angle) * b.length);
        g.addColorStop(0, `hsla(${b.hue}, 60%, 45%, 0)`);
        g.addColorStop(0.5, `hsla(${b.hue}, 60%, 45%, ${b.opacity})`);
        g.addColorStop(1, `hsla(${b.hue}, 60%, 45%, 0)`);
        ctx.beginPath(); ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + Math.cos(angle) * b.length, b.y + Math.sin(angle) * b.length);
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
      });

      for (let i = 0; i < beamsRef.current.length; i++) {
        for (let j = i + 1; j < beamsRef.current.length; j++) {
          const a = beamsRef.current[i]; const bm = beamsRef.current[j];
          const d = Math.sqrt((a.x - bm.x) ** 2 + (a.y - bm.y) ** 2);
          if (d < 200) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bm.x, bm.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.06 * (1 - d / 200)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', handleMouse);};
  }, [initBeams]);

  return <canvas
  ref={canvasRef}
  className={cn(
    'absolute inset-0 w-full h-full pointer-events-none', // ✅ Never blocks
    className
  )}
/>
}