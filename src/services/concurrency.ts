/**
 * Runs `mapper` over `items` with at most `limit` requests in flight at
 * once. Used to avoid firing dozens of parallel OpenF1 requests (which
 * triggers HTTP 429) when aggregating data across many race sessions.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const current = cursor++
      results[current] = await mapper(items[current], current)
    }
  }

  const workerCount = Math.min(limit, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}
