/**
 * Fixed-window rate limiter kept in process memory. This is intentionally
 * simple: it is enough to blunt a naive password-guessing script against a
 * single-instance deployment (which is what this app targets today).
 *
 * It does NOT work correctly across multiple server instances - each
 * instance would keep its own counters. If/when this app is deployed
 * behind more than one Vercel instance concurrently (rare for a single-gym
 * app, but possible under load), swap this for a shared store such as
 * Upstash Redis (`@upstash/ratelimit`) without changing the call sites
 * below, since they only depend on the exported `checkRateLimit` signature.
 */

interface WindowState {
  count: number;
  windowStartedAt: number;
}

const buckets = new Map<string, WindowState>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  { maxAttempts, windowSeconds }: { maxAttempts: number; windowSeconds: number },
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartedAt > windowMs) {
    buckets.set(key, { count: 1, windowStartedAt: now });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil(
      (existing.windowStartedAt + windowMs - now) / 1000,
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    retryAfterSeconds: 0,
  };
}
