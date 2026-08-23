import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository'
import { useSessionsStore } from './sessionsStore'
import type { DriverChampionshipEntry, TeamChampionshipEntry, Driver } from '@/types'

const repo = new OpenF1Repository()
// Counting season wins precisely means scanning every finished race's
// session_result for position === 1, which is O(races) HTTP calls. To keep
// the dashboard fast, wins are only computed lazily (see computeSeasonWins)
// and capped by this constant so a long season never triggers dozens of
// parallel requests at once.
const MAX_RACES_FOR_WIN_COUNT = 26

export const useStandingsStore = defineStore('standings', () => {
  const driverStandings = ref<DriverChampionshipEntry[]>([])
  const teamStandings = ref<TeamChampionshipEntry[]>([])
  const isLoadingDrivers = ref(false)
  const isLoadingTeams = ref(false)
  const driverError = ref<string | null>(null)
  const teamError = ref<string | null>(null)
  const winsComputed = ref(false)

  const topFiveDrivers = computed(() => driverStandings.value.slice(0, 5))
  const topFiveTeams = computed(() => teamStandings.value.slice(0, 5))

  async function fetchDriverStandings(): Promise<void> {
    isLoadingDrivers.value = true
    driverError.value = null
    try {
      const sessionsStore = useSessionsStore()
      if (sessionsStore.sessions.length === 0) await sessionsStore.fetchCalendar()
      const raceSession = sessionsStore.latestFinishedRaceSession
      if (!raceSession) {
        driverStandings.value = []
        return
      }

      const [raw, drivers] = await Promise.all([
        repo.getDriverChampionship(raceSession.session_key),
        repo.getDrivers(raceSession.session_key),
      ])

      const driverByNumber = new Map<number, Driver>(drivers.map((d) => [d.driver_number, d]))

      driverStandings.value = raw
        .map((entry) => {
          const driver = driverByNumber.get(entry.driver_number)
          return {
            position: entry.position_current,
            driver_number: entry.driver_number,
            broadcast_name: driver?.broadcast_name ?? '',
            full_name: driver?.full_name ?? `#${entry.driver_number}`,
            name_acronym: driver?.name_acronym ?? '',
            team_name: driver?.team_name ?? '',
            team_colour: driver?.team_colour ?? '666666',
            headshot_url: driver?.headshot_url ?? null,
            points: entry.points_current,
            wins: 0,
          } satisfies DriverChampionshipEntry
        })
        .sort((a, b) => a.position - b.position)
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
      const sessionsStore = useSessionsStore()
      if (sessionsStore.sessions.length === 0) await sessionsStore.fetchCalendar()
      const raceSession = sessionsStore.latestFinishedRaceSession
      if (!raceSession) {
        teamStandings.value = []
        return
      }

      const raw = await repo.getTeamChampionship(raceSession.session_key)
      const drivers = await repo.getDrivers(raceSession.session_key)
      const colourByTeam = new Map<string, string>(drivers.map((d) => [d.team_name, d.team_colour]))

      teamStandings.value = raw
        .map((entry) => ({
          position: entry.position_current,
          team_name: entry.team_name,
          team_colour: colourByTeam.get(entry.team_name) ?? '666666',
          points: entry.points_current,
          wins: 0,
        } satisfies TeamChampionshipEntry))
        .sort((a, b) => a.position - b.position)
    } catch {
      teamError.value = 'داده جدول تیم\u200cها در دسترس نیست'
    } finally {
      isLoadingTeams.value = false
    }
  }

  /**
   * Lazily back-fills the `wins` counter by scanning session_result for every
   * finished race of the season and counting P1 finishes per driver/team.
   * Intended to run once, only on the full standings pages (not the
   * dashboard summary), to avoid an N+1 request burst on every page load.
   */
  async function computeSeasonWins(): Promise<void> {
    if (winsComputed.value) return
    const sessionsStore = useSessionsStore()
    const finishedRaces = sessionsStore.raceSessions
      .filter((s) => new Date(s.date_end) < new Date())
      .slice(0, MAX_RACES_FOR_WIN_COUNT)

    if (finishedRaces.length === 0) return

    const winsByDriver = new Map<number, number>()
    const winsByTeam = new Map<string, number>()

    const resultsPerRace = await Promise.all(finishedRaces.map((race) => repo.getRaceResults(race.session_key)))
    const driversPerRace = await Promise.all(finishedRaces.map((race) => repo.getDrivers(race.session_key)))

    resultsPerRace.forEach((results, index) => {
      const winner = results.find((r) => r.position === 1)
      if (!winner) return
      winsByDriver.set(winner.driver_number, (winsByDriver.get(winner.driver_number) ?? 0) + 1)
      const driver = driversPerRace[index].find((d) => d.driver_number === winner.driver_number)
      if (driver) {
        winsByTeam.set(driver.team_name, (winsByTeam.get(driver.team_name) ?? 0) + 1)
      }
    })

    driverStandings.value = driverStandings.value.map((entry) => ({
      ...entry,
      wins: winsByDriver.get(entry.driver_number) ?? 0,
    }))
    teamStandings.value = teamStandings.value.map((entry) => ({
      ...entry,
      wins: winsByTeam.get(entry.team_name) ?? 0,
    }))
    winsComputed.value = true
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
    computeSeasonWins,
  }
})
