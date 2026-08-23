export type SessionStatus = 'Inactive' | 'Started' | 'Active' | 'Finished'
export type SessionType = 'Race' | 'Qualifying' | 'Sprint' | 'Practice'

export interface Session {
  session_key: number
  session_name: string
  session_type: SessionType
  status: SessionStatus
  date_start: string
  date_end: string
  gmt_offset: string
  location: string
  country_name: string
  country_code: string
  circuit_key: number
  circuit_short_name: string
  meeting_key: number
  year: number
}

export interface Meeting {
  meeting_key: number
  meeting_name: string
  meeting_official_name: string
  location: string
  country_key: number
  country_code: string
  country_name: string
  circuit_key: number
  circuit_short_name: string
  date_start: string
  gmt_offset: string
  year: number
}

export interface RaceResult {
  session_key: number
  meeting_key: number
  driver_number: number
  position: number
  date: string
}

export interface StartingGridEntry {
  session_key: number
  meeting_key: number
  driver_number: number
  position: number
}

export interface PitStop {
  session_key: number
  meeting_key: number
  driver_number: number
  date: string
  lap_number: number
  pit_duration: number | null
}

export interface Stint {
  session_key: number
  meeting_key: number
  driver_number: number
  stint_number: number
  lap_start: number
  lap_end: number
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN'
  tyre_age_at_start: number
}

export interface WeatherData {
  session_key: number
  meeting_key: number
  date: string
  air_temperature: number
  humidity: number
  pressure: number
  rainfall: number
  track_temperature: number
  wind_direction: number
  wind_speed: number
}

export interface RaceControlEvent {
  session_key: number
  meeting_key: number
  date: string
  driver_number: number | null
  lap_number: number | null
  category: string
  flag: string | null
  message: string
  scope: string
  sector: number | null
}
