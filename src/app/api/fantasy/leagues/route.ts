import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFantasySessionUser } from '@/lib/fantasy/auth'
import crypto from 'crypto'
import { PL_COMPETITION_ID, CURRENT_FANTASY_SEASON } from '@/lib/fantasy/data'

function generateLeagueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const user = await getFantasySessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberships = await prisma.fantasyLeagueMember.findMany({
      where: { userId: user.id },
      include: {
        league: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      leagues: memberships.map((m: any) => ({
        id: m.league.id,
        name: m.league.name,
        code: m.league.code,
        type: m.league.type,
        isPublic: m.league.isPublic,
        membersCount: m.league._count.members,
        currentRank: m.currentRank,
        joinedAt: m.joinedAt,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching user leagues:', err)
    return NextResponse.json({ error: 'Failed to retrieve leagues.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getFantasySessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const squad = await prisma.fantasySquad.findUnique({
      where: { userId: user.id },
    })
    if (!squad) {
      return NextResponse.json(
        { error: 'You must create a squad before creating a mini-league.' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name } = body

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'League name must be at least 3 characters.' },
        { status: 400 }
      )
    }

    const cleanName = name.trim().slice(0, 100)
    let code = generateLeagueCode()
    let attempts = 0
    while (attempts < 5) {
      const existing = await prisma.fantasyLeague.findUnique({ where: { code } })
      if (!existing) break
      code = generateLeagueCode()
      attempts++
    }

    const league = await prisma.$transaction(async (tx: any) => {
      const created = await tx.fantasyLeague.create({
        data: {
          name: cleanName,
          code,
          type: 'PRIVATE_CLASSIC',
          adminUserId: user.id,
          competitionId: PL_COMPETITION_ID,
          seasonYear: CURRENT_FANTASY_SEASON,
          isPublic: false,
        },
      })

      await tx.fantasyLeagueMember.create({
        data: {
          leagueId: created.id,
          userId: user.id,
          squadId: squad.id,
        },
      })

      return created
    })

    return NextResponse.json({
      success: true,
      message: 'Private mini-league created!',
      league: {
        id: league.id,
        name: league.name,
        code: league.code,
      },
    })
  } catch (err: any) {
    console.error('Error creating mini-league:', err)
    return NextResponse.json({ error: 'Failed to create mini-league.' }, { status: 500 })
  }
}
