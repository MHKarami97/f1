export type ReminderTiming = 'oneDayBefore' | 'oneHourBefore' | 'atStart'

export interface RaceReminderPreferences {
  timings: ReminderTiming[]
}

export interface SubscribeReminderPayload extends RaceReminderPreferences {
  subscription: PushSubscriptionJSON
  meetingKey: number  
  raceStartIso: string
}

export interface IReminderRepository {
  subscribe(payload: SubscribeReminderPayload): Promise<void>
  unsubscribe(endpoint: string, meetingKey: number): Promise<void>
}

const REMINDER_API_BASE = import.meta.env.VITE_PUSH_API_BASE_URL as string | undefined

export class ReminderApiNotConfiguredError extends Error {
  constructor() {
    super('VITE_PUSH_API_BASE_URL is not set — the reminder backend is not deployed.')
  }
}

export class CloudflareReminderRepository implements IReminderRepository {
  private readonly baseUrl: string

  constructor(baseUrl: string | undefined) {
    if (!baseUrl) throw new ReminderApiNotConfiguredError()
    this.baseUrl = baseUrl
  }

  async subscribe(payload: SubscribeReminderPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/reminders/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error(`Subscribe failed: HTTP ${response.status}`)
  }

  async unsubscribe(endpoint: string, meetingKey: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/reminders/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, meetingKey }),
    })
    if (!response.ok) throw new Error(`Unsubscribe failed: HTTP ${response.status}`)
  }
}

export class BrowserPushManager {
  private readonly vapidPublicKey: string

  constructor(vapidPublicKey: string) {
    this.vapidPublicKey = vapidPublicKey
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  }

  async requestPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission()
  }

  async getOrCreateSubscription(): Promise<PushSubscription> {
    const registration = await navigator.serviceWorker.ready
    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
    })
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const output = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
    return output
  }
}

let reminderRepositorySingleton: IReminderRepository | null = null
let pushManagerSingleton: BrowserPushManager | null = null

export function getReminderRepository(): IReminderRepository {
  if (!reminderRepositorySingleton) {
    reminderRepositorySingleton = new CloudflareReminderRepository(REMINDER_API_BASE)
  }
  return reminderRepositorySingleton
}

export function getBrowserPushManager(): BrowserPushManager {
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!vapidPublicKey) throw new Error('VITE_VAPID_PUBLIC_KEY is not set.')
  if (!pushManagerSingleton) pushManagerSingleton = new BrowserPushManager(vapidPublicKey)
  return pushManagerSingleton
}