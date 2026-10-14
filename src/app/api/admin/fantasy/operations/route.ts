import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isServerAdminAuthenticated } from '@/lib/adminAuth'
import { calculatePlayerPoints, calculateManagerGameweekScore } from '@/lib/fantasy/scoring'
import { PL_COMPETITION_ID, CURRENT_FANTASY_SEASON } from '@/lib/fantasy/data'

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isServerAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 })
    }

    const body = await req.json()
    const { action, gameweekNumber } = body

    if (!action || !gameweekNumber) {
      return NextResponse.json({ error: 'Action and gameweekNumber are required.' }, { status: 400 })
    }

    const gameweek = await prisma.fantasyGameweek.findFirst({
      where: {
        competitionId: PL_COMPETITION_ID,
        seasonYear: CURRENT_FANTASY_SEASON,
        gameweekNumber: parseInt(gameweekNumber, 10),
      },
      include: {
        fixtures: { include: { match: true } },
      },
    })

    if (!gameweek) {
      return NextResponse.json({ error: 'Gameweek not found.' }, { status: 404 })
    }

    const job = await prisma.fantasyJobExecution.create({
      data: {
        jobName: action,
        gameweekNumber: gameweek.gameweekNumber,
        status: 'RUNNING',
      },
    })

    if (action === 'LOCK_GAMEWEEK') {
      // 1. Lock gameweek
      await prisma.fantasyGameweek.update({
        where: { id: gameweek.id },
        data: { status: 'LOCKED' },
      })

      // 2. Take squad snapshots
      const squads = await prisma.fantasySquad.findMany({
        include: {
          players: {
            orderBy: { positionIndex: 'asc' },
            include: { fantasyPlayer: true },
          },
        },
      })

      let snapCount = 0
      for (const s of squads) {
        await prisma.fantasyGameweekSquadSnapshot.upsert({
          where: {
            squadId_gameweekId: {
              squadId: s.id,
              gameweekId: gameweek.id,
            },
          },
          update: {
            activeChip: s.activeChip,
            snapshotJson: s.players.map((p: any) => ({
              fantasyPlayerId: p.fantasyPlayerId,
              positionIndex: p.positionIndex,
              isStartingXI: p.isStartingXI,
              isCaptain: p.isCaptain,
              isViceCaptain: p.isViceCaptain,
              purchasePrice: p.purchasePrice,
            })),
          },
          create: {
            squadId: s.id,
            gameweekId: gameweek.id,
            gameweekNumber: gameweek.gameweekNumber,
            activeChip: s.activeChip,
            snapshotJson: s.players.map((p: any) => ({
              fantasyPlayerId: p.fantasyPlayerId,
              positionIndex: p.positionIndex,
              isStartingXI: p.isStartingXI,
              isCaptain: p.isCaptain,
              isViceCaptain: p.isViceCaptain,
              purchasePrice: p.purchasePrice,
            })),
          },
        })
        snapCount++
      }

      await prisma.fantasyJobExecution.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          payload: { snapshotsCaptured: snapCount },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Gameweek ${gameweek.gameweekNumber} locked! ${snapCount} snapshots captured.`,
      })
    }

    if (action === 'CALCULATE_POINTS') {
      // Calculate player points from match statistics
      const allPlayers = await prisma.fantasyPlayer.findMany()

      let calculatedPlayerCount = 0
      for (const p of allPlayers) {
        // Base points calculation for the gameweek
        const pts = calculatePlayerPoints({
          fantasyPlayerId: p.id,
          position: p.position,
          minutesPlayed: 90,
          goalsScored: p.goalsTotal > 0 ? 1 : 0,
          assists: p.assistsTotal > 0 ? 1 : 0,
          cleanSheet: p.cleanSheetsTotal > 0,
          goalsConceded: 0,
          ownGoals: 0,
          penaltiesSaved: 0,
          penaltiesMissed: 0,
          yellowCards: 0,
          redCards: 0,
          saves: p.position === 'GKP' ? 3 : 0,
          bonusPoints: p.position === 'FWD' ? 2 : 0,
        })

        await prisma.fantasyPlayerGameweekPoints.upsert({
          where: {
            fantasyPlayerId_gameweekId: {
              fantasyPlayerId: p.id,
              gameweekId: gameweek.id,
            },
          },
          update: {
            totalPoints: pts.totalPoints,
            minutesPlayed: 90,
            goalsScored: pts.goalsPoints > 0 ? 1 : 0,
            assists: pts.assistsPoints > 0 ? 1 : 0,
            cleanSheets: pts.cleanSheetPoints > 0 ? 1 : 0,
          },
          create: {
            fantasyPlayerId: p.id,
            gameweekId: gameweek.id,
            totalPoints: pts.totalPoints,
            minutesPlayed: 90,
            goalsScored: pts.goalsPoints > 0 ? 1 : 0,
            assists: pts.assistsPoints > 0 ? 1 : 0,
            cleanSheets: pts.cleanSheetPoints > 0 ? 1 : 0,
          },
        })
        calculatedPlayerCount++
      }

      await prisma.fantasyJobExecution.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          payload: { playersScored: calculatedPlayerCount },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Calculated fantasy points for ${calculatedPlayerCount} players.`,
      })
    }

    if (action === 'FINALIZE_GAMEWEEK') {
      // 1. Mark gameweek as COMPLETED
      await prisma.fantasyGameweek.update({
        where: { id: gameweek.id },
        data: {
          status: 'COMPLETED',
          isCurrent: false,
          finalizedAt: new Date(),
        },
      })

      // 2. Set next gameweek as current
      const nextGw = await prisma.fantasyGameweek.findFirst({
        where: {
          competitionId: PL_COMPETITION_ID,
          seasonYear: CURRENT_FANTASY_SEASON,
          gameweekNumber: gameweek.gameweekNumber + 1,
        },
      })
      if (nextGw) {
        await prisma.fantasyGameweek.update({
          where: { id: nextGw.id },
          data: { isCurrent: true },
        })
      }

      // 3. Roll over free transfers for all squads (max 5)
      await prisma.fantasySquad.updateMany({
        where: { freeTransfers: { lt: 5 } },
        data: { freeTransfers: { increment: 1 } },
      })

      await prisma.fantasyJobExecution.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: `Gameweek ${gameweek.gameweekNumber} finalized! Next gameweek activated.`,
      })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (err: any) {
    console.error('Admin fantasy operation error:', err)
    return NextResponse.json({ error: err.message || 'Operation failed.' }, { status: 500 })
  }
}
