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
    const currentSeason = 2026

    if (apiFootballProvider.hasValidApiKey()) {
      try {
        const [leagueRaw, standingsRaw, topScorersRaw, fixturesRaw] = await Promise.all([
          apiFootballProvider.getLeagueDetails(leagueId),
          apiFootballProvider.getLeagueStandings(leagueId, currentSeason),
          apiFootballProvider.getLeagueTopScorers(leagueId, currentSeason),
          apiFootballProvider.getLeagueFixtures(leagueId, currentSeason)
        ])

        const standings: Standing[] = Array.isArray(standingsRaw)
          ? standingsRaw.map(normalizeApiFootballStanding)
          : []
        const topScorers: TopScorer[] = Array.isArray(topScorersRaw)
          ? topScorersRaw.map(normalizeApiFootballTopScorer)
          : []
        const fixtures: Match[] = Array.isArray(fixturesRaw)
          ? fixturesRaw.map(normalizeApiFootballMatch)
          : []

        const leagueMeta = leagueRaw?.league || {}
        const countryMeta = leagueRaw?.country || {}

        const leagueName = leagueMeta.name || 'Football League'

        const league: League = {
          id: String(leagueId),
          slug: id,
          name: leagueName,
          shortName: leagueName.slice(0, 10),
          logo: leagueMeta.logo || 'https://media.api-sports.io/football/leagues/39.png',
          country: countryMeta.name || 'Global',
          countryCode: (countryMeta.code || 'WW').slice(0, 2).toUpperCase(),
          countryFlag: countryMeta.flag,
          season: String(currentSeason),
          currentRound: fixtures.length > 0 ? fixtures[0].round || 'Matchday' : 'Regular Season',
          type: 'league'
        }

        return NextResponse.json({
          league,
          standings,
          topScorers,
          fixtures,
          source: 'MyScore24 Real Live Feed (API-Football)'
        })
      } catch (apifbErr) {
        console.warn(`[API /api/leagues/${id}] API-Football query failed:`, apifbErr)
      }
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
