<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSessionsStore } from '@/stores'
import { useRaceDetail } from '@/composables'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'
import WeatherCard from '@/components/race/WeatherCard.vue'
import RaceControlEvents from '@/components/race/RaceControlEvents.vue'
import PositionChart from '@/components/race/PositionChart.vue'
import PitStopTable from '@/components/race/PitStopTable.vue'

const route = useRoute()
const sessionKey = Number(route.params.sessionKey)

const sessionsStore = useSessionsStore()
const { isLive, currentSession } = storeToRefs(sessionsStore)
const isThisSessionLive = computed(() => isLive.value && currentSession.value?.session_key === sessionKey)

const { results, grid, pitStops, weather, raceControl, drivers, isLoading, error } = useRaceDetail(sessionKey, isThisSessionLive.value)

const latestWeather = computed(() => weather.value[weather.value.length - 1] ?? null)
const sortedResults = computed(() => [...results.value].sort((a, b) => a.position - b.position))
const sortedGrid = computed(() => [...grid.value].sort((a, b) => a.position - b.position))

function driverName(num: number): string {
  return drivers.value.find((d) => d.driver_number === num)?.full_name ?? String(num)
}

function podiumRing(position: number): string {
  if (position === 1) return 'ring-2 ring-amber-400/50'
  if (position === 2) return 'ring-2 ring-gray-400/60'
  if (position === 3) return 'ring-2 ring-amber-700/40'
  return ''
}
</script>

<template>
  <div class="space-y-8">
    <SkeletonLoader v-if="isLoading" :rows="8" height="h-12" />
    <ErrorBoundary v-else-if="error" :message="error" />
    <template v-else>
      <section v-if="sortedResults.length > 0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <span class="w-1 h-5 rounded-full bg-f1-red" />
          نتایج مسابقه
        </h2>
        <div class="space-y-2">
          <div
            v-for="result in sortedResults"
            :key="result.driver_number"
            :class="['card flex items-center gap-4 p-4', podiumRing(result.position)]"
          >
            <span class="text-2xl font-bold tabular-nums text-gray-400 dark:text-gray-500 w-8 text-center">{{ result.position }}</span>
            <span class="text-gray-900 dark:text-white font-medium">{{ driverName(result.driver_number) }}</span>
          </div>
        </div>
      </section>

      <section v-if="sortedGrid.length > 0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <span class="w-1 h-5 rounded-full bg-f1-red" />
          گرید شروع
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="entry in sortedGrid" :key="entry.driver_number" class="card p-3 text-center">
            <p class="text-gray-400 dark:text-gray-500 text-xs mb-1">P{{ entry.position }}</p>
            <p class="text-gray-900 dark:text-white text-sm font-medium">{{ driverName(entry.driver_number) }}</p>
          </div>
        </div>
      </section>

      <section v-if="weather.length > 0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <span class="w-1 h-5 rounded-full bg-f1-red" />
          آب‌وهوا
        </h2>
        <WeatherCard :weather="latestWeather" />
      </section>

      <PositionChart :results="results" :drivers="drivers" />

      <section v-if="pitStops.length > 0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <span class="w-1 h-5 rounded-full bg-f1-red" />
          پیت‌استاپ‌ها
        </h2>
        <PitStopTable :pit-stops="pitStops" :drivers="drivers" />
      </section>

      <section v-if="raceControl.length > 0">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <span class="w-1 h-5 rounded-full bg-f1-red" />
          رویدادهای مدیریت مسابقه
        </h2>
        <RaceControlEvents :events="raceControl" />
      </section>
    </template>
  </div>
</template>