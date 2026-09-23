import { NextRequest, NextResponse } from 'next/server'
import { scanStoredFootballData } from '@/lib/football/validation/dataIntegrityValidator'
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

  try {
    // Audit stored data in MySQL (Guaranteed 0 API-Football calls)
    const auditResult = await scanStoredFootballData()

    // Retrieve recent broken routes and wasted request diagnostics
    const telemetry = apiTelemetry.getMetrics()

    return NextResponse.json({
      status: 'success',
      audit: auditResult,
      monitoring: {
        recentBrokenMatches: telemetry.recentBrokenMatches,
        recentWastedRequests: telemetry.recentWastedRequests,
        endpointBreakdown: telemetry.endpointCalls,
        quota: {
          used: telemetry.requestsUsedToday,
          remaining: telemetry.quotaRemaining,
          warningLevel: telemetry.quotaWarningLevel,
        },
      },
    })
  } catch (error: any) {
    console.error('[Data Audit API] Audit execution failed:', error)
    return NextResponse.json(
      {
        error: 'Data audit execution failed',
        details: error?.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
