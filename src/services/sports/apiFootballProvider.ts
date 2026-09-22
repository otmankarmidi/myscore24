/**
 * Server-side API-Football Provider
 * ───────────────
 * Executes secure HTTP requests to API-Football (api-sports.io or RapidAPI).
 * Runs strictly on the server side (Node.js/Edge) inside Next.js Route Handlers.
 */

const API_KEY = process.env.FOOTBALL_API_KEY
const API_HOST = process.env.FOOTBALL_API_HOST || 'v3.football.api-sports.io'
const DEFAULT_TIMEZONE = 'Africa/Casablanca'

export interface ApiFootballEventRaw {
  time: { elapsed: number; extra?: number }
  team: { id: number; name: string; logo?: string }
  player: { id: number; name: string }
  assist?: { id?: number; name?: string }
  type: string
  detail: string
  comments?: string
}

export interface ApiFootballLineupPlayerRaw {
  player: {
    id: number
    name: string
    number: number
    pos: string
    grid?: string
  }
}

export interface ApiFootballLineupRaw {
  team: { id: number; name: string; logo?: string }
  coach?: { id?: number; name?: string; photo?: string }
  formation: string
  startXI: ApiFootballLineupPlayerRaw[]
  substitutes: ApiFootballLineupPlayerRaw[]
}

export interface ApiFootballStatItemRaw {
  type: string
  value: number | string | null
}

export interface ApiFootballTeamStatsRaw {
  team: { id: number; name: string; logo?: string }
  statistics: ApiFootballStatItemRaw[]
}

export interface ApiFootballFixtureRaw {
  fixture: {
    id: number
    referee?: string
    timezone?: string
    date: string
    timestamp: number
    venue?: { id?: number; name?: string; city?: string }
    status: {
      long?: string
      short?: string
      elapsed?: number
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo?: string
    flag?: string
    season?: number
    round?: string
  }
  teams: {
    home: { id: number; name: string; logo?: string; winner?: boolean }
    away: { id: number; name: string; logo?: string; winner?: boolean }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime?: { home: number | null; away: number | null }
    fulltime?: { home: number | null; away: number | null }
    extratime?: { home: number | null; away: number | null }
    penalty?: { home: number | null; away: number | null }
  }
  events?: ApiFootballEventRaw[]
  lineups?: ApiFootballLineupRaw[]
  statistics?: ApiFootballTeamStatsRaw[]
}

export interface ApiFootballResult<T> {
  data: T
  status: number
  resultsCount: number
  errors?: any
  remainingQuota?: string | null
  url: string
}

export const apiFootballProvider = {
  hasValidApiKey(): boolean {
    return Boolean(API_KEY && API_KEY.trim().length > 5 && API_KEY !== 'your_api_key_here')
  },

  getHeaders(): Record<string, string> {
    const isRapidApi = API_HOST.includes('rapidapi.com')
    return isRapidApi
      ? {
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': API_KEY!,
        }
      : {
          'x-apisports-key': API_KEY!,
        }
  },

  getUrl(endpoint: string, includeTimezone = false): string {
    const isRapidApi = API_HOST.includes('rapidapi.com')
    const finalEndpoint = includeTimezone
      ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}timezone=${encodeURIComponent(DEFAULT_TIMEZONE)}`
      : endpoint

    return isRapidApi
      ? `https://${API_HOST}/v3/${finalEndpoint}`
      : `https://${API_HOST}/${finalEndpoint}`
  },

  async getFixturesByDate(dateString: string): Promise<ApiFootballResult<ApiFootballFixtureRaw[]>> {
    const url = this.getUrl(`fixtures?date=${dateString}`, true)
    if (!this.hasValidApiKey()) {
      console.warn('[API-Football Diagnostic] No valid API Key configured.')
      return { data: [], status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
    }

    try {
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 30 },
      })

      const remainingQuota = res.headers.get('x-ratelimit-requests-remaining')
      const status = res.status
      const json = await res.json()

      console.log('=== [API-Football Diagnostics: TODAY] ===')
      console.log('URL:', url)
      console.log('HTTP Status:', status)
      console.log('Remaining Quota:', remainingQuota)
      console.log('Results Count:', json.results || 0)
      if (json.errors && Object.keys(json.errors).length > 0) {
        console.error('API-Football Errors:', JSON.stringify(json.errors, null, 2))
      }

      return {
        data: json.response || [],
        status,
        resultsCount: json.results || (json.response?.length || 0),
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        remainingQuota,
        url,
      }
    } catch (err: any) {
      console.error('[API-Football Diagnostic Error]:', err)
      return { data: [], status: 500, resultsCount: 0, errors: { fetch: err.message }, url }
    }
  },

  async getLiveFixtures(): Promise<ApiFootballResult<ApiFootballFixtureRaw[]>> {
    const url = this.getUrl('fixtures?live=all', true)
    if (!this.hasValidApiKey()) {
      return { data: [], status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
    }

    try {
      const res = await fetch(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      })

      const remainingQuota = res.headers.get('x-ratelimit-requests-remaining')
      const status = res.status
      const json = await res.json()

      console.log('=== [API-Football Diagnostics: LIVE] ===')
      console.log('URL:', url)
      console.log('HTTP Status:', status)
      console.log('Remaining Quota:', remainingQuota)
      console.log('Results Count:', json.results || 0)
      if (json.errors && Object.keys(json.errors).length > 0) {
        console.error('API-Football Errors:', JSON.stringify(json.errors, null, 2))
      }

      return {
        data: json.response || [],
        status,
        resultsCount: json.results || (json.response?.length || 0),
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        remainingQuota,
        url,
      }
    } catch (err: any) {
      console.error('[API-Football Diagnostic Error Live]:', err)
      return { data: [], status: 500, resultsCount: 0, errors: { fetch: err.message }, url }
    }
  },

  async getFixtureDetails(id: string | number): Promise<ApiFootballResult<ApiFootballFixtureRaw | null>> {
    const url = this.getUrl(`fixtures?id=${id}`, true)
    if (!this.hasValidApiKey()) {
      return { data: null, status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
    }

    try {
      const res = await fetch(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      })

      const status = res.status
      const json = await res.json()
      const list = json.response || []

      return {
        data: list[0] || null,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        url,
      }
    } catch (err: any) {
      console.error(`[API-Football Diagnostic Error Details ${id}]:`, err)
      return { data: null, status: 500, resultsCount: 0, errors: { fetch: err.message }, url }
    }
  },

  async getH2H(team1Id: string | number, team2Id: string | number): Promise<ApiFootballFixtureRaw[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const res = await fetch(this.getUrl(`fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`, true), {
        headers: this.getHeaders(),
        next: { revalidate: 300 },
      })

      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    } catch (err) {
      console.error(`API-Football getH2H error:`, err)
      return []
    }
  },

  async getLeagueDetails(leagueId: string | number): Promise<any | null> {
    if (!this.hasValidApiKey()) return null

    try {
      const url = this.getUrl(`leagues?id=${leagueId}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 3600 },
      })

      if (!res.ok) return null
      const json = await res.json()
      if (json.errors && Object.keys(json.errors).length > 0) {
        console.error(`[API-Football Error getLeagueDetails ${leagueId}]:`, json.errors)
      }
      return json.response?.[0] || null
    } catch (err) {
      console.error(`API-Football getLeagueDetails error:`, err)
      return null
    }
  },

  async getLeagueStandings(leagueId: string | number, season: number): Promise<any[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const url = this.getUrl(`standings?league=${leagueId}&season=${season}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 600 },
      })

      if (!res.ok) return []
      const json = await res.json()
      const standingsObj = json.response?.[0]?.league?.standings
      if (!standingsObj) return []
      return Array.isArray(standingsObj[0]) ? standingsObj[0] : standingsObj
    } catch (err) {
      console.error(`API-Football getLeagueStandings error:`, err)
      return []
    }
  },

  async getLeagueTopScorers(leagueId: string | number, season: number): Promise<any[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const url = this.getUrl(`players/topscorers?league=${leagueId}&season=${season}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 1800 },
      })

      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    } catch (err) {
      console.error(`API-Football getLeagueTopScorers error:`, err)
      return []
    }
  },

  async getLeagueFixtures(leagueId: string | number, season: number): Promise<ApiFootballFixtureRaw[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const url = this.getUrl(`fixtures?league=${leagueId}&season=${season}`, true)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 300 },
      })

      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    } catch (err) {
      console.error(`API-Football getLeagueFixtures error:`, err)
      return []
    }
  },

  async getTeamDetails(teamId: string | number): Promise<any | null> {
    if (!this.hasValidApiKey()) return null

    try {
      const url = this.getUrl(`teams?id=${teamId}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 3600 },
      })

      if (!res.ok) return null
      const json = await res.json()
      if (json.errors && Object.keys(json.errors).length > 0) {
        console.error(`[API-Football Error getTeamDetails ${teamId}]:`, json.errors)
      }
      return json.response?.[0] || null
    } catch (err) {
      console.error(`API-Football getTeamDetails error:`, err)
      return null
    }
  },

  async getTeamSeasons(teamId: string | number): Promise<number[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const url = this.getUrl(`teams/seasons?team=${teamId}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 3600 },
      })

      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    } catch (err) {
      console.error(`API-Football getTeamSeasons error:`, err)
      return []
    }
  },

  async getTeamFixtures(teamId: string | number, season: number): Promise<ApiFootballFixtureRaw[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const url = this.getUrl(`fixtures?team=${teamId}&season=${season}`, true)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 300 },
      })

      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    } catch (err) {
      console.error(`API-Football getTeamFixtures error:`, err)
      return []
    }
  },

  async getTeamSquad(teamId: string | number): Promise<any[]> {
    if (!this.hasValidApiKey()) return []

    try {
      const url = this.getUrl(`players/squads?team=${teamId}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 3600 },
      })

      if (!res.ok) return []
      const json = await res.json()
      return json.response?.[0]?.players || []
    } catch (err) {
      console.error(`API-Football getTeamSquad error:`, err)
      return []
    }
  },

  async getTeamStatistics(teamId: string | number, leagueId: string | number, season: number): Promise<any | null> {
    if (!this.hasValidApiKey()) return null

    try {
      const url = this.getUrl(`teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, false)
      const res = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 1800 },
      })

      if (!res.ok) return null
      const json = await res.json()
      return json.response || null
    } catch (err) {
      console.error(`API-Football getTeamStatistics error:`, err)
      return null
    }
  },
}
