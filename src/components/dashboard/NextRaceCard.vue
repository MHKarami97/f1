<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSessionsStore } from '@/stores'

const store = useSessionsStore()
const { nextMeeting } = storeToRefs(store)

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}
</script>

<template>
  <div v-if="nextMeeting" class="rounded-2xl bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border p-6">
    <h3 class="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">مسابقه بعدی</h3>
    <h2 class="text-gray-900 dark:text-white text-xl font-bold mb-1">{{ nextMeeting.meeting_official_name }}</h2>
    <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">{{ nextMeeting.circuit_short_name }}</p>
    <p class="text-gray-400 dark:text-gray-500 text-xs mb-4">{{ nextMeeting.country_name }}</p>
    <p class="text-f1-red text-sm font-medium tabular-nums">{{ formatDate(nextMeeting.date_start) }}</p>
  </div>
</template>
