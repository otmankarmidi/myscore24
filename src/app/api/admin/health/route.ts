import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cacheEngine } from '@/services/sports/cacheEngine'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { apiTelemetry } from '@/services/sports/apiTelemetry'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isAuthorized(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET || process.env.ADMIN_SECRET_TOKEN
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('x-admin-token') ||
    request.headers.get('x-admin-secret') ||
    ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  const { searchParams } = new URL(request.url)
  const queryToken = searchParams.get('token')

  if (adminSecret) {
    return token === adminSecret || queryToken === adminSecret
  }

  // Development convenience fallback: allow localhost requests if no secret set
  const host = request.headers.get('host') || ''
  return host.includes('localhost') || host.includes('127.0.0.1')
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  // 1. Database Health Check (Zero-cost SELECT 1)
  let databaseStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  let matchesCount = 0
  let teamsCount = 0
  let competitionsCount = 0
  let seasonsCount = 0
  let invalidMatches = 0
  let duplicates = 0
  let brokenRelations = 0

  try {
    await prisma.$queryRaw`SELECT 1 as connected;`

    const [mCount, tCount, cCount, sCount] = await Promise.all([
      prisma.match.count(),
      prisma.team.count(),
      prisma.competition.count(),
      prisma.season.count(),
    ])

    matchesCount = mCount
    teamsCount = tCount
    competitionsCount = cCount
    seasonsCount = sCount

    // Fast indexed checks for basic integrity anomalies
    const [invalidFixtureCount, selfPlayCount, duplicateFixtureRows] = await Promise.all([
      prisma.match.count({
        where: { providerFixtureId: { lte: 0 } },
      }),
      prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(*) as cnt FROM matches WHERE homeTeamId = awayTeamId;
      `,
      prisma.$queryRaw<Array<{ cnt: bigint }>>`
        SELECT COUNT(*) as cnt FROM (
          SELECT providerFixtureId FROM matches GROUP BY providerFixtureId HAVING COUNT(*) > 1
        ) as dupes;
      `,
    ])

    invalidMatches = invalidFixtureCount
    brokenRelations = Number(selfPlayCount[0]?.cnt || 0)
    duplicates = Number(duplicateFixtureRows[0]?.cnt || 0)
  } catch (dbErr) {
    console.error('[Health Check] Database connectivity check failed:', dbErr)
    databaseStatus = 'unhealthy'
  }

  // 2. Cache Engine Health Check
  const cacheStats = cacheEngine.getStats()
  const cacheStatus = cacheStats.isHealthy ? 'healthy' : 'degraded'

  // 3. API-Football Provider Readiness (Zero API quota consumed)
  let providerStatus: 'healthy' | 'cooldown' | 'unhealthy' = 'healthy'
  if (!apiFootballProvider.hasValidApiKey()) {
    providerStatus = 'unhealthy'
  } else if (apiTelemetry.isInCooldown()) {
    providerStatus = 'cooldown'
  }

  // 4. Telemetry Metrics
  const telemetry = apiTelemetry.getMetrics()

  return NextResponse.json({
    status: databaseStatus === 'healthy' && cacheStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database: databaseStatus,
    cache: cacheStatus,
    footballProvider: providerStatus,
    quota: {
      used: telemetry.requestsUsedToday,
      remaining: telemetry.quotaRemaining,
      dailyLimit: telemetry.dailyQuotaLimit,
      warningLevel: telemetry.quotaWarningLevel,
    },
    data: {
      matches: matchesCount,
      teams: teamsCount,
      competitions: competitionsCount,
      seasons: seasonsCount,
    },
    issues: {
      invalidMatches,
      duplicates,
      brokenRelations,
      unnecessaryCalls: telemetry.unnecessaryProviderRequests,
      brokenMatchRoutes: telemetry.matchDetailNotFound + telemetry.invalidFixtureId,
    },
  })
}
