import { streamText } from "ai";
import { NextRequest } from "next/server";
import { buildSystemPrompt, RATE_LIMIT } from "@/lib/chat-config";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "anonymous";

    const rl = checkRateLimit(
      `chat:${ip}`,
      RATE_LIMIT.maxRequests,
      RATE_LIMIT.windowMs,
    );

    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please wait a moment.",
          resetIn: Math.ceil(rl.resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rl.resetIn / 1000)),
          },
        },
      );
    }

    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400 },
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "AI chat is not configured. Please contact Hossam directly.",
        }),
        { status: 503 },
      );
    }

    const modelName =
      process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    const result = streamText({
      model: openrouter(modelName),
      system: buildSystemPrompt(),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return result.toTextStreamResponse({
      headers: { "X-RateLimit-Remaining": String(rl.remaining) },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);

    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500 },
    );
  }
}