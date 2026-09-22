import { NextRequest, NextResponse } from 'next/server'
import { mockPlayers } from '@/data/mockPlayers'
import { mockTeams } from '@/data/mockTeams'
import { mockLeagues } from '@/data/mockLeagues'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    if (!q || q.length < 2) {
      return NextResponse.json({ players: [], teams: [], leagues: [] })
    }

    // Filter players
    const matchingPlayers = mockPlayers
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.team?.name.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        position: p.position,
        number: p.number,
        teamName: p.team?.name || 'Club',
        teamLogo: p.team?.logo,
        photo: p.photo,
      }))

    // Filter teams
    const matchingTeams = mockTeams
      .filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.shortName?.toLowerCase().includes(q) ||
        t.abbreviation?.toLowerCase().includes(q)
      )
      .slice(0, 5)

    // Filter leagues
    const matchingLeagues = mockLeagues
      .filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.shortName?.toLowerCase().includes(q)
      )
      .slice(0, 4)

    return NextResponse.json({
      players: matchingPlayers,
      teams: matchingTeams,
      leagues: matchingLeagues,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Search failed', players: [], teams: [], leagues: [] },
      { status: 500 }
    )
  }
}
