// src/components/chat/ChatWindow.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Trash2,
  X,
  Minus,
  StopCircle,
  AlertTriangle,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useChat }         from '@/hooks/useChat';
import { ChatMessage }     from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { cn }              from '@/utils/utils';

const QUICK_PROMPTS = [
  { label: '🛠 Skills',     prompt: 'What technologies does Hossam work with?' },
  { label: '📂 Projects',   prompt: "Tell me about Hossam's featured projects"  },
  { label: '💼 Hire',       prompt: 'How can I hire Hossam?'                    },
  { label: '🎓 Experience', prompt: "What's Hossam's work experience?"          },
];

interface ChatWindowProps {
  onClose:    () => void;
  onMinimize: () => void;
}

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

  const [input, setInput] = useState('');
  const scrollRef         = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  // ── Auto-scroll to bottom when new messages arrive ───────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight - scrollTop - clientHeight < 150 || isLoading) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // ── Prevent scroll leaking to the page underneath ────────────
  const preventScrollLeak = useCallback((e: WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop    = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('wheel',     preventScrollLeak,                  { passive: false });
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
      role="dialog"
      aria-modal="true"
      aria-label="Chat with Hossam's AI assistant"
      className={cn(
        'w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)]',
        'rounded-2xl overflow-hidden flex flex-col',
        'bg-white dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-700',
        'shadow-2xl shadow-black/10 dark:shadow-black/40',
      )}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{    opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center">
              <Sparkles
                size={16}
                className="text-emerald-500"
                aria-hidden="true"
              />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-neutral-800"
              aria-hidden="true"
            />
          </div>
          <div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 block leading-tight">
              Hossam&apos;s AI
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Zap size={8} className="text-emerald-500" aria-hidden="true" />
              Powered by GPT-4o
            </span>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={clearMessages}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'text-neutral-400 dark:text-neutral-500',
              'hover:text-neutral-700 dark:hover:text-neutral-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            )}
            aria-label="Clear chat history"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={onMinimize}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'text-neutral-400 dark:text-neutral-500',
              'hover:text-neutral-700 dark:hover:text-neutral-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            )}
            aria-label="Minimize chat"
          >
            <Minus size={14} />
          </button>

          <button
            onClick={onClose}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              'hover:bg-red-100 dark:hover:bg-red-500/15',
              'text-neutral-400 dark:text-neutral-500',
              'hover:text-red-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
            )}
            aria-label="Close chat"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────
       * flex-1          → takes all available height
       * overflow-y-auto → enables scrolling inside this div
       * overscroll-contain → CSS containment (Chrome/Firefox/Edge)
       * wheel/touchmove listeners above handle Safari edge cases
       */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto p-4 space-y-1',
          'bg-white dark:bg-neutral-900',
          'overscroll-contain',
        )}
        style={{ overscrollBehavior: 'contain' }}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        <AnimatePresence>
          {isLoading &&
            messages[messages.length - 1]?.role !== 'assistant' && (
              <TypingIndicator />
            )}
        </AnimatePresence>

        {/* Quick prompt chips — shown only before first user message */}
        <AnimatePresence>
          {showQuickPrompts && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-1.5 pt-2"
              aria-label="Quick question suggestions"
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
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  )}
                >
                  {qp.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Error / Rate limit banner ── */}
      <AnimatePresence>
        {(error || rateLimitInfo) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div
              id="chat-error"
              role="alert"
              aria-live="assertive"
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400"
            >
              <AlertTriangle
                size={12}
                className="flex-shrink-0"
                aria-hidden="true"
              />
              <span className="flex-1">{rateLimitInfo ?? error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input form ── */}
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
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          // ✅ autoFocus — user explicitly opened the chat window
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          placeholder={
            isLoading ? 'AI is responding...' : 'Ask about skills, projects...'
          }
          aria-label="Message Hossam's AI assistant"
          aria-describedby={error ? 'chat-error' : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={2000}
          className={cn(
            'flex-1 bg-transparent text-sm outline-none',
            'text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
          )}
        />

        {/* Character counter — shown when approaching limit */}
        {input.length > 1600 && (
          <span
            className={cn(
              'text-[10px] tabular-nums flex-shrink-0',
              input.length > 1900
                ? 'text-red-500'
                : 'text-neutral-400 dark:text-neutral-500',
            )}
            aria-live="polite"
          >
            {input.length}/2000
          </span>
        )}

        {/* Stop / Send button */}
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className={cn(
              'p-2 rounded-xl transition-colors cursor-pointer',
              'bg-red-100 dark:bg-red-500/15',
              'text-red-500',
              'hover:bg-red-200 dark:hover:bg-red-500/25',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
            )}
            aria-label="Stop AI response"
          >
            <StopCircle size={14} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              'p-2 rounded-xl transition-all cursor-pointer',
              'bg-emerald-500 text-white',
              'hover:bg-emerald-600',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
            )}
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        )}
      </form>
    </motion.div>
  );
}