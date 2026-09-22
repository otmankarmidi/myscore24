/**
 * Highlightly Football API Provider (via RapidAPI)
 * Base URL: https://football-highlights-api.p.rapidapi.com
 * Docs: https://highlightly.net/documentation/football/
 *
 * Response schema is completely different from API-Football.
 * Scores:  state.score.current = "3 - 1"
 * Status:  state.description = "Second half" | "Finished" | "Not started" | etc.
 */

const API_KEY = process.env.FOOTBALL_API_KEY
const API_HOST = process.env.FOOTBALL_API_HOST || 'football-highlights-api.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`
const DEFAULT_TIMEZONE = 'Africa/Casablanca'

export const highlightlyProvider = {
  hasValidApiKey(): boolean {
    return Boolean(API_KEY && API_KEY.trim().length > 5 && API_KEY !== 'your_api_key_here')
  },

  getHeaders(): Record<string, string> {
    return {
      'x-rapidapi-key': API_KEY!,
      'x-rapidapi-host': API_HOST,
    }
  },

  async fetchJson(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`
    if (!this.hasValidApiKey()) {
      console.warn('[Highlightly] No valid API key configured.')
      return null
    }
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      })

      const remaining = res.headers.get('x-ratelimit-requests-remaining')
      console.log(`[Highlightly] ${url} → HTTP ${res.status} | Quota remaining: ${remaining}`)

      if (!res.ok) {
        const text = await res.text()
        console.error(`[Highlightly] Error ${res.status}:`, text.slice(0, 300))
        return null
      }

      return await res.json()
    } catch (err: any) {
      console.error('[Highlightly] Fetch error:', err.message)
      return null
    }
  },

  /** GET /matches?date=YYYY-MM-DD&timezone=... */
  async getMatchesByDate(dateString: string): Promise<any[]> {
    const json = await this.fetchJson(
      `/matches?date=${dateString}&timezone=${encodeURIComponent(DEFAULT_TIMEZONE)}&limit=100`,
      { next: { revalidate: 30 } }
    )
    return json?.data || []
  },

  /** GET /matches?date=YYYY-MM-DD (status=live) — Highlightly doesn't have a dedicated live endpoint; filter by state */
  async getLiveMatches(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0]
    const json = await this.fetchJson(
      `/matches?date=${today}&timezone=${encodeURIComponent(DEFAULT_TIMEZONE)}&limit=100`,
      { cache: 'no-store' }
    )
    const all: any[] = json?.data || []
    return all.filter((m: any) => {
      const desc = (m?.state?.description || '').toLowerCase()
      return desc.includes('half') || desc.includes('live') || desc.includes('extra') || desc.includes('penalty')
    })
  },

  /** GET /matches/{id} */
  async getMatchById(matchId: string | number): Promise<any | null> {
    const json = await this.fetchJson(`/matches/${matchId}`, { cache: 'no-store' })
    if (Array.isArray(json)) return json[0] || null
    return json || null
  },

  /** GET /leagues?leagueName=...&countryCode=... */
  async getLeagues(params: { leagueName?: string; countryCode?: string; limit?: number } = {}): Promise<any[]> {
    const qs = new URLSearchParams()
    if (params.leagueName) qs.set('leagueName', params.leagueName)
    if (params.countryCode) qs.set('countryCode', params.countryCode)
    qs.set('limit', String(params.limit || 100))
    const json = await this.fetchJson(`/leagues?${qs}`, { next: { revalidate: 3600 } })
    return json?.data || []
  },

  /** GET /leagues/{id} */
  async getLeagueById(leagueId: string | number): Promise<any | null> {
    const json = await this.fetchJson(`/leagues/${leagueId}`, { next: { revalidate: 3600 } })
    if (Array.isArray(json)) return json[0] || null
    return json || null
  },

  /** GET /standings?leagueId=...&season=... */
  async getStandings(leagueId: string | number, season: number): Promise<any[]> {
    const json = await this.fetchJson(
      `/standings?leagueId=${leagueId}&season=${season}`,
      { next: { revalidate: 600 } }
    )
    if (Array.isArray(json)) return json
    return json?.data || json?.standings || []
  },

  /** GET /matches?leagueId=...&season=... */
  async getLeagueMatches(leagueId: string | number, season: number): Promise<any[]> {
    const json = await this.fetchJson(
      `/matches?leagueId=${leagueId}&season=${season}&limit=100`,
      { next: { revalidate: 300 } }
    )
    return json?.data || []
  },

  /** GET /teams?name=... */
  async getTeams(name?: string): Promise<any[]> {
    const qs = name ? `?name=${encodeURIComponent(name)}&limit=10` : '?limit=100'
    const json = await this.fetchJson(`/teams${qs}`, { next: { revalidate: 3600 } })
    return json?.data || []
  },

  /** GET /teams/{id} */
  async getTeamById(teamId: string | number): Promise<any | null> {
    const json = await this.fetchJson(`/teams/${teamId}`, { next: { revalidate: 3600 } })
    if (Array.isArray(json)) return json[0] || null
    return json || null
  },

  /** GET /teams/{id}/statistics?fromDate=YYYY-MM-DD */
  async getTeamStatistics(teamId: string | number, fromDate: string): Promise<any[]> {
    const json = await this.fetchJson(
      `/teams/${teamId}/statistics?fromDate=${fromDate}&timezone=${encodeURIComponent(DEFAULT_TIMEZONE)}`,
      { next: { revalidate: 1800 } }
    )
    if (Array.isArray(json)) return json
    return json?.data || []
  },

  /** GET /matches?teamId=...&season=... */
  async getTeamMatches(teamId: string | number, season: number): Promise<any[]> {
    const json = await this.fetchJson(
      `/matches?teamId=${teamId}&season=${season}&limit=100`,
      { next: { revalidate: 300 } }
    )
    return json?.data || []
  },

  /** GET /highlights?matchId=... */
  async getHighlightsByMatch(matchId: string | number): Promise<any[]> {
    const json = await this.fetchJson(`/highlights?matchId=${matchId}&limit=10`, { next: { revalidate: 1800 } })
    return json?.data || []
  },

  /** Resolve match status from state.description */
  resolveStatus(description: string): string {
    const d = (description || '').toLowerCase()
    if (d.includes('first half') || d.includes('second half') || d.includes('live') || d === 'in progress') return 'live'
    if (d.includes('half time') || d === 'halftime') return 'half_time'
    if (d.includes('extra time')) return 'extra_time'
    if (d.includes('penalties')) return 'penalties'
    if (d === 'finished' || d.includes('full time') || d.includes('ft') || d.includes('ended')) return 'full_time'
    if (d.includes('postponed')) return 'postponed'
    if (d.includes('cancelled') || d.includes('canceled') || d.includes('abandoned')) return 'cancelled'
    if (d.includes('suspended') || d.includes('interrupted')) return 'suspended'
    return 'scheduled'
  },

  /** Parse "3 - 1" score string into {home, away} */
  parseScore(scoreStr?: string): { home: number | null; away: number | null } {
    if (!scoreStr) return { home: null, away: null }
    const parts = scoreStr.split('-').map((p) => parseInt(p.trim(), 10))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { home: parts[0], away: parts[1] }
    }
    return { home: null, away: null }
  },
}
