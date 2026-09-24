import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import {
  normalizeApiFootballTeamDetails,
  normalizeApiFootballSquadPlayer,
  normalizeApiFootballTeamStats,
  normalizeApiFootballMatch
} from '@/services/sports/normalizers'
import { Team } from '@/types/team'
import { Match } from '@/types/match'
import { Player } from '@/types/player'
import { matchLocalPlayerImage, getAllManifestPlayers } from '@/lib/playerMatcher'
import { mockTeams } from '@/data/mockTeams'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Map website team slugs / IDs to API-Football provider numeric team IDs
const TEAM_PROVIDER_IDS: Record<string, number> = {
  'fc-barcelona': 529,
  'barcelona': 529,
  'fcb': 529,
  '529': 529,
  'real-madrid': 541,
  'madrid': 541,
  'rma': 541,
  '541': 541,
  'manchester-city': 50,
  'man-city': 50,
  'manchester-united': 33,
  'man-utd': 33,
  'arsenal': 42,
  'liverpool': 40,
  'chelsea': 49,
  'tottenham': 47,
  'tottenham-hotspur': 47,
  'newcastle': 34,
  'aston-villa': 66,
  'bayern-munich': 157,
  'borussia-dortmund': 165,
  'dortmund': 165,
  'bayer-leverkusen': 168,
  'paris-saint-germain': 85,
  'psg': 85,
  'inter': 505,
  'inter-milan': 505,
  'ac-milan': 489,
  'milan': 489,
  'juventus': 496,
  'juve': 496,
  'napoli': 492,
  'roma': 497,
  'as-roma': 497,
  'atletico-madrid': 530,
  'atletico': 530,
  'benfica': 211,
  'sporting-cp': 228,
  'sporting': 228,
  'porto': 212,
  'fc-porto': 212,
  'ajax': 194,
  'al-hilal': 1021,
  'al-nassr': 1022,
  'al-ittihad': 1023,
  'wydad': 968,
  'wydad-ac': 968,
  'raja': 967,
  'raja-ca': 967,
  'al-ahly': 1040,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawSlugOrId = decodeURIComponent(id).replace(/^team-/, '').toLowerCase()
    const { searchParams } = new URL(request.url)
    const seasonQuery = searchParams.get('season')

    // 1. Resolve numeric provider ID
    const parsedNum = parseInt(rawSlugOrId, 10)
    let teamProviderId: number | null = !isNaN(parsedNum) && parsedNum > 0 ? parsedNum : null

    if (!teamProviderId && TEAM_PROVIDER_IDS[rawSlugOrId]) {
      teamProviderId = TEAM_PROVIDER_IDS[rawSlugOrId]
    }

    // Check database if not resolved yet
    let dbTeamRecord: any = null
    const cleanName = rawSlugOrId.replace(/-/g, ' ').trim()

    try {
      if (teamProviderId) {
        dbTeamRecord = await prisma.team.findUnique({
          where: { providerId: teamProviderId },
        })
      }

      if (!dbTeamRecord && cleanName) {
        dbTeamRecord = await prisma.team.findFirst({
          where: {
            OR: [
              { name: { contains: cleanName } },
              { code: { equals: rawSlugOrId.toUpperCase() } },
            ],
          },
        })
        if (dbTeamRecord?.providerId) {
          teamProviderId = dbTeamRecord.providerId
        }
      }
    } catch (dbErr) {
      console.warn('[API /api/teams/[id]] DB lookup warning:', dbErr)
    }

    // Try API-Football team search if still no provider ID and name is at least 3 chars
    if (!teamProviderId && cleanName.length >= 3 && apiFootballProvider.hasValidApiKey()) {
      try {
        const searchResults = await apiFootballProvider.searchTeams(cleanName)
        if (searchResults && searchResults.length > 0 && searchResults[0]?.team?.id) {
          teamProviderId = searchResults[0].team.id
        }
      } catch (searchErr) {
        console.warn(`[API /api/teams/[id]] API-Football search failed for "${cleanName}":`, searchErr)
      }
    }

    const { getStoredMatchesByTeam } = await import('@/lib/football/persistence/queries')

    // Check MySQL for team stored matches
    let dbMatches: Match[] = []
    if (teamProviderId) {
      try {
        dbMatches = await getStoredMatchesByTeam(teamProviderId, seasonQuery ? parseInt(seasonQuery, 10) : undefined)
      } catch (err) {
        console.warn(`[API /api/teams/[id]] getStoredMatchesByTeam failed:`, err)
      }
    }

    // Determine current season
    let currentSeason = seasonQuery ? parseInt(seasonQuery, 10) : null
    if (!currentSeason && dbMatches.length > 0) {
      currentSeason = parseInt(dbMatches[0].league.season, 10) || new Date().getFullYear()
    }
    if (!currentSeason) {
      currentSeason = new Date().getFullYear()
    }

    // 2. Fetch from API-Football if provider ID exists and API key is valid
    if (teamProviderId && apiFootballProvider.hasValidApiKey()) {
      try {
        const promises: Promise<any>[] = [
          apiFootballProvider.getTeamDetails(teamProviderId),
          apiFootballProvider.getTeamSquad(teamProviderId),
        ]

        if (dbMatches.length === 0) {
          promises.push(apiFootballProvider.getTeamFixtures(teamProviderId, currentSeason))
        } else {
          promises.push(Promise.resolve([]))
        }

        const [rawDetails, rawSquad, rawFixtures] = await Promise.all(promises)

        if (rawDetails || dbTeamRecord || dbMatches.length > 0) {
          const isHome = dbMatches[0]?.homeTeam.id === String(teamProviderId)
          const base = isHome ? dbMatches[0]?.homeTeam : dbMatches[0]?.awayTeam

          const team: Team = rawDetails
            ? normalizeApiFootballTeamDetails(rawDetails)
            : {
                id: String(teamProviderId),
                slug: base?.slug || dbTeamRecord?.code?.toLowerCase() || `team-${teamProviderId}`,
                name: base?.name || dbTeamRecord?.name || 'Team',
                shortName: base?.shortName || dbTeamRecord?.code || dbTeamRecord?.name?.slice(0, 10) || 'Team',
                abbreviation: base?.abbreviation || dbTeamRecord?.code || 'TEA',
                country: base?.country || dbTeamRecord?.country || 'Global',
                logo: base?.logo || dbTeamRecord?.logo || undefined,
                founded: dbTeamRecord?.founded || undefined,
                stadium: dbTeamRecord?.venueName || undefined,
                stadiumCapacity: dbTeamRecord?.venueCapacity || undefined,
              }

          const allFixtures: Match[] = dbMatches.length > 0
            ? dbMatches
            : (Array.isArray(rawFixtures) ? rawFixtures.map(normalizeApiFootballMatch) : [])

          const squadPlayers: Player[] = Array.isArray(rawSquad)
            ? rawSquad.map((rawP) => {
                const baseP = normalizeApiFootballSquadPlayer(rawP)
                const matched = matchLocalPlayerImage(
                  team.name,
                  baseP.name,
                  baseP.id,
                  baseP.slug
                )

                if (matched) {
                  return {
                    ...baseP,
                    image: matched.imagePath,
                    imagePath: matched.imagePath,
                    imageSourceUrl: matched.imageSourceUrl,
                    squadNumber: matched.squadNumber || baseP.number,
                    position: matched.position || baseP.position,
                    slug: matched.slug || baseP.slug,
                  }
                }
                return baseP
              })
            : []

          const goalkeepers = squadPlayers.filter(p => (p.position || '').toLowerCase().includes('goalkeeper'))
          const defenders = squadPlayers.filter(p => (p.position || '').toLowerCase().includes('defender'))
          const midfielders = squadPlayers.filter(p => (p.position || '').toLowerCase().includes('midfielder'))
          const forwards = squadPlayers.filter(p => {
            const pos = (p.position || '').toLowerCase()
            return pos.includes('attacker') || pos.includes('forward') || pos.includes('winger')
          })

          const fixtures = allFixtures.filter(m => m.status === 'scheduled')
          const results = allFixtures.filter(m => m.status === 'full_time')
          const lastMatch = results[results.length - 1] || null
          const nextMatch = fixtures[0] || null

          const recentForm = results.slice(-5).map(m => {
            const isH = m.homeTeam.id === String(teamProviderId)
            const myScore = isH ? (m.score.home ?? 0) : (m.score.away ?? 0)
            const oppScore = isH ? (m.score.away ?? 0) : (m.score.home ?? 0)
            if (myScore > oppScore) return 'W'
            if (myScore < oppScore) return 'L'
            return 'D'
          })

          const winsCount = results.filter(m => {
            const isH = m.homeTeam.id === String(teamProviderId)
            return isH ? (m.score.home ?? 0) > (m.score.away ?? 0) : (m.score.away ?? 0) > (m.score.home ?? 0)
          }).length
          const drawsCount = results.filter(m => (m.score.home ?? 0) === (m.score.away ?? 0)).length
          const lossesCount = results.filter(m => {
            const isH = m.homeTeam.id === String(teamProviderId)
            return isH ? (m.score.home ?? 0) < (m.score.away ?? 0) : (m.score.away ?? 0) < (m.score.home ?? 0)
          }).length

          return NextResponse.json({
            team,
            standingPosition: { rank: 1, points: 0 },
            nextMatch,
            lastMatch,
            recentForm,
            fixtures,
            results,
            stats: {
              played: allFixtures.length,
              wins: winsCount,
              draws: drawsCount,
              losses: lossesCount,
              fixtures: {
                played: allFixtures.length,
                wins: winsCount,
                draws: drawsCount,
                loses: lossesCount,
              },
              goalsScored: 0,
              goalsConceded: 0,
            },
            squad: {
              goalkeepers,
              defenders,
              midfielders,
              forwards,
              all: squadPlayers,
            },
            source: 'MyScore24 Real Team Feed (API-Football)',
          })
        }
      } catch (apifbErr) {
        console.warn(`[API /api/teams/${id}] API-Football query error:`, apifbErr)
      }
    }

    // 3. Fallback from MySQL database record if API-Football is unavailable or providerId had no API response
    if (dbTeamRecord) {
      const team: Team = {
        id: String(dbTeamRecord.providerId),
        slug: rawSlugOrId,
        name: dbTeamRecord.name,
        shortName: dbTeamRecord.code || dbTeamRecord.name.slice(0, 10),
        abbreviation: dbTeamRecord.code || 'TEA',
        country: dbTeamRecord.country || 'Global',
        logo: dbTeamRecord.logo || undefined,
        founded: dbTeamRecord.founded || undefined,
        stadium: dbTeamRecord.venueName || undefined,
        stadiumCapacity: dbTeamRecord.venueCapacity || undefined,
      }

      return NextResponse.json({
        team,
        standingPosition: { rank: 1, points: 0 },
        nextMatch: null,
        lastMatch: null,
        recentForm: [],
        fixtures: dbMatches.filter(m => m.status === 'scheduled'),
        results: dbMatches.filter(m => m.status === 'full_time'),
        stats: {
          played: dbMatches.length,
          wins: 0,
          draws: 0,
          losses: 0,
          fixtures: { played: dbMatches.length, wins: 0, draws: 0, loses: 0 },
          goalsScored: 0,
          goalsConceded: 0,
        },
        squad: {
          goalkeepers: [],
          defenders: [],
          midfielders: [],
          forwards: [],
          all: [],
        },
        source: 'MyScore24 Database Team Record',
      })
    }

    // 4. Fallback for static mock clubs (Barcelona / Real Madrid)
    const matchedStaticTeam = mockTeams.find(
      (tm) => tm.slug === rawSlugOrId || tm.id === rawSlugOrId || (rawSlugOrId.includes('barcelona') && tm.id === 'fcb') || (rawSlugOrId.includes('madrid') && tm.id === 'rma')
    )

    if (matchedStaticTeam || rawSlugOrId.includes('barcelona') || rawSlugOrId.includes('madrid')) {
      const clubKey = rawSlugOrId.includes('barcelona') ? 'fc-barcelona' : rawSlugOrId.includes('madrid') ? 'real-madrid' : matchedStaticTeam?.slug || 'fc-barcelona'
      const clubName = clubKey === 'fc-barcelona' ? 'FC Barcelona' : 'Real Madrid'
      
      const manifestPlayers = getAllManifestPlayers().filter((mp) => mp.club_key === clubKey)
      const squadPlayers: Player[] = manifestPlayers.map((mp) => {
        const publicPath = `/images/players/${clubKey}/${mp.slug}.webp`
        return {
          id: mp.id,
          slug: mp.slug,
          name: mp.display_name || mp.full_name,
          firstName: mp.display_name.split(' ')[0] || '',
          lastName: mp.display_name.split(' ').slice(1).join(' ') || '',
          photo: publicPath,
          image: publicPath,
          imagePath: publicPath,
          imageSourceUrl: mp.image_source_url,
          squadNumber: mp.squad_number,
          nationality: 'Global',
          dateOfBirth: '',
          age: 0,
          position: mp.position,
          number: mp.squad_number,
          teamName: clubName,
          teamSlug: clubKey,
        }
      })

      const goalkeepers = squadPlayers.filter(p => p.position.toLowerCase().includes('goalkeeper'))
      const defenders = squadPlayers.filter(p => p.position.toLowerCase().includes('defender'))
      const midfielders = squadPlayers.filter(p => p.position.toLowerCase().includes('midfielder'))
      const forwards = squadPlayers.filter(p => p.position.toLowerCase().includes('forward') || p.position.toLowerCase().includes('winger') || p.position.toLowerCase().includes('attacker'))

      return NextResponse.json({
        team: matchedStaticTeam || {
          id: clubKey,
          slug: clubKey,
          name: clubName,
          shortName: clubName,
          abbreviation: clubKey === 'fc-barcelona' ? 'FCB' : 'RMA',
          country: 'Spain',
        },
        standingPosition: { rank: 1, points: 0, leagueName: 'LaLiga' },
        nextMatch: null,
        lastMatch: null,
        recentForm: ['W', 'W', 'D', 'W', 'W'],
        fixtures: [],
        results: [],
        stats: {
          played: 28,
          wins: 22,
          draws: 4,
          losses: 2,
          fixtures: { played: 28, wins: 22, draws: 4, loses: 2 },
          goals: { for: 72, against: 24 },
          cleanSheets: 14,
          failedToScore: 2,
        },
        squad: {
          goalkeepers,
          defenders,
          midfielders,
          forwards,
          all: squadPlayers,
        },
        source: 'MyScore24 Local Team Roster',
      })
    }

    return NextResponse.json(
      { error: 'Team not found', notFound: true },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('[API /api/teams/[id]] Unhandled error:', error)
    return NextResponse.json(
      { error: error?.message || 'Team query failed' },
      { status: 500 }
    )
  }
}
