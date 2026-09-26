import { Match } from '@/types/match'
import { Team } from '@/types/team'
import { League } from '@/types/league'
import { Player } from '@/types/player'
import { LeagueStanding, TopScorer } from '@/types/standing'
import { NewsArticle } from '@/types/news'
import { mockSportsProvider } from './mockSportsProvider'
import {
  normalizeMatch, normalizeTeam, normalizeLeague,
  normalizePlayer, normalizeStanding, normalizeNewsArticle,
  normalizeApiFootballPlayerFull,
} from './normalizers'
import { apiFootballProvider } from './apiFootballProvider'
import { resolveApiFootballPlayerId } from '@/data/knownPlayerIds'
import { mockMatches } from '@/data/mockMatches'
import { isToday } from '@/lib/utils'

const provider = mockSportsProvider

// Fast in-memory client-side cache for date fixtures
const clientMatchesByDateCache = new Map<
  string,
  {
    data: { matches: Match[]; source: string; count: number; lastUpdated: string; error?: string }
    cachedAt: number
  }
>()

export const sportsService = {
  // ── Matches (Connected to Real API Route Handlers) ──────────────────────
  async getMatchesByDateWithSource(
    date: Date,
    forceRefresh = false
  ): Promise<{ matches: Match[]; source: string; count: number; lastUpdated: string; error?: string }> {
    try {
      // Timezone-safe date string formatting (YYYY-MM-DD)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`

      const isTodayDate = isToday(date)
      // TTL: 10s for today's live matches to ensure real-time score & minute updates, 30m for other dates
      const ttl = isTodayDate ? 10 * 1000 : 30 * 60 * 1000

      const cached = clientMatchesByDateCache.get(dateStr)
      if (!forceRefresh && cached && Date.now() - cached.cachedAt < ttl) {
        return cached.data
      }

      const freshParam = forceRefresh || isTodayDate ? `&fresh=1&_t=${Date.now()}` : ''
      const res = await fetch(`/api/matches/today?date=${dateStr}${freshParam}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const result = {
        matches: json.data || [],
        source: json.source || 'LIVE API',
        count: json.count || 0,
        lastUpdated: json.lastUpdated || new Date().toISOString(),
        error: json.error,
      }

      // Save to client-side memory cache
      clientMatchesByDateCache.set(dateStr, {
        data: result,
        cachedAt: Date.now(),
      })

      return result
    } catch (err: any) {
      return {
        matches: [],
        source: 'LIVE API Error',
        count: 0,
        lastUpdated: new Date().toISOString(),
        error: err.message || 'Live football data is temporarily unavailable.',
      }
    }
  },
  async getMatchesToday(): Promise<Match[]> {
    const res = await this.getMatchesByDateWithSource(new Date())
    return res.matches
  },
  async getLiveMatches(): Promise<Match[]> {
    try {
      const res = await fetch('/api/matches/live', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return json.data || []
    } catch {
      return []
    }
  },
  async getMatchesByDate(date: Date): Promise<Match[]> {
    const res = await this.getMatchesByDateWithSource(date)
    return res.matches
  },
  async getMatchBySlug(slugOrId: string): Promise<{ match: Match | null; h2h: Match[]; error?: string; errorCode?: string }> {
    try {
      const res = await fetch(`/api/matches/${slugOrId}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        return {
          match: null,
          h2h: [],
          error: json.error || 'Match unavailable. No record found for this fixture ID.',
          errorCode: json.code || (res.status === 404 ? 'MATCH_NOT_FOUND' : 'PROVIDER_ERROR'),
        }
      }
      return {
        match: json.match || null,
        h2h: json.h2h || [],
      }
    } catch (err: any) {
      return {
        match: null,
        h2h: [],
        error: 'Network connection failed. Please check your connection and retry.',
        errorCode: 'PROVIDER_ERROR',
      }
    }
  },
  async getMatchesByLeague(leagueId: string): Promise<Match[]> {
    try {
      const full = await this.getLeagueFullData(leagueId)
      if (full?.fixtures && full.fixtures.length > 0) return full.fixtures
    } catch {}
    return (await provider.getMatchesByLeague(leagueId)).map(normalizeMatch)
  },
  async getMatchesByTeam(teamId: string): Promise<Match[]> {
    const full = await this.getTeamFullData(teamId)
    return [...full.fixtures, ...full.results]
  },
  async getMatchesByStatus(status: string): Promise<Match[]> {
    return (await provider.getMatchesByStatus(status)).map(normalizeMatch)
  },
  async getH2H(_teamAId: string, _teamBId: string): Promise<Match[]> {
    return []
  },

  // ── Teams ─────────────────────────────────────────────────────────────────
  async getTeamFullData(slugOrId: string, season?: number | string): Promise<{
    team: (Team & { currentSeason?: string; selectedSeason?: string; seasons?: number[]; primaryLeague?: any }) | null
    standingPosition: any
    nextMatch: Match | null
    lastMatch: Match | null
    recentForm: string[]
    fixtures: Match[]
    results: Match[]
    stats: any
    squad: {
      goalkeepers: Player[]
      defenders: Player[]
      midfielders: Player[]
      forwards: Player[]
      all: Player[]
    }
    errorType?: 'notFound' | 'unavailable'
  }> {
    try {
      const url = season ? `/api/teams/${slugOrId}?season=${season}` : `/api/teams/${slugOrId}`
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) {
        return {
          team: null,
          standingPosition: null,
          nextMatch: null,
          lastMatch: null,
          recentForm: [],
          fixtures: [],
          results: [],
          stats: null,
          squad: { goalkeepers: [], defenders: [], midfielders: [], forwards: [], all: [] },
          errorType: json.notFound ? 'notFound' : 'unavailable',
        }
      }
      return {
        team: json.team || null,
        standingPosition: json.standingPosition || null,
        nextMatch: json.nextMatch || null,
        lastMatch: json.lastMatch || null,
        recentForm: json.recentForm || [],
        fixtures: json.fixtures || [],
        results: json.results || [],
        stats: json.stats || null,
        squad: json.squad || { goalkeepers: [], defenders: [], midfielders: [], forwards: [], all: [], },
      }
    } catch (err) {
      console.error(`Error fetching team data for ${slugOrId} (season: ${season}):`, err)
      return {
        team: null,
        standingPosition: null,
        nextMatch: null,
        lastMatch: null,
        recentForm: [],
        fixtures: [],
        results: [],
        stats: null,
        squad: { goalkeepers: [], defenders: [], midfielders: [], forwards: [], all: [] },
        errorType: 'unavailable',
      }
    }
  },
  async getTeams(): Promise<Team[]> {
    return (await provider.getTeams()).map(normalizeTeam)
  },
  async getTeamBySlug(slug: string): Promise<Team | null> {
    const full = await this.getTeamFullData(slug)
    return full.team
  },
  async getSquadByTeam(teamId: string): Promise<Player[]> {
    const full = await this.getTeamFullData(teamId)
    return full.squad?.all || []
  },

  // ── Leagues ───────────────────────────────────────────────────────────────
  async getLeagueFullData(slugOrId: string, season?: number | string): Promise<{
    league: League | null
    standings: LeagueStanding[]
    groups?: import('@/types/standing').GroupedStanding[]
    topScorers: TopScorer[]
    fixtures: Match[]
    errorType?: 'notFound' | 'unavailable'
  }> {
    try {
      const url = season ? `/api/leagues/${slugOrId}?season=${season}` : `/api/leagues/${slugOrId}`
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) {
        return {
          league: null,
          standings: [],
          groups: [],
          topScorers: [],
          fixtures: [],
          errorType: json.notFound ? 'notFound' : 'unavailable',
        }
      }

      const leagueObj = json.league
        ? {
            ...json.league,
            groups: json.groups || json.league.groups,
          }
        : null

      return {
        league: leagueObj,
        standings: json.standings || [],
        groups: json.groups || json.league?.groups || [],
        topScorers: json.topScorers || [],
        fixtures: json.fixtures || [],
      }
    } catch (err) {
      console.error(`Error fetching league data for ${slugOrId} (season: ${season}):`, err)
      return {
        league: null,
        standings: [],
        groups: [],
        topScorers: [],
        fixtures: [],
        errorType: 'unavailable',
      }
    }
  },
  async getLeagues(): Promise<League[]> {
    try {
      const res = await fetch('/api/competitions')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch {}
    return (await provider.getLeagues()).map(normalizeLeague)
  },
  async getTopLeagues(): Promise<League[]> {
    return this.getLeagues()
  },
  async getLeagueBySlug(slug: string): Promise<League | null> {
    const full = await this.getLeagueFullData(slug)
    return full.league
  },

  // ── Players ───────────────────────────────────────────────────────────────
  async getPlayerBySlug(slug: string): Promise<Player | null> {
    const normSlug = slug.toLowerCase().trim()

    // 1. Try to resolve API-Football numeric ID
    let numericPlayerId = resolveApiFootballPlayerId(normSlug)

    // 2. If not directly in known IDs, check CSV player database for an ID match or name match
    let csvMatch: any = null
    try {
      const csvStatsList: any[] = (await import('@/data/player_stats_db.json')).default
      const normSearch = normSlug.replace(/-/g, ' ')
      csvMatch = csvStatsList.find((p) => {
        const pId = String(p.Id).toLowerCase()
        const pName = (p.Name || '').toLowerCase()
        const pFull = `${p.Firstname || ''} ${p.Lastname || ''}`.toLowerCase()
        return (
          pId === normSlug ||
          pName === normSearch ||
          pFull === normSearch ||
          pName.includes(normSearch) ||
          pFull.includes(normSearch) ||
          normSearch.includes(pName)
        )
      })
      if (!numericPlayerId && csvMatch?.Id && /^\d+$/.test(String(csvMatch.Id))) {
        numericPlayerId = String(csvMatch.Id)
      }
    } catch {
      // Non-fatal
    }

    // 3. Database-first fetch & sync via playerService with 2026 season
    if (numericPlayerId) {
      try {
        const { getOrSyncPlayerProfile } = await import('./playerService')
        const player = await getOrSyncPlayerProfile(Number(numericPlayerId), normSlug)
        if (player) {
          if (!/^\d+$/.test(normSlug)) {
            player.slug = normSlug
          }
          return player
        }
      } catch (err) {
        console.error(`Failed to fetch/sync stats for player ${numericPlayerId}:`, err)
      }
    }

    // 4. Manifest fallback for FC Barcelona & Real Madrid players
    let match: any = null
    try {
      const allManifest = (await import('@/lib/playerMatcher')).getAllManifestPlayers()
      match = allManifest.find(
        (mp) => mp.slug === normSlug || mp.id.toLowerCase() === normSlug || mp.full_name.toLowerCase().includes(normSlug)
      )
    } catch {
      // Non-fatal
    }

    if (match || csvMatch) {
      const publicPath = match ? `/images/players/${match.club_key}/${match.slug}.webp` : (csvMatch?.Photo || '')
      const name = csvMatch?.Name || (match ? match.display_name || match.full_name : 'Player')
      const appearances = Number(csvMatch?.['Games appearences']) || 0
      const goals = Number(csvMatch?.['Goals total']) || 0
      const assists = Number(csvMatch?.['Goals assists']) || 0
      const yellowCards = Number(csvMatch?.['Cards yellow']) || 0
      const redCards = Number(csvMatch?.['Cards red']) || 0
      const minutesPlayed = Number(csvMatch?.['Games minutes']) || 0
      const rating = Number(csvMatch?.['Games rating']) || undefined

      return {
        id: numericPlayerId || csvMatch?.Id || match?.id || normSlug,
        slug: match?.slug || normSlug,
        name,
        firstName: csvMatch?.Firstname || name.split(' ')[0] || '',
        lastName: csvMatch?.Lastname || name.split(' ').slice(1).join(' ') || '',
        photo: publicPath || csvMatch?.Photo,
        image: publicPath || csvMatch?.Photo,
        imagePath: publicPath,
        imageSourceUrl: match?.image_source_url,
        squadNumber: Number(csvMatch?.['Games number']) || match?.squad_number || undefined,
        nationality: csvMatch?.Nationality || 'Global',
        dateOfBirth: csvMatch?.['Birth date'] || '',
        age: Number(csvMatch?.Age) || 20,
        position: csvMatch?.['Games position'] || match?.position || 'Forward',
        number: Number(csvMatch?.['Games number']) || match?.squad_number || undefined,
        teamName: csvMatch?.['Team name'] || match?.club || 'Team',
        teamSlug: match?.club_key || 'team',
        marketValue: undefined,
        stats: { appearances, goals, assists, yellowCards, redCards, minutesPlayed, rating },
        seasonStats: { appearances, goals, assists, yellowCards, redCards, minutesPlayed, rating },
      }
    }

    // 5. Final fallback to mock provider only if nothing else found
    const d = await provider.getPlayerBySlug(normSlug)
    if (d) return normalizePlayer(d)

    return null
  },
  async getTopScorers(leagueId?: string): Promise<Player[]> {
    return (await provider.getTopScorers(leagueId)).map(normalizePlayer)
  },

  // ── Standings & Top Scorers ────────────────────────────────────────────────
  async getStandingsByLeague(leagueId: string, season?: string | number): Promise<LeagueStanding[]> {
    const full = await this.getLeagueFullData(leagueId, season)
    return full.standings
  },
  async getTopScorersByLeague(leagueId: string): Promise<TopScorer[]> {
    const full = await this.getLeagueFullData(leagueId)
    return full.topScorers
  },

  // ── News ──────────────────────────────────────────────────────────────────
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await fetch('/api/news')
      if (res.ok) {
        const json = await res.json()
        return (json.articles || []).map(normalizeNewsArticle)
      }
    } catch {
      // Fallback
    }
    return []
  },
  async getNewsByLeague(leagueId: string): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`/api/news?leagueId=${encodeURIComponent(leagueId)}`)
      if (res.ok) {
        const json = await res.json()
        return (json.articles || []).map(normalizeNewsArticle)
      }
    } catch {
      // Fallback
    }
    return []
  },
  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const res = await fetch(`/api/news?slug=${encodeURIComponent(slug)}`)
      if (res.ok) {
        const json = await res.json()
        const article = json.article || (json.articles && json.articles[0])
        return article ? normalizeNewsArticle(article) : null
      }
    } catch {
      // Fallback
    }
    return null
  },
  async getFeaturedNews(): Promise<NewsArticle[]> {
    try {
      const res = await fetch('/api/news')
      if (res.ok) {
        const json = await res.json()
        return (json.articles || []).map(normalizeNewsArticle)
      }
    } catch {
      // Fallback
    }
    return []
  },
  async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    try {
      const res = await fetch(`/api/news?category=${encodeURIComponent(category)}`)
      if (res.ok) {
        const json = await res.json()
        return (json.articles || []).map(normalizeNewsArticle)
      }
    } catch {
      // Fallback
    }
    return []
  },

  // ── FIFA World Rankings API ──────────────────────────────────────────────
  async getFifaRankings(homeTeam?: string, awayTeam?: string): Promise<{
    homeRank: number | null
    awayRank: number | null
    source?: string
  }> {
    try {
      const params = new URLSearchParams()
      if (homeTeam) params.append('home', homeTeam)
      if (awayTeam) params.append('away', awayTeam)

      const res = await fetch(`/api/fifa-rankings?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        return {
          homeRank: json.homeTeam?.rank || null,
          awayRank: json.awayTeam?.rank || null,
          source: json.source,
        }
      }
    } catch (err) {
      console.error('Failed to fetch FIFA rankings from API:', err)
    }
    return { homeRank: null, awayRank: null }
  },
}
