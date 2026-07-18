/** Lightweight typed localStorage helpers for local-first UX. */

export type LocalCacheEnvelope<T> = {
  version: number;
  updatedAt: string;
  data: T;
};

export function readLocalJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeLocalJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or private mode — ignore; app still works online-only.
    return false;
  }
}

export function removeLocalJson(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function readLocalCache<T>(key: string, version: number): T | null {
  const envelope = readLocalJson<LocalCacheEnvelope<T>>(key);
  if (!envelope || envelope.version !== version) return null;
  return envelope.data;
}

export function writeLocalCache<T>(key: string, version: number, data: T): boolean {
  return writeLocalJson(key, {
    version,
    updatedAt: new Date().toISOString(),
    data,
  } satisfies LocalCacheEnvelope<T>);
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}
