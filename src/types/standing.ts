import { Team } from './team'

export type StandingTier = 'champions_league' | 'europa_league' | 'conference_league' | 'relegation' | 'promotion' | 'normal'

export interface Standing {
  position: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form?: string[]
  tier?: StandingTier
}

export interface LeagueStandings {
  leagueId: string
  season: string
  standings: Standing[]
}
