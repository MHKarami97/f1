<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useSessionsStore } from '@/stores'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

const store = useSessionsStore()
const { meetings, isLoading, error } = storeToRefs(store)

onMounted(() => void store.fetchCalendar())

function isCompleted(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">تقویم مسابقات {{ new Date().getFullYear() }}</h1>
    <SkeletonLoader v-if="isLoading" :rows="10" height="h-20" />
    <ErrorBoundary v-else-if="error" :message="error" :on-retry="store.fetchCalendar" />
    <div v-else class="space-y-3">
      <component
        v-for="(meeting, index) in meetings"
        :key="meeting.meeting_key"
        :is="store.sessionKeyForMeeting(meeting.meeting_key) ? RouterLink : 'div'"
        :to="store.sessionKeyForMeeting(meeting.meeting_key) ? `/race/${store.sessionKeyForMeeting(meeting.meeting_key)}` : undefined"
        :class="[
          'flex items-center gap-4 p-5 rounded-xl border transition-colors',
          isCompleted(meeting.date_start)
            ? 'bg-white dark:bg-f1-dark border-gray-200 dark:border-f1-border opacity-70'
            : 'bg-gray-50 dark:bg-f1-surface border-gray-200 dark:border-f1-border hover:border-f1-red/50 cursor-pointer',
        ]"
      >
        <span class="text-3xl font-bold tabular-nums text-gray-300 dark:text-gray-700 w-8 text-center">{{ index + 1 }}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-gray-900 dark:text-white font-semibold truncate">{{ meeting.meeting_official_name }}</h3>
            <span
              :class="[
                'text-xs px-2 py-0.5 rounded-full font-medium',
                isCompleted(meeting.date_start) ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : 'bg-f1-red/15 text-f1-red',
              ]"
            >
              {{ isCompleted(meeting.date_start) ? 'برگزار شده' : 'پیش رو' }}
            </span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ meeting.circuit_short_name }} — {{ meeting.country_name }}</p>
        </div>
        <p class="text-gray-500 dark:text-gray-400 text-sm tabular-nums text-left flex-shrink-0">{{ formatDate(meeting.date_start) }}</p>
      </component>
    </div>
  </div>
</template>
