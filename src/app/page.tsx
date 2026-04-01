// src/app/page.tsx
// ← NO 'use client' — stays a Server Component for Hero SSR/LCP

import { SmoothScroll }     from '@/components/common/SmoothScroll';
import { FloatingAppBar }   from '@/components/common/FloatingAppBar';
import { Footer }           from '@/components/common/Footer';
import { SectionDivider }   from '@/components/sections/home/SectionDivider';
import { ChatWidgetLoader } from '@/components/chat/ChatWidgetLoader';
import { ErrorBoundary }    from '@/components/common/ErrorBoundary';
import { Hero }             from '@/components/sections/home/Hero';
import { HomeSections }     from '@/components/sections/home/HomeSections';

export default function HomePage() {
  return (
    <SmoothScroll>
      <FloatingAppBar />

      <main id="main-content">
        {/* Hero — static import, SSR, critical for LCP */}
        <ErrorBoundary section="hero">
          <Hero />
        </ErrorBoundary>

        <SectionDivider />

        {/* All below-fold sections — dynamically loaded, client-only */}
        <HomeSections />
      </main>

      <Footer />
      <ChatWidgetLoader />
    </SmoothScroll>
  );
}