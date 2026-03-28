import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { buildSystemPrompt, RATE_LIMIT } from '@/lib/chat-config';
import { checkRateLimit } from '@/lib/rate-limiter';

export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'anonymous';
    const rl = checkRateLimit(`chat:${ip}`, RATE_LIMIT.maxRequests, RATE_LIMIT.windowMs);

    if (!rl.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please wait a moment.',
          resetIn: Math.ceil(rl.resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rl.resetIn / 1000)),
          },
        }
      );
    }

    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Too many messages. Please start a new conversation.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI chat is not configured. Please contact Hossam directly.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const result = streamText({
      model: openai(model),
      system: buildSystemPrompt(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    return result.toTextStreamResponse({
      headers: { 'X-RateLimit-Remaining': String(rl.remaining) },
    });
  } catch (error) {
    console.error('[Chat API Error]', error);
    const msg = error instanceof Error ? error.message : '';

    if (msg.includes('401') || msg.includes('API key')) {
      return new Response(
        JSON.stringify({ error: 'AI authentication failed.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (msg.includes('429') || msg.includes('quota')) {
      return new Response(
        JSON.stringify({ error: 'AI service is busy. Try again shortly.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}