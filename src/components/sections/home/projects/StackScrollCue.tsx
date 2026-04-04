// src/components/sections/home/projects/StackScrollCue.tsx
// Minimal scroll hint — fades out via CSS animation after section enters
import { memo }  from 'react';

export const StackScrollCue = memo(function StackScrollCue() {
  return (
    <div
      aria-hidden="true"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      style={{
        // CSS animation — fade out after 3s
        animation: 'fadeOutDown 1s ease 3s forwards',
      }}
    >
      <span className="text-white/40 text-[10px] font-mono tracking-[0.2em] uppercase">
        Scroll
      </span>
      <div className="w-[1px] h-12 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
            animation:  'scrollLine 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes fadeOutDown {
          to { opacity: 0; transform: translateX(-50%) translateY(12px); }
        }
      `}</style>
    </div>
  );
});