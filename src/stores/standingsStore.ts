import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository'
import { mapWithConcurrency } from '@/services'
import { useSessionsStore } from './sessionsStore'
import type { DriverChampionshipEntry, TeamChampionshipEntry, Driver } from '@/types'

const repo = new OpenF1Repository()
// Counting season wins precisely means scanning every finished race's
// session_result for position === 1. Doing this for too many races at
// once, even with limited concurrency, is still costly, so we cap how far
// back we look.
const MAX_RACES_FOR_WIN_COUNT = 26
// OpenF1's free tier 429s hard once too many requests land in the same
// window. Capping in-flight requests to 3 keeps computeSeasonWins() under
// that limit in practice, at the cost of taking a bit longer to resolve.
const WIN_COUNT_CONCURRENCY = 3

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
      teamError.value = 'داده جدول تیم‌ها در دسترس نیست'
    } finally {
      isLoadingTeams.value = false
    }
  }

  /**
   * Lazily back-fills the `wins` counter by scanning session_result for every
   * finished race of the season and counting P1 finishes per driver/team.
   * Requests are throttled (see WIN_COUNT_CONCURRENCY) instead of fired all
   * at once, since OpenF1's free tier 429s a burst of 20-50 simultaneous
   * requests -- which used to make this fail silently and leave wins at 0.
   */
  async function computeSeasonWins(): Promise<void> {
    if (winsComputed.value) return
    const sessionsStore = useSessionsStore()
    const finishedRaces = sessionsStore.raceSessions
      .filter((s) => new Date(s.date_end) < new Date())
      .slice(0, MAX_RACES_FOR_WIN_COUNT)

    if (finishedRaces.length === 0) return

    try {
      const winsByDriver = new Map<number, number>()
      const winsByTeam = new Map<string, number>()

      const resultsPerRace = await mapWithConcurrency(finishedRaces, WIN_COUNT_CONCURRENCY, (race) =>
        repo.getRaceResults(race.session_key),
      )
      const driversPerRace = await mapWithConcurrency(finishedRaces, WIN_COUNT_CONCURRENCY, (race) =>
        repo.getDrivers(race.session_key),
      )

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
    } catch {
      // Leave wins at 0 rather than break the standings page; winsComputed
      // stays false so a page reload will retry.
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
    computeSeasonWins,
  }
})
