import { computed, ref } from 'vue'
import {
  getBrowserPushManager,
  getReminderRepository,
  ReminderApiNotConfiguredError,
  type ReminderTiming,
} from '../services/pushSubscriptionService'

export interface RaceReminderTarget {
  meetingKey: number
  raceStartIso: string
}

const LOCAL_STORAGE_KEY = 'f1-race-reminder-v2'

interface StoredReminderState {
  meetingKey: number
  timings: ReminderTiming[]
}

const DEFAULT_TIMINGS: ReminderTiming[] = ['oneDayBefore', 'oneHourBefore']

function readStoredState(): StoredReminderState | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredReminderState) : null
  } catch {
    return null
  }
}

function writeStoredState(state: StoredReminderState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode) — subscription still succeeds server-side.
  }
}

function detectInstalledApp(): boolean {
  const isStandaloneDisplay = ['fullscreen', 'standalone', 'minimal-ui'].some(
    (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
  )
  const isIosHomeScreen = (window.navigator as { standalone?: boolean }).standalone === true
  const isAndroidTwa = document.referrer.startsWith('android-app://')
  return isStandaloneDisplay || isIosHomeScreen || isAndroidTwa
}

export function useRaceReminder(target: RaceReminderTarget | null) {
  const isInstalledApp = ref(detectInstalledApp())
  const isSupported = ref(
    isInstalledApp.value && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,
  )
  const isSubscribing = ref(false)
  const error = ref<string | null>(null)
  const permission = ref<NotificationPermission>('Notification' in window ? Notification.permission : 'denied')

  window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
    isInstalledApp.value = detectInstalledApp()
    isSupported.value = isInstalledApp.value && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  })

  const stored = readStoredState()
  const timings = ref<ReminderTiming[]>(stored?.timings ?? DEFAULT_TIMINGS)

  const isSubscribedForCurrentRace = computed(() => {
    const current = target
    return !!current && stored?.meetingKey === current.meetingKey && permission.value === 'granted'
  })

  function describeSubscribeError(err: unknown): string {
    if (err instanceof ReminderApiNotConfiguredError) return 'سرویس یادآوری هنوز روی سرور راه‌اندازی نشده است.'
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'مرورگر اجازه‌ی دریافت نوتیفیکیشن (Google/Microsoft) را نداد.'
    }
    return 'ثبت یادآوری با خطا مواجه شد. دوباره تلاش کنید.'
  }

  async function subscribe(): Promise<void> {
    const current = target
    if (!current) {
      error.value = 'مسابقه‌ی بعدی هنوز مشخص نیست.'
      return
    }
    if (timings.value.length === 0) {
      error.value = 'حداقل یک زمان یادآوری را انتخاب کنید.'
      return
    }

    isSubscribing.value = true
    error.value = null
    try {
      const pushManager = getBrowserPushManager()
      permission.value = await pushManager.requestPermission()
      if (permission.value !== 'granted') {
        error.value = 'اجازه‌ی ارسال نوتیفیکیشن داده نشد.'
        return
      }

      const subscription = await pushManager.getOrCreateSubscription()
      const repository = getReminderRepository()
      await repository.subscribe({
        subscription: subscription.toJSON(),
        meetingKey: current.meetingKey,
        raceStartIso: current.raceStartIso,
        timings: timings.value,
      })

      writeStoredState({ meetingKey: current.meetingKey, timings: timings.value })
    } catch (err) {
      error.value = describeSubscribeError(err)
      console.error('useRaceReminder subscribe failed', err)
    } finally {
      isSubscribing.value = false
    }
  }

  async function unsubscribe(): Promise<void> {
    const current = target
    if (!current) return
    isSubscribing.value = true
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await getReminderRepository().unsubscribe(subscription.endpoint, current.meetingKey)
        await subscription.unsubscribe()
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (err) {
      console.error('useRaceReminder unsubscribe failed', err)
    } finally {
      isSubscribing.value = false
    }
  }

  return {
    isInstalledApp,
    isSupported,
    isSubscribing,
    isSubscribedForCurrentRace,
    permission,
    timings,
    error,
    subscribe,
    unsubscribe,
  }
}