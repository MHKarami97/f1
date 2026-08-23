<script setup lang="ts">
import type { PitStop, Driver } from '@/types'

const props = defineProps<{ pitStops: PitStop[]; drivers: Driver[] }>()

function driverName(num: number): string {
  return props.drivers.find((d) => d.driver_number === num)?.full_name ?? String(num)
}

function formatDuration(dur: number | null): string {
  return dur === null ? '—' : `${dur.toFixed(2)}s`
}
</script>

<template>
  <div v-if="pitStops.length > 0" class="overflow-hidden rounded-xl border border-gray-200 dark:border-f1-border">
    <table class="w-full">
      <thead class="bg-gray-50 dark:bg-f1-surface">
        <tr>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500">راننده</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500">دور</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500">مدت توقف</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-f1-border">
        <tr v-for="pit in pitStops" :key="`${pit.driver_number}-${pit.lap_number}`" class="bg-white dark:bg-f1-dark hover:bg-gray-50 dark:hover:bg-f1-surface transition-colors">
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">{{ driverName(pit.driver_number) }}</td>
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{{ pit.lap_number }}</td>
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{{ formatDuration(pit.stop_duration) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
