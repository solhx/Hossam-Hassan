// ✅ FIXED — src/hooks/useChat.ts
'use client';

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  stop: () => void;
  rateLimitInfo: string | null;
}

// ✅ Fixed: clean string without broken escape sequences
const WELCOME_CONTENT = `👋 Hey there! I'm Hossam's AI assistant. I know all about his skills, projects, and experience.

Ask me anything like:
- *"What technologies does Hossam work with?"*
- *"Tell me about his featured projects"*
- *"How can I hire him?"*

What would you like to know?`;

function createWelcomeMessage(id = 'welcome'): ChatMessage {
  return {
    id,
    role: 'assistant',
    content: WELCOME_CONTENT,
    timestamp: new Date(),
  };
}

// ── Vercel AI SDK data stream parser ─────────────────────────────────
// The SDK prefixes chunks: 0:"text content"\n
// We need to extract just the text.
function parseDataStreamChunk(chunk: string): string {
  let extracted = '';
  const lines = chunk.split('\n');

  for (const line of lines) {
    // Text part: 0:"..."
    if (line.startsWith('0:')) {
      try {
        const jsonStr = line.slice(2); // Remove "0:" prefix
        const parsed = JSON.parse(jsonStr);
        if (typeof parsed === 'string') {
          extracted += parsed;
        }
      } catch {
        // If not valid JSON, treat as raw text (fallback for toTextStreamResponse)
        extracted += line.slice(2);
      }
    }
    // Skip other prefixes: 2: (data), 8: (metadata), e: (finish), d: (done)
  }

  return extracted;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accumulatedRef = useRef<string>(''); // ✅ Ref for accumulated content avoids stale closure

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setRateLimitInfo(null);
      accumulatedRef.current = '';

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantId = `assistant-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      setIsLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        // ✅ Build API messages: exclude the welcome message and only send
        // role + content (no id, timestamp, isStreaming — not needed by API)
        const apiMessages = [...messages, userMsg]
          .filter((m) => m.id !== 'welcome' && m.content.trim().length > 0)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          let errorMsg = 'Something went wrong.';
          try {
            const data = await res.json();
            errorMsg = data.error ?? errorMsg;
            if (res.status === 429 && data.resetIn) {
              setRateLimitInfo(`Rate limited. Try again in ${data.resetIn}s.`);
            }
          } catch {
            /* not JSON */
          }
          // Remove empty assistant placeholder
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setError(errorMsg);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();

        // ✅ Stream reading loop with proper data stream parsing
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const rawChunk = decoder.decode(value, { stream: true });
          const textContent = parseDataStreamChunk(rawChunk);

          if (textContent) {
            accumulatedRef.current += textContent;
            const snapshot = accumulatedRef.current; // Capture for closure

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: snapshot, isStreaming: true }
                  : m
              )
            );
          }
        }

        // ✅ Mark streaming complete
        const finalContent = accumulatedRef.current;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: finalContent, isStreaming: false }
              : m
          )
        );
      } catch (err) {
        const e = err as Error;

        if (e.name === 'AbortError') {
          // User manually stopped — keep whatever was accumulated
          const partialContent = accumulatedRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: partialContent, isStreaming: false }
                : m
            )
          );
        } else {
          // Network or parse error — remove empty placeholder, keep non-empty
          setMessages((prev) => {
            const msg = prev.find((m) => m.id === assistantId);
            if (msg && msg.content === '') {
              return prev.filter((m) => m.id !== assistantId);
            }
            return prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            );
          });

          const isNetworkError =
            e.message.includes('Failed to fetch') ||
            e.message.includes('NetworkError');
          setError(
            isNetworkError
              ? 'Network error. Please check your connection.'
              : 'Something went wrong. Please try again.'
          );
        }
      } finally {
        setIsLoading(false);
        accumulatedRef.current = '';
      }
    },
    [messages, isLoading]
  );

  const clearMessages = useCallback(() => {
    stop();
    setError(null);
    setRateLimitInfo(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: '🔄 Chat cleared! Ask me anything about Hossam.',
        timestamp: new Date(),
      },
    ]);
  }, [stop]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    stop,
    rateLimitInfo,
  };
}