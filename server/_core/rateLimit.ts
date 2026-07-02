type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type MemoryRateLimiterOptions = {
  windowMs: number;
  cleanupIntervalMs?: number;
  maxEntries?: number;
};

export type MemoryRateLimiter = {
  allow: (key: string, maxAttempts: number, now?: number) => boolean;
  sweep: (now?: number) => void;
};

function removeExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  });
}

function capStoreSize(store: Map<string, RateLimitEntry>, maxEntries: number) {
  if (store.size <= maxEntries) return;

  const ordered = Array.from(store.entries()).sort((a, b) => a[1].resetAt - b[1].resetAt);
  const overflow = store.size - maxEntries;
  for (let i = 0; i < overflow; i += 1) {
    const victim = ordered[i];
    if (victim) {
      store.delete(victim[0]);
    }
  }
}

export function createMemoryRateLimiter(options: MemoryRateLimiterOptions): MemoryRateLimiter {
  const { windowMs, cleanupIntervalMs = Math.max(60_000, Math.floor(windowMs / 2)), maxEntries = 20_000 } = options;
  const store = new Map<string, RateLimitEntry>();

  const sweep = (now = Date.now()) => {
    removeExpiredEntries(store, now);
    capStoreSize(store, maxEntries);
  };

  const timer = setInterval(() => {
    sweep();
  }, cleanupIntervalMs);

  if (typeof (timer as NodeJS.Timeout).unref === "function") {
    (timer as NodeJS.Timeout).unref();
  }

  const allow = (key: string, maxAttempts: number, now = Date.now()) => {
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    entry.count += 1;
    store.set(key, entry);

    // Opportunistic sweep on hot paths to keep memory bounded.
    if (store.size > maxEntries) {
      sweep(now);
    }

    return entry.count <= maxAttempts;
  };

  return { allow, sweep };
}
