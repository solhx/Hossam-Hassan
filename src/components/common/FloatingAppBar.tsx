"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Home,
  User,
  Briefcase,
  FolderOpen,
  Mail,
  Zap,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { FloatingDock } from "@/components/ui/floating-dock";

const navItems = [
  { label: "Home", href: "#hero", icon: <Home size={16} /> },
  { label: "About", href: "#about", icon: <User size={16} /> },
  { label: "Skills", href: "#skills", icon: <Zap size={16} /> },
  { label: "Experience", href: "#experience", icon: <Briefcase size={16} /> },
  { label: "Projects", href: "#projects", icon: <FolderOpen size={16} /> },
  { label: "Contact", href: "#contact", icon: <Mail size={16} /> },
];

export function FloatingAppBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = navItems.map((item) => item.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <motion.header
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 rounded-2xl border px-2 py-2 transition-all duration-500",
          scrolled
            ? "bg-card/80 backdrop-blur-xl border-border shadow-lg shadow-primary/5"
            : "bg-transparent border-transparent"
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#hero");
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary/50 transition-colors mr-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            H
          </div>
          <span className="font-semibold text-sm text-foreground">Hossam</span>
        </a>

        {/* Nav Links */}
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => scrollTo(item.href)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer",
              activeSection === item.href.slice(1)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeSection === item.href.slice(1) && (
              <motion.div
                layoutId="activeSection"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground ml-1 cursor-pointer"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}

        {/* Resume Button */}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 ml-1 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          <Download size={14} />
          Resume
        </a>
      </motion.header>

      {/* Mobile Hamburger */}
      <motion.button
        className="fixed top-4 right-4 z-50 md:hidden p-3 rounded-xl glass border border-border cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        aria-label="Toggle mobile menu"
      >
        <AnimatePresence mode="wait">
          {mobileOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={20} className="text-foreground" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Menu size={20} className="text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden glass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.nav
              className="flex flex-col items-center justify-center h-full gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
            >
              {navItems.map((item, i) => (
                <motion.button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className={cn(
                    "flex items-center gap-3 text-2xl font-semibold transition-colors cursor-pointer",
                    activeSection === item.href.slice(1)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}

              {mounted && (
                <motion.button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="mt-4 p-3 rounded-xl bg-secondary/50 text-foreground cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Dock (bottom) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <FloatingDock
          items={navItems.map((item) => ({
            title: item.label,
            icon: item.icon,
            href: item.href,
          }))}
        />
      </div>
    </>
  );
}