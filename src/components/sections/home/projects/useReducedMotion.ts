// src/components/sections/home/projects/useReducedMotion.ts
//
// Re-exports the global hook so the projects directory is
// self-contained — no ../../../ relative chains inside the feature.
// If the global hook changes, this stays in sync automatically.

export { useReducedMotion } from '@/hooks/useReducedMotion';