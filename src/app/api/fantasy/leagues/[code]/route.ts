import { NextRequest, NextResponse } from 'next/server'
import { getLeagueLeaderboard } from '@/lib/fantasy/data'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('perPage') || '50', 10)

    const data = await getLeagueLeaderboard(code.toUpperCase(), page, perPage)
    if (!data) {
      return NextResponse.json({ error: 'League not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    console.error('Error fetching league leaderboard:', err)
    return NextResponse.json({ error: 'Failed to retrieve league leaderboard.' }, { status: 500 })
  }
}
