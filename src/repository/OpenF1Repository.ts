import { httpClient } from '@/services/httpClient'
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
  DriverChampionshipEntry,
  TeamChampionshipEntry,
} from '@/types'

export class OpenF1Repository implements IF1Repository {
  async getDrivers(sessionKey: number): Promise<Driver[]> {
    const { data } = await httpClient.get<Driver[]>('/drivers', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getSessions(year: number): Promise<Session[]> {
    const { data } = await httpClient.get<Session[]>('/sessions', {
      params: { year },
    })
    return data
  }

  async getMeetings(year: number): Promise<Meeting[]> {
    const { data } = await httpClient.get<Meeting[]>('/meetings', {
      params: { year },
    })
    return data
  }

  async getActiveSession(): Promise<Session | null> {
    const { data } = await httpClient.get<Session[]>('/sessions', {
      params: { session_type: 'Race' },
    })
    const now = new Date()
    const active = data.find((s) => {
      const start = new Date(s.date_start)
      const end = new Date(s.date_end)
      return now >= start && now <= end && s.status === 'Active'
    })
    return active ?? null
  }

  async getRaceResults(sessionKey: number): Promise<RaceResult[]> {
    const { data } = await httpClient.get<RaceResult[]>('/session_result', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getStartingGrid(sessionKey: number): Promise<StartingGridEntry[]> {
    const { data } = await httpClient.get<StartingGridEntry[]>('/starting_grid', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getPitStops(sessionKey: number): Promise<PitStop[]> {
    const { data } = await httpClient.get<PitStop[]>('/pit', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getStints(sessionKey: number): Promise<Stint[]> {
    const { data } = await httpClient.get<Stint[]>('/stints', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getWeather(sessionKey: number): Promise<WeatherData[]> {
    const { data } = await httpClient.get<WeatherData[]>('/weather', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getRaceControl(sessionKey: number): Promise<RaceControlEvent[]> {
    const { data } = await httpClient.get<RaceControlEvent[]>('/race_control', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getLaps(sessionKey: number, driverNumber?: number): Promise<LapData[]> {
    const { data } = await httpClient.get<LapData[]>('/laps', {
      params: {
        session_key: sessionKey,
        ...(driverNumber !== undefined ? { driver_number: driverNumber } : {}),
      },
    })
    return data
  }

  async getIntervals(sessionKey: number): Promise<Interval[]> {
    const { data } = await httpClient.get<Interval[]>('/intervals', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getPositions(sessionKey: number): Promise<Position[]> {
    const { data } = await httpClient.get<Position[]>('/position', {
      params: { session_key: sessionKey },
    })
    return data
  }

  async getDriverChampionship(year: number): Promise<DriverChampionshipEntry[]> {
    const { data } = await httpClient.get<DriverChampionshipEntry[]>('/championship_drivers', {
      params: { year },
    })
    return data
  }

  async getTeamChampionship(year: number): Promise<TeamChampionshipEntry[]> {
    const { data } = await httpClient.get<TeamChampionshipEntry[]>('/championship_teams', {
      params: { year },
    })
    return data
  }
}
