// src/components/ui/HeroFallback.tsx
// Pure CSS animated background — zero JS animation libraries,
// no Three.js, no GSAP. Uses only @keyframes defined in globals.css.

export function HeroFallback() {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      aria-hidden="true"
    >
      {/*
        ✅ will-change: transform promotes each orb to its own GPU
           compositor layer BEFORE animation starts.
        ✅ transform: translateZ(0) forces immediate GPU layer creation.
        Both together eliminate the "non-composited animations" Lighthouse
        warning and prevent main-thread repaints on every animation frame.
      */}

      {/* Orb 1 — top left */}
      <div
        className="absolute rounded-full opacity-30 blur-3xl"
        style={{
          width:      '40vw',
          height:     '40vw',
          top:        '-10%',
          left:       '-10%',
          background: 'radial-gradient(circle, #10b981 0%, #059669 60%, transparent 100%)',
          animation:  'float 7s ease-in-out infinite',
          willChange: 'transform',        // ✅ GPU compositing
          transform:  'translateZ(0)',    // ✅ force layer creation
        }}
      />

      {/* Orb 2 — bottom right */}
      <div
        className="absolute rounded-full opacity-20 blur-3xl"
        style={{
          width:          '50vw',
          height:         '50vw',
          bottom:         '-15%',
          right:          '-15%',
          background:     'radial-gradient(circle, #6ee7b7 0%, #008299 60%, transparent 100%)',
          animation:      'float 9s ease-in-out infinite reverse',
          animationDelay: '-3s',
          willChange:     'transform',    // ✅ GPU compositing
          transform:      'translateZ(0)',
        }}
      />

      {/* Orb 3 — center */}
      <div
        className="absolute rounded-full opacity-15 blur-3xl"
        style={{
          width:          '30vw',
          height:         '30vw',
          top:            '40%',
          left:           '35%',
          background:     'radial-gradient(circle, #34d399 0%, transparent 70%)',
          animation:      'float 11s ease-in-out infinite',
          animationDelay: '-6s',
          willChange:     'transform',    // ✅ GPU compositing
          transform:      'translateZ(0)',
        }}
      />
    </div>
  );
}