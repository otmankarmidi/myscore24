import { Team } from './team'

export type StandingTier = 'champions_league' | 'europa_league' | 'conference_league' | 'relegation' | 'promotion' | 'normal'

export interface Standing {
  position: number
  rank?: number
  team: Team
  teamId?: string
  teamName?: string
  teamSlug?: string
  teamLogo?: string
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
  home?: {
    played?: number
    won?: number
    drawn?: number
    lost?: number
    goalsFor?: number
    goalsAgainst?: number
    points?: number
  }
  away?: {
    played?: number
    won?: number
    drawn?: number
    lost?: number
    goalsFor?: number
    goalsAgainst?: number
    points?: number
  }
}

export interface TopScorer {
  playerId: string
  playerSlug: string
  playerName: string
  photo?: string
  teamId?: string
  teamSlug: string
  teamName: string
  teamLogo?: string
  matches: number
  goals: number
  assists: number
  penalties: number
}

export interface GroupedStanding {
  groupName: string
  standings: Standing[]
}

export interface LeagueStandings {
  leagueId: string
  season: string
  standings: Standing[]
  groups?: GroupedStanding[]
}

export type LeagueStanding = Standing
