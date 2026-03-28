import dynamic from 'next/dynamic';
import { SmoothScroll } from '@/components/common/SmoothScroll';
import { FloatingAppBar } from '@/components/common/FloatingAppBar';
import { Footer } from '@/components/common/Footer';
import { SectionDivider } from '@/components/sections/home/SectionDivider';

const Hero = dynamic(
  () => import('@/components/sections/home/Hero').then((m) => ({ default: m.Hero })),
  { ssr: true }
);
const AboutMe = dynamic(
  () => import('@/components/sections/home/AboutMe').then((m) => ({ default: m.AboutMe })),
  { ssr: true }
);
const Skills = dynamic(
  () => import('@/components/sections/home/Skills').then((m) => ({ default: m.Skills })),
  { ssr: true }
);
const Experience = dynamic(
  () => import('@/components/sections/home/Experience').then((m) => ({ default: m.Experience })),
  { ssr: true }
);
const Projects = dynamic(
  () => import('@/components/sections/home/Projects').then((m) => ({ default: m.Projects })),
  { ssr: true }
);
const Contact = dynamic(
  () => import('@/components/sections/home/Contact').then((m) => ({ default: m.Contact })),
  { ssr: true }
);
const ChatWidget = dynamic(
  () => import('@/components/chat/ChatWidget').then((m) => ({ default: m.ChatWidget })),
  { ssr: true }
);

export default function HomePage() {
  return (
    <SmoothScroll>
      <FloatingAppBar />

      <main>
        <Hero />
        <SectionDivider />
        <AboutMe />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <Experience />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Contact />
      </main>

      <Footer />
      <ChatWidget />
    </SmoothScroll>
  );
}