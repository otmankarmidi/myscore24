import { NextRequest, NextResponse } from 'next/server'
import { apiTelemetry } from '@/services/sports/apiTelemetry'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN || 'myscore24_admin_secret_9823'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const authHeader = request.headers.get('x-admin-token') || request.headers.get('authorization')
  const queryToken = searchParams.get('token')

  const isAuthorized =
    authHeader === `Bearer ${ADMIN_TOKEN}` ||
    authHeader === ADMIN_TOKEN ||
    queryToken === ADMIN_TOKEN

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  const metrics = apiTelemetry.getMetrics()
  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    telemetry: metrics
  })
}
