export interface IngestionSourceStatus {
  name: string
  isPermitted: boolean
  accessStatus: 'ACTIVE' | 'BLOCKED_BY_CLOUDFLARE' | 'DISALLOWED_BY_ROBOTS' | 'RATE_LIMITED'
  lastCheckTime: string
  details: string
}

export interface IngestionMatch {
  externalId: string | number
  leagueId: number
  leagueName: string
  homeTeamId: number
  homeTeamName: string
  homeTeamLogo: string
  awayTeamId: number
  awayTeamName: string
  awayTeamLogo: string
  matchDate: string
  status: 'NS' | '1H' | 'HT' | '2H' | 'FT' | 'AET' | 'PEN' | 'CANC' | 'POSTP'
  elapsed: number
  homeScore: number
  awayScore: number
  venue?: string
  round?: string
}

export interface IngestionStanding {
  leagueId: number
  teamId: number
  teamName: string
  teamLogo: string
  rank: number
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  form?: string
}

export interface IngestionResult {
  sourceName: string
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'BLOCKED_BY_CLOUDFLARE'
  matchesProcessed: number
  message: string
  executionTimeMs: number
}

export interface IngestionSourceAdapter {
  name: string
  checkPermitted(): Promise<IngestionSourceStatus>
  fetchTodayMatches(): Promise<IngestionMatch[]>
  fetchStandings?(leagueId: number): Promise<IngestionStanding[]>
}
