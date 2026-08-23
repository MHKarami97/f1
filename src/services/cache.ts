interface CacheEntry<T> {
  data: T
  expiresAt: number
}

// OpenF1's free tier rate-limits aggressively (HTTP 429). Historical data
// (drivers, meetings, sessions, standings) barely changes within a single
// browsing session, so we memoize responses in memory and also de-duplicate
// concurrent identical in-flight requests -- this is what actually stops the
// burst of 429s when several composables mount at once and all ask for the
// same session/meeting data.
const DEFAULT_TTL_MS = 5 * 60_000

const store = new Map<string, CacheEntry<unknown>>()
const pending = new Map<string, Promise<unknown>>()

export async function withCache<T>(key: string, fetcher: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const cached = store.get(key) as CacheEntry<T> | undefined
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const inFlight = pending.get(key) as Promise<T> | undefined
  if (inFlight) return inFlight

  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expiresAt: Date.now() + ttlMs })
      return data
    })
    .finally(() => {
      pending.delete(key)
    })

  pending.set(key, promise)
  return promise
}
