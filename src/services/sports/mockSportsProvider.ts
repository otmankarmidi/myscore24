import { Match } from '@/types/match'
import { Team } from '@/types/team'
import { League } from '@/types/league'
import { Player } from '@/types/player'
import { LeagueStandings } from '@/types/standing'
import { NewsArticle } from '@/types/news'
import { mockMatches, getMatchBySlug, getLiveMatches, getMatchesByLeague, getMatchesByStatus } from '@/data/mockMatches'
import { mockTeams, getTeamBySlug } from '@/data/mockTeams'
import { mockLeagues, getLeagueBySlug } from '@/data/mockLeagues'
import { mockPlayers, getPlayerBySlug, getTopScorers } from '@/data/mockPlayers'
import { mockStandings, getStandingsByLeagueId } from '@/data/mockStandings'
import { mockNews, getNewsBySlug, getFeaturedNews, getNewsByCategory } from '@/data/mockNews'

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms))

export const mockSportsProvider = {
  async getMatchesToday(): Promise<Match[]> { await delay(); return mockMatches },
  async getLiveMatches(): Promise<Match[]> { await delay(200); return getLiveMatches() },
  async getMatchById(id: string): Promise<Match | undefined> { await delay(); return mockMatches.find(m => m.id === id) },
  async getMatchBySlug(slug: string): Promise<Match | undefined> { await delay(); return getMatchBySlug(slug) },
  async getMatchesByLeague(leagueId: string): Promise<Match[]> { await delay(); return getMatchesByLeague(leagueId) },
  async getMatchesByStatus(status: string): Promise<Match[]> { await delay(); return getMatchesByStatus(status) },
  async getTeams(): Promise<Team[]> { await delay(); return mockTeams },
  async getTeamBySlug(slug: string): Promise<Team | undefined> { await delay(); return getTeamBySlug(slug) },
  async getLeagues(): Promise<League[]> { await delay(); return mockLeagues },
  async getLeagueBySlug(slug: string): Promise<League | undefined> { await delay(); return getLeagueBySlug(slug) },
  async getPlayerBySlug(slug: string): Promise<Player | undefined> { await delay(); return getPlayerBySlug(slug) },
  async getTopScorers(leagueId?: string): Promise<Player[]> { await delay(); return getTopScorers(leagueId) },
  async getStandingsByLeague(leagueId: string): Promise<LeagueStandings | undefined> { await delay(); return getStandingsByLeagueId(leagueId) },
  async getNews(): Promise<NewsArticle[]> { await delay(); return mockNews },
  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> { await delay(); return getNewsBySlug(slug) },
  async getFeaturedNews(): Promise<NewsArticle[]> { await delay(200); return getFeaturedNews() },
  async getNewsByCategory(category: string): Promise<NewsArticle[]> { await delay(); return getNewsByCategory(category) },
}
