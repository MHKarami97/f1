import { ref, onMounted, onUnmounted } from 'vue'
import { OpenF1Repository } from '@/repository'
import { createPollingStrategy } from '@/services'
import type { PollingStrategy } from '@/services'
import type { RaceResult, StartingGridEntry, PitStop, WeatherData, RaceControlEvent, Driver } from '@/types'

const repo = new OpenF1Repository()

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
        repo.getRaceResults(sessionKey),
        repo.getStartingGrid(sessionKey),
        repo.getPitStops(sessionKey),
        repo.getWeather(sessionKey),
        repo.getRaceControl(sessionKey),
        repo.getDrivers(sessionKey),
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
      const [r, rc] = await Promise.all([repo.getRaceResults(sessionKey), repo.getRaceControl(sessionKey)])
      results.value = r
      raceControl.value = rc
    } catch {
      // Live refresh failures are silent by design: the last known good
      // state stays on screen instead of flashing an error every 5s.
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
