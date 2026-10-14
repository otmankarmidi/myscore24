import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFantasySessionUser } from '@/lib/fantasy/auth'
import { validateFantasySquad, ValidationSquadPlayer } from '@/lib/fantasy/rules'
import { PL_COMPETITION_ID, CURRENT_FANTASY_SEASON } from '@/lib/fantasy/data'

export async function GET() {
  try {
    const user = await getFantasySessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const squad = await prisma.fantasySquad.findUnique({
      where: { userId: user.id },
      include: {
        players: {
          orderBy: { positionIndex: 'asc' },
          include: {
            fantasyPlayer: {
              include: {
                team: { select: { id: true, name: true, code: true, logo: true } },
              },
            },
          },
        },
      },
    })

    if (!squad) {
      return NextResponse.json({ squad: null }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      squad: {
        id: squad.id,
        teamName: squad.teamName,
        bank: squad.bank,
        squadValue: squad.squadValue,
        freeTransfers: squad.freeTransfers,
        totalTransfers: squad.totalTransfers,
        totalPoints: squad.totalPoints,
        overallRank: squad.overallRank,
        activeChip: squad.activeChip,
        players: squad.players.map((sp: any) => ({
          id: sp.id,
          fantasyPlayerId: sp.fantasyPlayerId,
          positionIndex: sp.positionIndex,
          isStartingXI: sp.isStartingXI,
          isCaptain: sp.isCaptain,
          isViceCaptain: sp.isViceCaptain,
          purchasePrice: sp.purchasePrice,
          player: {
            id: sp.fantasyPlayer.id,
            name: sp.fantasyPlayer.name,
            webName: sp.fantasyPlayer.webName,
            position: sp.fantasyPlayer.position,
            price: sp.fantasyPlayer.price,
            teamId: sp.fantasyPlayer.teamId,
            teamName: sp.fantasyPlayer.team.name,
            teamShortName: sp.fantasyPlayer.teamShortName,
            teamLogo: sp.fantasyPlayer.team.logo,
            photo: sp.fantasyPlayer.photo,
            status: sp.fantasyPlayer.status,
            totalPoints: sp.fantasyPlayer.totalPoints,
          },
        })),
      },
    })
  } catch (err: any) {
    console.error('Error fetching user squad:', err)
    return NextResponse.json({ error: 'Failed to retrieve squad.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getFantasySessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Please log in to save your fantasy squad.' }, { status: 401 })
    }

    const body = await req.json()
    const { players: squadAssignments, teamName } = body as {
      players: ValidationSquadPlayer[]
      teamName?: string
    }

    if (!Array.isArray(squadAssignments) || squadAssignments.length !== 15) {
      return NextResponse.json(
        { error: 'A complete squad of exactly 15 players must be submitted.' },
        { status: 400 }
      )
    }

    // Fetch the 15 selected players from database
    const selectedPlayerIds = squadAssignments.map((p) => p.fantasyPlayerId)
    const dbPlayers = await prisma.fantasyPlayer.findMany({
      where: { id: { in: selectedPlayerIds } },
    })

    if (dbPlayers.length !== 15) {
      return NextResponse.json(
        { error: 'One or more selected players were not found in the database.' },
        { status: 400 }
      )
    }

    // Server-side validation
    const validation = validateFantasySquad(
      dbPlayers.map((p: any) => ({
        id: p.id,
        teamId: p.teamId,
        position: p.position,
        price: p.price,
        webName: p.webName,
      })),
      squadAssignments,
      100.0
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Squad validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const squadTeamName = teamName?.trim() || user.teamName
    const remainingBank = Math.max(0, Math.round((100.0 - validation.details.totalCost) * 10) / 10)

    // Run creation in transaction
    const squad = await prisma.$transaction(async (tx: any) => {
      // Find existing or create squad
      const existingSquad = await tx.fantasySquad.findUnique({
        where: { userId: user.id },
      })

      let activeSquad
      if (existingSquad) {
        // Delete old squad players and re-insert
        await tx.fantasySquadPlayer.deleteMany({
          where: { squadId: existingSquad.id },
        })

        activeSquad = await tx.fantasySquad.update({
          where: { id: existingSquad.id },
          data: {
            teamName: squadTeamName,
            bank: remainingBank,
            squadValue: validation.details.totalCost,
          },
        })
      } else {
        activeSquad = await tx.fantasySquad.create({
          data: {
            userId: user.id,
            competitionId: PL_COMPETITION_ID,
            seasonYear: CURRENT_FANTASY_SEASON,
            teamName: squadTeamName,
            bank: remainingBank,
            squadValue: validation.details.totalCost,
            freeTransfers: 1,
          },
        })
      }

      // Insert all 15 players
      const playerMap = new Map<string, any>(dbPlayers.map((p: any) => [p.id, p]))
      for (const a of squadAssignments) {
        const player = playerMap.get(a.fantasyPlayerId)!
        await tx.fantasySquadPlayer.create({
          data: {
            squadId: activeSquad.id,
            fantasyPlayerId: a.fantasyPlayerId,
            positionIndex: a.positionIndex,
            isStartingXI: a.isStartingXI,
            isCaptain: a.isCaptain,
            isViceCaptain: a.isViceCaptain,
            purchasePrice: player.price,
          },
        })
      }

      // Check Global League membership
      const globalLeague = await tx.fantasyLeague.findFirst({
        where: { code: 'GLOBAL' },
      })
      if (globalLeague) {
        const existingMember = await tx.fantasyLeagueMember.findUnique({
          where: {
            leagueId_squadId: {
              leagueId: globalLeague.id,
              squadId: activeSquad.id,
            },
          },
        })
        if (!existingMember) {
          await tx.fantasyLeagueMember.create({
            data: {
              leagueId: globalLeague.id,
              userId: user.id,
              squadId: activeSquad.id,
            },
          })
        }
      }

      return activeSquad
    })

    return NextResponse.json({
      success: true,
      message: 'Fantasy squad successfully saved!',
      squadId: squad.id,
      bank: squad.bank,
      squadValue: squad.squadValue,
    })
  } catch (err: any) {
    console.error('Error saving fantasy squad:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to save squad.' },
      { status: 500 }
    )
  }
}
