import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { Match } from '@/types/match'
import { processMatchAlerts } from '@/services/sports/alertService'
import { persistFixturesBatch } from '@/lib/football/persistence/fixtures'
import { getStoredMatchesByDate, hasFinalMatchesForDate } from '@/lib/football/persistence/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const todayStr = new Date().toISOString().split('T')[0]
  const dateParam = searchParams.get('date') || todayStr
  const isHistoricalPast = dateParam < todayStr

  // ── 1. Database-First Strategy for Historical Dates ────────────────────────
  if (isHistoricalPast) {
    const hasFinals = await hasFinalMatchesForDate(dateParam)
    if (hasFinals) {
      const storedMatches = await getStoredMatchesByDate(dateParam)
      if (storedMatches.length > 0) {
        const response = NextResponse.json({
          data: storedMatches,
          source: 'MyScore24 Persistent Database (Historical)',
          date: dateParam,
          count: storedMatches.length,
          lastUpdated: new Date().toISOString(),
          quotaSaved: true,
        })
        response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
        return response
      }
    }
  }

  // ── 2. Primary Source: API-Football (Synchronized with MySQL) ───────────────
  if (apiFootballProvider.hasValidApiKey()) {
    try {
      const apiRes = await apiFootballProvider.getFixturesByDate(dateParam)
      if (apiRes.data && apiRes.data.length > 0) {
        // Persist the fixtures into MySQL database asynchronously in the background
        persistFixturesBatch(apiRes.data).catch((err) =>
          console.error('[Persistence] Background upsert error:', err)
        )

        const matches: Match[] = apiRes.data.map(normalizeApiFootballMatch)

        try {
          apiRes.data.forEach((m) => processMatchAlerts(m as any))
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
          suspended: 9,
        }
        matches.sort((a, b) => {
          const ordA = statusOrder[a.status] || 5
          const ordB = statusOrder[b.status] || 5
          if (ordA !== ordB) return ordA - ordB
          return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
        })

        const response = NextResponse.json({
          data: matches,
          source: 'MyScore24 Real Feed (API-Football & Database Synced)',
          date: dateParam,
          count: matches.length,
          lastUpdated: new Date().toISOString(),
          quotaRemaining: apiRes.remainingQuota || null,
        })
        response.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
        return response
      }
    } catch (apiErr) {
      console.warn('[API /api/matches/today] API-Football query failed:', apiErr)
    }
  }

  // ── 3. Provider Failure Fallback: Check MySQL Persistent Database ──────────
  const storedFallbackMatches = await getStoredMatchesByDate(dateParam)
  if (storedFallbackMatches.length > 0) {
    const fallbackRes = NextResponse.json({
      data: storedFallbackMatches,
      source: 'MyScore24 Persistent Database (Fallback)',
      date: dateParam,
      count: storedFallbackMatches.length,
      lastUpdated: new Date().toISOString(),
    })
    fallbackRes.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
    return fallbackRes
  }

  // ── 4. Clean Empty State when No Matches Exist ─────────────────────────────
  const emptyRes = NextResponse.json({
    data: [],
    source: 'MyScore24 Real Feed',
    date: dateParam,
    count: 0,
    lastUpdated: new Date().toISOString(),
  })
  emptyRes.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
  return emptyRes
}
