export type AlertType = 'goal' | 'penalty' | 'red_card' | 'yellow_card' | 'match_started' | 'half_time' | 'full_time'

export interface MatchLiveState {
  matchId: string
  homeScore: number
  awayScore: number
  status: string
  minute: number
  redCardsHome: number
  redCardsAway: number
  halftimeHome?: number | null
  halftimeAway?: number | null
  penaltyHome?: number | null
  penaltyAway?: number | null
  lastUpdatedAt: string
}

export interface MatchAlert {
  id: string
  eventId: string
  matchId: string
  matchSlug: string
  type: AlertType
  title: string
  message: string
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  homeScore: number
  awayScore: number
  penaltyHome?: number
  penaltyAway?: number
  scorerName?: string
  goalType?: 'normal' | 'penalty' | 'own_goal'
  minute?: number
  teamId?: string
  team?: 'home' | 'away'
  playerId?: string
  createdAt: string
  priority: 'HIGH' | 'NORMAL'
  source: 'api-football' | 'manual' | 'system'
}
