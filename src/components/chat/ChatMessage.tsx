'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';
import { Bot, User, Copy, Check } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { useState, useCallback } from 'react';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = message.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  return (
    <motion.div
      className={cn('flex gap-2.5 mb-4 group', isUser && 'flex-row-reverse')}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5',
          isUser
            ? 'bg-emerald-500/20 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400'
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300'
        )}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble */}
      <div className="relative max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-sm'
              : [
                  'rounded-tl-sm',
                  // Light mode: light gray bg, dark text
                  'bg-neutral-100 text-neutral-800',
                  // Dark mode: darker bg, light text, visible border
                  'dark:bg-neutral-800 dark:text-neutral-100',
                  'border border-neutral-200 dark:border-neutral-600',
                ].join(' ')
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {message.isStreaming && (
            <motion.span
              className="inline-block w-1.5 h-4 bg-emerald-500 ml-0.5 rounded-full align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Timestamp + Copy */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1 px-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          {/* Timestamp: was text-neutral-400/50 — invisible in dark mode */}
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && message.content.length > 10 && (
            <button
              onClick={copyToClipboard}
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer',
                'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                'text-neutral-400 dark:text-neutral-500',
                'hover:text-neutral-600 dark:hover:text-neutral-300'
              )}
              aria-label="Copy message"
            >
              {copied ? (
                <Check size={10} className="text-emerald-500" />
              ) : (
                <Copy size={10} />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}