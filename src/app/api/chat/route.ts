// ✅ FIXED — src/app/api/chat/route.ts
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { buildSystemPrompt, RATE_LIMIT } from '@/lib/chat-config';
import { checkRateLimit } from '@/lib/rate-limiter';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const maxDuration = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Validation constants ──────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_IN_CONTEXT = 20;
const MAX_TOTAL_CHARS = 10000;

// ── Input validation ──────────────────────────────────────────────────
function validateMessages(
  messages: unknown,
): { valid: true; data: ChatMessage[] } | { valid: false; error: string } {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      valid: false,
      error: 'Messages array is required and must not be empty',
    };
  }

  if (messages.length > MAX_MESSAGES_IN_CONTEXT) {
    return {
      valid: false,
      error: `Too many messages. Maximum ${MAX_MESSAGES_IN_CONTEXT} allowed.`,
    };
  }

  let totalChars = 0;

  for (const msg of messages) {
    if (
      typeof msg !== 'object' ||
      msg === null ||
      !['user', 'assistant'].includes(msg.role) ||
      typeof msg.content !== 'string'
    ) {
      return { valid: false, error: 'Invalid message format' };
    }

    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return {
        valid: false,
        error: `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`,
      };
    }

    totalChars += msg.content.length;

    if (totalChars > MAX_TOTAL_CHARS) {
      return {
        valid: false,
        error: 'Conversation too long. Please clear the chat.',
      };
    }
  }

  return { valid: true, data: messages as ChatMessage[] };
}

// ── Content sanitization ──────────────────────────────────────────────
function sanitizeContent(content: string): string {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Check API key FIRST ────────────────────────────────────────
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Chat API] OPENROUTER_API_KEY is not configured');
      return Response.json(
        { error: 'AI chat is not configured. Please contact Hossam directly.' },
        { status: 503 },
      );
    }

    // ── 2. Rate limiting ──────────────────────────────────────────────
    const forwarded = req.headers.get('x-forwarded-for');
    const ip =
      forwarded?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'anonymous';

    const rl = checkRateLimit(
      `chat:${ip}`,
      RATE_LIMIT.maxRequests,
      RATE_LIMIT.windowMs,
    );

    if (!rl.allowed) {
      return Response.json(
        {
          error: 'Rate limit exceeded. Please wait a moment.',
          resetIn: Math.ceil(rl.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rl.resetIn / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    // ── 3. Parse body ─────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    if (typeof body !== 'object' || body === null) {
      return Response.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    // ── 4. Validate messages ──────────────────────────────────────────
    const validation = validateMessages(
      (body as Record<string, unknown>).messages,
    );
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // ── 5. Sanitize & filter ──────────────────────────────────────────
    const sanitizedMessages = validation.data
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content: sanitizeContent(m.content),
      }))
      .filter((m) => m.content.length > 0);

    if (sanitizedMessages.length === 0) {
      return Response.json(
        { error: 'No valid messages after sanitization' },
        { status: 400 },
      );
    }

    // ── 6. Create client inside handler (never at module scope) ───────
    const openrouter = createOpenRouter({ apiKey });
    const modelName = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini';

    const result = streamText({
      model: openrouter(modelName),
      system: buildSystemPrompt(),
      messages: sanitizedMessages,
      // ✅ ai@6.x uses maxOutputTokens (not maxTokens)
      maxOutputTokens: 800,
      temperature: 0.7,
    });

    // ✅ ai@6.x only has toTextStreamResponse
    return result.toTextStreamResponse({
      headers: {
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Limit': String(RATE_LIMIT.maxRequests),
      },
    });
  } catch (error) {
    console.error('[Chat API Error]', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}