// src/app/page.tsx
import { SmoothScroll }     from '@/components/common/SmoothScroll';
import { FloatingAppBar }   from '@/components/common/FloatingAppBar';
import { Footer }           from '@/components/common/Footer';
import { SectionDivider }   from '@/components/sections/home/SectionDivider';
import { ChatWidgetLoader } from '@/components/chat/ChatWidgetLoader';
import { ErrorBoundary }    from '@/components/common/ErrorBoundary';

// ✅ Direct imports — dynamic({ ssr: true }) is the default and adds no value.
// Next.js App Router already code-splits at the route boundary.
import { Hero }       from '@/components/sections/home/Hero';
import { AboutMe }    from '@/components/sections/home/AboutMe';
import { Skills }     from '@/components/sections/home/Skills';
import { Experience } from '@/components/sections/home/Experience';
import { Projects }   from '@/components/sections/home/Projects';
import { Contact }    from '@/components/sections/home/Contact';

export default function HomePage() {
  return (
    <SmoothScroll>
      <FloatingAppBar />

      {/* ✅ id="main-content" — target for skip-to-content link */}
      <main id="main-content">
        <ErrorBoundary section="hero">
          <Hero />
        </ErrorBoundary>

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
      </main>

      <Footer />

      {/* ✅ ChatWidgetLoader — ssr:false handled inside the loader */}
      <ChatWidgetLoader />
    </SmoothScroll>
  );
}