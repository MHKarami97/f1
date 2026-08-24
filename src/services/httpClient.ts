import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const MAX_RETRIES = 6
const BASE_RETRY_DELAY_MS = 1_000
const MAX_RETRY_DELAY_MS = 60_000
const MIN_REQUEST_INTERVAL_MS = 1_000

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

class RequestScheduler {
  private tail: Promise<void> = Promise.resolve()
  private lastDispatchAt = 0

  schedule(): Promise<void> {
    const next = this.tail.then(async () => {
      const waitMs = Math.max(
        0,
        this.lastDispatchAt + MIN_REQUEST_INTERVAL_MS - Date.now(),
      )

      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }

      this.lastDispatchAt = Date.now()
    })

    this.tail = next.catch(() => undefined)
    return next
  }
}

class HttpClient {
  private static instance: HttpClient
  readonly client: AxiosInstance
  private readonly scheduler = new RequestScheduler()

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.openf1.org/v1',
      timeout: 20_000,
      headers: {
        Accept: 'application/json',
      },
    })

    this.client.interceptors.request.use(async (config) => {
      await this.scheduler.schedule()
      return config
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryConfig | undefined

        if (!config) {
          return Promise.reject(error)
        }

        config._retryCount = config._retryCount ?? 0

        const status = error.response?.status
        const isRateLimited = status === 429
        const isServerError = status !== undefined && status >= 500
        const isRetryable = isRateLimited || isServerError

        if (!isRetryable || config._retryCount >= MAX_RETRIES) {
          // Do not use console.error here. The caller can handle the error
          // without polluting the browser console.
          return Promise.reject(error)
        }

        config._retryCount += 1

        const retryAfter = getRetryAfterMs(error)
        const exponentialDelay = Math.min(
          BASE_RETRY_DELAY_MS * 2 ** (config._retryCount - 1),
          MAX_RETRY_DELAY_MS,
        )

        const jitter = Math.floor(Math.random() * 750)
        const delay = Math.max(retryAfter ?? exponentialDelay, 1_000) + jitter

        await sleep(delay)

        return this.client(config)
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryAfterMs(error: AxiosError): number | null {
  const value = error.response?.headers?.['retry-after']

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value * 1_000
  }

  if (typeof value !== 'string') {
    return null
  }

  const seconds = Number(value)

  if (Number.isFinite(seconds)) {
    return seconds * 1_000
  }

  const date = Date.parse(value)

  if (!Number.isNaN(date)) {
    return Math.max(0, date - Date.now())
  }

  return null
}

export const httpClient = HttpClient.getInstance().client