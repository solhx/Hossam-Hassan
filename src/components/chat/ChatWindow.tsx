"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  X,
  Minus,
  StopCircle,
  AlertTriangle,
  Zap,
  Sparkles,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "@/utils/utils";

interface ChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

const QUICK_PROMPTS = [
  { label: "🛠 Skills", prompt: "What technologies does Hossam work with?" },
  { label: "📂 Projects", prompt: "Tell me about Hossam's featured projects" },
  { label: "💼 Hire", prompt: "How can I hire Hossam?" },
  { label: "🎓 Experience", prompt: "What's Hossam's work experience?" },
];

export function ChatWindow({ onClose, onMinimize }: ChatWindowProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stop,
    rateLimitInfo,
  } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

      if (isNearBottom || isLoading) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Show quick prompts only after welcome message
  const showQuickPrompts = messages.length <= 1;

  return (
    <motion.div
      className="w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-card" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block leading-tight">
              Hossam&apos;s AI Assistant
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Zap size={8} className="text-primary" />
              Powered by GPT-4o
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear chat"
            title="Clear conversation"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator (only when loading and no streaming content yet) */}
        <AnimatePresence>
          {isLoading &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <TypingIndicator />
            )}
        </AnimatePresence>

        {/* Quick prompts */}
        <AnimatePresence>
          {showQuickPrompts && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex flex-wrap gap-1.5 pt-2"
            >
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer"
                >
                  {qp.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {(error || rateLimitInfo) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-xs text-destructive">
              <AlertTriangle size={12} className="flex-shrink-0" />
              <span className="flex-1">{rateLimitInfo || error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 border-t border-border bg-card"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? "AI is responding..."
              : "Ask about skills, projects, experience..."
          }
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          disabled={isLoading && !input}
          maxLength={500}
        />

        {/* Character count */}
        {input.length > 400 && (
          <span
            className={cn(
              "text-[10px] tabular-nums",
              input.length > 480 ? "text-destructive" : "text-muted-foreground/40"
            )}
          >
            {input.length}/500
          </span>
        )}

        {/* Stop / Send button */}
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <StopCircle size={14} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        )}
      </form>
    </motion.div>
  );
}