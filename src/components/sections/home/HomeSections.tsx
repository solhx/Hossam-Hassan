// src/components/sections/home/HomeSections.tsx
'use client';

import dynamic from 'next/dynamic';
import { SectionDivider } from '@/components/sections/home/SectionDivider';
import { ErrorBoundary }  from '@/components/common/ErrorBoundary';

// ── Skeleton placeholder ─────────────────────────────────────────────
function SectionSkeleton() {
  return (
    <div
      className="w-full h-[400px] bg-muted animate-pulse rounded-lg"
      aria-hidden="true"
    />
  );
}

// ── Below-fold sections — code split, client-only ───────────────────
const AboutMe = dynamic(
  () => import('@/components/sections/home/AboutMe').then((m) => ({ default: m.AboutMe })),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const Skills = dynamic(
  () => import('@/components/sections/home/Skills').then((m) => ({ default: m.Skills })),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const Experience = dynamic(
  () => import('@/components/sections/home/Experience').then((m) => ({ default: m.Experience })),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const Projects = dynamic(
  () => import('@/components/sections/home/Projects').then((m) => ({ default: m.Projects })),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const Contact = dynamic(
  () => import('@/components/sections/home/Contact').then((m) => ({ default: m.Contact })),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

// ── Single export renders all below-fold sections ───────────────────
export function HomeSections() {
  return (
    <>
      <SectionDivider />

      <ErrorBoundary section="about">
        <AboutMe />
      </ErrorBoundary>

      <SectionDivider />

      <ErrorBoundary section="skills">
        <Skills />
      </ErrorBoundary>

      <SectionDivider />

      <ErrorBoundary section="experience">
        <Experience />
      </ErrorBoundary>

      <SectionDivider />

      <ErrorBoundary section="projects">
        <Projects />
      </ErrorBoundary>

      <SectionDivider />

      <ErrorBoundary section="contact">
        <Contact />
      </ErrorBoundary>
    </>
  );
}