import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballPlayerFull } from '@/services/sports/normalizers'
import { resolveApiFootballPlayerId } from '@/data/knownPlayerIds'
import { sportsService } from '@/services/sports/sportsService'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Player ID or slug required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const season = parseInt(searchParams.get('season') || '2026', 10)

    const numericId = resolveApiFootballPlayerId(id)

    if (numericId) {
      const { getOrSyncPlayerProfile } = await import('@/services/sports/playerService')
      const player = await getOrSyncPlayerProfile(Number(numericId), id)
      if (player) {
        return NextResponse.json({
          player,
          source: 'DATABASE_OR_SYNC',
        })
      }
    }

    // Fallback to sportsService resolution
    const fallbackPlayer = await sportsService.getPlayerBySlug(id)
    if (!fallbackPlayer) {
      return NextResponse.json({ error: 'Player not found', notFound: true }, { status: 404 })
    }

    return NextResponse.json({
      player: fallbackPlayer,
      source: 'LOCAL_FALLBACK',
    })
  } catch (err: any) {
    console.error('Error fetching player in /api/players/[id]:', err)
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 })
  }
}
