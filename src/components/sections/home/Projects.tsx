"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  ThreeDCard,
  ThreeDCardBody,
  ThreeDCardItem,
} from "@/components/ui/3d-card";
import { Button } from "@/components/ui/button";
import { projects } from "@/lib/portfolio-data";
import { cn } from "@/utils/utils";
import Image from "next/image";

export function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [showAll, setShowAll] = useState(false);

  const featured = projects.filter((p) => p.featured);
  const displayed = showAll ? projects : featured;

  return (
    <section
      id="projects"
      ref={ref}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          badge="Projects"
          title="Featured Work"
          subtitle="A selection of projects that showcase my skills and expertise."
        />

        {/* Toggle buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setShowAll(false)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer",
              !showAll
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <Star size={14} className="inline mr-1.5" />
            Featured
          </button>
          <button
            onClick={() => setShowAll(true)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer",
              showAll
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            All Projects
          </button>
        </motion.div>

        {/* Project grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayed.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
              >
                <ThreeDCard containerClassName="h-full">
                  <ThreeDCardBody className="h-full flex flex-col">
                    {/* Image */}
                    <ThreeDCardItem translateZ={30} className="mb-4">
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary/50">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {project.featured && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1">
                            <Star
                              size={10}
                              className="fill-current"
                            />
                            Featured
                          </div>
                        )}
                      </div>
                    </ThreeDCardItem>

                    {/* Info */}
                    <ThreeDCardItem
                      translateZ={20}
                      className="flex-1"
                    >
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/10"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 4 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">
                            +{project.tags.length - 4}
                          </span>
                        )}
                      </div>
                    </ThreeDCardItem>

                    {/* Actions — NO asChild, wrap <a> around <Button> */}
                    <ThreeDCardItem
                      translateZ={40}
                      className="mt-auto"
                    >
                      <div className="flex items-center gap-2 pt-4 border-t border-border">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                          >
                            <ExternalLink size={14} />
                            Live Demo
                          </Button>
                        </a>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Github size={14} />
                            Code
                          </Button>
                        </a>
                      </div>
                    </ThreeDCardItem>
                  </ThreeDCardBody>
                </ThreeDCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}