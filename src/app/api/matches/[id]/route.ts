import { NextRequest, NextResponse } from 'next/server'
import { espnPublicProvider } from '@/services/sports/espnPublicProvider'
import { Match, MatchStatus, MatchEvent, MatchStatistics, MatchCommentaryItem, Lineup } from '@/types/match'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const summary = await espnPublicProvider.fetchMatchSummary(id)

    if (!summary || !summary.header) {
      return NextResponse.json({ error: 'Match summary not found' }, { status: 404 })
    }

    const comp = summary.header?.competitions?.[0] || {}
    const leagueMeta = summary.header?.league || {}
    const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home') || {}
    const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away') || {}

    // Match Status
    const statusType = comp.status?.type || {}
    let matchStatus: MatchStatus = 'scheduled'
    if (statusType.completed) matchStatus = 'full_time'
    else if (statusType.state === 'in') {
      matchStatus = comp.status?.period === 1 ? 'live' : comp.status?.period === 2 ? 'live' : 'half_time'
    }

    // Parse Statistics from Boxscore
    let statistics: MatchStatistics | undefined = undefined
    const teamStats = summary.boxscore?.teams
    if (teamStats && teamStats.length >= 2) {
      const homeStatsArr: any[] = teamStats[0]?.statistics || []
      const awayStatsArr: any[] = teamStats[1]?.statistics || []

      const getStatVal = (arr: any[], key: string): number => {
        const item = arr.find((s: any) => s.name === key)
        return item ? parseFloat(item.displayValue) || 0 : 0
      }

      statistics = {
        possession: { home: getStatVal(homeStatsArr, 'possessionPct') || 50, away: getStatVal(awayStatsArr, 'possessionPct') || 50 },
        shots: { home: getStatVal(homeStatsArr, 'totalShots') || 0, away: getStatVal(awayStatsArr, 'totalShots') || 0 },
        shotsOnTarget: { home: getStatVal(homeStatsArr, 'shotsOnTarget') || 0, away: getStatVal(awayStatsArr, 'shotsOnTarget') || 0 },
        corners: { home: getStatVal(homeStatsArr, 'wonCorners') || getStatVal(homeStatsArr, 'totalCrosses') || 0, away: getStatVal(awayStatsArr, 'wonCorners') || getStatVal(awayStatsArr, 'totalCrosses') || 0 },
        fouls: { home: getStatVal(homeStatsArr, 'foulsCommitted') || 0, away: getStatVal(awayStatsArr, 'foulsCommitted') || 0 },
        yellowCards: { home: getStatVal(homeStatsArr, 'yellowCards') || 0, away: getStatVal(awayStatsArr, 'yellowCards') || 0 },
        redCards: { home: getStatVal(homeStatsArr, 'redCards') || 0, away: getStatVal(awayStatsArr, 'redCards') || 0 },
        offsides: { home: getStatVal(homeStatsArr, 'offsides') || 0, away: getStatVal(awayStatsArr, 'offsides') || 0 }
      }
    }

    // Parse Lineups from Rosters
    let lineups: Lineup | undefined = undefined
    if (summary.rosters && summary.rosters.length >= 2) {
      const homeRoster = summary.rosters[0]
      const awayRoster = summary.rosters[1]

      const isLive = (matchStatus as string) === 'live' || (matchStatus as string) === 'half_time' || (matchStatus as string) === 'extra_time' || (matchStatus as string) === 'penalties'

      const mapRosterToPlayers = (arr: any[] = [], isStarter: boolean) => {
        return arr
          .filter((p: any) => isStarter ? p.starter : !p.starter)
          .map((p: any, idx: number) => {
            // Extract player rating from source if available
            let rawRating: number | undefined = undefined
            if (p.rating !== undefined && p.rating !== null && p.rating !== '') {
              const num = parseFloat(p.rating)
              if (!isNaN(num) && num > 0) rawRating = Math.round(num * 10) / 10
            } else {
              const ratingStat = p.stats?.find((s: any) => typeof s.name === 'string' && s.name.toLowerCase().includes('rating'))
              if (ratingStat && ratingStat.value !== undefined) {
                const num = parseFloat(ratingStat.value)
                if (!isNaN(num) && num > 0) rawRating = Math.round(num * 10) / 10
              }
            }

            const athleteId = p.athlete?.id ? String(p.athlete.id) : String(idx)

            return {
              id: athleteId,
              name: p.athlete?.displayName || p.athlete?.fullName || 'Player',
              number: parseInt(p.jersey || String(idx + 1)),
              position: p.position?.abbreviation || p.position?.name || 'M',
              positionX: isStarter ? ((idx % 4) + 1) * 20 : 0,
              positionY: isStarter ? Math.floor(idx / 4) * 25 + 10 : 0,
              formationPlace: p.formationPlace || p.position?.id || (idx + 1),
              rating: rawRating,
              ratingIsLive: rawRating !== undefined ? isLive : undefined,
              photo: p.athlete?.headshot?.href || (athleteId ? `https://a.espncdn.com/i/headshots/soccer/players/full/${athleteId}.png` : undefined),
              subbedIn: Boolean(p.subbedIn),
              subbedOut: Boolean(p.subbedOut),
              substituted: Boolean(p.subbedIn || p.subbedOut)
            }
          })
      }

      lineups = {
        home: {
          formation: homeRoster.formation || '4-3-3',
          starters: mapRosterToPlayers(homeRoster.roster, true),
          bench: mapRosterToPlayers(homeRoster.roster, false),
          coach: homeRoster.coach?.[0]?.firstName ? `${homeRoster.coach[0].firstName} ${homeRoster.coach[0].lastName}` : 'Manager'
        },
        away: {
          formation: awayRoster.formation || '4-3-3',
          starters: mapRosterToPlayers(awayRoster.roster, true),
          bench: mapRosterToPlayers(awayRoster.roster, false),
          coach: awayRoster.coach?.[0]?.firstName ? `${awayRoster.coach[0].firstName} ${awayRoster.coach[0].lastName}` : 'Manager'
        }
      }
    }

    // Parse Live Commentary Items
    const commentaryItems: MatchCommentaryItem[] = (summary.commentary || []).map((c: any, idx: number) => ({
      id: String(c.sequence || idx),
      minute: c.time?.displayValue ? parseInt(c.time.displayValue.replace(/\D/g, '')) || 0 : 0,
      type: c.text?.toLowerCase().includes('goal') ? 'goal' : c.text?.toLowerCase().includes('card') ? 'card' : 'comment',
      text: c.text || '',
      isImportant: c.text?.toLowerCase().includes('goal') || c.text?.toLowerCase().includes('red card')
    }))

    // Parse Events (Goals, Cards, Substitutions)
    const events: MatchEvent[] = (summary.keyEvents || []).map((ev: any, idx: number) => {
      const athlete = ev.participants?.[0]?.athlete
      const athleteId = athlete?.id ? String(athlete.id) : undefined
      const athleteSecondary = ev.participants?.[1]?.athlete
      const athleteSecondaryId = athleteSecondary?.id ? String(athleteSecondary.id) : undefined

      return {
        id: String(ev.id || idx),
        minute: ev.clock?.value ? Math.floor(ev.clock.value / 60) : 0,
        type: ev.scoringPlay ? 'goal' : ev.text?.toLowerCase().includes('yellow') ? 'yellow_card' : ev.text?.toLowerCase().includes('red') ? 'red_card' : 'substitution',
        team: ev.team?.id === homeComp.team?.id ? 'home' : 'away',
        playerName: athlete?.displayName || ev.text || 'Player',
        playerId: athleteId,
        playerPhoto: athlete?.headshot?.href || (athleteId ? `https://a.espncdn.com/i/headshots/soccer/players/full/${athleteId}.png` : undefined),
        playerNameSecondary: athleteSecondary?.displayName,
        playerIdSecondary: athleteSecondaryId,
        playerPhotoSecondary: athleteSecondary?.headshot?.href || (athleteSecondaryId ? `https://a.espncdn.com/i/headshots/soccer/players/full/${athleteSecondaryId}.png` : undefined),
        detail: ev.text || ''
      }
    })

    // Calculate highest rated player if rating data exists
    let highestRatedPlayer: Match['highestRatedPlayer'] = undefined
    if (lineups) {
      const allPlayers: { player: any; teamName: string; teamLogo?: string }[] = []
      const homeName = homeComp.team?.displayName || 'Home Team'
      const homeLogo = homeComp.team?.logo || ''
      const awayName = awayComp.team?.displayName || 'Away Team'
      const awayLogo = awayComp.team?.logo || ''

      ;[...(lineups.home.starters || []), ...(lineups.home.bench || [])].forEach(p => {
        if (p.rating !== undefined) allPlayers.push({ player: p, teamName: homeName, teamLogo: homeLogo })
      })
      ;[...(lineups.away.starters || []), ...(lineups.away.bench || [])].forEach(p => {
        if (p.rating !== undefined) allPlayers.push({ player: p, teamName: awayName, teamLogo: awayLogo })
      })

      if (allPlayers.length > 0) {
        allPlayers.sort((a, b) => b.player.rating - a.player.rating)
        const top = allPlayers[0]
        highestRatedPlayer = {
          id: top.player.id,
          name: top.player.name,
          photo: top.player.photo,
          teamName: top.teamName,
          teamLogo: top.teamLogo,
          rating: top.player.rating,
          isLive: top.player.ratingIsLive
        }
      }
    }

    const match: Match = {
      id: String(summary.header.id),
      slug: `match-${summary.header.id}`,
      league: {
        id: leagueMeta.id || '39',
        slug: leagueMeta.slug || 'league',
        name: leagueMeta.name || 'Football League',
        shortName: leagueMeta.abbreviation || leagueMeta.name || 'League',
        logo: leagueMeta.logos?.[0]?.href || 'https://media.api-sports.io/football/leagues/39.png',
        country: 'International',
        countryCode: 'INT',
        season: '2026/2027',
        type: 'league'
      },
      homeTeam: {
        id: String(homeComp.team?.id || '1'),
        slug: `team-${homeComp.team?.id || '1'}`,
        name: homeComp.team?.displayName || 'Home Team',
        shortName: homeComp.team?.name || 'Home',
        abbreviation: homeComp.team?.abbreviation || 'HOM',
        logo: homeComp.team?.logo || (homeComp.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${homeComp.team.id}.png` : ''),
        country: 'International'
      },
      awayTeam: {
        id: String(awayComp.team?.id || '2'),
        slug: `team-${awayComp.team?.id || '2'}`,
        name: awayComp.team?.displayName || 'Away Team',
        shortName: awayComp.team?.name || 'Away',
        abbreviation: awayComp.team?.abbreviation || 'AWY',
        logo: awayComp.team?.logo || (awayComp.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${awayComp.team.id}.png` : ''),
        country: 'International'
      },
      status: matchStatus,
      minute: comp.status?.clock || 0,
      kickoff: comp.date || new Date().toISOString(),
      kickoffTime: comp.date ? new Date(comp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '20:00',
      venue: comp.venue?.fullName || 'Stadium',
      round: 'Regular Season',
      score: {
        home: parseInt(homeComp.score || '0'),
        away: parseInt(awayComp.score || '0')
      },
      statistics,
      lineups,
      lineup: lineups,
      events,
      commentary: commentaryItems,
      highestRatedPlayer
    }

    return NextResponse.json({
      match,
      h2h: [],
      source: 'MyScore24 Live Match Summary (ESPN Real Feed)'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Database match summary query failed' },
      { status: 500 }
    )
  }
}
