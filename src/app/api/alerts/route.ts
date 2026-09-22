import { NextRequest, NextResponse } from 'next/server'
import { getAlertsHistory, getLiveStateStore } from '@/services/sports/alertService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 20

    const alerts = getAlertsHistory(limit)
    const liveState = Array.from(getLiveStateStore().values())

    return NextResponse.json({
      alerts,
      liveStateCount: liveState.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { alerts: [], error: error?.message || 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
