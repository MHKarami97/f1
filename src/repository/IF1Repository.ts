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
  DriverChampionshipEntry,
  TeamChampionshipEntry,
} from '@/types'

export interface IF1Repository {
  getDrivers(sessionKey: number): Promise<Driver[]>
  getSessions(year: number): Promise<Session[]>
  getMeetings(year: number): Promise<Meeting[]>
  getActiveSession(): Promise<Session | null>
  getRaceResults(sessionKey: number): Promise<RaceResult[]>
  getStartingGrid(sessionKey: number): Promise<StartingGridEntry[]>
  getPitStops(sessionKey: number): Promise<PitStop[]>
  getStints(sessionKey: number): Promise<Stint[]>
  getWeather(sessionKey: number): Promise<WeatherData[]>
  getRaceControl(sessionKey: number): Promise<RaceControlEvent[]>
  getLaps(sessionKey: number, driverNumber?: number): Promise<LapData[]>
  getIntervals(sessionKey: number): Promise<Interval[]>
  getPositions(sessionKey: number): Promise<Position[]>
  getDriverChampionship(year: number): Promise<DriverChampionshipEntry[]>
  getTeamChampionship(year: number): Promise<TeamChampionshipEntry[]>
}
