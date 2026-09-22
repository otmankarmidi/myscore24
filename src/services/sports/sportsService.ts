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
} from './normalizers'
import { mockMatches } from '@/data/mockMatches'

const provider = mockSportsProvider

export const sportsService = {
  // ── Matches (Connected to Real API Route Handlers) ──────────────────────
  async getMatchesByDateWithSource(date: Date): Promise<{ matches: Match[]; source: string; count: number; lastUpdated: string; error?: string }> {
    try {
      // Timezone-safe date string formatting (YYYY-MM-DD)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`

      const res = await fetch(`/api/matches/today?date=${dateStr}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      return {
        matches: json.data || [],
        source: json.source || 'LIVE API',
        count: json.count || 0,
        lastUpdated: json.lastUpdated || new Date().toISOString(),
        error: json.error,
      }
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
  async getMatchBySlug(slugOrId: string): Promise<{ match: Match | null; h2h: Match[] }> {
    try {
      const res = await fetch(`/api/matches/${slugOrId}`)
      if (!res.ok) throw new Error('Failed to fetch match details')
      const json = await res.json()
      return {
        match: json.match || null,
        h2h: json.h2h || [],
      }
    } catch {
      const d = await provider.getMatchBySlug(slugOrId)
      return { match: d ? normalizeMatch(d) : null, h2h: [] }
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
  async getH2H(teamAId: string, teamBId: string): Promise<Match[]> {
    return mockMatches
      .filter(
        (m) =>
          (m.homeTeam.id === teamAId && m.awayTeam.id === teamBId) ||
          (m.homeTeam.id === teamBId && m.awayTeam.id === teamAId)
      )
      .map(normalizeMatch)
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
          topScorers: [],
          fixtures: [],
          errorType: json.notFound ? 'notFound' : 'unavailable',
        }
      }
      return {
        league: json.league || null,
        standings: json.standings || [],
        topScorers: json.topScorers || [],
        fixtures: json.fixtures || [],
      }
    } catch (err) {
      console.error(`Error fetching league data for ${slugOrId} (season: ${season}):`, err)
      return {
        league: null,
        standings: [],
        topScorers: [],
        fixtures: [],
        errorType: 'unavailable',
      }
    }
  },
  async getLeagues(): Promise<League[]> {
    return (await provider.getLeagues()).map(normalizeLeague)
  },
  async getTopLeagues(): Promise<League[]> {
    return (await provider.getLeagues()).map(normalizeLeague)
  },
  async getLeagueBySlug(slug: string): Promise<League | null> {
    const full = await this.getLeagueFullData(slug)
    return full.league
  },

  // ── Players ───────────────────────────────────────────────────────────────
  async getPlayerBySlug(slug: string): Promise<Player | null> {
    const normSlug = slug.toLowerCase().trim()
    const d = await provider.getPlayerBySlug(normSlug)
    if (d) return normalizePlayer(d)

    // Manifest fallback for FC Barcelona & Real Madrid players
    const allManifest = (await import('@/lib/playerMatcher')).getAllManifestPlayers()
    const match = allManifest.find(
      (mp) => mp.slug === normSlug || mp.id.toLowerCase() === normSlug || mp.full_name.toLowerCase().includes(normSlug)
    )

    if (match) {
      const publicPath = `/images/players/${match.club_key}/${match.slug}.webp`
      return {
        id: match.id,
        slug: match.slug,
        name: match.display_name || match.full_name,
        firstName: match.display_name.split(' ')[0] || '',
        lastName: match.display_name.split(' ').slice(1).join(' ') || '',
        photo: publicPath,
        image: publicPath,
        imagePath: publicPath,
        imageSourceUrl: match.image_source_url,
        squadNumber: match.squad_number,
        nationality: 'Global',
        dateOfBirth: '',
        age: 0,
        position: match.position,
        number: match.squad_number,
        teamName: match.club,
        teamSlug: match.club_key,
        marketValue: '€80M',
        stats: { appearances: 26, goals: 12, assists: 8, yellowCards: 2, redCards: 0, minutesPlayed: 2100, rating: 8.2 },
        seasonStats: { appearances: 26, goals: 12, assists: 8, yellowCards: 2, redCards: 0, minutesPlayed: 2100, rating: 8.2 },
      }
    }

    return null
  },
  async getTopScorers(leagueId?: string): Promise<Player[]> {
    return (await provider.getTopScorers(leagueId)).map(normalizePlayer)
  },

  // ── Standings & Top Scorers ────────────────────────────────────────────────
  async getStandingsByLeague(leagueId: string): Promise<LeagueStanding[]> {
    const full = await this.getLeagueFullData(leagueId)
    return full.standings
  },
  async getTopScorersByLeague(leagueId: string): Promise<TopScorer[]> {
    const full = await this.getLeagueFullData(leagueId)
    return full.topScorers
  },

  // ── News ──────────────────────────────────────────────────────────────────
  async getNews(): Promise<NewsArticle[]> {
    return (await provider.getNews()).map(normalizeNewsArticle)
  },
  async getNewsByLeague(_leagueId: string): Promise<NewsArticle[]> {
    return (await provider.getNews()).map(normalizeNewsArticle)
  },
  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
    const d = await provider.getNewsArticleBySlug(slug)
    return d ? normalizeNewsArticle(d) : null
  },
  async getFeaturedNews(): Promise<NewsArticle[]> {
    return (await provider.getFeaturedNews()).map(normalizeNewsArticle)
  },
  async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    return (await provider.getNewsByCategory(category)).map(normalizeNewsArticle)
  },
}
