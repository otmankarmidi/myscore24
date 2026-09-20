import { Team } from './team'
import { League } from './league'

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'half_time'
  | 'full_time'
  | 'extra_time'
  | 'penalties'
  | 'postponed'
  | 'cancelled'
  | 'suspended'

export interface MatchScore {
  home: number | null
  away: number | null
  halftime?: { home: number | null; away: number | null }
  extratime?: { home: number | null; away: number | null }
  penalty?: { home: number | null; away: number | null }
}

export interface MatchEvent {
  id: string
  minute: number
  extraMinute?: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'second_yellow' | 'substitution' | 'var' | 'penalty_scored' | 'penalty_missed'
  team: 'home' | 'away'
  playerName: string
  playerNameSecondary?: string
  detail?: string
}

export interface MatchStatistics {
  possession: { home: number; away: number }
  shots: { home: number; away: number }
  shotsOnTarget: { home: number; away: number }
  corners: { home: number; away: number }
  fouls: { home: number; away: number }
  yellowCards: { home: number; away: number }
  redCards: { home: number; away: number }
  offsides: { home: number; away: number }
  xG?: { home: number; away: number }
  passes?: { home: number; away: number }
  passAccuracy?: { home: number; away: number }
}

export interface LineupPlayer {
  id: string
  name: string
  number: number
  position: string
  positionX: number // 0-100 % on pitch width
  positionY: number // 0-100 % on pitch height (0=top/away goal, 100=bottom/home goal)
  rating?: number
  yellowCard?: boolean
  redCard?: boolean
  substituted?: boolean
  substituteMinute?: number
}

export interface Lineup {
  home: {
    formation: string
    startingXI: LineupPlayer[]
    substitutes: LineupPlayer[]
  }
  away: {
    formation: string
    startingXI: LineupPlayer[]
    substitutes: LineupPlayer[]
  }
}

export interface Match {
  id: string
  slug: string
  league: League
  homeTeam: Team
  awayTeam: Team
  score: MatchScore
  status: MatchStatus
  minute?: number
  kickoff: string
  venue?: string
  referee?: string
  round?: string
  events?: MatchEvent[]
  statistics?: MatchStatistics
  lineup?: Lineup
  isFavorited?: boolean
}
