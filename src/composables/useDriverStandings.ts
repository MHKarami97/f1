import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStandingsStore } from '@/stores/standingsStore'

export function useDriverStandings() {
  const store = useStandingsStore()
  const { driverStandings, isLoadingDrivers, driverError, topFiveDrivers } = storeToRefs(store)

  onMounted(() => {
    if (driverStandings.value.length === 0) {
      void store.fetchDriverStandings()
    }
  })

  return {
    standings: driverStandings,
    isLoading: isLoadingDrivers,
    error: driverError,
    topFive: topFiveDrivers,
  }
}
