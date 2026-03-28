"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after 5 seconds if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 5000);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
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

      {/* Tooltip bubble */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="relative bg-card border border-border rounded-2xl rounded-br-sm px-4 py-3 shadow-lg max-w-[220px]"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={10} />
            </button>
            <p className="text-xs text-foreground font-medium">
              👋 Have questions about Hossam?
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Chat with his AI assistant!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={handleOpen}
        className="group relative p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 2 }}
        aria-label={isOpen ? "Close chat" : "Open AI chat"}
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
            <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-[pulse-ring_2s_ease-in-out_infinite]" />
          </div>
        )}

        {/* Online dot */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-card"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Minimized indicator */}
        {isMinimized && (
          <motion.div
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground border-2 border-card"
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