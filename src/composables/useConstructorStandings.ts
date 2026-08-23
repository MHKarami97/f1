import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStandingsStore } from '@/stores/standingsStore'

export function useConstructorStandings() {
  const store = useStandingsStore()
  const { teamStandings, isLoadingTeams, teamError, topFiveTeams } = storeToRefs(store)

  onMounted(() => {
    if (teamStandings.value.length === 0) {
      void store.fetchTeamStandings()
    }
  })

  return {
    standings: teamStandings,
    isLoading: isLoadingTeams,
    error: teamError,
    topFive: topFiveTeams,
  }
}
