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

    const {
      getStoredMatchesByCompetition,
      getCurrentSeasonForCompetition,
      getAvailableSeasonsForCompetition,
    } = await import('@/lib/football/persistence/queries')

    // ── 1. Resolve Target Season & Current Season Dynamically (No Hardcoding) ──
    let dbCurrentSeason = await getCurrentSeasonForCompetition(leagueId)
    let leagueDetails: any = null

    // If current season not yet known in MySQL or details needed, query API-Football (cached)
    if (!dbCurrentSeason && apiFootballProvider.hasValidApiKey()) {
      leagueDetails = await apiFootballProvider.getLeagueDetails(leagueId)
      if (leagueDetails?.seasons) {
        const found = leagueDetails.seasons.find((s: any) => s.current === true)
        if (found) {
          dbCurrentSeason = Number(found.year)
          const { upsertCompetition, upsertSeason } = await import('@/lib/football/persistence/fixtures')
          const comp = await upsertCompetition(leagueDetails.league)
          if (comp) {
            await upsertSeason(comp.id, dbCurrentSeason, true)
          }
        }
      }
    }

    const currentSeason = dbCurrentSeason || new Date().getFullYear()
    const requestedSeason = seasonQuery ? parseInt(seasonQuery, 10) : currentSeason

    // ── 2. Database-First Check for Stored Competition Matches ───────────────
    let storedMatches = await getStoredMatchesByCompetition(leagueId, requestedSeason)

    // Build available seasons list dynamically from MySQL
    let dbSeasons = await getAvailableSeasonsForCompetition(leagueId)
    if (dbSeasons.length === 0 && leagueDetails?.seasons) {
      dbSeasons = leagueDetails.seasons.map((s: any) => ({
        year: s.year,
        current: s.current || s.year === currentSeason,
        label: `${s.year}/${s.year + 1}`,
      }))
    }
    if (dbSeasons.length === 0) {
      dbSeasons = [{ year: requestedSeason, current: true, label: `${requestedSeason}/${requestedSeason + 1}` }]
    }

    if (apiFootballProvider.hasValidApiKey()) {
      try {
        if (!leagueDetails) {
          leagueDetails = await apiFootballProvider.getLeagueDetails(leagueId)
        }

        const seasonMeta = leagueDetails?.seasons?.find((s: any) => s.year === requestedSeason)
        const coverage = seasonMeta?.coverage || {}

        // Coverage-gated queries
        const canFetchStandings = coverage.standings !== false
        const canFetchTopScorers = coverage.top_scorers !== false
        const canFetchFixtures = coverage.fixtures !== false

        const promises: Promise<any>[] = [
          canFetchStandings ? apiFootballProvider.getLeagueStandings(leagueId, requestedSeason).catch(() => []) : Promise.resolve([]),
          canFetchTopScorers ? apiFootballProvider.getLeagueTopScorers(leagueId, requestedSeason).catch(() => []) : Promise.resolve([]),
        ]

        // Only query fixtures from provider if not already stored in MySQL
        if (storedMatches.length === 0 && canFetchFixtures) {
          promises.push(apiFootballProvider.getLeagueFixtures(leagueId, requestedSeason).catch(() => []))
        } else {
          promises.push(Promise.resolve([]))
        }

        const [standingsRaw, topScorersRaw, fixturesRaw] = await Promise.all(promises)

        // If fixtures were returned from API, persist them in background
        if (fixturesRaw && fixturesRaw.length > 0 && storedMatches.length === 0) {
          const { persistFixturesBatch } = await import('@/lib/football/persistence/fixtures')
          persistFixturesBatch(fixturesRaw).catch(console.error)
        }

        const standings: Standing[] = Array.isArray(standingsRaw)
          ? standingsRaw.map(normalizeApiFootballStanding)
          : []
        const topScorers: TopScorer[] = Array.isArray(topScorersRaw)
          ? topScorersRaw.map(normalizeApiFootballTopScorer)
          : []
        const fixtures: Match[] = storedMatches.length > 0
          ? storedMatches
          : (Array.isArray(fixturesRaw) ? fixturesRaw.map(normalizeApiFootballMatch) : [])

        const leagueMeta = leagueDetails?.league || {}
        const countryMeta = leagueDetails?.country || {}
        const leagueName = leagueMeta.name || (fixtures[0]?.league?.name) || 'Competition'

        const league: League = {
          id: String(leagueId),
          slug: id,
          name: leagueName,
          shortName: leagueName.slice(0, 10),
          logo: leagueMeta.logo || fixtures[0]?.league?.logo,
          country: countryMeta.name || fixtures[0]?.league?.country || 'Global',
          countryCode: (countryMeta.code || fixtures[0]?.league?.countryCode || 'WW').slice(0, 2).toUpperCase(),
          countryFlag: countryMeta.flag || fixtures[0]?.league?.countryFlag,
          season: String(requestedSeason),
          currentSeason: String(currentSeason),
          selectedSeason: String(requestedSeason),
          seasons: dbSeasons,
          currentRound: fixtures.length > 0 ? fixtures[fixtures.length - 1].round || 'Regular Season' : 'Regular Season',
          type: 'league',
        }

        return NextResponse.json({
          league,
          standings,
          topScorers,
          fixtures,
          source: storedMatches.length > 0 ? 'MySQL Database (Stored)' : 'API-Football (Synced)',
        })
      } catch (apifbErr) {
        console.warn(`[API /api/leagues/${id}] API-Football query failed:`, apifbErr)
      }
    }

    // ── 3. Fallback to MySQL Persistent Database ─────────────────────────────
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
        currentSeason: String(currentSeason),
        selectedSeason: String(requestedSeason),
        seasons: dbSeasons,
        currentRound: 'Regular Season',
        type: 'league',
      }

      return NextResponse.json({
        league,
        standings: [],
        topScorers: [],
        fixtures: storedMatches,
        source: 'MySQL Persistent Database (Stored)',
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
