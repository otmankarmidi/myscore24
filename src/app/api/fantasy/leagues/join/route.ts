import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFantasySessionUser } from '@/lib/fantasy/auth'

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
        { error: 'You must build a squad before joining a mini-league.' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()
    const league = await prisma.fantasyLeague.findUnique({
      where: { code: cleanCode },
    })

    if (!league) {
      return NextResponse.json({ error: 'Invalid league invite code.' }, { status: 404 })
    }

    const existingMember = await prisma.fantasyLeagueMember.findUnique({
      where: {
        leagueId_squadId: {
          leagueId: league.id,
          squadId: squad.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: `You are already a member of "${league.name}".` },
        { status: 400 }
      )
    }

    await prisma.fantasyLeagueMember.create({
      data: {
        leagueId: league.id,
        userId: user.id,
        squadId: squad.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully joined "${league.name}"!`,
      league: {
        id: league.id,
        name: league.name,
        code: league.code,
      },
    })
  } catch (err: any) {
    console.error('Error joining mini-league:', err)
    return NextResponse.json({ error: 'Failed to join league.' }, { status: 500 })
  }
}
