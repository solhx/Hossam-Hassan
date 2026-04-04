// src/components/sections/home/projects/StackScrollCue.tsx
// ─────────────────────────────────────────────────────────────────
// CHANGES:
//
// FIX Y — jsx styled-jsx removal (not needed in Next.js App Router)
// BEFORE: Used `<style jsx>` which requires styled-jsx babel plugin.
//         Next.js App Router with Tailwind doesn't include styled-jsx
//         by default — this threw a silent compile warning and fell
//         back to injecting a plain <style> tag without scoping.
// AFTER:  CSS keyframes moved to globals.css (already defined there
//         as stack-scroll-line and stack-cue-fade). The component
//         references those keyframe names directly — no local style tag.
//
// FIX Z — Reduced motion: animation runs even when reduced=true
// BEFORE: The CSS animations on StackScrollCue had no reduced motion
//         guard. @media(prefers-reduced-motion) in globals.css covered
//         the background orbs but not the scroll cue specifically.
// AFTER:  Added inline check for prefers-reduced-motion. The cue
//         is hidden entirely for reduced motion users (they don't
//         need a scroll prompt — keyboard navigation is their path).
// ─────────────────────────────────────────────────────────────────
import { memo }  from 'react';

export const StackScrollCue = memo(function StackScrollCue() {
  // FIX Z: Hide scroll cue for reduced motion users.
  // prefers-reduced-motion users navigate via keyboard (arrow keys)
  // and don't need the visual scroll prompt. The cue's animation
  // is also potentially distracting for vestibular disorder users.
  // This check is synchronous (matchMedia) — safe in 'use client' context.
  // We intentionally don't use useReducedMotion hook here to avoid
  // adding a state subscription to this purely decorative component.
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  if (prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      style={{
        // FIX Y: References keyframe defined in globals.css (stack-cue-fade)
        animation: 'stack-cue-fade 1s ease 3s forwards',
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
            // FIX Y: References keyframe defined in globals.css (stack-scroll-line)
            animation: 'stack-scroll-line 1.4s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
});