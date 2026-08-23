import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository/OpenF1Repository'
import type { DriverChampionshipEntry, TeamChampionshipEntry } from '@/types'

const repo = new OpenF1Repository()
const CURRENT_YEAR = new Date().getFullYear()

export const useStandingsStore = defineStore('standings', () => {
  const driverStandings = ref<DriverChampionshipEntry[]>([])
  const teamStandings = ref<TeamChampionshipEntry[]>([])
  const isLoadingDrivers = ref(false)
  const isLoadingTeams = ref(false)
  const driverError = ref<string | null>(null)
  const teamError = ref<string | null>(null)

  const topFiveDrivers = computed(() => driverStandings.value.slice(0, 5))
  const topFiveTeams = computed(() => teamStandings.value.slice(0, 5))

  async function fetchDriverStandings(): Promise<void> {
    isLoadingDrivers.value = true
    driverError.value = null
    try {
      driverStandings.value = await repo.getDriverChampionship(CURRENT_YEAR)
    } catch {
      driverError.value = 'داده جدول رانندگان در دسترس نیست'
    } finally {
      isLoadingDrivers.value = false
    }
  }

  async function fetchTeamStandings(): Promise<void> {
    isLoadingTeams.value = true
    teamError.value = null
    try {
      teamStandings.value = await repo.getTeamChampionship(CURRENT_YEAR)
    } catch {
      teamError.value = 'داده جدول تیم‌ها در دسترس نیست'
    } finally {
      isLoadingTeams.value = false
    }
  }

  return {
    driverStandings,
    teamStandings,
    isLoadingDrivers,
    isLoadingTeams,
    driverError,
    teamError,
    topFiveDrivers,
    topFiveTeams,
    fetchDriverStandings,
    fetchTeamStandings,
  }
})
