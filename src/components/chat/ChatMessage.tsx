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
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5',
          isUser
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300'
        )}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      <div className="relative max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-foreground rounded-tl-sm border border-neutral-200 dark:border-neutral-700'
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

        <div
          className={cn(
            'flex items-center gap-2 mt-1 px-1',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span className="text-[10px] text-neutral-400/50">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && message.content.length > 10 && (
            <button
              onClick={copyToClipboard}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
              aria-label="Copy message"
            >
              {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}