<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSessionsStore } from '@/stores'
import { useDriverStandings, useConstructorStandings } from '@/composables'
import HeroSection from '@/components/dashboard/HeroSection.vue'
import LiveSection from '@/components/dashboard/LiveSection.vue'
import NextRaceCard from '@/components/dashboard/NextRaceCard.vue'
import DriverTable from '@/components/standings/DriverTable.vue'
import ConstructorTable from '@/components/standings/ConstructorTable.vue'

const sessionsStore = useSessionsStore()
const { isLoading: driversLoading, error: driversError, topFive: topFiveDrivers, retry: retryDrivers } = useDriverStandings()
const { isLoading: teamsLoading, error: teamsError, topFive: topFiveTeams, retry: retryTeams } = useConstructorStandings()

onMounted(() => void sessionsStore.fetchCalendar())
</script>

<template>
  <div class="space-y-8">
    <HeroSection />
    <LiveSection />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-gray-900 dark:text-white font-semibold">جدول امتیازات رانندگان</h2>
          <RouterLink to="/drivers" class="text-f1-red text-sm hover:underline">مشاهده همه</RouterLink>
        </div>
        <DriverTable :standings="topFiveDrivers" :is-loading="driversLoading" :error="driversError" :limit="5" :on-retry="retryDrivers" />
      </div>
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-gray-900 dark:text-white font-semibold">جدول تیم\u200cها</h2>
          <RouterLink to="/teams" class="text-f1-red text-sm hover:underline">همه</RouterLink>
        </div>
        <ConstructorTable :standings="topFiveTeams" :is-loading="teamsLoading" :error="teamsError" :limit="5" :on-retry="retryTeams" />
      </div>
    </div>

    <NextRaceCard />
  </div>
</template>
