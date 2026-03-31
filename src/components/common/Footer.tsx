'use client';

import { motion } from 'framer-motion';
// ✅ Heart added to the import
import { Github, Linkedin, Mail, ArrowUp, Heart } from 'lucide-react';
import { IconBrandWhatsapp} from '@tabler/icons-react';
import { siteConfig, socialLinks } from '@/lib/portfolio-data';

const iconMap: Record<string, React.ReactNode> = {
  github:    <Github        size={18} />,
  linkedin:  <Linkedin      size={18} />,
  mail:      <Mail          size={18} />,
  whatsapp:  <IconBrandWhatsapp size={18} />,
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
              H
            </div>
            <div>
              <p className="font-bold dark:text-neutral-100 text-foreground">{siteConfig.name}</p>
              <p className="text-sm text-neutral-500">{siteConfig.title}</p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label={link.name}
              >
                {iconMap[link.icon] ?? <Mail size={18} />}
              </motion.a>
            ))}
          </div>

          {/* Back to top */}
          <motion.button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-foreground hover:bg-emerald-500/10 transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={16} />
            Back to top
          </motion.button>
        </div>

        {/* Bottom row */}
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500 flex items-center gap-1">
            © {new Date().getFullYear()} {siteConfig.name}. Built with
            {/* ✅ Heart now resolves — was crashing the whole component */}
            <Heart size={12} className="text-emerald-500 fill-emerald-500 mx-0.5" />
            and lots of coffee.
          </p>
          <p className="text-xs text-neutral-400">
            Next.js • React • TypeScript • Tailwind CSS
          </p>
        </div>

      </div>
    </footer>
  );
}