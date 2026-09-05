import { computed, ref } from 'vue'
import type { Meeting } from '../types'
import {
  getBrowserPushManager,
  getReminderRepository,
  ReminderApiNotConfiguredError,
  type RaceReminderPreferences,
} from '../services/pushSubscriptionService'

const LOCAL_STORAGE_KEY = 'f1-race-reminder-v1'

interface StoredReminderState extends RaceReminderPreferences {
  meetingKey: number
}

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

/** True only when launched as an installed PWA/TWA, never in a plain browser tab. */
function detectInstalledApp(): boolean {
  const isStandaloneDisplay = ['fullscreen', 'standalone', 'minimal-ui'].some(
    (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
  )
  const isIosHomeScreen = (window.navigator as { standalone?: boolean }).standalone === true
  const isAndroidTwa = document.referrer.startsWith('android-app://')
  return isStandaloneDisplay || isIosHomeScreen || isAndroidTwa
}

export function useRaceReminder(meeting: () => Meeting | null) {
  const isInstalledApp = ref(detectInstalledApp())
  const isSupported = ref(
    isInstalledApp.value &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window,
  )
  const isSubscribing = ref(false)
  const error = ref<string | null>(null)
  const permission = ref<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  )

  // Re-check once the display mode can actually change at runtime (e.g. user
  // installs the PWA while the tab stays open) so the button can appear
  // without a full reload.
  window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
    isInstalledApp.value = detectInstalledApp()
    isSupported.value =
      isInstalledApp.value &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
  })

  const stored = readStoredState()
  const remindOneDayBefore = ref(stored?.remindOneDayBefore ?? true)
  const remindOneHourBefore = ref(stored?.remindOneHourBefore ?? true)

  const isSubscribedForCurrentRace = computed(() => {
    const current = meeting()
    return !!current && stored?.meetingKey === current.meeting_key && permission.value === 'granted'
  })

  function describeSubscribeError(err: unknown): string {
    if (err instanceof ReminderApiNotConfiguredError) {
      return 'سرویس یادآوری هنوز پیکربندی نشده است.'
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'اتصال به سرویس اعلان برقرار نشد — ممکن است اینترنت یا مرورگر شما دسترسی به سرویس‌های پوش (Google/Microsoft) را مسدود کرده باشد. اتصال یا فیلترشکن خود را بررسی کنید.'
    }
    return 'خطا در فعال‌سازی یادآور. دوباره تلاش کنید.'
  }

  async function subscribe(): Promise<void> {
    const current = meeting()
    if (!current) {
      error.value = 'مسابقه بعدی مشخص نیست.'
      return
    }
    if (!remindOneDayBefore.value && !remindOneHourBefore.value) {
      error.value = 'حداقل یکی از یادآورها را انتخاب کنید.'
      return
    }

    isSubscribing.value = true
    error.value = null

    try {
      const pushManager = getBrowserPushManager()
      permission.value = await pushManager.requestPermission()
      if (permission.value !== 'granted') {
        error.value = 'دسترسی اعلان رد شد.'
        return
      }

      const subscription = await pushManager.getOrCreateSubscription()
      const repository = getReminderRepository()

      await repository.subscribe({
        subscription: subscription.toJSON(),
        meetingKey: current.meeting_key,
        raceStartIso: current.date_start,
        remindOneDayBefore: remindOneDayBefore.value,
        remindOneHourBefore: remindOneHourBefore.value,
      })

      writeStoredState({
        meetingKey: current.meeting_key,
        remindOneDayBefore: remindOneDayBefore.value,
        remindOneHourBefore: remindOneHourBefore.value,
      })
    } catch (err) {
      error.value = describeSubscribeError(err)
      console.error('[useRaceReminder] subscribe failed', err)
    } finally {
      isSubscribing.value = false
    }
  }

  async function unsubscribe(): Promise<void> {
    const current = meeting()
    if (!current) return

    isSubscribing.value = true
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await getReminderRepository().unsubscribe(subscription.endpoint, current.meeting_key)
        await subscription.unsubscribe()
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (err) {
      console.error('[useRaceReminder] unsubscribe failed', err)
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
    remindOneDayBefore,
    remindOneHourBefore,
    error,
    subscribe,
    unsubscribe,
  }
}