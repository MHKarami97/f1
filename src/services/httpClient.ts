import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

class HttpClient {
  private static instance: HttpClient
  readonly client: AxiosInstance

  private constructor() {
    this.client = axios.create({
      baseURL: 'https://api.openf1.org/v1',
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use((config) => config)

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryConfig
        if (!config) return Promise.reject(error)

        config._retryCount = config._retryCount ?? 0

        const isRetryable =
          error.response?.status !== 404 &&
          error.response?.status !== 401 &&
          config._retryCount < MAX_RETRIES

        if (isRetryable) {
          config._retryCount++
          // Exponential backoff
          const delay = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
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
