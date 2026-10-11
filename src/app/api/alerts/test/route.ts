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
    const homeTeam = searchParams.get('home') || 'Lecce'
    const awayTeam = searchParams.get('away') || 'Bologna'
    const homeScore = parseInt(searchParams.get('homeScore') || '1', 10)
    const awayScore = parseInt(searchParams.get('awayScore') || '2', 10)
    const homeLogo = searchParams.get('homeLogo') || (homeTeam === 'Lecce' ? 'https://media.api-sports.io/football/teams/867.png' : undefined)
    const awayLogo = searchParams.get('awayLogo') || (awayTeam === 'Bologna' ? 'https://media.api-sports.io/football/teams/500.png' : undefined)

    const alert = pushCustomAlert({
      matchId,
      type: typeParam,
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      homeTeamLogo: homeLogo,
      awayTeamLogo: awayLogo,
      homeScore,
      awayScore,
      scorerName: typeParam === 'full_time' ? undefined : scorer,
      minute,
      title: typeParam === 'full_time' ? '🏁 FULL-TIME' : typeParam === 'penalty' ? '⚽ PENALTY GOAL!' : typeParam === 'red_card' ? '🟥 RED CARD' : typeParam === 'yellow_card' ? '🟨 YELLOW CARD' : '⚽ GOAL!',
      message: typeParam === 'full_time' ? 'Final result' : `${scorer} scored! ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`
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
