import { ref, onMounted, onUnmounted } from 'vue'
import { OpenF1Repository } from '@/repository'
import { createPollingStrategy } from '@/services'
import { CACHE_TTL } from '@/services/cache'
import type { PollingStrategy } from '@/services'
import type { RaceResult, StartingGridEntry, PitStop, WeatherData, RaceControlEvent, Driver } from '@/types'

const repo = new OpenF1Repository()

async function safeFetch<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise
  } catch {
    return []
  }
}

export function useRaceDetail(sessionKey: number, isLive = false) {
  const results = ref<RaceResult[]>([])
  const grid = ref<StartingGridEntry[]>([])
  const pitStops = ref<PitStop[]>([])
  const weather = ref<WeatherData[]>([])
  const raceControl = ref<RaceControlEvent[]>([])
  const drivers = ref<Driver[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let strategy: PollingStrategy | null = null

  // A session still in progress must never be cached long-term — its
  // results/race-control change until the chequered flag. A finished race
  // is immutable and safe to keep for 30 days.
  const staticTtl = isLive ? CACHE_TTL.LIVE : CACHE_TTL.HISTORICAL

  async function fetchStaticData(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const [r, g, p, w, rc, d] = await Promise.all([
        safeFetch(repo.getRaceResults(sessionKey, staticTtl)),
        safeFetch(repo.getStartingGrid(sessionKey, staticTtl)),
        safeFetch(repo.getPitStops(sessionKey, staticTtl)),
        safeFetch(repo.getWeather(sessionKey, staticTtl)),
        safeFetch(repo.getRaceControl(sessionKey, staticTtl)),
        repo.getDrivers(sessionKey, staticTtl),
      ])
      results.value = r
      grid.value = g
      pitStops.value = p
      weather.value = w
      raceControl.value = rc
      drivers.value = d
    } catch {
      error.value = 'جزئیات مسابقه در دسترس نیست'
    } finally {
      isLoading.value = false
    }
  }

  async function refreshLiveSlice(): Promise<void> {
    try {
      const [r, rc] = await Promise.all([
        safeFetch(repo.getRaceResults(sessionKey, CACHE_TTL.LIVE)),
        safeFetch(repo.getRaceControl(sessionKey, CACHE_TTL.LIVE)),
      ])
      results.value = r
      raceControl.value = rc
    } catch {
      // Live refresh failures are silent by design.
    }
  }

  onMounted(async () => {
    await fetchStaticData()
    strategy = createPollingStrategy(isLive)
    if (isLive) strategy.start(refreshLiveSlice)
  })

  onUnmounted(() => strategy?.stop())

  return { results, grid, pitStops, weather, raceControl, drivers, isLoading, error }
}