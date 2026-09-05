<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSessionsStore } from '../../stores'
import { useRaceReminder } from '../../composables/useRaceReminder'

const sessionsStore = useSessionsStore()
const { nextMeeting } = storeToRefs(sessionsStore)

const {
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
} = useRaceReminder(() => nextMeeting.value)

const buttonLabel = computed(() => {
  if (isSubscribedForCurrentRace.value) return 'یادآور فعال است'
  if (isSubscribing.value) return 'در حال فعال‌سازی...'
  return 'اعلام مسابقه'
})
</script>

<template>
  <div v-if="nextMeeting && isInstalledApp" class="mt-4 flex flex-col items-end gap-3">
    <div class="flex w-full flex-wrap items-center justify-end gap-3">
      <button
        v-if="!isSubscribedForCurrentRace"
        type="button"
        :disabled="isSubscribing || !isSupported"
        class="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-f1-red px-5 py-2.5 text-sm font-semibold leading-none text-white transition-colors hover:bg-f1-red-dark disabled:cursor-not-allowed disabled:opacity-50"
        @click="subscribe"
      >
        <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span class="leading-none">{{ buttonLabel }}</span>
      </button>

      <button
        v-else
        type="button"
        class="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-f1-light-border bg-f1-light-surface px-5 py-2.5 text-sm font-semibold leading-none text-gray-600 transition-colors hover:border-f1-red hover:text-f1-red dark:border-f1-border dark:bg-f1-dark dark:text-gray-300"
        @click="unsubscribe"
      >
        <span class="leading-none">لغو یادآور</span>
      </button>
    </div>

    <div
      v-if="!isSubscribedForCurrentRace"
      class="flex w-full flex-wrap items-center justify-end gap-x-4 gap-y-2"
    >
      <label class="flex items-center gap-1.5 text-xs leading-none text-gray-500 dark:text-gray-400">
        <input v-model="remindOneDayBefore" type="checkbox" class="accent-f1-red" />
        <span class="leading-none">یک روز قبل</span>
      </label>
      <label class="flex items-center gap-1.5 text-xs leading-none text-gray-500 dark:text-gray-400">
        <input v-model="remindOneHourBefore" type="checkbox" class="accent-f1-red" />
        <span class="leading-none">یک ساعت قبل</span>
      </label>
    </div>

    <p v-if="!isSupported" class="w-full text-left text-xs text-gray-400 dark:text-gray-500">
      مرورگر یا دستگاه شما از اعلان پوش پشتیبانی نمی‌کند.
    </p>
    <p
      v-else-if="permission === 'denied'"
      class="w-full text-left text-xs text-gray-400 dark:text-gray-500"
    >
      دسترسی اعلان قبلاً رد شده؛ از تنظیمات مرورگر آن را فعال کنید.
    </p>
    <p v-if="error" class="w-full text-left text-xs text-f1-red">{{ error }}</p>
  </div>
</template>