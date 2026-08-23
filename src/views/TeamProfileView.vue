<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useConstructorStandings } from '@/composables'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

const route = useRoute()
const teamName = decodeURIComponent(route.params.name as string)
const { standings, isLoading, error, retry } = useConstructorStandings()

const team = computed(() => standings.value.find((t) => t.team_name === teamName) ?? null)
</script>

<template>
  <div class="space-y-6">
    <SkeletonLoader v-if="isLoading" :rows="3" height="h-16" />
    <ErrorBoundary v-else-if="error || !team" :message="error ?? 'تیم پیدا نشد'" :on-retry="retry" />
    <div v-else>
      <div class="flex items-center gap-4 mb-8">
        <div class="w-4 h-16 rounded-sm" :style="{ backgroundColor: `#${team.team_colour}` }" />
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ team.team_name }}</h1>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="p-5 rounded-xl bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border text-center">
          <p class="text-gray-400 dark:text-gray-500 text-xs mb-2">رتبه</p>
          <p class="text-gray-900 dark:text-white text-3xl font-black tabular-nums">{{ team.position }}</p>
        </div>
        <div class="p-5 rounded-xl bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border text-center">
          <p class="text-gray-400 dark:text-gray-500 text-xs mb-2">امتیاز</p>
          <p class="text-gray-900 dark:text-white text-3xl font-black tabular-nums">{{ team.points }}</p>
        </div>
        <div class="p-5 rounded-xl bg-gray-50 dark:bg-f1-surface border border-gray-200 dark:border-f1-border text-center">
          <p class="text-gray-400 dark:text-gray-500 text-xs mb-2">برد</p>
          <p class="text-gray-900 dark:text-white text-3xl font-black tabular-nums">{{ team.wins }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
