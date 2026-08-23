import { ref, onMounted } from 'vue'
import { OpenF1Repository } from '@/repository/OpenF1Repository'
import type { RaceResult, StartingGridEntry, PitStop, WeatherData, RaceControlEvent, Driver } from '@/types'

const repo = new OpenF1Repository()

export function useRaceDetail(sessionKey: number) {
  const results = ref<RaceResult[]>([])
  const grid = ref<StartingGridEntry[]>([])
  const pitStops = ref<PitStop[]>([])
  const weather = ref<WeatherData[]>([])
  const raceControl = ref<RaceControlEvent[]>([])
  const drivers = ref<Driver[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetch(): Promise<void> {
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

  onMounted(() => void fetch())

  return { results, grid, pitStops, weather, raceControl, drivers, isLoading, error }
}
