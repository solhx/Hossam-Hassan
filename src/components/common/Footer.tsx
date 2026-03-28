"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Heart, ArrowUp } from "lucide-react";
import { siteConfig, socialLinks } from "@/lib/portfolio-data";

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  linkedin: <Linkedin size={18} />,
  twitter: <Twitter size={18} />,
  mail: <Mail size={18} />,
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left — Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
              H
            </div>
            <div>
              <p className="font-bold text-foreground">{siteConfig.name}</p>
              <p className="text-sm text-muted-foreground">{siteConfig.title}</p>
            </div>
          </div>

          {/* Center — Social */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={link.name}
              >
                {iconMap[link.icon] || <Mail size={18} />}
              </motion.a>
            ))}
          </div>

          {/* Right — Back to Top */}
          <motion.button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={16} />
            Back to top
          </motion.button>
        </div>

        {/* Bottom line */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {new Date().getFullYear()} {siteConfig.name}. Built with
            <Heart size={12} className="text-primary fill-primary" />
            and lots of coffee.
          </p>
          <p className="text-xs text-muted-foreground/50">
            Next.js • React • TypeScript • Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}