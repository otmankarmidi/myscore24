import { NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { espnPublicProvider } from '@/services/sports/espnPublicProvider'
import { getLeagueCountry } from '@/services/sports/databaseNormalizer'
import { Match, MatchStatus } from '@/types/match'
import { mockMatches } from '@/data/mockMatches'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  // 1. Primary Source: API-Football Live Fixtures
  if (apiFootballProvider.hasValidApiKey()) {
    try {
      const apiRes = await apiFootballProvider.getLiveFixtures()
      if (apiRes.data && apiRes.data.length > 0) {
        const liveMatches: Match[] = apiRes.data.map(normalizeApiFootballMatch)
        return NextResponse.json({
          data: liveMatches,
          source: 'MyScore24 Real Live Matches Feed (API-Football)',
          count: liveMatches.length,
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (err: any) {
      console.warn('[API /api/matches/live] API-Football live fetch failed, attempting ESPN fallback:', err?.message || err)
    }
  }

  // 2. Secondary Fallback Source: ESPN Public Endpoints
  try {
    const rawAllMatches = await espnPublicProvider.fetchAllTodayMatches()

    // Filter live matches where state is 'in' or status is live / 1H / 2H / HT
    const liveRaw = rawAllMatches.filter(m => m.status?.type?.state === 'in')

    const liveMatches: Match[] = liveRaw.map((m: any) => {
      const homeComp = m.competitors?.find((c: any) => c.homeAway === 'home')
      const awayComp = m.competitors?.find((c: any) => c.homeAway === 'away')
      const country = getLeagueCountry(m.leagueName || m.leagueId)

      let status: MatchStatus = 'live'
      if (m.status?.period === 1) status = 'live'
      else if (m.status?.period === 2) status = 'live'

      const matchDate = m.date ? new Date(m.date) : new Date()

      return {
        id: String(m.id),
        slug: `match-${m.id}`,
        league: {
          id: String(m.leagueId || '39'),
          slug: m.leagueId || 'league',
          name: m.leagueName || 'Premier League',
          shortName: m.leagueName || 'League',
          logo: m.leagueLogo || 'https://media.api-sports.io/football/leagues/39.png',
          country: country,
          countryCode: country.substring(0, 3).toUpperCase(),
          season: '2026/2027',
          type: 'league'
        },
        homeTeam: {
          id: String(homeComp?.team?.id || '1'),
          slug: `team-${homeComp?.team?.id || '1'}`,
          name: homeComp?.team?.displayName || 'Home Team',
          shortName: homeComp?.team?.name || homeComp?.team?.displayName || 'Home',
          abbreviation: homeComp?.team?.abbreviation || 'HOM',
          logo: homeComp?.team?.logo || '',
          country: country
        },
        awayTeam: {
          id: String(awayComp?.team?.id || '2'),
          slug: `team-${awayComp?.team?.id || '2'}`,
          name: awayComp?.team?.displayName || 'Away Team',
          shortName: awayComp?.team?.name || awayComp?.team?.displayName || 'Away',
          abbreviation: awayComp?.team?.abbreviation || 'AWY',
          logo: awayComp?.team?.logo || '',
          country: country
        },
        status,
        minute: m.status?.clock || 0,
        kickoff: m.date || matchDate.toISOString(),
        kickoffTime: matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        venue: m.venue?.fullName || 'Stadium',
        round: 'Regular Season',
        score: {
          home: parseInt(homeComp?.score || '0'),
          away: parseInt(awayComp?.score || '0')
        }
      }
    })

    if (liveMatches.length > 0) {
      return NextResponse.json({
        data: liveMatches,
        source: 'MyScore24 Real Live Matches Feed (ESPN)',
        count: liveMatches.length,
        lastUpdated: new Date().toISOString()
      })
    }

    // 3. Tertiary Fallback Source: Mock matches live subset
    const fallbackLive = mockMatches.filter(m => m.status === 'live' || m.status === 'half_time')
    return NextResponse.json({
      data: fallbackLive,
      source: 'MyScore24 Live Matches Feed (Fallback)',
      count: fallbackLive.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Failed to fetch live matches from ESPN:', error)
    const fallbackLive = mockMatches.filter(m => m.status === 'live' || m.status === 'half_time')
    return NextResponse.json({
      data: fallbackLive,
      source: 'MyScore24 Resilient Fallback Feed',
      count: fallbackLive.length,
      lastUpdated: new Date().toISOString()
    })
  }
}
