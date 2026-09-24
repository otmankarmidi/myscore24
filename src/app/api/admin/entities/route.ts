import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRequestAdminAuthenticated } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!isRequestAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'competitions' | 'teams' | 'matches'
    const query = searchParams.get('q') || ''

    if (type === 'competitions') {
      const competitions = await prisma.competition.findMany({
        where: query ? { name: { contains: query } } : undefined,
        select: { id: true, providerId: true, name: true, logo: true },
        take: 30,
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ items: competitions })
    }

    if (type === 'teams') {
      const teams = await prisma.team.findMany({
        where: query ? { name: { contains: query } } : undefined,
        select: { id: true, providerId: true, name: true, logo: true, country: true },
        take: 30,
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ items: teams })
    }

    if (type === 'matches') {
      const matches = await prisma.match.findMany({
        take: 30,
        orderBy: { kickoff: 'desc' },
        include: {
          homeTeam: { select: { name: true, logo: true } },
          awayTeam: { select: { name: true, logo: true } },
          competition: { select: { name: true } },
        },
      })
      const formatted = matches.map((m: any) => ({
        id: m.providerFixtureId.toString(),
        title: `${m.homeTeam.name} vs ${m.awayTeam.name} (${new Date(m.kickoff).toLocaleDateString()})`,
        competition: m.competition.name,
      }))
      return NextResponse.json({ items: formatted })
    }

    return NextResponse.json({ error: 'Invalid entity type requested' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
