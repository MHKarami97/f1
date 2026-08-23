import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

/**
 * Singleton wrapper around a single Axios instance.
 * The whole app must share one HTTP client so retry/backoff behaviour
 * and base configuration stay consistent everywhere (Singleton pattern).
 */
class HttpClient {
  private static instance: HttpClient
  readonly client: AxiosInstance

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.openf1.org/v1',
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryConfig | undefined
        if (!config) return Promise.reject(error)

        config._retryCount = config._retryCount ?? 0

        const isNonRetryableStatus = error.response?.status === 404 || error.response?.status === 401
        const canRetry = !isNonRetryableStatus && config._retryCount < MAX_RETRIES

        if (canRetry) {
          config._retryCount += 1
          const backoffMs = RETRY_DELAY_MS * 2 ** (config._retryCount - 1)
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
