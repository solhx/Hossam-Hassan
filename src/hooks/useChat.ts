"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
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

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Hey there! I'm Hossam's AI assistant — powered by GPT-4o. I know all about his skills, projects, and experience.\n\nAsk me anything like:\n- *\"What technologies does Hossam work with?\"*\n- *\"Tell me about his featured projects\"*\n- *\"How can I hire him?\"*\n\nWhat would you like to know?",
  timestamp: new Date(),
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    streamingIdRef.current = null;
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Clear previous errors
      setError(null);
      setRateLimitInfo(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantId = `assistant-${Date.now()}`;
      streamingIdRef.current = assistantId;

      // Add user message + empty assistant placeholder
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      setIsLoading(true);

      // Abort any previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        // Build messages payload (only role + content for the API)
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortControllerRef.current.signal,
        });

        // Handle non-OK responses
        if (!response.ok) {
          let errorMsg = "Something went wrong. Please try again.";

          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;

            if (response.status === 429 && errorData.resetIn) {
              setRateLimitInfo(
                `Rate limited. Try again in ${errorData.resetIn}s.`
              );
            }
          } catch {
            // Response wasn't JSON
          }

          // Remove the empty assistant placeholder
          setMessages((prev) =>
            prev.filter((m) => m.id !== assistantId)
          );
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        // Read streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the assistant message with accumulated text
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, isStreaming: true }
                : m
            )
          );
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulated, isStreaming: false }
              : m
          )
        );
      } catch (err) {
        const error = err as Error;

        if (error.name === "AbortError") {
          // User stopped generation — keep what we have so far
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
        } else {
          console.error("[Chat Error]", error);

          // Remove empty assistant message on error
          setMessages((prev) => {
            const assistantMsg = prev.find((m) => m.id === assistantId);
            if (assistantMsg && assistantMsg.content === "") {
              return prev.filter((m) => m.id !== assistantId);
            }
            // If there's partial content, keep it
            return prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            );
          });

          if (error.message.includes("Failed to fetch")) {
            setError("Network error. Please check your connection.");
          } else {
            setError("Something went wrong. Please try again.");
          }
        }
      } finally {
        setIsLoading(false);
        streamingIdRef.current = null;
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
        role: "assistant",
        content:
          "🔄 Chat cleared! I'm ready for new questions about Hossam's skills, projects, or experience. What would you like to know?",
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