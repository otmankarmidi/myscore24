import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface DbLeague {
  id: number
  name: string
  slug: string
  country_id?: number
  logo_url: string
  type?: string
}

export interface DbTeam {
  id: number
  name: string
  short_name?: string
  code?: string
  logo_url: string
  venue_name?: string
  venue_city?: string
  venue_capacity?: number
}

export interface DbMatch {
  id: number
  league_id: number
  home_team_id: number
  away_team_id: number
  match_date: string
  status: string
  elapsed: number
  home_score: number
  away_score: number
  venue?: string
  round?: string
}

export interface DbMatchEvent {
  id: number
  match_id: number
  minute: number
  extra_minute?: number
  team_id?: number
  player_name: string
  type: string
  detail: string
}

export interface DbMatchStats {
  id: number
  match_id: number
  home_possession: number
  away_possession: number
  home_shots: number
  away_shots: number
  home_shots_on_target: number
  away_shots_on_target: number
  home_corners: number
  away_corners: number
  home_fouls: number
  away_fouls: number
  home_yellow_cards: number
  away_yellow_cards: number
  home_red_cards: number
  away_red_cards: number
}

export interface DbStanding {
  id: number
  league_id: number
  team_id: number
  rank: number
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  form?: string
}

export interface DbIngestionLog {
  id: number
  source: string
  status: string
  matches_processed: number
  message: string
  execution_time_ms: number
  created_at: string
}

class InMemoryFootballDb {
  public leagues: Map<number, DbLeague> = new Map()
  public teams: Map<number, DbTeam> = new Map()
  public matches: Map<number, DbMatch> = new Map()
  public matchEvents: Map<number, DbMatchEvent[]> = new Map()
  public matchStats: Map<number, DbMatchStats> = new Map()
  public standings: Map<string, DbStanding> = new Map()
  public ingestionLogs: DbIngestionLog[] = []

  constructor() {
    this.seedDefaultData()
  }

  private seedDefaultData() {
    this.ingestionLogs.push({
      id: 1,
      source: 'Internal Local DB Store',
      status: 'SUCCESS',
      matches_processed: 0,
      message: 'System initialized. Ready for real live data ingestion.',
      execution_time_ms: 10,
      created_at: new Date().toISOString()
    })
  }
}

export const localDb = new InMemoryFootballDb()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabaseClient: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null
