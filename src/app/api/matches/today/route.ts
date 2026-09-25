import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { Match } from '@/types/match'
import { processMatchAlerts } from '@/services/sports/alertService'
import { persistFixturesBatch } from '@/lib/football/persistence/fixtures'
import { getStoredMatchesByDate, hasFinalMatchesForDate } from '@/lib/football/persistence/queries'
import { cacheEngine, CACHE_TTLS } from '@/services/sports/cacheEngine'
import { isApprovedCompetition, getCompetitionPriority } from '@/config/competitions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function sortMatches(matches: Match[]): Match[] {
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

  return matches.sort((a, b) => {
    // 1. Prioritize approved competition tier (Big 5 first: 1-5, Europe: 10-12, International: 20-27)
    const priorityA = getCompetitionPriority(a.league)
    const priorityB = getCompetitionPriority(b.league)
    if (priorityA !== priorityB) return priorityA - priorityB

    // 2. Status priority (live matches top)
    const ordA = statusOrder[a.status] || 5
    const ordB = statusOrder[b.status] || 5
    if (ordA !== ordB) return ordA - ordB

    // 3. Kickoff time
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const todayStr = new Date().toISOString().split('T')[0]
  const dateParam = searchParams.get('date') || todayStr
  const isFresh = searchParams.get('fresh') === '1'
  const isHistoricalPast = dateParam < todayStr
  const isToday = dateParam === todayStr

  // ── 1. Check L1 Memory Cache for Approved Fixtures ─────────────────────────
  const cacheKey = `approved_fixtures:${dateParam}`
  if (!isFresh || !isToday) {
    const cachedApproved = cacheEngine.get<Match[]>('fixtures', cacheKey)
    if (cachedApproved && cachedApproved.length > 0) {
      const response = NextResponse.json({
        data: cachedApproved,
        source: 'MyScore24 Layered Cache (Memory SWR)',
        date: dateParam,
        count: cachedApproved.length,
        lastUpdated: new Date().toISOString(),
        quotaSaved: true,
      })
      response.headers.set(
        'Cache-Control',
        isToday ? 'no-cache, no-store, must-revalidate' : 'public, max-age=1800, s-maxage=3600'
      )
      return response
    }
  }

  // ── 2. Database-First Strategy for Historical Dates ────────────────────────
  if (isHistoricalPast) {
    const hasFinals = await hasFinalMatchesForDate(dateParam)
    if (hasFinals) {
      const storedMatches = await getStoredMatchesByDate(dateParam)
      const approvedStored = sortMatches(storedMatches.filter((m) => isApprovedCompetition(m.league)))
      if (approvedStored.length > 0) {
        cacheEngine.set('fixtures', cacheKey, approvedStored, CACHE_TTLS.DATE_FIXTURES)
        const response = NextResponse.json({
          data: approvedStored,
          source: 'MyScore24 Persistent Database (Historical)',
          date: dateParam,
          count: approvedStored.length,
          lastUpdated: new Date().toISOString(),
          quotaSaved: true,
        })
        response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
        return response
      }
    }
  }

  // ── 3. Primary Provider (API-Football) Synchronized with MySQL ──────────────
  if (apiFootballProvider.hasValidApiKey()) {
    try {
      const apiRes = await apiFootballProvider.getFixturesByDate(dateParam)
      if (apiRes.data && apiRes.data.length > 0) {
        // Persist full provider fixtures in background for historical coverage
        persistFixturesBatch(apiRes.data).catch((err) =>
          console.error('[Persistence] Background upsert error:', err)
        )

        // Process in-app live score alerts
        try {
          apiRes.data.forEach((m) => processMatchAlerts(m as any))
        } catch {}

        // Normalize and filter strictly for approved competitions (Big 5, Europe, International)
        const allMatches: Match[] = apiRes.data.map(normalizeApiFootballMatch)
        const approvedMatches = sortMatches(allMatches.filter((m) => isApprovedCompetition(m.league)))

        // Cache filtered result
        const ttl = isToday ? CACHE_TTLS.TODAY_FIXTURES : CACHE_TTLS.DATE_FIXTURES
        cacheEngine.set('fixtures', cacheKey, approvedMatches, ttl)

        const response = NextResponse.json({
          data: approvedMatches,
          source: 'MyScore24 Real Feed (API-Football & Database Synced)',
          date: dateParam,
          count: approvedMatches.length,
          lastUpdated: new Date().toISOString(),
          quotaRemaining: apiRes.remainingQuota || null,
        })
        response.headers.set(
          'Cache-Control',
          isToday ? 'no-cache, no-store, must-revalidate' : 'public, max-age=1800, s-maxage=3600'
        )
        return response
      }
    } catch (apiErr) {
      console.warn('[API /api/matches/today] API-Football query failed:', apiErr)
    }
  }

  // ── 4. Provider Failure Fallback: Check MySQL Persistent Database ──────────
  const storedFallbackMatches = await getStoredMatchesByDate(dateParam)
  const approvedFallback = sortMatches(storedFallbackMatches.filter((m) => isApprovedCompetition(m.league)))
  if (approvedFallback.length > 0) {
    const fallbackRes = NextResponse.json({
      data: approvedFallback,
      source: 'MyScore24 Persistent Database (Fallback)',
      date: dateParam,
      count: approvedFallback.length,
      lastUpdated: new Date().toISOString(),
    })
    fallbackRes.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
    return fallbackRes
  }

  // ── 5. Clean Empty State when No Approved Matches Exist ────────────────────
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
