import { NextRequest, NextResponse } from 'next/server'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { normalizeApiFootballMatchDetails, normalizeApiFootballMatch } from '@/services/sports/normalizers'
import { Match } from '@/types/match'
import { apiTelemetry } from '@/services/sports/apiTelemetry'
import { cacheEngine, CACHE_TTLS } from '@/services/sports/cacheEngine'
import { getStoredMatchByFixtureId } from '@/lib/football/persistence/queries'
import { upsertFixture } from '@/lib/football/persistence/fixtures'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id ? id.replace(/^match-/, '').trim() : ''
    const fixtureIdNum = Number(cleanId)

    if (!cleanId || isNaN(fixtureIdNum) || fixtureIdNum <= 0) {
      apiTelemetry.recordHit('INVALID_FIXTURE_ID', { fixtureId: id, reason: 'Invalid or non-numeric fixture ID' })
      return NextResponse.json(
        {
          error: 'Invalid match ID format. Expected numeric provider fixture ID.',
          code: 'MATCH_NOT_FOUND',
        },
        { status: 400 }
      )
    }

    const cacheKey = `match_summary:${cleanId}`

    // ── 1. Layered Cache Check (L1 Memory / In-Flight Single-Flight) ───────────
    const cachedEntry = cacheEngine.get<any>('match_detail', cleanId)
    if (cachedEntry) {
      apiTelemetry.recordMatchDetailHit('CACHE_HIT')
      const response = NextResponse.json({
        match: cachedEntry.match,
        h2h: cachedEntry.h2h || [],
        source: 'MyScore24 Layered Cache (Memory SWR)',
        resolution: 'CACHE_HIT',
      })
      response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
      return response
    }

    // ── 2. Database-First Check (MySQL by providerFixtureId) ───────────────────
    const storedMatch = await getStoredMatchByFixtureId(fixtureIdNum)
    if (storedMatch && storedMatch.isFinal) {
      apiTelemetry.recordMatchDetailHit('DATABASE_HIT')
      cacheEngine.set('match_detail', cleanId, { match: storedMatch, h2h: [] }, CACHE_TTLS.FINISHED_MATCH_DETAILS)

      const response = NextResponse.json({
        match: storedMatch,
        h2h: [],
        source: 'MyScore24 Persistent Database (Historical Final)',
        resolution: 'DATABASE_HIT',
        quotaSaved: true,
      })
      response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
      return response
    } else if (!storedMatch) {
      apiTelemetry.recordHit('MATCH_DB_MISS', { fixtureId: fixtureIdNum, reason: 'Match not stored in MySQL' })
    }

    // ── 3. API-Football Request (Only if match missing or ongoing/live) ────────
    if (apiFootballProvider.hasValidApiKey()) {
      try {
        const fixtureRes = await apiFootballProvider.getFixtureDetails(fixtureIdNum)

        if (fixtureRes.data) {
          apiTelemetry.recordHit('PROVIDER_HIT')

          // Persist the fixture into MySQL asynchronously
          upsertFixture(fixtureRes.data).catch((err) =>
            console.error(`[Persistence] Error upserting fixture ${fixtureIdNum}:`, err)
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

          const isFinished = match.status === 'full_time' || match.status === 'penalties'
          const ttl = isFinished ? CACHE_TTLS.FINISHED_MATCH_DETAILS : CACHE_TTLS.LIVE_MATCH_DETAILS
          cacheEngine.set('match_detail', cleanId, { match, h2h }, ttl)

          const response = NextResponse.json({
            match,
            h2h,
            source: 'MyScore24 Live Match Summary (API-Football & Database Synced)',
            resolution: 'PROVIDER_HIT',
          })
          response.headers.set('Cache-Control', isFinished ? 'public, max-age=300' : 'public, max-age=15')
          return response
        } else {
          apiTelemetry.recordHit('MATCH_PROVIDER_MISS', {
            fixtureId: fixtureIdNum,
            reason: 'API-Football returned no data for this fixture ID',
          })
        }
      } catch (apifbErr: any) {
        console.warn(`[API /api/matches/${id}] API-Football query failed:`, apifbErr?.message || apifbErr)
        apiTelemetry.recordHit('PROVIDER_ERROR', { fixtureId: fixtureIdNum, reason: apifbErr?.message })
      }
    }

    // ── 4. Fallback Source: MySQL Stored Record (Even if non-final or stale) ────
    if (storedMatch) {
      apiTelemetry.recordHit('FALLBACK_HIT')
      const response = NextResponse.json({
        match: storedMatch,
        h2h: [],
        source: 'MyScore24 Persistent Database (Stored Fallback)',
        resolution: 'FALLBACK_HIT',
      })
      response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
      return response
    }

    // ── 5. Clean Error Response ────────────────────────────────────────────────
    apiTelemetry.recordHit('MATCH_NOT_FOUND', {
      fixtureId: fixtureIdNum,
      reason: 'No record found in cache, database, or provider',
    })
    return NextResponse.json(
      {
        error: 'Match unavailable. No record found for this fixture ID.',
        code: 'MATCH_NOT_FOUND',
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('[API /api/matches/[id]] Server route error:', error)
    apiTelemetry.recordHit('DATABASE_ERROR')
    return NextResponse.json(
      {
        error: 'Database match summary query failed',
        code: 'DATABASE_ERROR',
        details: error?.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
