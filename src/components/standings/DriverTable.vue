<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { DriverChampionshipEntry } from '@/types'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

const props = defineProps<{
  standings: DriverChampionshipEntry[]
  isLoading: boolean
  error: string | null
  limit?: number
  onRetry?: () => void
}>()

const router = useRouter()

type SortKey = 'position' | 'points' | 'wins'
const sortKey = ref<SortKey>('position')
const sortAsc = ref(true)

const sorted = computed(() => {
  const data = props.limit ? props.standings.slice(0, props.limit) : [...props.standings]
  return data.sort((a, b) => (a[sortKey.value] - b[sortKey.value]) * (sortAsc.value ? 1 : -1))
})

function setSort(key: SortKey): void {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

function podiumRing(position: number): string {
  if (position === 1) return 'ring-2 ring-amber-400/50'
  if (position === 2) return 'ring-2 ring-slate-300/40'
  if (position === 3) return 'ring-2 ring-amber-700/40'
  return ''
}
</script>

<template>
  <div>
    <SkeletonLoader v-if="isLoading" :rows="limit ?? 10" />
    <ErrorBoundary v-else-if="error" :message="error" :on-retry="onRetry" />
    <template v-else>
      <div class="md:hidden space-y-3">
        <RouterLink
          v-for="entry in sorted"
          :key="entry.driver_number"
          :to="`/drivers/${entry.driver_number}`"
          :class="['card-hover flex items-center gap-3 p-4', podiumRing(entry.position)]"
        >
          <span class="text-2xl font-bold tabular-nums text-gray-300 dark:text-gray-600 w-8 text-center">{{ entry.position }}</span>
          <div class="w-1 h-12 rounded-full" :style="{ backgroundColor: `#${entry.team_colour}` }" />
          <img v-if="entry.headshot_url" :src="entry.headshot_url" :alt="entry.full_name" class="w-10 h-10 rounded-full object-cover" loading="lazy" />
          <div class="flex-1 min-w-0">
            <p class="text-gray-900 dark:text-white font-semibold text-sm truncate">{{ entry.full_name }}</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs">{{ entry.team_name }}</p>
          </div>
          <div class="text-left">
            <p class="text-gray-900 dark:text-white font-bold tabular-nums">{{ entry.points }}</p>
            <p class="text-gray-400 dark:text-gray-500 text-xs">امتیاز</p>
          </div>
        </RouterLink>
      </div>

      <div class="hidden md:block card overflow-hidden">
        <table class="w-full">
          <thead class="bg-f1-light-surface-2 dark:bg-f1-surface-2">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-f1-red transition-colors" @click="setSort('position')">رتبه</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">راننده</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">تیم</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-f1-red transition-colors" @click="setSort('points')">امتیاز</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-f1-red transition-colors" @click="setSort('wins')">برد</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-f1-light-border dark:divide-f1-border">
            <tr
              v-for="entry in sorted"
              :key="entry.driver_number"
              :class="['bg-f1-light-surface dark:bg-f1-surface hover:bg-f1-light-surface-2 dark:hover:bg-f1-surface-2 transition-colors cursor-pointer', podiumRing(entry.position)]"
              @click="router.push(`/drivers/${entry.driver_number}`)"
            >
              <td class="px-4 py-3 text-gray-400 dark:text-gray-500 font-bold tabular-nums text-center">{{ entry.position }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img v-if="entry.headshot_url" :src="entry.headshot_url" :alt="entry.full_name" class="w-8 h-8 rounded-full object-cover" loading="lazy" />
                  <div class="w-0.5 h-8 rounded-full" :style="{ backgroundColor: `#${entry.team_colour}` }" />
                  <div>
                    <p class="text-gray-900 dark:text-white text-sm font-semibold">{{ entry.full_name }}</p>
                    <p class="text-gray-400 dark:text-gray-500 text-xs">{{ entry.name_acronym }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{{ entry.team_name }}</td>
              <td class="px-4 py-3 text-gray-900 dark:text-white font-bold tabular-nums">{{ entry.points }}</td>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{{ entry.wins }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>