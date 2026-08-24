import { httpClient } from '@/services/httpClient'
import { withCache, CACHE_TTL } from '@/services/cache'
import type { IF1Repository } from './IF1Repository'
import type {
  Driver,
  Session,
  Meeting,
  RaceResult,
  StartingGridEntry,
  PitStop,
  Stint,
  WeatherData,
  RaceControlEvent,
  LapData,
  Interval,
  Position,
  DriverChampionshipRaw,
  TeamChampionshipRaw,
} from '@/types'

export class OpenF1Repository implements IF1Repository {
  async getDrivers(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<Driver[]> {
    return withCache(`drivers:${sessionKey}`, async () => {
      const { data } = await httpClient.get<Driver[]>('/drivers', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  async getSessions(year: number, ttlMs: number = CACHE_TTL.CALENDAR_MAX): Promise<Session[]> {
    return withCache(`sessions:${year}`, async () => {
      const { data } = await httpClient.get<Session[]>('/sessions', { params: { year } })
      return data
    }, ttlMs)
  }

  async getMeetings(year: number, ttlMs: number = CACHE_TTL.CALENDAR_MAX): Promise<Meeting[]> {
    return withCache(`meetings:${year}`, async () => {
      const { data } = await httpClient.get<Meeting[]>('/meetings', { params: { year } })
      return data
    }, ttlMs)
  }

  async getSessionByKey(sessionKey: number, ttlMs: number = CACHE_TTL.CALENDAR_MAX): Promise<Session | null> {
    return withCache(`session:${sessionKey}`, async () => {
      const { data } = await httpClient.get<Session[]>('/sessions', { params: { session_key: sessionKey } })
      return data[0] ?? null
    }, ttlMs)
  }

  async getRaceResults(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<RaceResult[]> {
    return withCache(`results:${sessionKey}`, async () => {
      const { data } = await httpClient.get<RaceResult[]>('/session_result', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  async getStartingGrid(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<StartingGridEntry[]> {
    return withCache(`grid:${sessionKey}`, async () => {
      const { data } = await httpClient.get<StartingGridEntry[]>('/starting_grid', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  async getPitStops(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<PitStop[]> {
    return withCache(`pit:${sessionKey}`, async () => {
      const { data } = await httpClient.get<PitStop[]>('/pit', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  async getStints(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<Stint[]> {
    return withCache(`stints:${sessionKey}`, async () => {
      const { data } = await httpClient.get<Stint[]>('/stints', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  async getWeather(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<WeatherData[]> {
    return withCache(`weather:${sessionKey}`, async () => {
      const { data } = await httpClient.get<WeatherData[]>('/weather', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  async getRaceControl(sessionKey: number, ttlMs: number = CACHE_TTL.HISTORICAL): Promise<RaceControlEvent[]> {
    return withCache(`race_control:${sessionKey}`, async () => {
      const { data } = await httpClient.get<RaceControlEvent[]>('/race_control', { params: { session_key: sessionKey } })
      return data
    }, ttlMs)
  }

  // Live telemetry endpoints require a paid OpenF1 plan and are only
  // called while REALTIME_DATA_ENABLED is on — never cached, always fresh.
  async getLaps(sessionKey: number, driverNumber?: number): Promise<LapData[]> {
    const { data } = await httpClient.get<LapData[]>('/laps', {
      params: { session_key: sessionKey, ...(driverNumber !== undefined ? { driver_number: driverNumber } : {}) },
    })
    return data
  }

  async getIntervals(sessionKey: number): Promise<Interval[]> {
    const { data } = await httpClient.get<Interval[]>('/intervals', { params: { session_key: sessionKey } })
    return data
  }

  async getPositions(sessionKey: number): Promise<Position[]> {
    const { data } = await httpClient.get<Position[]>('/position', { params: { session_key: sessionKey } })
    return data
  }

  // Always keyed by an already-finished race's session_key, so this is an
  // immutable historical snapshot — always safe to cache for 30 days.
  async getDriverChampionship(sessionKey: number): Promise<DriverChampionshipRaw[]> {
    return withCache(`championship_drivers:${sessionKey}`, async () => {
      const { data } = await httpClient.get<DriverChampionshipRaw[]>('/championship_drivers', { params: { session_key: sessionKey } })
      return data
    }, CACHE_TTL.HISTORICAL)
  }

  async getTeamChampionship(sessionKey: number): Promise<TeamChampionshipRaw[]> {
    return withCache(`championship_teams:${sessionKey}`, async () => {
      const { data } = await httpClient.get<TeamChampionshipRaw[]>('/championship_teams', { params: { session_key: sessionKey } })
      return data
    }, CACHE_TTL.HISTORICAL)
  }
}