import { NextRequest, NextResponse } from 'next/server'
import { pushCustomAlert } from '@/services/sports/alertService'
import { AlertType } from '@/types/alerts'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId') || 'test-match-1'
    const typeParam = (searchParams.get('type') || 'goal') as AlertType
    const scorer = searchParams.get('scorer') || (typeParam === 'goal' ? 'Kylian Mbappé' : typeParam === 'penalty' ? 'Harry Kane' : 'Sergio Ramos')
    const minute = parseInt(searchParams.get('minute') || '67', 10)
    const homeTeam = searchParams.get('home') || 'Real Madrid'
    const awayTeam = searchParams.get('away') || 'Barcelona'
    const homeScore = parseInt(searchParams.get('homeScore') || '2', 10)
    const awayScore = parseInt(searchParams.get('awayScore') || '1', 10)

    const alert = pushCustomAlert({
      matchId,
      type: typeParam,
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      homeScore,
      awayScore,
      scorerName: scorer,
      minute,
      title: typeParam === 'penalty' ? '⚽ PENALTY GOAL!' : typeParam === 'red_card' ? '🟥 RED CARD' : typeParam === 'yellow_card' ? '🟨 YELLOW CARD' : '⚽ GOAL!',
      message: `${scorer} scored! ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`
    })

    return NextResponse.json({
      success: true,
      message: 'Test alert dispatched successfully',
      alert
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      matchId = 'test-match-1',
      type = 'goal',
      homeTeamName = 'Real Madrid',
      awayTeamName = 'Barcelona',
      homeScore = 1,
      awayScore = 0,
      scorerName,
      minute = 34,
      title,
      message,
    } = body

    const alert = pushCustomAlert({
      matchId: String(matchId),
      type: type as AlertType,
      homeTeamName,
      awayTeamName,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      scorerName,
      minute: Number(minute),
      title,
      message,
    })

    return NextResponse.json({
      success: true,
      message: 'Alert generated successfully',
      alert,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate alert' },
      { status: 500 }
    )
  }
}
