"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn, prefersReducedMotion } from "@/utils/utils";

interface Beam {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  hue: number;
}

interface BackgroundBeamsProps {
  className?: string;
  beamCount?: number;
}

export function BackgroundBeams({ className, beamCount = 8 }: BackgroundBeamsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  const initBeams = useCallback(
    (width: number, height: number) => {
      beamsRef.current = Array.from({ length: beamCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        length: 100 + Math.random() * 200,
        opacity: 0.1 + Math.random() * 0.3,
        hue: 150 + Math.random() * 20, // Green range
      }));
    },
    [beamCount]
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initBeams(canvas.offsetWidth, canvas.offsetHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", handleMouse);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      beamsRef.current.forEach((beam) => {
        const dx = beam.x - mouseRef.current.x;
        const dy = beam.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          beam.vx += (dx / dist) * 0.3;
          beam.vy += (dy / dist) * 0.3;
        }

        beam.x += beam.vx;
        beam.y += beam.vy;
        beam.vx *= 0.99;
        beam.vy *= 0.99;

        if (beam.x < 0 || beam.x > w) beam.vx *= -1;
        if (beam.y < 0 || beam.y > h) beam.vy *= -1;
        beam.x = Math.max(0, Math.min(w, beam.x));
        beam.y = Math.max(0, Math.min(h, beam.y));

        const angle = Math.atan2(beam.vy, beam.vx);
        const gradient = ctx.createLinearGradient(
          beam.x, beam.y,
          beam.x + Math.cos(angle) * beam.length,
          beam.y + Math.sin(angle) * beam.length
        );
        gradient.addColorStop(0, `hsla(${beam.hue}, 75%, 50%, 0)`);
        gradient.addColorStop(0.5, `hsla(${beam.hue}, 75%, 50%, ${beam.opacity})`);
        gradient.addColorStop(1, `hsla(${beam.hue}, 75%, 50%, 0)`);

        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(
          beam.x + Math.cos(angle) * beam.length,
          beam.y + Math.sin(angle) * beam.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      for (let i = 0; i < beamsRef.current.length; i++) {
        for (let j = i + 1; j < beamsRef.current.length; j++) {
          const a = beamsRef.current[i];
          const b = beamsRef.current[j];
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (d < 200) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - d / 200)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, [initBeams]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full pointer-events-auto", className)}
    />
  );
}