import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { buildSystemPrompt, RATE_LIMIT } from "@/lib/chat-config";
import { checkRateLimit } from "@/lib/rate-limiter";

export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting by IP ──
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
    const rateLimitResult = checkRateLimit(
      `chat:${ip}`,
      RATE_LIMIT.maxRequests,
      RATE_LIMIT.windowMs
    );

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please wait a moment before sending more messages.",
          resetIn: Math.ceil(rateLimitResult.resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000)),
          },
        }
      );
    }

    // ── Parse request ──
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please start a new conversation." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Check API key ──
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI chat is not configured. Please contact Hossam directly." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Stream response using Vercel AI SDK ──
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const result = streamText({
      model: openai(model),
      system: buildSystemPrompt(),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Return plain text stream that our custom hook reads with reader.read()
    return result.toTextStreamResponse({
      headers: {
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
      },
    });
  } catch (error) {
    console.error("[Chat API Error]", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("401") || errorMessage.includes("Incorrect API key")) {
      return new Response(
        JSON.stringify({ error: "AI service authentication failed. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    if (errorMessage.includes("429")) {
      return new Response(
        JSON.stringify({ error: "AI service is busy. Please try again in a moment." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    if (errorMessage.includes("quota") || errorMessage.includes("billing")) {
      return new Response(
        JSON.stringify({
          error: "AI service quota exceeded. Please contact Hossam directly at hello@hossamhassan.dev",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}