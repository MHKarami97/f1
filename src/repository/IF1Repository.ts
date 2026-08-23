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

/**
 * Repository Pattern: the only contract the UI layer is allowed to depend on.
 * No component or store may import axios or reference OpenF1 URLs directly;
 * they talk to this interface, which OpenF1Repository fulfils.
 */
export interface IF1Repository {
  getDrivers(sessionKey: number): Promise<Driver[]>
  getSessions(year: number): Promise<Session[]>
  getMeetings(year: number): Promise<Meeting[]>
  getSessionByKey(sessionKey: number): Promise<Session | null>
  getRaceResults(sessionKey: number): Promise<RaceResult[]>
  getStartingGrid(sessionKey: number): Promise<StartingGridEntry[]>
  getPitStops(sessionKey: number): Promise<PitStop[]>
  getStints(sessionKey: number): Promise<Stint[]>
  getWeather(sessionKey: number): Promise<WeatherData[]>
  getRaceControl(sessionKey: number): Promise<RaceControlEvent[]>
  getLaps(sessionKey: number, driverNumber?: number): Promise<LapData[]>
  getIntervals(sessionKey: number): Promise<Interval[]>
  getPositions(sessionKey: number): Promise<Position[]>
  getDriverChampionship(sessionKey: number): Promise<DriverChampionshipRaw[]>
  getTeamChampionship(sessionKey: number): Promise<TeamChampionshipRaw[]>
}
