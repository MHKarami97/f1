export const CACHE_TTL = {
  /** Finished-session data (results, pit stops, weather, grid, drivers,
   *  standings snapshots) never changes once the race is in the books. */
  HISTORICAL: 30 * 24 * 60 * 60 * 1000,
  /** Floor/ceiling for the calendar's dynamic TTL (see sessionsStore). */
  CALENDAR_MIN: 60 * 60 * 1000,
  CALENDAR_MAX: 7 * 24 * 60 * 60 * 1000,
  /** Sentinel meaning "always hit the network" — used for in-progress
   *  session polling where staleness would show wrong live data. */
  LIVE: 0,
} as const

interface CacheRecord<T> {
  data: T
  expiresAt: number
}

const STORAGE_PREFIX = 'f1-cache:v1:'
const pending = new Map<string, Promise<unknown>>()

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const record = JSON.parse(raw) as CacheRecord<T>
    if (record.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return null
    }
    return record.data
  } catch {
    // Corrupt entry or storage unavailable (private browsing) — treat as miss.
    return null
  }
}

export function writeCache<T>(key: string, data: T, ttlMs: number): void {
  try {
    const record: CacheRecord<T> = { data, expiresAt: Date.now() + ttlMs }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record))
  } catch {
    // Storage full/unavailable — degrade to in-memory-only for this
    // session instead of crashing the fetch.
  }
}

/**
 * Persistent, TTL-based cache backed by localStorage so responses survive
 * page reloads/new tabs (unlike the previous in-memory-only Map). Failed
 * fetches are NEVER written here, so the next call after an error always
 * retries against the network instead of getting stuck with bad data.
 */
export async function withCache<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<T> {
  if (ttlMs <= 0) return fetcher()

  const cached = readCache<T>(key)
  if (cached !== null) return cached

  const inFlight = pending.get(key) as Promise<T> | undefined
  if (inFlight) return inFlight

  const promise = fetcher()
    .then((data) => {
      writeCache(key, data, ttlMs)
      return data
    })
    .finally(() => {
      pending.delete(key)
    })

  pending.set(key, promise)
  return promise
}

/** Wipes every cached OpenF1 response — handy for a manual "hard refresh". */
export function clearCache(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key))
}