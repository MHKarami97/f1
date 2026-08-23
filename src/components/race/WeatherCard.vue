<script setup lang="ts">
import type { WeatherData } from '@/types'

defineProps<{ weather: WeatherData | null }>()
</script>

<template>
  <div v-if="weather" class="rounded-xl bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="flex flex-col gap-1">
      <span class="text-gray-400 dark:text-gray-500 text-xs">دمای هوا</span>
      <span class="text-gray-900 dark:text-white font-bold tabular-nums">{{ weather.air_temperature }}°C</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-gray-400 dark:text-gray-500 text-xs">دمای آسفالت</span>
      <span class="text-gray-900 dark:text-white font-bold tabular-nums">{{ weather.track_temperature }}°C</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-gray-400 dark:text-gray-500 text-xs">رطوبت</span>
      <span class="text-gray-900 dark:text-white font-bold tabular-nums">{{ weather.humidity }}%</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-gray-400 dark:text-gray-500 text-xs">سرعت باد</span>
      <span class="text-gray-900 dark:text-white font-bold tabular-nums">{{ weather.wind_speed }} m/s</span>
    </div>
  </div>
</template>
