import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { Match } from '@/types/match'
import { processMatchAlerts } from '@/services/sports/alertService'
import { mockMatches } from '@/data/mockMatches'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]

  // Primary Source: API-Football (v3.football.api-sports.io)
  if (apiFootballProvider.hasValidApiKey()) {
    try {
      const apiRes = await apiFootballProvider.getFixturesByDate(dateParam)
      if (apiRes.data && apiRes.data.length > 0) {
        const matches: Match[] = apiRes.data.map(normalizeApiFootballMatch)

        try {
          apiRes.data.forEach(m => processMatchAlerts(m as any))
        } catch {}

        // Sort: Live first, then scheduled by kickoff time, then completed
        const statusOrder: Record<string, number> = {
          live: 1,
          half_time: 2,
          extra_time: 3,
          penalties: 4,
          scheduled: 5,
          full_time: 6,
          postponed: 7,
          cancelled: 8,
          suspended: 9
        }
        matches.sort((a, b) => {
          const ordA = statusOrder[a.status] || 5
          const ordB = statusOrder[b.status] || 5
          if (ordA !== ordB) return ordA - ordB
          return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
        })

        const response = NextResponse.json({
          data: matches,
          source: 'MyScore24 Real Feed (API-Football)',
          date: dateParam,
          count: matches.length,
          lastUpdated: new Date().toISOString(),
          quotaRemaining: apiRes.remainingQuota || null
        })
        response.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
        return response
      }
    } catch (apiErr) {
      console.warn('[API /api/matches/today] API-Football error:', apiErr)
    }
  }

  // Fallback Source: Resilient Mock Matches
  const fallbackRes = NextResponse.json({
    data: mockMatches,
    source: 'MyScore24 Resilient Feed',
    date: dateParam,
    count: mockMatches.length,
    lastUpdated: new Date().toISOString()
  })
  fallbackRes.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
  return fallbackRes
}
