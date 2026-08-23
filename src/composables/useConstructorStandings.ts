import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStandingsStore } from '@/stores'

export function useConstructorStandings(withWins = false) {
  const store = useStandingsStore()
  const { teamStandings, isLoadingTeams, teamError, topFiveTeams } = storeToRefs(store)

  onMounted(async () => {
    if (teamStandings.value.length === 0) {
      await store.fetchTeamStandings()
    }
    if (withWins) {
      void store.computeSeasonWins()
    }
  })

  return {
    standings: teamStandings,
    isLoading: isLoadingTeams,
    error: teamError,
    topFive: topFiveTeams,
    retry: store.fetchTeamStandings,
  }
}
