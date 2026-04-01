// src/lib/rate-limiter.ts
/**
 * In-memory rate limiter with sliding window.
 * Production note: Replace with Upstash Redis for multi-instance deployments.
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

interface RateLimitEntry {
  requests: number[]; // timestamps of requests in current window
}

const store = new Map<string, RateLimitEntry>();

function cleanup(windowMs: number) {
  // Only run cleanup ~1% of the time to avoid overhead on every request
  if (Math.random() > 0.01) return;

  const cutoff = Date.now() - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.requests = entry.requests.filter((t) => t > cutoff);
    if (entry.requests.length === 0) store.delete(key);
  }

  // Safety valve: if store grows too large, evict oldest entries
  if (store.size > 5000) {
    const keys = [...store.keys()];
    keys.slice(0, 1000).forEach((k) => store.delete(k));
  }
}

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetIn:   number; // ms until a slot opens up
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now         = Date.now();
  const windowStart = now - windowMs;

  cleanup(windowMs);

  let entry = store.get(identifier);
  if (!entry) {
    entry = { requests: [] };
    store.set(identifier, entry);
  }

  // Sliding window: remove requests outside the current window
  entry.requests = entry.requests.filter((t) => t > windowStart);

  if (entry.requests.length >= maxRequests) {
    // ✅ Safe indexed access — no Math.min(...array) spread on potentially empty array
    // requests is sorted ascending (push order), so index 0 is the oldest
    const oldestRequest = entry.requests[0] ?? now;
    return {
      allowed:   false,
      remaining: 0,
      resetIn:   oldestRequest + windowMs - now,
    };
  }

  entry.requests.push(now);

  const remaining     = maxRequests - entry.requests.length;
  // ✅ Safe indexed access — array always has at least 1 entry after push
  const oldestRequest = entry.requests[0] ?? now;

  return {
    allowed: true,
    remaining,
    resetIn: oldestRequest + windowMs - now,
  };
}