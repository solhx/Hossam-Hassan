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

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "👋 Hey there! I'm Hossam's AI assistant — powered by GPT-4o. I know all about his skills, projects, and experience.\n\nAsk me anything like:\n- *\"What technologies does Hossam work with?\"*\n- *\"Tell me about his featured projects\"*\n- *\"How can I hire him?\"*\n\nWhat would you like to know?",
  timestamp: new Date(),
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true },
      ]);

      setIsLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const apiMessages = [...messages, userMsg].map((m) => ({
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
            errorMsg = data.error || errorMsg;
            if (res.status === 429 && data.resetIn) {
              setRateLimitInfo(`Rate limited. Try again in ${data.resetIn}s.`);
            }
          } catch { /* not json */ }
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated, isStreaming: true } : m
            )
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated, isStreaming: false } : m
          )
        );
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
          );
        } else {
          setMessages((prev) => {
            const msg = prev.find((m) => m.id === assistantId);
            if (msg && msg.content === '') return prev.filter((m) => m.id !== assistantId);
            return prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m));
          });
          setError(e.message.includes('Failed to fetch') ? 'Network error.' : 'Something went wrong.');
        }
      } finally {
        setIsLoading(false);
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

  return { messages, isLoading, error, sendMessage, clearMessages, stop, rateLimitInfo };
}