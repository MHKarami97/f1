<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { TeamChampionshipEntry } from '@/types'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

const props = defineProps<{
  standings: TeamChampionshipEntry[]
  isLoading: boolean
  error: string | null
  limit?: number
  onRetry?: () => void
}>()
</script>

<template>
  <div>
    <SkeletonLoader v-if="isLoading" :rows="limit ?? 10" />
    <ErrorBoundary v-else-if="error" :message="error" :on-retry="onRetry" />
    <div v-else class="space-y-2">
      <RouterLink
        v-for="entry in (props.limit ? props.standings.slice(0, props.limit) : props.standings)"
        :key="entry.team_name"
        :to="`/teams/${encodeURIComponent(entry.team_name)}`"
        class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border hover:border-f1-red/50 transition-colors"
      >
        <span class="text-xl font-bold tabular-nums text-gray-300 dark:text-gray-600 w-6 text-center">{{ entry.position }}</span>
        <div class="w-3 h-10 rounded-sm" :style="{ backgroundColor: `#${entry.team_colour}` }" />
        <div class="flex-1 min-w-0">
          <p class="text-gray-900 dark:text-white font-semibold text-sm truncate">{{ entry.team_name }}</p>
          <p class="text-gray-400 dark:text-gray-500 text-xs">{{ entry.wins }} برد</p>
        </div>
        <p class="text-gray-900 dark:text-white font-bold tabular-nums text-lg">{{ entry.points }}</p>
      </RouterLink>
    </div>
  </div>
</template>
