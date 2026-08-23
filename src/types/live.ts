export interface LapData {
  session_key: number
  meeting_key: number
  driver_number: number
  date_start: string
  lap_number: number
  lap_duration: number | null
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  i1_speed: number | null
  i2_speed: number | null
  st_speed: number | null
  is_pit_out_lap: boolean
  segments_sector_1: number[] | null
  segments_sector_2: number[] | null
  segments_sector_3: number[] | null
}

export interface Interval {
  session_key: number
  meeting_key: number
  driver_number: number
  date: string
  gap_to_leader: number | null
  interval: number | null
}

export interface Position {
  session_key: number
  meeting_key: number
  driver_number: number
  date: string
  position: number
}
