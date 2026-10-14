import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFantasySessionUser } from '@/lib/fantasy/auth'
import { getCurrentGameweek } from '@/lib/fantasy/data'
import { calculateManagerGameweekScore, SquadPlayerState } from '@/lib/fantasy/scoring'

export async function GET(req: NextRequest) {
  try {
    const user = await getFantasySessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const gwParam = searchParams.get('gw')

    const currentGw = await getCurrentGameweek()
    const targetGwNumber = gwParam ? parseInt(gwParam, 10) : (currentGw?.gameweekNumber || 6)

    const gameweek = await prisma.fantasyGameweek.findFirst({
      where: { gameweekNumber: targetGwNumber },
      include: {
        fixtures: {
          include: {
            match: {
              include: {
                homeTeam: { select: { id: true, name: true, code: true, logo: true } },
                awayTeam: { select: { id: true, name: true, code: true, logo: true } },
              },
            },
          },
        },
      },
    })

    if (!gameweek) {
      return NextResponse.json({ error: 'Gameweek not found.' }, { status: 404 })
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
      return NextResponse.json({ hasSquad: false }, { status: 200 })
    }

    // Check if points have already been finalized in FantasyManagerGameweekPoints
    const storedPoints = await prisma.fantasyManagerGameweekPoints.findUnique({
      where: {
        squadId_gameweekId: {
          squadId: squad.id,
          gameweekId: gameweek.id,
        },
      },
    })

    // Fetch player points for this gameweek
    const playerPointsRecords = await prisma.fantasyPlayerGameweekPoints.findMany({
      where: { gameweekId: gameweek.id },
    })
    const playerPointsMap = new Map<string, any>(playerPointsRecords.map((r: any) => [r.fantasyPlayerId, r]))

    // Build SquadPlayerState array for scoring engine
    const squadStates: SquadPlayerState[] = squad.players.map((sp: any) => {
      const rec = playerPointsMap.get(sp.fantasyPlayerId)
      return {
        fantasyPlayerId: sp.fantasyPlayerId,
        webName: sp.fantasyPlayer.webName,
        position: sp.fantasyPlayer.position as any,
        positionIndex: sp.positionIndex,
        isStartingXI: sp.isStartingXI,
        isCaptain: sp.isCaptain,
        isViceCaptain: sp.isViceCaptain,
        pointsScored: rec?.totalPoints || 0,
        minutesPlayed: rec?.minutesPlayed !== undefined ? rec.minutesPlayed : 90, // if gameweek is played
      }
    })

    // Run scoring calculation
    const calculated = calculateManagerGameweekScore(squadStates, 0, squad.activeChip)

    const playersWithDetails = squad.players.map((sp: any) => {
      const p = sp.fantasyPlayer
      const rec = playerPointsMap.get(p.id)
      const isEffectiveCaptain = calculated.effectiveCaptainId === p.id
      const finalPoints = calculated.playerPoints[p.id] || (rec?.totalPoints || 0)

      return {
        id: sp.id,
        fantasyPlayerId: p.id,
        webName: p.webName,
        name: p.name,
        position: p.position,
        positionIndex: sp.positionIndex,
        isStartingXI: sp.isStartingXI,
        isCaptain: sp.isCaptain,
        isViceCaptain: sp.isViceCaptain,
        isEffectiveCaptain,
        multiplier: isEffectiveCaptain ? calculated.captainMultiplierUsed : 1,
        points: finalPoints,
        rawPoints: rec?.totalPoints || 0,
        minutes: rec?.minutesPlayed || 0,
        goals: rec?.goalsScored || 0,
        assists: rec?.assists || 0,
        cleanSheet: rec?.cleanSheets ? true : false,
        teamName: p.team.name,
        teamShortName: p.teamShortName,
        teamLogo: p.team.logo,
        photo: p.photo,
      }
    })

    return NextResponse.json({
      success: true,
      hasSquad: true,
      gameweek: {
        id: gameweek.id,
        number: gameweek.gameweekNumber,
        name: gameweek.name,
        status: gameweek.status,
      },
      summary: {
        grossPoints: storedPoints?.grossPoints || calculated.grossPoints,
        transferCost: storedPoints?.transferCost || calculated.transferCost,
        netPoints: storedPoints?.netPoints || calculated.netPoints,
        overallPoints: squad.totalPoints,
        gameweekRank: storedPoints?.gameweekRank || 1,
        activeChip: calculated.activeChip,
        effectiveCaptainId: calculated.effectiveCaptainId,
        substitutionsMade: calculated.substitutionsMade,
      },
      players: playersWithDetails,
    })
  } catch (err: any) {
    console.error('Error fetching gameweek points:', err)
    return NextResponse.json({ error: 'Failed to retrieve points.' }, { status: 500 })
  }
}
