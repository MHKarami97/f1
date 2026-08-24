import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OpenF1Repository } from '@/repository'
import { mapWithConcurrency } from '@/services'
import { useSessionsStore } from './sessionsStore'
import { getSeasonDriverMap } from '@/composables/useDriverLookup'
import type { DriverChampionshipEntry, TeamChampionshipEntry } from '@/types'

const repo = new OpenF1Repository()
const MAX_RACES_FOR_WIN_COUNT = 26
const WIN_COUNT_CONCURRENCY = 3

export const useStandingsStore = defineStore('standings', () => {
  const driverStandings = ref<DriverChampionshipEntry[]>([])
  const teamStandings = ref<TeamChampionshipEntry[]>([])
  const isLoadingDrivers = ref(false)
  const isLoadingTeams = ref(false)
  const driverError = ref<string | null>(null)
  const teamError = ref<string | null>(null)
  const winsComputed = ref(false)
  let winsByDriverCache: Map<number, number> | null = null
  let winsByTeamCache: Map<string, number> | null = null

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

      const [raw, driverMap] = await Promise.all([
        repo.getDriverChampionship(raceSession.session_key),
        getSeasonDriverMap(),
      ])

      driverStandings.value = raw
        .map((entry) => {
          const driver = driverMap.get(entry.driver_number)
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
            wins: winsByDriverCache?.get(entry.driver_number) ?? null,
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

      const [raw, driverMap] = await Promise.all([
        repo.getTeamChampionship(raceSession.session_key),
        getSeasonDriverMap(),
      ])
      const colourByTeam = new Map<string, string>()
      driverMap.forEach((driver) => colourByTeam.set(driver.team_name, driver.team_colour))

      teamStandings.value = raw
        .map((entry) => ({
          position: entry.position_current,
          team_name: entry.team_name,
          team_colour: colourByTeam.get(entry.team_name) ?? '666666',
          points: entry.points_current,
          wins: winsByTeamCache?.get(entry.team_name) ?? null,
        } satisfies TeamChampionshipEntry))
        .sort((a, b) => a.position - b.position)
    } catch {
      teamError.value = 'داده جدول تیم‌ها در دسترس نیست'
    } finally {
      isLoadingTeams.value = false
    }
  }

  /**
   * Scans every finished race of the season and counts P1 finishes per
   * driver/team. Each race is fetched independently — OpenF1's free-tier
   * rate limit means some of these requests (up to 2 x 26 races) can still
   * fail after every retry, and previously a single failure threw the whole
   * scan away silently, leaving wins stuck at 0 forever. Now a failed race
   * is logged to the console (check DevTools) and skipped instead.
   */
  async function computeSeasonWins(): Promise<void> {
    if (winsComputed.value) return
    const sessionsStore = useSessionsStore()
    const finishedRaces = sessionsStore.raceSessions
      .filter((s) => new Date(s.date_end) < new Date())
      .slice(0, MAX_RACES_FOR_WIN_COUNT)

    if (finishedRaces.length === 0) return

    console.info(`[computeSeasonWins] scanning ${finishedRaces.length} finished races`)

    const winsByDriver = new Map<number, number>()
    const winsByTeam = new Map<string, number>()

    await mapWithConcurrency(finishedRaces, WIN_COUNT_CONCURRENCY, async (race) => {
      try {
        const [results, raceDrivers] = await Promise.all([
          repo.getRaceResults(race.session_key),
          repo.getDrivers(race.session_key),
        ])
        const winner = results.find((r) => r.position === 1)
        if (!winner) return
        winsByDriver.set(winner.driver_number, (winsByDriver.get(winner.driver_number) ?? 0) + 1)
        const driver = raceDrivers.find((d) => d.driver_number === winner.driver_number)
        if (driver) {
          winsByTeam.set(driver.team_name, (winsByTeam.get(driver.team_name) ?? 0) + 1)
        }
      } catch (err) {
        console.error(`[computeSeasonWins] failed to fetch session ${race.session_key}`, err)
      }
    })

    winsByDriverCache = winsByDriver
    winsByTeamCache = winsByTeam

    driverStandings.value = driverStandings.value.map((entry) => ({
      ...entry,
      wins: winsByDriver.get(entry.driver_number) ?? null,
    }))
    teamStandings.value = teamStandings.value.map((entry) => ({
      ...entry,
      wins: winsByTeam.get(entry.team_name) ?? null,
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