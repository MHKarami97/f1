import { ref, onMounted, onUnmounted } from 'vue'
import { OpenF1Repository } from '@/repository'
import { createPollingStrategy } from '@/services'
import type { PollingStrategy } from '@/services'
import type { RaceResult, StartingGridEntry, PitStop, WeatherData, RaceControlEvent, Driver } from '@/types'

const repo = new OpenF1Repository()

/**
 * Some OpenF1 endpoints (race_control in particular) can return a bare 404
 * instead of an empty array for sessions where that specific data category
 * was never recorded. Grouping every endpoint under one Promise.all() meant
 * a single such 404 failed the whole page even when results/grid/weather
 * had loaded fine. Wrapping each optional endpoint like this keeps only the
 * affected section empty instead of breaking the entire race detail view.
 */
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

  async function fetchStaticData(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const [r, g, p, w, rc, d] = await Promise.all([
        safeFetch(repo.getRaceResults(sessionKey)),
        safeFetch(repo.getStartingGrid(sessionKey)),
        safeFetch(repo.getPitStops(sessionKey)),
        safeFetch(repo.getWeather(sessionKey)),
        safeFetch(repo.getRaceControl(sessionKey)),
        repo.getDrivers(sessionKey),
      ])
      results.value = r
      grid.value = g
      pitStops.value = p
      weather.value = w
      raceControl.value = rc
      drivers.value = d
    } catch {
      // Only the driver roster fetch is treated as fatal here — every other
      // section already degrades gracefully to an empty list above.
      error.value = 'جزئیات مسابقه در دسترس نیست'
    } finally {
      isLoading.value = false
    }
  }

  async function refreshLiveSlice(): Promise<void> {
    try {
      const [r, rc] = await Promise.all([safeFetch(repo.getRaceResults(sessionKey)), safeFetch(repo.getRaceControl(sessionKey))])
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