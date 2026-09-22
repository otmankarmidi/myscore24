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
  'bayern-munich': 157,
  'paris-saint-germain': 85,
  'arsenal': 42,
  'liverpool': 40,
  'chelsea': 49,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawSlugOrId = id.replace(/^team-/, '').toLowerCase()

    // 1. Resolve team provider numeric ID or keep numeric string
    const mappedProviderId = TEAM_PROVIDER_IDS[rawSlugOrId] || (parseInt(rawSlugOrId, 10) ? parseInt(rawSlugOrId, 10) : null)
    const teamId = mappedProviderId || rawSlugOrId
    const currentSeason = 2026

    // 2. Fetch from API-Football if valid key and numeric ID exists
    if (typeof teamId === 'number' && apiFootballProvider.hasValidApiKey()) {
      try {
        const [rawDetails, rawSquad, rawFixtures] = await Promise.all([
          apiFootballProvider.getTeamDetails(teamId),
          apiFootballProvider.getTeamSquad(teamId),
          apiFootballProvider.getTeamFixtures(teamId, currentSeason)
        ])

        if (rawDetails) {
          const team: Team = normalizeApiFootballTeamDetails(rawDetails)
          const allFixtures: Match[] = Array.isArray(rawFixtures)
            ? rawFixtures.map(normalizeApiFootballMatch)
            : []

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

          const goalkeepers = squadPlayers.filter(p => p.position.toLowerCase().includes('goalkeeper'))
          const defenders = squadPlayers.filter(p => p.position.toLowerCase().includes('defender'))
          const midfielders = squadPlayers.filter(p => p.position.toLowerCase().includes('midfielder'))
          const forwards = squadPlayers.filter(p => p.position.toLowerCase().includes('attacker') || p.position.toLowerCase().includes('forward'))

          const fixtures = allFixtures.filter(m => m.status === 'scheduled')
          const results = allFixtures.filter(m => m.status === 'full_time')
          const lastMatch = results[results.length - 1] || null
          const nextMatch = fixtures[0] || null

          const recentForm = results.slice(-5).map(m => {
            const isHome = m.homeTeam.id === String(teamId)
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
              played: allFixtures.length,
              wins: results.filter(m => {
                const isHome = m.homeTeam.id === String(teamId)
                return isHome ? (m.score.home ?? 0) > (m.score.away ?? 0) : (m.score.away ?? 0) > (m.score.home ?? 0)
              }).length,
              draws: results.filter(m => (m.score.home ?? 0) === (m.score.away ?? 0)).length,
              losses: results.filter(m => {
                const isHome = m.homeTeam.id === String(teamId)
                return isHome ? (m.score.home ?? 0) < (m.score.away ?? 0) : (m.score.away ?? 0) < (m.score.home ?? 0)
              }).length,
              goalsScored: 0,
              goalsConceded: 0
            },
            squad: {
              goalkeepers,
              defenders,
              midfielders,
              forwards,
              all: squadPlayers
            },
            source: 'MyScore24 Real Team Feed (API-Football)'
          })
        }
      } catch (apifbErr) {
        console.warn(`[API /api/teams/${id}] API-Football query failed:`, apifbErr)
      }
    }

    // 3. Fallback for FC Barcelona / Real Madrid from local manifest data
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
          fixtures: { played: 28, wins: 22, draws: 4, loses: 2 },
          goals: { for: 72, against: 24 },
          cleanSheets: 14,
          failedToScore: 2
        },
        squad: {
          goalkeepers,
          defenders,
          midfielders,
          forwards,
          all: squadPlayers
        },
        source: 'MyScore24 Local Team Roster'
      })
    }

    return NextResponse.json(
      { error: 'Team not found', notFound: true },
      { status: 404 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Team query failed' },
      { status: 500 }
    )
  }
}
