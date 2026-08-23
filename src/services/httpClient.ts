import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const MAX_RETRIES = 6
const BASE_RETRY_DELAY_MS = 1000
// OpenF1's free tier enforces a per-IP rate limit. Spacing every outgoing
// request by at least this many ms -- regardless of which store/composable
// triggered it -- is what actually keeps us under that limit; retrying
// after a 429 alone isn't enough once several parts of the app fire
// requests in the same tick (e.g. season-wins aggregation).
const MIN_REQUEST_INTERVAL_MS = 250

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

/**
 * Serializes request dispatch with a minimum spacing between any two
 * outgoing requests, app-wide. Implemented as a promise chain so callers
 * queue up in order instead of racing a shared timestamp.
 */
class RequestScheduler {
  private tail: Promise<void> = Promise.resolve()
  private lastDispatchAt = 0

  schedule(): Promise<void> {
    const next = this.tail.then(async () => {
      const waitMs = Math.max(0, this.lastDispatchAt + MIN_REQUEST_INTERVAL_MS - Date.now())
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }
      this.lastDispatchAt = Date.now()
    })
    this.tail = next
    return next
  }
}

/**
 * Singleton wrapper around a single Axios instance.
 * The whole app must share one HTTP client so retry/backoff behaviour,
 * request pacing, and base configuration stay consistent everywhere
 * (Singleton pattern).
 */
class HttpClient {
  private static instance: HttpClient
  readonly client: AxiosInstance
  private readonly scheduler = new RequestScheduler()

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.openf1.org/v1',
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(async (config) => {
      await this.scheduler.schedule()
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryConfig | undefined
        if (!config) return Promise.reject(error)

        config._retryCount = config._retryCount ?? 0

        const status = error.response?.status
        const isNonRetryableStatus = status === 404 || status === 401
        const canRetry = !isNonRetryableStatus && config._retryCount < MAX_RETRIES

        if (canRetry) {
          config._retryCount += 1

          // Respect the server's Retry-After if it sent one (standard for 429
          // responses); otherwise fall back to exponential backoff.
          const retryAfterHeader = error.response?.headers?.['retry-after']
          const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null
          const backoffMs =
            retryAfterMs && !Number.isNaN(retryAfterMs)
              ? retryAfterMs
              : BASE_RETRY_DELAY_MS * 2 ** (config._retryCount - 1)

          await new Promise((resolve) => setTimeout(resolve, backoffMs))
          return this.client(config)
        }

        return Promise.reject(error)
      },
    )
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient()
    }
    return HttpClient.instance
  }
}

export const httpClient = HttpClient.getInstance().client
