'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, X, Minus, StopCircle, AlertTriangle, Zap, Sparkles } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/utils/utils';

const QUICK_PROMPTS = [
  { label: '🛠 Skills', prompt: 'What technologies does Hossam work with?' },
  { label: '📂 Projects', prompt: "Tell me about Hossam's featured projects" },
  { label: '💼 Hire', prompt: 'How can I hire Hossam?' },
  { label: '🎓 Experience', prompt: "What's Hossam's work experience?" },
];

interface ChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
}

export function ChatWindow({ onClose, onMinimize }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage, clearMessages, stop, rateLimitInfo } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
      if (scrollHeight - scrollTop - clientHeight < 150 || isLoading) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) { sendMessage(input.trim()); setInput(''); }
  };

  const showQuickPrompts = messages.length <= 1;

  return (
    <motion.div
      className="w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-background shadow-2xl shadow-black/5 dark:shadow-black/20 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-500" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block leading-tight">Hossam&apos;s AI</span>
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              <Zap size={8} className="text-emerald-500" />Powered by GPT-4o
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={clearMessages} className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-foreground transition-colors cursor-pointer" aria-label="Clear"><Trash2 size={14} /></button>
          <button onClick={onMinimize} className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-foreground transition-colors cursor-pointer" aria-label="Minimize"><Minus size={14} /></button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer" aria-label="Close"><X size={14} /></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
        </AnimatePresence>
        <AnimatePresence>
          {showQuickPrompts && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-1.5 pt-2">
              {QUICK_PROMPTS.map((qp) => (
                <button key={qp.label} onClick={() => sendMessage(qp.prompt)} className="px-3 py-1.5 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer">{qp.label}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {(error || rateLimitInfo) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border-t border-red-200 dark:border-red-500/20 text-xs text-red-500">
              <AlertTriangle size={12} className="flex-shrink-0" />
              <span className="flex-1">{rateLimitInfo || error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800 bg-background">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
          placeholder={isLoading ? 'AI is responding...' : 'Ask about skills, projects...'}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-neutral-400 outline-none"
          disabled={isLoading && !input}
          maxLength={500}
        />
        {input.length > 400 && (
          <span className={cn('text-[10px] tabular-nums', input.length > 480 ? 'text-red-500' : 'text-neutral-400')}>{input.length}/500</span>
        )}
        {isLoading ? (
          <button type="button" onClick={stop} className="p-2 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-500 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors cursor-pointer" aria-label="Stop"><StopCircle size={14} /></button>
        ) : (
          <button type="submit" disabled={!input.trim()} className="p-2 rounded-xl bg-emerald-500 text-white disabled:opacity-30 hover:bg-emerald-600 transition-all cursor-pointer disabled:cursor-not-allowed" aria-label="Send"><Send size={14} /></button>
        )}
      </form>
    </motion.div>
  );
}