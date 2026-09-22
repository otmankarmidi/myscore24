import { Team } from './team'

export interface PlayerStats {
  appearances: number
  matches?: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  minutesPlayed: number
  minutes?: number
  rating?: number
  cleanSheets?: number
  saves?: number
  passAccuracy?: number
  dribbles?: number
  shotsOnTarget?: number
  shotsTotal?: number
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
  countryFlag?: string
  dateOfBirth: string
  age: number
  height?: number
  weight?: number
  position: string
  number?: number
  team?: Team
  teamSlug?: string
  teamName?: string
  teamLogo?: string
  preferredFoot?: string
  marketValue?: string
  stats?: PlayerStats
  seasonStats?: PlayerStats
  recentMatches?: Array<{
    matchId: string
    matchSlug: string
    opponentName: string
    opponentLogo?: string
    isHome?: boolean
    score?: string
    rating?: number
    ratingIsLive?: boolean
    date: string
  }>
}
