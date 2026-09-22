import { NextRequest, NextResponse } from 'next/server'
import { espnPublicProvider } from '@/services/sports/espnPublicProvider'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Secure Next.js Same-Origin ESPN Proxy Gateway
 * Routes:
 *   /api/espn/matches?date=YYYY-MM-DD
 *   /api/espn/scoreboard?league=eng.1&date=YYYY-MM-DD
 *   /api/espn/standings?league=eng.1
 *   /api/espn/scorers?league=eng.1
 *   /api/espn/summary?id=12345
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const endpoint = (slug && slug[0]) || ''
    const { searchParams } = new URL(request.url)

    switch (endpoint) {
      case 'matches': {
        const date = searchParams.get('date') || undefined
        const data = await espnPublicProvider.fetchAllTodayMatches()
        return NextResponse.json({
          data,
          source: 'Secure Same-Origin ESPN Gateway (/api/espn/matches)',
          count: data.length,
          timestamp: new Date().toISOString()
        })
      }

      case 'scoreboard': {
        const league = searchParams.get('league') || 'eng.1'
        const date = searchParams.get('date') || undefined
        const data = await espnPublicProvider.fetchMatchesForLeague(league, date)
        return NextResponse.json({
          data,
          league,
          count: data.length,
          source: 'Secure Same-Origin ESPN Gateway (/api/espn/scoreboard)',
          timestamp: new Date().toISOString()
        })
      }

      case 'standings': {
        const league = searchParams.get('league') || 'eng.1'
        const data = await espnPublicProvider.fetchStandings(league)
        return NextResponse.json({
          data,
          league,
          source: 'Secure Same-Origin ESPN Gateway (/api/espn/standings)',
          timestamp: new Date().toISOString()
        })
      }

      case 'scorers': {
        const league = searchParams.get('league') || 'eng.1'
        const data = await espnPublicProvider.fetchTopScorers(league)
        return NextResponse.json({
          data,
          league,
          source: 'Secure Same-Origin ESPN Gateway (/api/espn/scorers)',
          timestamp: new Date().toISOString()
        })
      }

      case 'summary': {
        const id = searchParams.get('id') || searchParams.get('event') || ''
        if (!id) {
          return NextResponse.json({ error: 'Missing match event ID' }, { status: 400 })
        }
        const data = await espnPublicProvider.fetchMatchSummary(id)
        if (!data) {
          return NextResponse.json({ error: 'Match summary not found' }, { status: 404 })
        }
        return NextResponse.json({
          data,
          source: 'Secure Same-Origin ESPN Gateway (/api/espn/summary)',
          timestamp: new Date().toISOString()
        })
      }

      default: {
        return NextResponse.json(
          {
            error: `Unknown ESPN endpoint: ${endpoint}`,
            validEndpoints: ['matches', 'scoreboard', 'standings', 'scorers', 'summary']
          },
          { status: 404 }
        )
      }
    }
  } catch (error: any) {
    console.warn('[ESPN Gateway] Error handling request:', error?.message)
    return NextResponse.json(
      { error: error?.message || 'Secure ESPN gateway error' },
      { status: 500 }
    )
  }
}
