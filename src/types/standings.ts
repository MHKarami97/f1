export interface DriverChampionshipRaw {
  session_key: number
  meeting_key: number
  driver_number: number
  points_current: number
  points_start: number
  position_current: number
  position_start: number
}

export interface TeamChampionshipRaw {
  session_key: number
  meeting_key: number
  team_name: string
  points_current: number
  points_start: number
  position_current: number
  position_start: number
}

export interface DriverChampionshipEntry {
  position: number
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  headshot_url: string | null
  points: number
  wins: number | null
}

export interface TeamChampionshipEntry {
  position: number
  team_name: string
  team_colour: string
  points: number
  wins: number | null
}
