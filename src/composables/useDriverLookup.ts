import { OpenF1Repository } from '@/repository'
import { useSessionsStore } from '@/stores'
import type { Driver } from '@/types'

const repo = new OpenF1Repository()
const MAX_RACES_FOR_DRIVER_LOOKUP = 5

let cachedMap: Map<number, Driver> | null = null
let cachedPromise: Promise<Map<number, Driver>> | null = null

/**
 * Some drivers (reserve/substitute appearances, single-race absences)
 * don't show up in the very latest race's /drivers roster even though they
 * still have a standings entry. Merging driver info across the last few
 * finished races (most recent appearance wins on conflict) makes
 * headshots/names/profile lookups resolve correctly for those drivers
 * instead of showing blank fields or "driver not found".
 */
export async function getSeasonDriverMap(forceRefresh = false): Promise<Map<number, Driver>> {
  if (cachedMap && !forceRefresh) return cachedMap
  if (cachedPromise && !forceRefresh) return cachedPromise

  const sessionsStore = useSessionsStore()
  if (sessionsStore.sessions.length === 0) await sessionsStore.fetchCalendar()

  const finishedRaces = sessionsStore.raceSessions
    .filter((s) => new Date(s.date_end) < new Date())
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    .slice(-MAX_RACES_FOR_DRIVER_LOOKUP)

  cachedPromise = (async () => {
    const map = new Map<number, Driver>()
    for (const race of finishedRaces) {
      const raceDrivers = await repo.getDrivers(race.session_key)
      for (const driver of raceDrivers) {
        map.set(driver.driver_number, driver)
      }
    }
    cachedMap = map
    return map
  })()

  return cachedPromise
}