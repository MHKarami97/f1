export interface PollingStrategy {
  start(callback: () => Promise<void>): void
  stop(): void
}

export class LivePollingStrategy implements PollingStrategy {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private readonly intervalMs: number

  constructor(intervalMs = 5_000) {
    this.intervalMs = intervalMs
  }

  start(callback: () => Promise<void>): void {
    this.stop()
    // Immediate first call, then poll at fixed interval
    void callback()
    this.intervalId = setInterval(() => void callback(), this.intervalMs)
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

export class StaticPollingStrategy implements PollingStrategy {
  start(_callback: () => Promise<void>): void {
    // no-op in static mode
  }

  stop(): void {
    // no-op
  }
}

export function createPollingStrategy(isLive: boolean): PollingStrategy {
  return isLive ? new LivePollingStrategy() : new StaticPollingStrategy()
}
