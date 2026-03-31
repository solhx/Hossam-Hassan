'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, X, Minus, StopCircle, AlertTriangle, Zap, Sparkles } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/utils/utils';

const QUICK_PROMPTS = [
  { label: '🛠 Skills',      prompt: 'What technologies does Hossam work with?' },
  { label: '📂 Projects',    prompt: "Tell me about Hossam's featured projects" },
  { label: '💼 Hire',        prompt: 'How can I hire Hossam?' },
  { label: '🎓 Experience',  prompt: "What's Hossam's work experience?" },
];

interface ChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

export function ChatWindow({ onClose, onMinimize }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage, clearMessages, stop, rateLimitInfo } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Auto-scroll to bottom when new messages arrive ──────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight - scrollTop - clientHeight < 150 || isLoading) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // ── Focus input on open ─────────────────────────────────────
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // ── Prevent scroll leaking to the page ──────────────────────
  // When the user scrolls inside the messages area, wheel/touch
  // events must NOT bubble up to the <body> (which would scroll
  // the portfolio page underneath the chat window).
  //
  // Strategy:
  //   • overscroll-contain (CSS) — tells the browser to contain
  //     scroll within this element. Works in Chrome/Edge/Firefox.
  //   • wheel listener with stopPropagation — belt-and-suspenders
  //     for Safari which doesn't honour overscroll-contain fully.
  //   • preventDefault only at the boundary (top / bottom) so the
  //     chat itself still scrolls normally in all directions.
  const preventScrollLeak = useCallback((e: WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop    = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // If we're at the boundary and still trying to scroll past it,
    // prevent the event from reaching the page.
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }

    // Always stop the event from bubbling to parent scrollers.
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // passive: false is required so we can call preventDefault
    el.addEventListener('wheel',     preventScrollLeak, { passive: false });
    el.addEventListener('touchmove', preventScrollLeak as EventListener, { passive: false });

    return () => {
      el.removeEventListener('wheel',     preventScrollLeak);
      el.removeEventListener('touchmove', preventScrollLeak as EventListener);
    };
  }, [preventScrollLeak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const showQuickPrompts = messages.length <= 1;

  return (
    <motion.div
      className={cn(
        'w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)]',
        'rounded-2xl overflow-hidden flex flex-col',
        'bg-white dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-700',
        'shadow-2xl shadow-black/10 dark:shadow-black/40',
      )}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-500" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-neutral-800" />
          </div>
          <div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 block leading-tight">
              Hossam&apos;s AI
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Zap size={8} className="text-emerald-500" />
              Powered by GPT-4o
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            aria-label="Clear"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            aria-label="Minimize"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/15 text-neutral-400 dark:text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────
       *
       * Key classes:
       *   flex-1          → takes all available height
       *   overflow-y-auto → enables scrolling inside this div
       *   overscroll-contain → CSS containment (Chrome/Firefox/Edge)
       *
       * The wheel/touchmove listeners (attached above) handle
       * Safari and any remaining scroll-bubble cases.
       */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto p-4 space-y-1',
          'bg-white dark:bg-neutral-900',
          // CSS scroll containment — prevents scroll chaining to body
          'overscroll-contain',
        )}
        // Inline style for cross-browser overscroll support
        style={{ overscrollBehavior: 'contain' }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        <AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <TypingIndicator />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQuickPrompts && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-1.5 pt-2"
            >
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.prompt)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-xl cursor-pointer',
                    'bg-emerald-500/10 dark:bg-emerald-500/15',
                    'text-emerald-700 dark:text-emerald-300',
                    'border border-emerald-500/20 dark:border-emerald-500/25',
                    'hover:bg-emerald-500/20 dark:hover:bg-emerald-500/25',
                    'transition-all',
                  )}
                >
                  {qp.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {(error || rateLimitInfo) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle size={12} className="flex-shrink-0" />
              <span className="flex-1">{rateLimitInfo || error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex items-center gap-2 p-3 flex-shrink-0',
          'border-t border-neutral-200 dark:border-neutral-700',
          'bg-neutral-50 dark:bg-neutral-800/60',
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={isLoading ? 'AI is responding...' : 'Ask about skills, projects...'}
          className={cn(
            'flex-1 bg-transparent text-sm outline-none',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
          )}
        
          maxLength={2000}
        />
       {input.length > 1600 && ( // ✅ Was 400, update for new maxLength
  <span className={cn(
    'text-[10px] tabular-nums flex-shrink-0',
    input.length > 1900 ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500',
  )}>
    {input.length}/2000
  </span>
)}
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="p-2 rounded-xl bg-red-100 dark:bg-red-500/15 text-red-500 hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors cursor-pointer"
            aria-label="Stop"
          >
            <StopCircle size={14} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-emerald-500 text-white disabled:opacity-30 hover:bg-emerald-600 transition-all cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <Send size={14} />
          </button>
        )}
      </form>
    </motion.div>
  );
}