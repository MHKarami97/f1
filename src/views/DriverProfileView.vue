<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useStandingsStore, useSessionsStore } from '@/stores'
import { getSeasonDriverMap } from '@/composables/useDriverLookup'
import type { Driver } from '@/types'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue'

const route = useRoute()
const driverNumber = Number(route.params.number)

const driver = ref<Driver | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const sessionsStore = useSessionsStore()
const standingsStore = useStandingsStore()
const { driverStandings } = storeToRefs(standingsStore)

const standing = computed(() => driverStandings.value.find((d) => d.driver_number === driverNumber) ?? null)

async function load(): Promise<void> {
  isLoading.value = true
  error.value = null
  try {
    if (sessionsStore.sessions.length === 0) await sessionsStore.fetchCalendar()
    const driverMap = await getSeasonDriverMap()
    driver.value = driverMap.get(driverNumber) ?? null
    if (driverStandings.value.length === 0) await standingsStore.fetchDriverStandings()
  } catch {
    error.value = 'اطلاعات راننده در دسترس نیست'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <SkeletonLoader v-if="isLoading" :rows="6" height="h-16" />
    <ErrorBoundary v-else-if="error || !driver" :message="error ?? 'راننده پیدا نشد'" :on-retry="load" />
    <div v-else class="space-y-6">
      <div
        class="stripe-top relative overflow-hidden rounded-2xl border border-f1-light-border dark:border-f1-border p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start"
        :style="{ background: `linear-gradient(135deg, #${driver.team_colour}14, transparent)` }"
      >
        <div class="absolute top-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-20" :style="{ backgroundColor: `#${driver.team_colour}` }" />
        <img v-if="driver.headshot_url" :src="driver.headshot_url" :alt="driver.full_name" class="relative w-32 h-32 rounded-2xl object-cover border border-f1-light-border dark:border-f1-border" loading="lazy" />
        <div class="relative">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-black text-gray-900 dark:text-white">{{ driver.full_name }}</h1>
            <span class="text-5xl font-black tabular-nums text-gray-200 dark:text-gray-700">#{{ driver.driver_number }}</span>
          </div>
          <div class="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2" :style="{ backgroundColor: `#${driver.team_colour}20`, color: `#${driver.team_colour}` }">
            {{ driver.team_name }}
          </div>
        </div>
      </div>

      <div v-if="standing" class="grid grid-cols-3 gap-4">
        <div class="card p-4 text-center">
          <p class="text-gray-400 dark:text-gray-500 text-xs mb-1">رتبه فصل</p>
          <p class="text-gray-900 dark:text-white text-2xl font-bold tabular-nums">{{ standing.position }}</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-gray-400 dark:text-gray-500 text-xs mb-1">امتیاز</p>
          <p class="text-gray-900 dark:text-white text-2xl font-bold tabular-nums">{{ standing.points }}</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-gray-400 dark:text-gray-500 text-xs mb-1">تعداد برد</p>
          <p class="text-gray-900 dark:text-white text-2xl font-bold tabular-nums">{{ standing.wins }}</p>
        </div>
      </div>
    </div>
  </div>
</template>