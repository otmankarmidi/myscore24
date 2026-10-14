import { NextResponse } from 'next/server'
import { getFantasyGameweeks, getCurrentGameweek } from '@/lib/fantasy/data'

export async function GET() {
  try {
    const gameweeks = await getFantasyGameweeks()
    const current = await getCurrentGameweek()

    return NextResponse.json({
      success: true,
      currentGameweek: current
        ? {
            id: current.id,
            gameweekNumber: current.gameweekNumber,
            name: current.name,
            deadline: current.deadline,
            status: current.status,
            isCurrent: current.isCurrent,
          }
        : null,
      gameweeks: gameweeks.map((gw: any) => ({
        id: gw.id,
        gameweekNumber: gw.gameweekNumber,
        name: gw.name,
        deadline: gw.deadline,
        status: gw.status,
        isCurrent: gw.isCurrent,
        totalFixtures: gw.totalFixtures,
        fixturesCount: gw.fixtures.length,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching gameweeks:', err)
    return NextResponse.json({ error: 'Failed to retrieve gameweeks.' }, { status: 500 })
  }
}
