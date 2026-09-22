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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id.replace(/^team-/, '')
    const teamId = parseInt(cleanId, 10) || cleanId
    const currentSeason = 2026

    if (apiFootballProvider.hasValidApiKey()) {
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
            ? rawSquad.map(normalizeApiFootballSquadPlayer)
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

    return NextResponse.json(
      { error: 'Team not found' },
      { status: 404 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Team query failed' },
      { status: 500 }
    )
  }
}
