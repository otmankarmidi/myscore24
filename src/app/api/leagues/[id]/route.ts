import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import {
  normalizeApiFootballStanding,
  normalizeApiFootballTopScorer,
  normalizeApiFootballMatch
} from '@/services/sports/normalizers'
import { League } from '@/types/league'
import { Standing, TopScorer } from '@/types/standing'
import { Match } from '@/types/match'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const LEAGUE_SLUG_TO_ID: Record<string, number> = {
  'premier-league': 39,
  'eng.1': 39,
  '39': 39,
  'la-liga': 140,
  'esp.1': 140,
  '140': 140,
  'serie-a': 135,
  'ita.1': 135,
  '135': 135,
  'bundesliga': 78,
  'ger.1': 78,
  '78': 78,
  'ligue-1': 61,
  'fra.1': 61,
  '61': 61,
  'champions-league': 2,
  'uefa.champions': 2,
  '2': 2,
  'europa-league': 3,
  '3': 3,
  'botola-pro': 200,
  'mar.1': 200,
  '200': 200,
  'saudi-pro-league': 307,
  'ksa.1': 307,
  '307': 307,
  'eredivisie': 88,
  'ned.1': 88,
  '88': 88,
  'primeira-liga': 94,
  'por.1': 94,
  '94': 94,
  'mls': 253,
  'usa.1': 253,
  '253': 253,
}

function resolveLeagueId(rawId: string): number {
  const key = rawId.toLowerCase()
  if (LEAGUE_SLUG_TO_ID[key]) return LEAGUE_SLUG_TO_ID[key]
  const parsed = parseInt(rawId, 10)
  return isNaN(parsed) ? 39 : parsed
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const leagueId = resolveLeagueId(id)
    const { searchParams } = new URL(request.url)
    const seasonQuery = searchParams.get('season')
    const requestedSeason = seasonQuery ? parseInt(seasonQuery, 10) : 2024

    // ── 1. Database-First Check for Stored Competition Matches ───────────────
    const { getStoredMatchesByCompetition } = await import('@/lib/football/persistence/queries')
    const storedMatches = await getStoredMatchesByCompetition(leagueId, requestedSeason)

    if (apiFootballProvider.hasValidApiKey()) {
      try {
        const [leagueRaw, standingsRaw, topScorersRaw, fixturesRaw] = await Promise.all([
          apiFootballProvider.getLeagueDetails(leagueId),
          apiFootballProvider.getLeagueStandings(leagueId, requestedSeason),
          apiFootballProvider.getLeagueTopScorers(leagueId, requestedSeason),
          apiFootballProvider.getLeagueFixtures(leagueId, requestedSeason).catch(() => [])
        ])

        const standings: Standing[] = Array.isArray(standingsRaw)
          ? standingsRaw.map(normalizeApiFootballStanding)
          : []
        const topScorers: TopScorer[] = Array.isArray(topScorersRaw)
          ? topScorersRaw.map(normalizeApiFootballTopScorer)
          : []
        let fixtures: Match[] = Array.isArray(fixturesRaw) && fixturesRaw.length > 0
          ? fixturesRaw.map(normalizeApiFootballMatch)
          : storedMatches

        const leagueMeta = leagueRaw?.league || {}
        const countryMeta = leagueRaw?.country || {}
        const leagueName = leagueMeta.name || 'Premier League'

        const seasonsList = [
          { year: 2024, current: true, label: '2024/2025' },
          { year: 2023, current: false, label: '2023/2024' },
          { year: 2022, current: false, label: '2022/2023' }
        ]

        const league: League = {
          id: String(leagueId),
          slug: id,
          name: leagueName,
          shortName: leagueName.slice(0, 10),
          logo: leagueMeta.logo || 'https://media.api-sports.io/football/leagues/39.png',
          country: countryMeta.name || 'England',
          countryCode: (countryMeta.code || 'GB').slice(0, 2).toUpperCase(),
          countryFlag: countryMeta.flag,
          season: String(requestedSeason),
          currentSeason: '2024',
          selectedSeason: String(requestedSeason),
          seasons: seasonsList,
          currentRound: fixtures.length > 0 ? fixtures[fixtures.length - 1].round || 'Regular Season' : 'Regular Season',
          type: 'league'
        }

        return NextResponse.json({
          league,
          standings,
          topScorers,
          fixtures,
          source: 'MyScore24 Real Live Feed (API-Football & Database Synced)'
        })
      } catch (apifbErr) {
        console.warn(`[API /api/leagues/${id}] API-Football query failed:`, apifbErr)
      }
    }

    // ── 2. Fallback to MySQL Persistent Database ─────────────────────────────
    if (storedMatches.length > 0) {
      const firstMatch = storedMatches[0]
      const league: League = {
        id: String(leagueId),
        slug: id,
        name: firstMatch.league.name,
        shortName: firstMatch.league.shortName,
        logo: firstMatch.league.logo,
        country: firstMatch.league.country,
        countryCode: firstMatch.league.countryCode,
        countryFlag: firstMatch.league.countryFlag,
        season: String(requestedSeason),
        currentSeason: '2024',
        selectedSeason: String(requestedSeason),
        seasons: [
          { year: 2024, current: true, label: '2024/2025' },
          { year: 2023, current: false, label: '2023/2024' },
          { year: 2022, current: false, label: '2022/2023' }
        ],
        currentRound: 'Regular Season',
        type: 'league'
      }

      return NextResponse.json({
        league,
        standings: [],
        topScorers: [],
        fixtures: storedMatches,
        source: 'MyScore24 Persistent Database (Historical)'
      })
    }

    return NextResponse.json(
      { error: 'League not found' },
      { status: 404 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'League query failed' },
      { status: 500 }
    )
  }
}
