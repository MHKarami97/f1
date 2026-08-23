export interface DriverChampionshipEntry {
  position: number
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  headshot_url: string | null
  country_code: string
  points: number
  wins: number
}

export interface TeamChampionshipEntry {
  position: number
  team_name: string
  team_colour: string
  points: number
  wins: number
}
