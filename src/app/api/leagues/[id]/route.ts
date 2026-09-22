import { NextRequest, NextResponse } from 'next/server'
import { espnPublicProvider, LEAGUE_MAP } from '@/services/sports/espnPublicProvider'
import { League } from '@/types/league'
import { Standing } from '@/types/standing'
import { Match, MatchStatus } from '@/types/match'
import { TopScorer } from '@/types/standing'

// Resolve the ESPN code and league meta from slug/id (supports slug like 'premier-league', ESPN code 'eng.1', or numeric id)
function resolveLeagueMeta(rawId: string) {
  const key = rawId.toLowerCase()
  // Try direct match in LEAGUE_MAP
  if (LEAGUE_MAP[key]) return { code: LEAGUE_MAP[key].code, meta: LEAGUE_MAP[key] }
  // Try as an ESPN code directly
  const byCode = Object.values(LEAGUE_MAP).find(v => v.code === key)
  if (byCode) return { code: byCode.code, meta: byCode }
  // Default to the ESPN provider's lookup
  const code = espnPublicProvider.getEspnLeagueCode(key)
  const meta = espnPublicProvider.getLeagueMeta(key)
  return { code, meta }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { code, meta } = resolveLeagueMeta(id)

    // Fetch standings, current round fixtures, and top scorers concurrently
    const [rawEspnEntries, rawEspnMatches, topScorersRaw] = await Promise.all([
      espnPublicProvider.fetchStandings(code),
      espnPublicProvider.fetchMatchesForLeague(code),
      espnPublicProvider.fetchTopScorers(code)
    ])

    // ── Standings ──────────────────────────────────────────────────────────
    const isFriendly = code === 'fifa.friendly'
    let standings: Standing[] = []
    let groups: Array<{ groupName: string; standings: Standing[] }> | undefined = undefined

    if (!isFriendly && Array.isArray(rawEspnEntries)) {
      // Check if rawEspnEntries is array of groups (has 'standings' property)
      const isGrouped = rawEspnEntries.length > 0 && Boolean(rawEspnEntries[0].standings?.entries)

      if (isGrouped) {
        groups = rawEspnEntries.map((grp: any) => {
          const groupName = grp.name || 'Group'
          const groupEntries = grp.standings?.entries || []
          const grpStandings: Standing[] = groupEntries.map((e: any, idx: number) => {
            const statsMap: Record<string, number> = {}
            e.stats?.forEach((s: any) => { statsMap[s.name] = s.value })
            const teamId = e.team?.id || String(idx + 1)
            const teamName = e.team?.displayName || e.team?.name || `Team ${idx + 1}`
            const teamLogo = e.team?.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`
            const gf = statsMap['pointsFor'] ?? statsMap['goalsFor'] ?? 0
            const ga = statsMap['pointsAgainst'] ?? statsMap['goalsAgainst'] ?? 0
            return {
              position: statsMap['rank'] || idx + 1,
              team: {
                id: teamId,
                slug: `team-${teamId}`,
                name: teamName,
                shortName: teamName,
                abbreviation: teamName.substring(0, 3).toUpperCase(),
                logo: teamLogo,
                country: meta.country
              },
              played: statsMap['gamesPlayed'] || 0,
              won: statsMap['wins'] || 0,
              drawn: statsMap['ties'] || 0,
              lost: statsMap['losses'] || 0,
              goalsFor: gf,
              goalsAgainst: ga,
              goalDifference: gf - ga,
              points: statsMap['points'] || 0
            }
          })
          return { groupName, standings: grpStandings }
        })
        standings = groups[0]?.standings || []
      } else {
        standings = rawEspnEntries.map((e: any, idx: number) => {
          const statsMap: Record<string, number> = {}
          e.stats?.forEach((s: any) => { statsMap[s.name] = s.value })
          const teamId = e.team?.id || String(idx + 1)
          const teamName = e.team?.displayName || e.team?.name || `Club ${idx + 1}`
          const teamLogo = e.team?.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`
          const gf = statsMap['pointsFor'] ?? statsMap['goalsFor'] ?? 0
          const ga = statsMap['pointsAgainst'] ?? statsMap['goalsAgainst'] ?? 0
          return {
            position: statsMap['rank'] || idx + 1,
            team: {
              id: teamId,
              slug: `team-${teamId}`,
              name: teamName,
              shortName: teamName,
              abbreviation: teamName.substring(0, 3).toUpperCase(),
              logo: teamLogo,
              country: meta.country
            },
            played: statsMap['gamesPlayed'] || 0,
            won: statsMap['wins'] || 0,
            drawn: statsMap['ties'] || 0,
            lost: statsMap['losses'] || 0,
            goalsFor: gf,
            goalsAgainst: ga,
            goalDifference: gf - ga,
            points: statsMap['points'] || 0,
            form: ['W', 'D', 'W', 'L', 'W']
          }
        })
      }
    }

    // ── Fixtures ───────────────────────────────────────────────────────────
    const fixtures: Match[] = rawEspnMatches.map((m: any) => {
      const homeComp = m.competitors?.find((c: any) => c.homeAway === 'home')
      const awayComp = m.competitors?.find((c: any) => c.homeAway === 'away')

      let status: MatchStatus = 'scheduled'
      if (m.status?.type?.completed) status = 'full_time'
      else if (m.status?.type?.state === 'in') status = 'live'

      const matchDate = m.date ? new Date(m.date) : new Date()

      return {
        id: String(m.id),
        slug: `match-${m.id}`,
        league: {
          id: code,
          slug: code,
          name: meta.name,
          shortName: meta.name,
          logo: meta.logo,
          country: meta.country,
          countryCode: meta.country.substring(0, 3).toUpperCase(),
          season: '2026/2027',
      currentSeason: '2026/2027',
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
    })

    // ── Top Scorers ────────────────────────────────────────────────────────
    const topScorers: TopScorer[] = topScorersRaw.map((s: any) => ({
      playerId: String(s.playerId || '1'),
      playerSlug: s.playerSlug || `player-${s.playerId || 1}`,
      playerName: s.playerName || 'Player',
      photo: s.photo || '',
      teamId: String(s.teamId || '1'),
      teamSlug: s.teamSlug || 'club',
      teamName: s.teamName || 'Club',
      teamLogo: s.teamLogo || '',
      matches: s.matches || 0,
      goals: s.goals || 0,
      assists: s.assists || 0,
      penalties: s.penalties || 0
    }))

    // ── League Object ──────────────────────────────────────────────────────
    const league: League = {
      id: code,
      slug: code,
      name: meta.name,
      shortName: meta.name,
      logo: meta.logo,
      country: meta.country,
      countryCode: meta.country.substring(0, 3).toUpperCase(),
      season: '2026/2027',
      currentSeason: '2026/2027',
      currentRound: fixtures.length > 0 ? 'Matchday' : 'Regular Season',
      type: 'league'
    }

    return NextResponse.json({
      league,
      standings,
      groups,
      topScorers,
      fixtures,
      source: 'MyScore24 Real ESPN Live Feed'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'League query failed' },
      { status: 500 }
    )
  }
}
