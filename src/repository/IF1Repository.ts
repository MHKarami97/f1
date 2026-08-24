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

export interface IF1Repository {
  getDrivers(sessionKey: number, ttlMs?: number): Promise<Driver[]>
  getSessions(year: number, ttlMs?: number): Promise<Session[]>
  getMeetings(year: number, ttlMs?: number): Promise<Meeting[]>
  getSessionByKey(sessionKey: number, ttlMs?: number): Promise<Session | null>
  getRaceResults(sessionKey: number, ttlMs?: number): Promise<RaceResult[]>
  getStartingGrid(sessionKey: number, ttlMs?: number): Promise<StartingGridEntry[]>
  getPitStops(sessionKey: number, ttlMs?: number): Promise<PitStop[]>
  getStints(sessionKey: number, ttlMs?: number): Promise<Stint[]>
  getWeather(sessionKey: number, ttlMs?: number): Promise<WeatherData[]>
  getRaceControl(sessionKey: number, ttlMs?: number): Promise<RaceControlEvent[]>
  getLaps(sessionKey: number, driverNumber?: number): Promise<LapData[]>
  getIntervals(sessionKey: number): Promise<Interval[]>
  getPositions(sessionKey: number): Promise<Position[]>
  getDriverChampionship(sessionKey: number): Promise<DriverChampionshipRaw[]>
  getTeamChampionship(sessionKey: number): Promise<TeamChampionshipRaw[]>
}