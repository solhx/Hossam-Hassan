'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (hasInteracted) return;
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 12000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [hasInteracted]);

  const handleOpen = () => {
    setHasInteracted(true);
    setShowTooltip(false);
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <ChatWindow
            onClose={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            onMinimize={() => setIsMinimized(true)}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="relative bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-2xl rounded-br-sm px-4 py-3 shadow-lg dark:shadow-black/30 max-w-[220px]"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer transition-colors"
            >
              <X size={10} />
            </button>
            <p className="text-xs text-neutral-900 dark:text-neutral-100 font-medium">
              👋 Have questions about Hossam?
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
              Chat with his AI assistant!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={handleOpen}
        className="group relative p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:bg-emerald-600 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 2 }}
        aria-label={isOpen ? 'Close chat' : 'Open AI chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && !hasInteracted && (
          <div className="absolute inset-0 rounded-2xl">
            <span className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-[pulse-ring_2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Online dot */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-white dark:border-neutral-900"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Minimized badge */}
        {isMinimized && (
          <motion.div
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] font-bold text-white border-2 border-white dark:border-neutral-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            1
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}