import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStandingsStore } from '@/stores'

export function useDriverStandings(withWins = false) {
  const store = useStandingsStore()
  const { driverStandings, isLoadingDrivers, driverError, topFiveDrivers } = storeToRefs(store)

  onMounted(async () => {
    if (driverStandings.value.length === 0) {
      await store.fetchDriverStandings()
    }
    if (withWins) {
      void store.computeSeasonWins()
    }
  })

  return {
    standings: driverStandings,
    isLoading: isLoadingDrivers,
    error: driverError,
    topFive: topFiveDrivers,
    retry: store.fetchDriverStandings,
  }
}
