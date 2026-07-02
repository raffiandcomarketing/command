/**
 * In-memory sliding-window rate limiter (assessment R8/TD16).
 *
 * Suitable for the current single-replica deployment; swap the store for
 * Redis when scaling horizontally. Keys are arbitrary strings such as
 * `login:<ip>:<email>` or `mutate:<userId>`.
 */
interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();
let lastSweep = Date.now();

function sweep(maxAgeMs: number) {
  // Periodically drop stale keys so the map cannot grow unbounded.
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  const keys = Array.from(store.keys());
  for (const key of keys) {
    const w = store.get(key);
    if (!w || w.timestamps.length === 0 || now - w.timestamps[w.timestamps.length - 1] > maxAgeMs) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  sweep(windowMs * 2);
  const now = Date.now();
  const w = store.get(key) ?? { timestamps: [] };
  w.timestamps = w.timestamps.filter((t) => now - t < windowMs);

  if (w.timestamps.length >= limit) {
    const oldest = w.timestamps[0];
    store.set(key, w);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  w.timestamps.push(now);
  store.set(key, w);
  return { allowed: true, remaining: limit - w.timestamps.length, retryAfterSeconds: 0 };
}

/** Clear a window (e.g. successful login resets failed-attempt counter). */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
