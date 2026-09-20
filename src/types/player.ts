import { Team } from './team'

export interface PlayerStats {
  appearances: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  minutesPlayed: number
  rating?: number
  cleanSheets?: number
  saves?: number
  passAccuracy?: number
  dribbles?: number
  shotsOnTarget?: number
}

export interface Player {
  id: string
  slug: string
  name: string
  firstName: string
  lastName: string
  photo?: string
  nationality: string
  nationalityFlag?: string
  dateOfBirth: string
  age: number
  height?: number
  weight?: number
  position: string
  number?: number
  team?: Team
  marketValue?: string
  stats?: PlayerStats
  seasonStats?: PlayerStats
}
