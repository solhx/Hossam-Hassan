"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Marquee } from "@/components/ui/marquee";
import { VelocityScroll } from "@/components/ui/velocity-scroll";
import { skills, skillCategories } from "@/lib/portfolio-data";
import { cn } from "@/utils/utils";

export function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredSkills =
    activeCategory === "all"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Velocity scroll background text */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none">
        <VelocityScroll defaultVelocity={2}>
          REACT • NEXT.JS • TYPESCRIPT • NODE.JS • MONGODB • TAILWIND •
        </VelocityScroll>
      </div>

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Skills & Tools"
          title="Tech Arsenal"
          subtitle="Technologies and tools I use to build exceptional digital experiences."
        />

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer",
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            All
          </button>
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Skills grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="group relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                  {/* Progress bar background */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/50">
                    <motion.div
                      className="h-full bg-primary/40 rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${skill.proficiency}%` } : {}}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{skill.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {skill.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {skill.category}
                    </span>
                    <span className="text-xs font-mono text-primary">
                      {skill.proficiency}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Marquee of skill names */}
        <div className="mt-16">
          <Marquee speed={25} className="py-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm mx-2"
              >
                <span className="text-lg">{skill.icon}</span>
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {skill.name}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}