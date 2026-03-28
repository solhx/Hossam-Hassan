"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { Bot, User, Copy, Check } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import { useState, useCallback } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = message.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  return (
    <motion.div
      className={cn("flex gap-2.5 mb-4 group", isUser && "flex-row-reverse")}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5",
          isUser
            ? "bg-primary/20 text-primary"
            : "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
        )}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble */}
      <div className="relative max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-secondary/80 text-foreground rounded-tl-sm border border-border/50"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {/* Streaming cursor */}
          {message.isStreaming && (
            <motion.span
              className="inline-block w-1.5 h-4 bg-primary ml-0.5 rounded-full align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Bottom: timestamp + copy */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 px-1",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-muted-foreground/40">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Copy button (assistant messages only) */}
          {!isUser && message.content.length > 10 && (
            <button
              onClick={copyToClipboard}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-secondary/50 text-muted-foreground/40 hover:text-muted-foreground cursor-pointer"
              aria-label="Copy message"
            >
              {copied ? (
                <Check size={10} className="text-primary" />
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