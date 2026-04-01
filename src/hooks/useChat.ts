// src/hooks/useChat.ts
'use client';

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id:           string;
  role:         'user' | 'assistant';
  content:      string;
  timestamp:    Date;
  isStreaming?: boolean;
}

interface UseChatReturn {
  messages:      ChatMessage[];
  isLoading:     boolean;
  error:         string | null;
  sendMessage:   (content: string) => void;
  clearMessages: () => void;
  stop:          () => void;
  rateLimitInfo: string | null;
}

const WELCOME_CONTENT = `👋 Hey there! I'm Hossam's AI assistant. I know all about his skills, projects, and experience.

Ask me anything like:
- *"What technologies does Hossam work with?"*
- *"Tell me about his featured projects"*
- *"How can I hire him?"*

What would you like to know?`;

function createWelcomeMessage(id = 'welcome'): ChatMessage {
  return {
    id,
    role:      'assistant',
    content:   WELCOME_CONTENT,
    timestamp: new Date(),
  };
}

// ✅ FIXED: route.ts uses toTextStreamResponse which sends PLAIN TEXT.
// No prefix format — chunks are raw text, return directly.
// If you ever switch route.ts to toDataStreamResponse,
// swap this back to the prefixed parser.
function parseStreamChunk(chunk: string): string {
  return chunk;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createWelcomeMessage(),
  ]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);

  const abortRef       = useRef<AbortController | null>(null);
  const accumulatedRef = useRef<string>('');
  const messagesRef    = useRef<ChatMessage[]>([createWelcomeMessage()]);
  const isLoadingRef   = useRef(false);

  const setMessagesSync = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setMessages((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : updater;
        messagesRef.current = next;
        return next;
      });
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current     = null;
    isLoadingRef.current = false;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoadingRef.current) return;

      setError(null);
      setRateLimitInfo(null);
      accumulatedRef.current = '';

      const userMsg: ChatMessage = {
        id:        `user-${Date.now()}`,
        role:      'user',
        content:   content.trim(),
        timestamp: new Date(),
      };

      const assistantId = `assistant-${Date.now()}`;

      setMessagesSync((prev) => [
        ...prev,
        userMsg,
        {
          id:          assistantId,
          role:        'assistant',
          content:     '',
          timestamp:   new Date(),
          isStreaming: true,
        },
      ]);

      isLoadingRef.current = true;
      setIsLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const apiMessages = messagesRef.current
          .filter(
            (m) =>
              m.id !== 'welcome' &&
              m.id !== assistantId &&
              m.content.trim().length > 0,
          )
          .map((m) => ({ role: m.role, content: m.content }));

        // Add the new user message at the end
        apiMessages.push({ role: 'user', content: userMsg.content });

        const res = await fetch('/api/chat', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ messages: apiMessages }),
          signal:  abortRef.current.signal,
        });

        if (!res.ok) {
          let errorMsg = 'Something went wrong.';
          try {
            const data = await res.json();
            errorMsg = data.error ?? errorMsg;
            if (res.status === 429 && data.resetIn) {
              setRateLimitInfo(
                `Rate limited. Try again in ${data.resetIn}s.`,
              );
            }
          } catch {
            /* not JSON */
          }
          setMessagesSync((prev) =>
            prev.filter((m) => m.id !== assistantId),
          );
          setError(errorMsg);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // ✅ FIXED: toTextStreamResponse = plain text, no parsing needed
          const textContent = parseStreamChunk(
            decoder.decode(value, { stream: true }),
          );

          if (textContent) {
            accumulatedRef.current += textContent;
            const snapshot = accumulatedRef.current;
            setMessagesSync((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: snapshot, isStreaming: true }
                  : m,
              ),
            );
          }
        }

        const finalContent = accumulatedRef.current;
        setMessagesSync((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: finalContent, isStreaming: false }
              : m,
          ),
        );
      } catch (err) {
        const e = err as Error;

        if (e.name === 'AbortError') {
          const partialContent = accumulatedRef.current;
          setMessagesSync((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: partialContent, isStreaming: false }
                : m,
            ),
          );
        } else {
          setMessagesSync((prev) => {
            const msg = prev.find((m) => m.id === assistantId);
            if (msg && msg.content === '') {
              return prev.filter((m) => m.id !== assistantId);
            }
            return prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m,
            );
          });

          const isNetworkError =
            e.message.includes('Failed to fetch') ||
            e.message.includes('NetworkError');
          setError(
            isNetworkError
              ? 'Network error. Please check your connection.'
              : 'Something went wrong. Please try again.',
          );
        }
      } finally {
        isLoadingRef.current   = false;
        setIsLoading(false);
        accumulatedRef.current = '';
      }
    },
    [setMessagesSync],
  );

  const clearMessages = useCallback(() => {
    stop();
    setError(null);
    setRateLimitInfo(null);
    setMessagesSync([
      {
        id:        `welcome-${Date.now()}`,
        role:      'assistant',
        content:   '🔄 Chat cleared! Ask me anything about Hossam.',
        timestamp: new Date(),
      },
    ]);
  }, [stop, setMessagesSync]);

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