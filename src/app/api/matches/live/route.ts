import { NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { Match } from '@/types/match'
import { mockMatches } from '@/data/mockMatches'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  // Primary Source: API-Football Live Fixtures
  if (apiFootballProvider.hasValidApiKey()) {
    try {
      const apiRes = await apiFootballProvider.getLiveFixtures()
      if (apiRes.data && apiRes.data.length > 0) {
        const liveMatches: Match[] = apiRes.data.map(normalizeApiFootballMatch)
        return NextResponse.json({
          data: liveMatches,
          source: 'MyScore24 Real Live Matches Feed (API-Football)',
          count: liveMatches.length,
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (err: any) {
      console.warn('[API /api/matches/live] API-Football live fetch error:', err?.message || err)
    }
  }

  // Return clean empty array if no live matches exist in API
  return NextResponse.json({
    data: [],
    source: 'MyScore24 Real Live Matches Feed',
    count: 0,
    lastUpdated: new Date().toISOString()
  })
}
