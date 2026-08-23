/**
 * Strategy pattern: swap the polling behaviour of a composable without
 * changing its call site. LivePollingStrategy re-fetches on a fixed
 * interval; StaticPollingStrategy only fetches once.
 */
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
  start(callback: () => Promise<void>): void {
    void callback()
  }

  stop(): void {
    // no-op: static mode never schedules anything to cancel
  }
}

export function createPollingStrategy(isLive: boolean): PollingStrategy {
  return isLive ? new LivePollingStrategy() : new StaticPollingStrategy()
}
