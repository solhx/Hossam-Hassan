"use client";

import { useEffect, useRef } from "react";
import { cn, prefersReducedMotion } from "@/utils/utils";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface BallpitProps {
  className?: string;
  count?: number;
}

const COLORS = [
  "rgba(139,92,246,0.5)",
  "rgba(124,58,237,0.4)",
  "rgba(99,102,241,0.35)",
  "rgba(167,139,250,0.3)",
  "rgba(196,181,253,0.2)",
  "rgba(129,140,248,0.3)",
];

export function Ballpit({ className, count = 30 }: BallpitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animRef = useRef<number>(0);

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
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ballsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 3 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      ballsRef.current.forEach((ball) => {
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x - ball.r < 0 || ball.x + ball.r > w) ball.vx *= -1;
        if (ball.y - ball.r < 0 || ball.y + ball.r > h) ball.vy *= -1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
      });

      for (let i = 0; i < ballsRef.current.length; i++) {
        for (let j = i + 1; j < ballsRef.current.length; j++) {
          const a = ballsRef.current[i];
          const b = ballsRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + b.r;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            a.vx -= dot * nx * 0.8;
            a.vy -= dot * ny * 0.8;
            b.vx += dot * nx * 0.8;
            b.vy += dot * ny * 0.8;
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none",
        className
      )}
    />
  );
}