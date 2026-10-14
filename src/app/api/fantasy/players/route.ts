import { NextRequest, NextResponse } from 'next/server'
import { getFantasyPlayersCatalogue } from '@/lib/fantasy/data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const position = searchParams.get('position') || undefined
    const teamId = searchParams.get('teamId') || undefined
    const search = searchParams.get('search') || undefined
    const sortBy = (searchParams.get('sortBy') as any) || 'totalPoints'
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc'
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined

    const players = await getFantasyPlayersCatalogue({
      position,
      teamId,
      search,
      sortBy,
      sortOrder,
      maxPrice,
      minPrice,
      limit: 300,
    })

    return NextResponse.json({
      success: true,
      count: players.length,
      players: players.map((p: any) => ({
        id: p.id,
        name: p.name,
        webName: p.webName,
        teamId: p.teamId,
        teamName: p.team.name,
        teamShortName: p.teamShortName,
        teamLogo: p.team.logo,
        position: p.position,
        price: p.price,
        status: p.status,
        news: p.news,
        chanceOfPlaying: p.chanceOfPlaying,
        totalPoints: p.totalPoints,
        goalsTotal: p.goalsTotal,
        assistsTotal: p.assistsTotal,
        cleanSheetsTotal: p.cleanSheetsTotal,
        minutesTotal: p.minutesTotal,
        photo: p.photo,
        selectedByPercent: p.selectedByPercent,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching fantasy players catalogue:', err)
    return NextResponse.json({ error: 'Failed to retrieve players.' }, { status: 500 })
  }
}
