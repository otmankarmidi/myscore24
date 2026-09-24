/**
 * Server-side API-Football Provider
 * ───────────────
 * Executes secure HTTP requests to API-Football (api-sports.io or RapidAPI).
 * Integrated with Layered CacheEngine (SWR, Request Coalescing, Namespacing)
 * and ApiTelemetry quota tracking.
 */

import { cacheEngine, CACHE_TTLS, formatCacheKey } from './cacheEngine'
import { apiTelemetry } from './apiTelemetry'

const DEFAULT_KEY = '24f7ff23b96dcf9af3ef36a3bac17c15'
const API_KEY = process.env.FOOTBALL_API_KEY || DEFAULT_KEY
const API_HOST = process.env.FOOTBALL_API_HOST || 'v3.football.api-sports.io'
const DEFAULT_TIMEZONE = 'Africa/Casablanca'

let lastLiveCount = 0

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delayMs = 500): Promise<Response> {
  let attempt = 0
  while (attempt <= retries) {
    attempt++
    try {
      const res = await fetchWithTimeout(url, options, 6000)
      if (res.status === 429) {
        const err: any = new Error('HTTP 429 Rate Limit Exceeded')
        err.status = 429
        throw err
      }
      if (res.ok || attempt > retries || (res.status >= 400 && res.status < 500)) {
        return res
      }
    } catch (err: any) {
      if (err.status === 429 || attempt > retries) throw err
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)))
  }
  throw new Error(`Fetch failed after ${retries} retries`)
}

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
    const todayStr = new Date().toISOString().split('T')[0]
    const isToday = dateString === todayStr
    const ttl = isToday ? CACHE_TTLS.TODAY_FIXTURES : CACHE_TTLS.DATE_FIXTURES

    return cacheEngine.fetchWithCache('fixtures', dateString, ttl, async () => {
      const url = this.getUrl(`fixtures?date=${dateString}`, true)
      if (!this.hasValidApiKey()) {
        return { data: [], status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
      }

      const res = await fetchWithRetry(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      })

      const remainingQuota = res.headers.get('x-ratelimit-requests-remaining')
      const status = res.status
      const json = await res.json()

      const list: ApiFootballFixtureRaw[] = Array.isArray(json.response) ? json.response : []
      return {
        data: list,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        remainingQuota,
        url,
      }
    })
  },

  async getLiveFixtures(): Promise<ApiFootballResult<ApiFootballFixtureRaw[]>> {
    const ttl = lastLiveCount > 0 ? CACHE_TTLS.LIVE_MATCHES : CACHE_TTLS.LIVE_MATCHES_IDLE

    return cacheEngine.fetchWithCache('live', 'all', ttl, async () => {
      const url = this.getUrl('fixtures?live=all', true)
      if (!this.hasValidApiKey()) {
        return { data: [], status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
      }

      const res = await fetchWithRetry(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      })

      const remainingQuota = res.headers.get('x-ratelimit-requests-remaining')
      const status = res.status
      const json = await res.json()

      const list: ApiFootballFixtureRaw[] = Array.isArray(json.response) ? json.response : []
      lastLiveCount = list.length

      return {
        data: list,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        remainingQuota,
        url,
      }
    })
  },

  async getFixtureDetails(id: string | number): Promise<ApiFootballResult<ApiFootballFixtureRaw | null>> {
    const keyStr = String(id)
    return cacheEngine.fetchWithCache('fixture_details', keyStr, CACHE_TTLS.LIVE_MATCH_DETAILS, async () => {
      const url = this.getUrl(`fixtures?id=${id}`, true)
      if (!this.hasValidApiKey()) {
        return { data: null, status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
      }

      const res = await fetchWithRetry(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      })

      const status = res.status
      const json = await res.json()
      const list = json.response || []
      const match = list[0] || null

      return {
        data: match,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        url,
      }
    })
  },

  async getH2H(team1Id: string | number, team2Id: string | number): Promise<ApiFootballFixtureRaw[]> {
    const keyStr = `${team1Id}_${team2Id}`
    return cacheEngine.fetchWithCache('h2h', keyStr, CACHE_TTLS.DATE_FIXTURES, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`, true)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    })
  },

  async getLeagueDetails(leagueId: string | number): Promise<any | null> {
    const keyStr = String(leagueId)
    return cacheEngine.fetchWithCache('league', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return null
      const url = this.getUrl(`leagues?id=${leagueId}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return null
      const json = await res.json()
      return json.response?.[0] || null
    })
  },

  async getLeagueStandings(leagueId: string | number, season: number): Promise<any[]> {
    const keyStr = `${leagueId}_${season}`
    return cacheEngine.fetchWithCache('standings', keyStr, CACHE_TTLS.STANDINGS, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`standings?league=${leagueId}&season=${season}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      const standingsObj = json.response?.[0]?.league?.standings
      if (!standingsObj) return []
      return Array.isArray(standingsObj[0]) ? standingsObj[0] : standingsObj
    })
  },

  async getLeagueTopScorers(leagueId: string | number, season: number): Promise<any[]> {
    const keyStr = `${leagueId}_${season}`
    return cacheEngine.fetchWithCache('topscorers', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`players/topscorers?league=${leagueId}&season=${season}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    })
  },

  async getLeagueFixtures(leagueId: string | number, season: number): Promise<ApiFootballFixtureRaw[]> {
    const keyStr = `${leagueId}_${season}`
    return cacheEngine.fetchWithCache('league_fixtures', keyStr, CACHE_TTLS.DATE_FIXTURES, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`fixtures?league=${leagueId}&season=${season}`, true)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      if (json.errors && Object.keys(json.errors).length > 0) {
        const errorMsg = Object.entries(json.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
        console.warn(`[API-Football] getLeagueFixtures error: ${errorMsg}`)
        const err: any = new Error(`API-Football error: ${errorMsg}`)
        err.errors = json.errors
        throw err
      }
      return json.response || []
    })
  },

  async getTeamDetails(teamId: string | number): Promise<any | null> {
    const keyStr = String(teamId)
    return cacheEngine.fetchWithCache('team', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return null
      const url = this.getUrl(`teams?id=${teamId}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return null
      const json = await res.json()
      return json.response?.[0] || null
    })
  },

  async getTeamSeasons(teamId: string | number): Promise<number[]> {
    const keyStr = String(teamId)
    return cacheEngine.fetchWithCache('team_seasons', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`teams/seasons?team=${teamId}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    })
  },

  async getTeamFixtures(teamId: string | number, season: number): Promise<ApiFootballFixtureRaw[]> {
    const keyStr = `${teamId}_${season}`
    return cacheEngine.fetchWithCache('team_fixtures', keyStr, CACHE_TTLS.DATE_FIXTURES, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`fixtures?team=${teamId}&season=${season}`, true)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    })
  },

  async getTeamSquad(teamId: string | number): Promise<any[]> {
    const keyStr = String(teamId)
    return cacheEngine.fetchWithCache('squad', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`players/squads?team=${teamId}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response?.[0]?.players || []
    })
  },

  async getTeamStatistics(teamId: string | number, leagueId: string | number, season: number): Promise<any | null> {
    const keyStr = `${teamId}_${leagueId}_${season}`
    return cacheEngine.fetchWithCache('team_stats', keyStr, CACHE_TTLS.STANDINGS, async () => {
      if (!this.hasValidApiKey()) return null
      const url = this.getUrl(`teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return null
      const json = await res.json()
      return json.response || null
    })
  },

  async searchTeams(query: string): Promise<any[]> {
    const keyStr = query.toLowerCase().trim()
    return cacheEngine.fetchWithCache('team_search', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey() || query.trim().length < 3) return []
      const url = this.getUrl(`teams?search=${encodeURIComponent(query.trim())}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    })
  },

  async getPlayerSquads(playerId: string | number): Promise<any[]> {
    const keyStr = String(playerId)
    return cacheEngine.fetchWithCache('player_squads', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return []
      const url = this.getUrl(`players/squads?player=${playerId}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return []
      const json = await res.json()
      return json.response || []
    })
  },

  async getPlayerDetailsAndStats(playerId: string | number, season: number = 2026): Promise<any | null> {
    const keyStr = `${playerId}_${season}`
    return cacheEngine.fetchWithCache('player_stats', keyStr, CACHE_TTLS.ENTITY_INFO, async () => {
      if (!this.hasValidApiKey()) return null
      const url = this.getUrl(`players?id=${playerId}&season=${season}`, false)
      const res = await fetchWithRetry(url, { headers: this.getHeaders() })
      if (!res.ok) return null
      const json = await res.json()
      return json.response?.[0] || null
    })
  },
}
