"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Timeline } from "@/components/ui/timeline";
import { experiences } from "@/lib/portfolio-data";
import { CheckCircle2 } from "lucide-react";

export function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const timelineItems = experiences.map((exp) => ({
    title: exp.role,
    subtitle: exp.company,
    period: exp.period,
    content: (
      <div>
        <p className="text-sm text-muted-foreground mb-3 text-left">
          {exp.description}
        </p>

        {/* Achievements */}
        <ul className="space-y-2 mb-4 text-left">
          {exp.achievements.map((achievement, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground/80">
              <CheckCircle2
                size={14}
                className="text-primary mt-0.5 flex-shrink-0"
              />
              <span>{achievement}</span>
            </li>
          ))}
        </ul>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5">
          {exp.technologies.map((tech) => (
            <span
              key={tech}
              className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary border border-primary/10"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    ),
  }));

  return (
    <section
      id="experience"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Dot pattern bg */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Experience"
          title="Career Journey"
          subtitle="A timeline of my professional growth and key achievements."
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Timeline items={timelineItems} />
        </motion.div>
      </div>
    </section>
  );
}