import { NextRequest, NextResponse } from 'next/server'
import { espnPublicProvider } from '@/services/sports/espnPublicProvider'
import { getLeagueCountry } from '@/services/sports/databaseNormalizer'
import { Match, MatchStatus } from '@/types/match'
import { processMatchAlerts } from '@/services/sports/alertService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Fetch real matches for this date across all top global & international competitions
    const leagues = ['eng.1', 'esp.1', 'ger.1', 'ita.1', 'fra.1', 'uefa.champions', 'mar.1', 'ksa.1', 'por.1', 'ned.1', 'usa.1', 'fifa.friendly', 'caf.nations_qual']
    const results = await Promise.allSettled(
      leagues.map(code => espnPublicProvider.fetchMatchesForLeague(code, dateParam))
    )

    const rawEspnMatches: any[] = []
    results.forEach(res => {
      if (res.status === 'fulfilled') {
        rawEspnMatches.push(...res.value)
      }
    })

    // Process alerts server-side by comparing live states
    const alertsList: any[] = []
    rawEspnMatches.forEach(m => {
      const generated = processMatchAlerts(m)
      if (generated.length > 0) alertsList.push(...generated)
    })

    const matches: Match[] = rawEspnMatches.map((m: any) => {
      const homeComp = m.competitors?.find((c: any) => c.homeAway === 'home')
      const awayComp = m.competitors?.find((c: any) => c.awayAway === 'away') || m.competitors?.find((c: any) => c.homeAway === 'away')

      let status: MatchStatus = 'scheduled'
      if (m.status?.type?.completed) status = 'full_time'
      else if (m.status?.type?.state === 'in') {
        status = m.status?.period === 1 ? 'live' : m.status?.period === 2 ? 'live' : 'half_time'
      }

      const matchDate = m.date ? new Date(m.date) : new Date()
      const kickoffTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const country = getLeagueCountry(m.leagueName || m.leagueId)

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
          logo: homeComp?.team?.logo || (homeComp?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${homeComp.team.id}.png` : ''),
          country: country
        },
        awayTeam: {
          id: String(awayComp?.team?.id || '2'),
          slug: `team-${awayComp?.team?.id || '2'}`,
          name: awayComp?.team?.displayName || 'Away Team',
          shortName: awayComp?.team?.name || awayComp?.team?.displayName || 'Away',
          abbreviation: awayComp?.team?.abbreviation || 'AWY',
          logo: awayComp?.team?.logo || (awayComp?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${awayComp.team.id}.png` : ''),
          country: country
        },
        status,
        minute: m.status?.clock || 0,
        kickoff: m.date || matchDate.toISOString(),
        kickoffTime,
        venue: m.venue?.fullName || 'Stadium',
        round: 'Regular Season',
        score: {
          home: parseInt(homeComp?.score || '0'),
          away: parseInt(awayComp?.score || '0')
        }
      }
    })

    return NextResponse.json({
      data: matches,
      source: 'MyScore24 Real Date Live Feed (ESPN)',
      date: dateParam,
      count: matches.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { data: [], error: error?.message || 'Failed to fetch matches for date' },
      { status: 500 }
    )
  }
}
