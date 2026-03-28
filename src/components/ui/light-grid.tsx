'use client';

import { cn } from '@/utils/utils';

export function LightGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-emerald-500/[0.02] blur-[120px]" />
      <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-emerald-500/10 animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-emerald-400/5 animate-[float_6s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-emerald-300/8 animate-[float_7s_ease-in-out_infinite_2s]" />
    </div>
  );
}