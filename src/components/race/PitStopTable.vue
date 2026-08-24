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
  <div v-if="pitStops.length > 0" class="card overflow-hidden">
    <table class="w-full">
      <thead class="bg-f1-light-surface-2 dark:bg-f1-surface-2">
        <tr>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">راننده</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">دور</th>
          <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">مدت توقف</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-f1-light-border dark:divide-f1-border">
        <tr
          v-for="pit in pitStops"
          :key="`${pit.driver_number}-${pit.lap_number}`"
          class="bg-f1-light-surface dark:bg-f1-surface hover:bg-f1-light-surface-2 dark:hover:bg-f1-surface-2 transition-colors"
        >
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm font-medium">{{ driverName(pit.driver_number) }}</td>
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{{ pit.lap_number }}</td>
          <td class="px-4 py-3 text-f1-red font-semibold tabular-nums">{{ formatDuration(pit.stop_duration) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>