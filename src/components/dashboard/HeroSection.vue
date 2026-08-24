<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSessionsStore } from '@/stores'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const sessionsStore = useSessionsStore()
const { nextMeeting } = storeToRefs(sessionsStore)

const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: ReturnType<typeof setInterval> | null = null

function updateCountdown(): void {
  if (!nextMeeting.value) return
  const diff = new Date(nextMeeting.value.date_start).getTime() - Date.now()
  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  countdown.value = {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1_000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const countdownItems = computed(() => [
  { label: t('common.days'), value: countdown.value.days },
  { label: t('common.hours'), value: countdown.value.hours },
  { label: t('common.minutes'), value: countdown.value.minutes },
  { label: t('common.seconds'), value: countdown.value.seconds },
])
</script>

<template>
  <div class="stripe-top relative overflow-hidden rounded-2xl bg-gradient-to-br from-f1-light-surface to-f1-light-surface-2 dark:from-f1-surface dark:to-f1-dark border border-f1-light-border dark:border-f1-border p-6 md:p-10 mb-8">
    <div class="absolute top-0 left-0 w-72 h-72 bg-f1-red/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
    <div class="absolute bottom-0 right-0 w-56 h-56 bg-f1-red/5 rounded-full blur-3xl translate-y-1/3 translate-x-1/4" />
    <div class="checkered-corner absolute top-4 left-4 w-10 h-10 rounded-md opacity-60" />

    <div class="relative">
      <p class="text-f1-red text-sm font-semibold tracking-widest uppercase mb-2">فرمول یک {{ new Date().getFullYear() }}</p>
      <h1 class="text-3xl md:text-5xl font-black mb-6">
        <span class="text-gradient-red">فصل جاری</span>
      </h1>

      <template v-if="nextMeeting">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">
          {{ t('dashboard.nextRace') }}:
          <span class="text-gray-900 dark:text-white font-medium">{{ nextMeeting.meeting_official_name }}</span>
        </p>
        <p class="text-gray-400 dark:text-gray-500 text-xs mb-6">{{ nextMeeting.circuit_short_name }} — {{ nextMeeting.country_name }}</p>
        <div class="flex gap-3 md:gap-4 flex-wrap">
          <div
            v-for="item in countdownItems"
            :key="item.label"
            class="glow-red flex flex-col items-center bg-f1-light-surface dark:bg-f1-dark rounded-xl px-4 md:px-5 py-3 min-w-[68px] border border-f1-light-border dark:border-f1-border"
          >
            <span class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{{ String(item.value).padStart(2, '0') }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ item.label }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>