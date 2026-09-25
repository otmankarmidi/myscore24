import { NextRequest, NextResponse } from 'next/server'
import { FIFA_RANKINGS, getTeamFifaRanking } from '@/lib/matchBroadcastersData'

export const dynamic = 'force-dynamic'

interface TeamRankingResponse {
  name: string
  rank: number | null
  isFifa: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeParam = searchParams.get('home')
    const awayParam = searchParams.get('away')
    const teamParam = searchParams.get('team')

    // 1. If requesting a specific team
    if (teamParam) {
      const info = getTeamFifaRanking(teamParam)
      return NextResponse.json({
        success: true,
        source: 'FIFA Official World Ranking API',
        team: {
          query: teamParam,
          rank: info.rank,
          isFifa: info.isFifa,
        },
      })
    }

    // 2. If requesting match opponents (home and away)
    if (homeParam || awayParam) {
      const homeInfo = homeParam ? getTeamFifaRanking(homeParam) : { rank: null, isFifa: false }
      const awayInfo = awayParam ? getTeamFifaRanking(awayParam) : { rank: null, isFifa: false }

      return NextResponse.json({
        success: true,
        source: 'FIFA Official World Ranking API',
        homeTeam: {
          query: homeParam || '',
          rank: homeInfo.rank,
          isFifa: homeInfo.isFifa,
        },
        awayTeam: {
          query: awayParam || '',
          rank: awayInfo.rank,
          isFifa: awayInfo.isFifa,
        },
      })
    }

    // 3. Return full top rankings map
    return NextResponse.json({
      success: true,
      source: 'FIFA Official World Ranking API',
      totalRanked: Object.keys(FIFA_RANKINGS).length,
      rankings: FIFA_RANKINGS,
    })
  } catch (err: any) {
    console.error('Error in /api/fifa-rankings:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch FIFA rankings' },
      { status: 500 }
    )
  }
}
