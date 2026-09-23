import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncCompetitionSeason, checkSeasonCoverage } from '@/lib/football/persistence/importer'
import { apiTelemetry } from '@/services/sports/apiTelemetry'

export const dynamic = 'force-dynamic'

/**
 * Validates admin request authentication.
 * Checks for ADMIN_SECRET or authorization header if configured.
 */
function isAuthorized(request: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    // If no secret configured in local dev, allow local requests only
    const host = request.headers.get('host') || ''
    return host.includes('localhost') || host.includes('127.0.0.1')
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  const customHeader = request.headers.get('x-admin-secret') || ''

  return token === adminSecret || customHeader === adminSecret
}

/**
 * GET: Retrieve status of import jobs, season coverage, and telemetry.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized access to admin importer.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const competitionId = searchParams.get('competitionId')
  const season = searchParams.get('season')

  try {
    const jobs = await prisma.importJob.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    let coverage = null
    if (competitionId && season) {
      coverage = await checkSeasonCoverage(Number(competitionId), Number(season))
    }

    const telemetryMetrics = apiTelemetry.getMetrics()

    return NextResponse.json({
      success: true,
      jobs,
      coverage,
      telemetry: telemetryMetrics,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to query import status' },
      { status: 500 }
    )
  }
}

/**
 * POST: Start, pause, or resume a historical import job.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized access to admin importer.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action = 'START', leagueProviderId, seasonYear, jobId } = body

    if (!leagueProviderId || !seasonYear) {
      return NextResponse.json(
        { error: 'Missing required parameters: leagueProviderId and seasonYear' },
        { status: 400 }
      )
    }

    // ── Action: PAUSE ──
    if (action === 'PAUSE' && jobId) {
      const pausedJob = await prisma.importJob.update({
        where: { id: jobId },
        data: { status: 'PAUSED' },
      })
      return NextResponse.json({ success: true, message: 'Import job paused.', job: pausedJob })
    }

    // ── Action: START / RESUME ──
    const result = await syncCompetitionSeason({
      leagueProviderId: Number(leagueProviderId),
      seasonYear: Number(seasonYear),
      jobId,
    })

    return NextResponse.json({
      success: result.status !== 'FAILED',
      result,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute import job' },
      { status: 500 }
    )
  }
}
