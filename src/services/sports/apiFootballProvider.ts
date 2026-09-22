/**
 * Server-side API-Football Provider
 * ───────────────
 * Executes secure HTTP requests to API-Football (api-sports.io or RapidAPI).
 * Runs strictly on the server side (Node.js/Edge) inside Next.js Route Handlers.
 */

const DEFAULT_KEY = 'c26d748e926e82946cc6acb2eee6943e'
const API_KEY = process.env.FOOTBALL_API_KEY || DEFAULT_KEY
const API_HOST = process.env.FOOTBALL_API_HOST || 'v3.football.api-sports.io'
const DEFAULT_TIMEZONE = 'Africa/Casablanca'

// ── In-Memory Cache for API-Football Quota Preservation (100 req/day) ────────
interface CacheItem<T> {
  data: T
  expiresAt: number
}

const apiFootballCache = new Map<string, CacheItem<any>>()

function getFromCache<T>(key: string): T | null {
  const item = apiFootballCache.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    apiFootballCache.delete(key)
    return null
  }
  return item.data
}

function setToCache<T>(key: string, data: T, ttlMs: number): void {
  if (apiFootballCache.size > 200) {
    const now = Date.now()
    for (const [k, v] of apiFootballCache.entries()) {
      if (now > v.expiresAt) apiFootballCache.delete(k)
    }
  }
  apiFootballCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
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
    const cacheKey = `apifb_fixtures_${dateString}`
    const cached = getFromCache<ApiFootballFixtureRaw[]>(cacheKey)
    if (cached) {
      return { data: cached, status: 200, resultsCount: cached.length, url: 'cache' }
    }

    const url = this.getUrl(`fixtures?date=${dateString}`, true)
    if (!this.hasValidApiKey()) {
      console.warn('[API-Football] No valid API Key configured.')
      return { data: [], status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
    }

    try {
      const res = await fetchWithTimeout(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      }, 5000)

      const remainingQuota = res.headers.get('x-ratelimit-requests-remaining')
      const status = res.status
      const json = await res.json()

      const list: ApiFootballFixtureRaw[] = Array.isArray(json.response) ? json.response : []
      if (list.length > 0) {
        setToCache(cacheKey, list, 90000) // 90 seconds cache to preserve 100 req/day quota
      }

      return {
        data: list,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        remainingQuota,
        url,
      }
    } catch (err: any) {
      console.warn('[API-Football Error]:', err.message || err)
      return { data: [], status: 500, resultsCount: 0, errors: { fetch: err.message }, url }
    }
  },

  async getLiveFixtures(): Promise<ApiFootballResult<ApiFootballFixtureRaw[]>> {
    const cacheKey = 'apifb_live'
    const cached = getFromCache<ApiFootballFixtureRaw[]>(cacheKey)
    if (cached) {
      return { data: cached, status: 200, resultsCount: cached.length, url: 'cache' }
    }

    const url = this.getUrl('fixtures?live=all', true)
    if (!this.hasValidApiKey()) {
      return { data: [], status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
    }

    try {
      const res = await fetchWithTimeout(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      }, 5000)

      const remainingQuota = res.headers.get('x-ratelimit-requests-remaining')
      const status = res.status
      const json = await res.json()

      const list: ApiFootballFixtureRaw[] = Array.isArray(json.response) ? json.response : []
      if (list.length > 0) {
        setToCache(cacheKey, list, 30000) // 30s cache for live
      }

      return {
        data: list,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        remainingQuota,
        url,
      }
    } catch (err: any) {
      console.warn('[API-Football Live Error]:', err.message || err)
      return { data: [], status: 500, resultsCount: 0, errors: { fetch: err.message }, url }
    }
  },

  async getFixtureDetails(id: string | number): Promise<ApiFootballResult<ApiFootballFixtureRaw | null>> {
    const cacheKey = `apifb_details_${id}`
    const cached = getFromCache<ApiFootballFixtureRaw>(cacheKey)
    if (cached) {
      return { data: cached, status: 200, resultsCount: 1, url: 'cache' }
    }

    const url = this.getUrl(`fixtures?id=${id}`, true)
    if (!this.hasValidApiKey()) {
      return { data: null, status: 401, resultsCount: 0, errors: { key: 'API Key missing' }, url }
    }

    try {
      const res = await fetchWithTimeout(url, {
        headers: this.getHeaders(),
        cache: 'no-store',
      }, 5000)

      const status = res.status
      const json = await res.json()
      const list = json.response || []
      const match = list[0] || null

      if (match) {
        const isCompleted = match.fixture?.status?.short === 'FT' || match.fixture?.status?.short === 'AET' || match.fixture?.status?.short === 'PEN'
        setToCache(cacheKey, match, isCompleted ? 600000 : 30000)
      }

      return {
        data: match,
        status,
        resultsCount: json.results || list.length,
        errors: json.errors && Object.keys(json.errors).length > 0 ? json.errors : undefined,
        url,
      }
    } catch (err: any) {
      console.warn(`[API-Football Details Error ${id}]:`, err.message || err)
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
