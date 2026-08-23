<script setup lang="ts">
import type { RaceControlEvent } from '@/types'

defineProps<{ events: RaceControlEvent[] }>()

const FLAG_COLOR: Record<string, string> = {
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-400',
  'DOUBLE YELLOW': 'bg-yellow-400',
  RED: 'bg-red-500',
  CHEQUERED: 'bg-gray-300',
  'BLACK AND WHITE': 'bg-gray-500',
}

function flagColor(flag: string | null): string {
  return flag ? (FLAG_COLOR[flag] ?? 'bg-gray-400') : 'bg-gray-400'
}
</script>

<template>
  <div class="space-y-2 max-h-80 overflow-y-auto">
    <div v-for="(event, i) in events" :key="i" class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border">
      <span :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', flagColor(event.flag)]" />
      <div class="flex-1 min-w-0">
        <p class="text-gray-700 dark:text-gray-200 text-sm">{{ event.message }}</p>
        <p class="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
          {{ event.lap_number ? `دور ${event.lap_number}` : '' }} {{ event.flag ? `· ${event.flag}` : '' }}
        </p>
      </div>
    </div>
  </div>
</template>
