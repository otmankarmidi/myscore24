/**
 * ESPN Public Soccer API Provider
 * 100% Real, Actual, Live Football Data for MyScore24.
 * Endpoints: https://site.api.espn.com/apis/site/v2/sports/soccer/
 */

export const CURRENT_SEASON = '2026/2027'

const ESPN_FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
}

export interface EspnMatch {
  id: string
  date: string
  name: string
  shortName: string
  leagueId: string
  leagueName: string
  leagueLogo?: string
  status: {
    type: {
      id: string
      name: string
      state: 'pre' | 'in' | 'post'
      completed: boolean
      description: string
      detail: string
      shortDetail: string
    }
    clock?: number
    displayClock?: string
    period?: number
  }
  competitors: Array<{
    id: string
    uid: string
    type: string
    order: number
    homeAway: 'home' | 'away'
    winner?: boolean
    score?: string
    team: {
      id: string
      name: string
      displayName: string
      abbreviation: string
      logo?: string
    }
  }>
  venue?: {
    fullName: string
    address?: { city: string }
  }
}

export const LEAGUE_MAP: Record<string, { code: string; name: string; country: string; logo: string }> = {
  // Premier League
  '39': { code: 'eng.1', name: 'English Premier League', country: 'England', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png' },
  'premier-league': { code: 'eng.1', name: 'English Premier League', country: 'England', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png' },

  // La Liga
  '140': { code: 'esp.1', name: 'Spanish LALIGA', country: 'Spain', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png' },
  'la-liga': { code: 'esp.1', name: 'Spanish LALIGA', country: 'Spain', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png' },

  // Champions League
  '2': { code: 'uefa.champions', name: 'UEFA Champions League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },
  'champions-league': { code: 'uefa.champions', name: 'UEFA Champions League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },

  // Europa League
  '3': { code: 'uefa.europa', name: 'UEFA Europa League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2036.png' },
  'europa-league': { code: 'uefa.europa', name: 'UEFA Europa League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2036.png' },

  // Bundesliga
  '78': { code: 'ger.1', name: 'German Bundesliga', country: 'Germany', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },
  'bundesliga': { code: 'ger.1', name: 'German Bundesliga', country: 'Germany', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },

  // Serie A
  '135': { code: 'ita.1', name: 'Italian Serie A', country: 'Italy', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png' },
  'serie-a': { code: 'ita.1', name: 'Italian Serie A', country: 'Italy', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png' },

  // Ligue 1
  '61': { code: 'fra.1', name: 'French Ligue 1', country: 'France', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png' },
  'ligue-1': { code: 'fra.1', name: 'French Ligue 1', country: 'France', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png' },

  // Botola Pro
  '200': { code: 'mar.1', name: 'Moroccan Botola Pro', country: 'Morocco', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1908.png' },
  'botola-pro': { code: 'mar.1', name: 'Moroccan Botola Pro', country: 'Morocco', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1908.png' },

  // Saudi Pro League
  '307': { code: 'ksa.1', name: 'Saudi Pro League', country: 'Saudi Arabia', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2744.png' },
  'saudi-pro-league': { code: 'ksa.1', name: 'Saudi Pro League', country: 'Saudi Arabia', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2744.png' },

  // Primeira Liga (Portugal)
  '94': { code: 'por.1', name: 'Portuguese Primeira Liga', country: 'Portugal', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/14.png' },
  'primeira-liga': { code: 'por.1', name: 'Portuguese Primeira Liga', country: 'Portugal', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/14.png' },

  // Eredivisie (Netherlands)
  '88': { code: 'ned.1', name: 'Dutch Eredivisie', country: 'Netherlands', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/11.png' },
  'eredivisie': { code: 'ned.1', name: 'Dutch Eredivisie', country: 'Netherlands', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/11.png' },

  // MLS (USA)
  '253': { code: 'usa.1', name: 'Major League Soccer', country: 'USA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png' },
  'mls': { code: 'usa.1', name: 'Major League Soccer', country: 'USA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png' },

  // International Friendlies
  'friendly': { code: 'fifa.friendly', name: 'International Friendlies', country: 'International', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png' },
  'fifa.friendly': { code: 'fifa.friendly', name: 'International Friendlies', country: 'International', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png' },

  // AFCON Qualifiers
  'afcon-qualifiers': { code: 'caf.nations_qual', name: 'AFCON Qualifiers', country: 'Africa', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/65.png' },
  'caf.nations_qual': { code: 'caf.nations_qual', name: 'AFCON Qualifiers', country: 'Africa', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/65.png' }
}

export function formatElapsedMinutes(rawClock?: number): number {
  if (!rawClock || rawClock <= 0) return 0
  let clock = rawClock
  if (clock > 120) {
    clock = Math.floor(clock / 60)
  }
  if (clock > 120) {
    clock = 90
  }
  return clock
}

/** Extract numeric ID from ESPN $ref URL like .../athletes/12345?lang=en */
function extractIdFromRef(ref: string): string {
  const match = ref.match(/\/(\d+)\?/)
  return match ? match[1] : ''
}

// ── In-Memory Server Cache & Timeout Utilities ──────────────────────────────
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.data
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  if (memoryCache.size > 250) {
    const now = Date.now()
    for (const [k, v] of memoryCache.entries()) {
      if (now > v.expiresAt) memoryCache.delete(k)
    }
  }
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...ESPN_FETCH_HEADERS,
        ...(options.headers || {})
      }
    })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

export const espnPublicProvider = {
  getEspnLeagueCode(slugOrId: string): string {
    const key = (slugOrId || '').toLowerCase()
    return LEAGUE_MAP[key]?.code || key || 'eng.1'
  },

  getLeagueMeta(slugOrId: string) {
    const key = (slugOrId || '').toLowerCase()
    return LEAGUE_MAP[key] || {
      code: key || 'eng.1',
      name: key.toUpperCase(),
      country: 'International',
      logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png'
    }
  },

  async fetchMatchesForLeague(leagueCode: string, dateStr?: string): Promise<EspnMatch[]> {
    const espnLeague = this.getEspnLeagueCode(leagueCode)
    const formattedDate = dateStr ? dateStr.replace(/-/g, '') : ''
    const cacheKey = `matches_${espnLeague}_${formattedDate || 'active'}`

    const cached = getCached<EspnMatch[]>(cacheKey)
    if (cached) return cached

    try {
      let url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${espnLeague}/scoreboard`
      if (formattedDate) {
        url += `?dates=${formattedDate}`
      }

      const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500)
      if (!res.ok) return []
      const json = await res.json()

      if (!json || typeof json !== 'object' || !Array.isArray(json.events)) {
        return []
      }

      const leagueName = json.leagues?.[0]?.name || 'Football League'
      const leagueLogo = json.leagues?.[0]?.logos?.[0]?.href || ''

      const matches: EspnMatch[] = json.events
        .filter((ev: any) => ev && ev.id && Array.isArray(ev.competitions) && ev.competitions.length > 0)
        .map((ev: any) => {
          const competition = ev.competitions[0] || {}
          const status = competition.status || ev.status || {}
          if (status.clock) {
            status.clock = formatElapsedMinutes(status.clock)
          }

          return {
            id: String(ev.id),
            date: ev.date || new Date().toISOString(),
            name: ev.name || 'Match',
            shortName: ev.shortName || ev.name || 'Match',
            leagueId: espnLeague,
            leagueName,
            leagueLogo,
            status,
            competitors: Array.isArray(competition.competitors) ? competition.competitors : [],
            venue: competition.venue
          }
        })

      // Cache matches: 45s for live/active round, 3m for specific date
      const ttl = formattedDate ? 180000 : 45000
      setCache(cacheKey, matches, ttl)
      return matches
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[ESPN] Timeout fetching matches for ${espnLeague}`)
      } else {
        console.warn(`[ESPN] Error fetching matches for ${espnLeague}:`, err.message || err)
      }
      return []
    }
  },

  async fetchAllTodayMatches(): Promise<EspnMatch[]> {
    const cacheKey = 'all_today_matches'
    const cached = getCached<EspnMatch[]>(cacheKey)
    if (cached && cached.length > 0) return cached

    const leagues = ['eng.1', 'esp.1', 'ger.1', 'ita.1', 'fra.1', 'uefa.champions', 'mar.1', 'ksa.1', 'por.1', 'ned.1', 'usa.1', 'fifa.friendly', 'caf.nations_qual']
    const results = await Promise.allSettled(leagues.map(code => this.fetchMatchesForLeague(code)))
    const allMatches: EspnMatch[] = []

    results.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allMatches.push(...res.value)
      }
    })

    if (allMatches.length > 0) {
      setCache(cacheKey, allMatches, 45000) // 45s cache
    }

    return allMatches
  },

  async fetchStandings(leagueCode: string): Promise<any> {
    const espnLeague = this.getEspnLeagueCode(leagueCode)
    const cacheKey = `standings_${espnLeague}`
    const cached = getCached<any>(cacheKey)
    if (cached) return cached

    try {
      const url = `https://site.api.espn.com/apis/v2/sports/soccer/${espnLeague}/standings`
      const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500)
      if (!res.ok) return []
      const json = await res.json()
      if (!json || typeof json !== 'object') return []

      let data: any = []
      if (Array.isArray(json.children) && json.children.length > 0) {
        data = json.children
      } else if (Array.isArray(json.children?.[0]?.standings?.entries)) {
        data = json.children[0].standings.entries
      }

      setCache(cacheKey, data, 300000) // 5 minutes cache
      return data
    } catch (err: any) {
      console.warn(`[ESPN] Error fetching standings for ${espnLeague}:`, err.message || err)
      return []
    }
  },

  async fetchTopScorers(leagueCode: string): Promise<any[]> {
    const espnLeague = this.getEspnLeagueCode(leagueCode)
    const cacheKey = `topscorers_${espnLeague}`
    const cached = getCached<any[]>(cacheKey)
    if (cached) return cached

    try {
      // Get active season year from standings
      let seasonYear = new Date().getFullYear()
      try {
        const stRes = await fetchWithTimeout(
          `https://site.api.espn.com/apis/v2/sports/soccer/${espnLeague}/standings`,
          { cache: 'no-store' },
          3500
        )
        if (stRes.ok) {
          const stJson = await stRes.json()
          if (stJson.season?.year) seasonYear = stJson.season.year
        }
      } catch {}

      // Try type=1 (regular season) first, then type=2, then previous season
      let res = await fetchWithTimeout(
        `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear}/types/1/leaders`,
        { cache: 'no-store' },
        3500
      )
      if (!res.ok) {
        res = await fetchWithTimeout(
          `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear}/types/2/leaders`,
          { cache: 'no-store' },
          3500
        )
      }
      if (!res.ok) {
        res = await fetchWithTimeout(
          `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear - 1}/types/1/leaders`,
          { cache: 'no-store' },
          3500
        )
      }
      if (!res.ok) {
        res = await fetchWithTimeout(
          `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear - 1}/types/2/leaders`,
          { cache: 'no-store' },
          3500
        )
      }
      if (!res.ok) return []

      const json = await res.json()

      const goalsCat = json.categories?.find(
        (c: any) =>
          c.name === 'goalsLeaders' ||
          c.name === 'goals' ||
          (typeof c.name === 'string' && c.name.toLowerCase().includes('goal'))
      )
      if (!goalsCat?.leaders?.length) return []

      const leadersSlice: any[] = goalsCat.leaders.slice(0, 10)

      // Resolve player+team names in parallel
      const scorers = await Promise.all(
        leadersSlice.map(async (l: any, i: number) => {
          let athleteRef: string = l.athlete?.['$ref'] || ''
          let teamRef: string = l.team?.['$ref'] || ''
          if (athleteRef.startsWith('http:')) athleteRef = athleteRef.replace('http:', 'https:')
          if (teamRef.startsWith('http:')) teamRef = teamRef.replace('http:', 'https:')

          const athleteId = extractIdFromRef(athleteRef)
          const teamId = extractIdFromRef(teamRef)

          let goals = typeof l.value === 'number' ? l.value : 0
          let appearances = 0
          if (l.displayValue) {
            const gm = l.displayValue.match(/Goals:\s*(\d+)/i)
            const mm = l.displayValue.match(/Matches:\s*(\d+)/i)
            if (gm) goals = parseInt(gm[1])
            if (mm) appearances = parseInt(mm[1])
          }

          let playerName = `Player ${i + 1}`
          let teamName = 'Club'
          try {
            const [athRes, teamRes] = await Promise.all([
              athleteRef ? fetchWithTimeout(athleteRef, { cache: 'no-store' }, 2500) : Promise.resolve(null),
              teamRef ? fetchWithTimeout(teamRef, { cache: 'no-store' }, 2500) : Promise.resolve(null)
            ])
            if (athRes?.ok) {
              const ath = await athRes.json()
              playerName = ath.displayName || ath.fullName || playerName
            }
            if (teamRes?.ok) {
              const team = await teamRes.json()
              teamName = team.displayName || team.name || teamName
            }
          } catch {}

          return {
            playerId: athleteId || String(i + 1),
            playerSlug: `player-${athleteId || i + 1}`,
            playerName,
            photo: athleteId
              ? `https://a.espncdn.com/i/headshots/soccer/players/full/${athleteId}.png`
              : '',
            teamId: teamId || String(i + 1),
            teamSlug: `team-${teamId || i + 1}`,
            teamName,
            teamLogo: teamId
              ? `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`
              : '',
            matches: appearances,
            goals,
            assists: 0,
            penalties: 0
          }
        })
      )

      const validScorers = scorers.filter(s => s.goals > 0)
      setCache(cacheKey, validScorers, 600000) // 10 minutes cache
      return validScorers
    } catch (err: any) {
      console.warn(`[ESPN] Error fetching top scorers for ${espnLeague}:`, err.message || err)
      return []
    }
  },

  async fetchMatchSummary(eventId: string): Promise<any> {
    const cacheKey = `summary_${eventId}`
    const cached = getCached<any>(cacheKey)
    if (cached) return cached

    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${eventId}`
      const res = await fetchWithTimeout(url, { cache: 'no-store' }, 4500)
      if (!res.ok) return null
      const json = await res.json()
      if (!json || typeof json !== 'object') return null

      // Cache live matches for 30s, finished matches for 10 minutes
      const isCompleted = Boolean(json.header?.competitions?.[0]?.status?.type?.completed)
      setCache(cacheKey, json, isCompleted ? 600000 : 30000)
      return json
    } catch (err: any) {
      console.warn(`[ESPN] Error fetching match summary for ${eventId}:`, err.message || err)
      return null
    }
  }
}
