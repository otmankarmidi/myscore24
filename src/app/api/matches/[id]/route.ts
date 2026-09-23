import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatchDetails, normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { Match } from '@/types/match'
import { mockMatches } from '@/data/mockMatches'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id.replace(/^match-/, '')

    // 0. Database-First Strategy: Check if match is already final in MySQL
    if (!isNaN(Number(cleanId))) {
      const { prisma } = await import('@/lib/prisma')
      const { formatDbMatchToAppMatch } = await import('@/lib/football/persistence/queries')

      const stored = await prisma.match.findUnique({
        where: { providerFixtureId: Number(cleanId) },
        include: {
          competition: { include: { country: true } },
          season: true,
          homeTeam: true,
          awayTeam: true,
        },
      })

      if (stored && stored.isFinal) {
        return NextResponse.json({
          match: formatDbMatchToAppMatch(stored),
          h2h: [],
          source: 'MyScore24 Persistent Database (Historical Final)',
          quotaSaved: true,
        })
      }
    }

    // 1. Primary Source: API-Football match details
    if (apiFootballProvider.hasValidApiKey() && !isNaN(Number(cleanId))) {
      try {
        const fixtureRes = await apiFootballProvider.getFixtureDetails(cleanId)
        if (fixtureRes.data) {
          // Persist the fixture into MySQL database
          const { upsertFixture } = await import('@/lib/football/persistence/fixtures')
          upsertFixture(fixtureRes.data).catch((err) =>
            console.error(`[Persistence] Error upserting match ${cleanId}:`, err)
          )

          const match = normalizeApiFootballMatchDetails(fixtureRes.data)
          let h2h: Match[] = []
          const homeId = fixtureRes.data.teams?.home?.id
          const awayId = fixtureRes.data.teams?.away?.id
          if (homeId && awayId) {
            try {
              const h2hRaw = await apiFootballProvider.getH2H(homeId, awayId)
              if (Array.isArray(h2hRaw) && h2hRaw.length > 0) {
                h2h = h2hRaw.map(normalizeApiFootballMatch)
              }
            } catch {}
          }

          return NextResponse.json({
            match,
            h2h,
            source: 'MyScore24 Live Match Summary (API-Football & Database Synced)'
          })
        }
      } catch (apifbErr) {
        console.warn(`[API /api/matches/${id}] API-Football details query failed:`, apifbErr)
      }
    }

    // 2. Fallback Source: MySQL Stored Record
    if (!isNaN(Number(cleanId))) {
      const { prisma } = await import('@/lib/prisma')
      const { formatDbMatchToAppMatch } = await import('@/lib/football/persistence/queries')

      const stored = await prisma.match.findUnique({
        where: { providerFixtureId: Number(cleanId) },
        include: {
          competition: { include: { country: true } },
          season: true,
          homeTeam: true,
          awayTeam: true,
        },
      })

      if (stored) {
        return NextResponse.json({
          match: formatDbMatchToAppMatch(stored),
          h2h: [],
          source: 'MyScore24 Persistent Database (Fallback)'
        })
      }
    }

    return NextResponse.json({ error: 'Match summary not found' }, { status: 404 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Database match summary query failed' },
      { status: 500 }
    )
  }
}
