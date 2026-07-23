interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Simple in-process TTL cache for external API responses. */
export class MemoryCache<T> {
  private entry: CacheEntry<T> | null = null;

  constructor(private readonly ttlMs: number) {}

  get(): T | null {
    if (!this.entry) return null;
    if (Date.now() > this.entry.expiresAt) {
      this.entry = null;
      return null;
    }
    return this.entry.value;
  }

  set(value: T): T {
    this.entry = { value, expiresAt: Date.now() + this.ttlMs };
    return value;
  }

  clear() {
    this.entry = null;
  }
}
