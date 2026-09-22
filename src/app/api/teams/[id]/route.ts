import { NextRequest, NextResponse } from 'next/server'
import { espnPublicProvider, LEAGUE_MAP } from '@/services/sports/espnPublicProvider'
import { Team } from '@/types/team'
import { Match, MatchStatus } from '@/types/match'

// Map ESPN match to our Match type
function mapEspnMatch(m: any, leagueCode: string): Match {
  const homeComp = m.competitors?.find((c: any) => c.homeAway === 'home')
  const awayComp = m.competitors?.find((c: any) => c.homeAway === 'away')
  const meta = espnPublicProvider.getLeagueMeta(leagueCode)

  let status: MatchStatus = 'scheduled'
  if (m.status?.type?.completed) status = 'full_time'
  else if (m.status?.type?.state === 'in') status = 'live'

  const matchDate = m.date ? new Date(m.date) : new Date()

  return {
    id: String(m.id),
    slug: `match-${m.id}`,
    league: {
      id: leagueCode,
      slug: leagueCode,
      name: meta.name,
      shortName: meta.name,
      logo: meta.logo,
      country: meta.country,
      countryCode: meta.country.substring(0, 3).toUpperCase(),
      season: '2026/2027',
      type: 'league'
    },
    homeTeam: {
      id: String(homeComp?.team?.id || '1'),
      slug: `team-${homeComp?.team?.id || '1'}`,
      name: homeComp?.team?.displayName || 'Home Club',
      shortName: homeComp?.team?.name || 'Home',
      abbreviation: homeComp?.team?.abbreviation || 'HOM',
      logo: homeComp?.team?.logo || '',
      country: meta.country
    },
    awayTeam: {
      id: String(awayComp?.team?.id || '2'),
      slug: `team-${awayComp?.team?.id || '2'}`,
      name: awayComp?.team?.displayName || 'Away Club',
      shortName: awayComp?.team?.name || 'Away',
      abbreviation: awayComp?.team?.abbreviation || 'AWY',
      logo: awayComp?.team?.logo || '',
      country: meta.country
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
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find team across all known leagues from ESPN
    // We search by numeric ESPN team id
    const leagueCodes = Object.values(LEAGUE_MAP)
      .map(v => v.code)
      .filter((v, i, a) => a.indexOf(v) === i) // unique codes

    // Fetch all league matches in parallel and find matches for this team
    const allLeagueMatches = await Promise.allSettled(
      leagueCodes.map(code => espnPublicProvider.fetchMatchesForLeague(code).then(matches => ({ code, matches })))
    )

    let teamName = `Club`
    let teamLogo = `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`
    let teamCountry = 'International'
    const allTeamMatches: Match[] = []

    allLeagueMatches.forEach(result => {
      if (result.status !== 'fulfilled') return
      const { code, matches } = result.value

      matches.forEach(m => {
        const homeComp = m.competitors?.find((c: any) => c.homeAway === 'home')
        const awayComp = m.competitors?.find((c: any) => c.homeAway === 'away')

        // Match by ESPN team id
        if (homeComp?.team?.id === id || awayComp?.team?.id === id) {
          // Extract team info
          const comp = homeComp?.team?.id === id ? homeComp : awayComp
          if (comp?.team) {
            teamName = comp.team.displayName || comp.team.name || teamName
            teamLogo = comp.team.logo || teamLogo
            const meta = espnPublicProvider.getLeagueMeta(code)
            teamCountry = meta.country || teamCountry
          }
          allTeamMatches.push(mapEspnMatch(m, code))
        }
      })
    })

    const team: Team = {
      id: String(id),
      slug: `team-${id}`,
      name: teamName,
      shortName: teamName,
      abbreviation: teamName.substring(0, 3).toUpperCase(),
      logo: teamLogo,
      country: teamCountry,
      stadium: 'Club Stadium',
      stadiumCapacity: 50000
    }

    const fixtures = allTeamMatches.filter(m => m.status === 'scheduled')
    const results = allTeamMatches.filter(m => m.status === 'full_time')
    const lastMatch = results[results.length - 1] || null
    const nextMatch = fixtures[0] || null

    // Generate simple recent form from results
    const recentForm = results.slice(-5).map(m => {
      const isHome = m.homeTeam.id === id
      const myScore = isHome ? (m.score.home ?? 0) : (m.score.away ?? 0)
      const oppScore = isHome ? (m.score.away ?? 0) : (m.score.home ?? 0)
      if (myScore > oppScore) return 'W'
      if (myScore < oppScore) return 'L'
      return 'D'
    })

    return NextResponse.json({
      team,
      standingPosition: { rank: 1, points: 0 },
      nextMatch,
      lastMatch,
      recentForm,
      fixtures,
      results,
      stats: {
        played: allTeamMatches.length,
        wins: results.filter(m => {
          const isHome = m.homeTeam.id === id
          return isHome ? (m.score.home ?? 0) > (m.score.away ?? 0) : (m.score.away ?? 0) > (m.score.home ?? 0)
        }).length,
        draws: results.filter(m => (m.score.home ?? 0) === (m.score.away ?? 0)).length,
        losses: results.filter(m => {
          const isHome = m.homeTeam.id === id
          return isHome ? (m.score.home ?? 0) < (m.score.away ?? 0) : (m.score.away ?? 0) < (m.score.home ?? 0)
        }).length,
        goalsScored: 0,
        goalsConceded: 0
      },
      squad: { goalkeepers: [], defenders: [], midfielders: [], forwards: [], all: [] },
      source: 'MyScore24 Real ESPN Team Feed'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Team query failed' },
      { status: 500 }
    )
  }
}
