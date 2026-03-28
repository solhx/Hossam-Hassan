"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code2, Coffee, Rocket, Heart, Terminal, Globe } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { LightGrid } from "@/components/ui/light-grid";
import { siteConfig } from "@/lib/portfolio-data";

const highlights = [
  {
    icon: <Code2 size={22} />,
    title: "Clean Code Advocate",
    description: "Writing maintainable, scalable, and well-documented code is my passion.",
  },
  {
    icon: <Rocket size={22} />,
    title: "Performance First",
    description: "Every millisecond matters. I optimize for speed, accessibility, and SEO.",
  },
  {
    icon: <Coffee size={22} />,
    title: "Continuous Learner",
    description: "Always exploring new technologies, patterns, and best practices.",
  },
  {
    icon: <Heart size={22} />,
    title: "User-Centric Design",
    description: "Building interfaces that delight users with smooth interactions.",
  },
  {
    icon: <Terminal size={22} />,
    title: "Full-Stack Mindset",
    description: "From database design to pixel-perfect UIs, I handle the full stack.",
  },
  {
    icon: <Globe size={22} />,
    title: "Open Source Contributor",
    description: "Giving back to the community through open-source contributions.",
  },
];

export function AboutMe() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden">
      <LightGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="About Me"
          title="Passionate Developer"
          subtitle="I'm a Full-Stack Developer based in Cairo, Egypt, with 5+ years of experience building modern web applications."
        />

        {/* Bio section */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 text-center">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
              I specialize in the{" "}
              <span className="text-primary font-semibold">MERN stack</span> and
              modern frontend frameworks like{" "}
              <span className="text-primary font-semibold">Next.js</span> and{" "}
              <span className="text-primary font-semibold">TypeScript</span>. I
              love creating premium digital experiences with cutting-edge animations,
              smooth interactions, and pixel-perfect designs.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              When I&apos;m not coding, you&apos;ll find me exploring new technologies,
              contributing to open-source projects, or writing technical articles. I
              believe in clean code, thoughtful architecture, and building products
              that make a real impact.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary font-medium">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {siteConfig.availability}
            </div>
          </div>
        </motion.div>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <div className="group h-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}