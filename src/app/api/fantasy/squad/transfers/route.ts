import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFantasySessionUser } from '@/lib/fantasy/auth'
import { getCurrentGameweek } from '@/lib/fantasy/data'
import { calculateTransferCost, validateFantasySquad } from '@/lib/fantasy/rules'

export async function POST(req: NextRequest) {
  try {
    const user = await getFantasySessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const currentGw = await getCurrentGameweek()
    if (!currentGw) {
      return NextResponse.json({ error: 'No active gameweek found.' }, { status: 400 })
    }

    // Check deadline
    if (new Date() >= new Date(currentGw.deadline) || currentGw.status === 'LOCKED' || currentGw.status === 'LIVE') {
      return NextResponse.json(
        { error: `Transfers are locked for ${currentGw.name}. The deadline has passed.` },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { transfers, chip } = body as {
      transfers: Array<{ playerOutId: string; playerInId: string }>
      chip?: string | null
    }

    if (!Array.isArray(transfers) || transfers.length === 0) {
      return NextResponse.json({ error: 'No transfers provided.' }, { status: 400 })
    }

    const squad = await prisma.fantasySquad.findUnique({
      where: { userId: user.id },
      include: {
        players: {
          include: {
            fantasyPlayer: true,
          },
        },
      },
    })

    if (!squad || squad.players.length !== 15) {
      return NextResponse.json(
        { error: 'You must have a full 15-man squad before making transfers.' },
        { status: 400 }
      )
    }

    // Collect IDs
    const playerOutIds = new Set(transfers.map((t) => t.playerOutId))
    const playerInIds = new Set(transfers.map((t) => t.playerInId))

    if (playerOutIds.size !== transfers.length || playerInIds.size !== transfers.length) {
      return NextResponse.json({ error: 'Duplicate players found in transfer request.' }, { status: 400 })
    }

    // Check all players being sold exist in user's current squad
    const currentSquadPlayerIds = new Set(squad.players.map((sp: any) => sp.fantasyPlayerId))
    for (const outId of playerOutIds) {
      if (!currentSquadPlayerIds.has(outId)) {
        return NextResponse.json(
          { error: `Player to sell (${outId}) is not in your current squad.` },
          { status: 400 }
        )
      }
    }

    // Fetch incoming players
    const incomingPlayers = await prisma.fantasyPlayer.findMany({
      where: { id: { in: Array.from(playerInIds) } },
    })

    if (incomingPlayers.length !== transfers.length) {
      return NextResponse.json(
        { error: 'One or more players being bought were not found.' },
        { status: 400 }
      )
    }

    // Calculate budget change
    const incomingMap = new Map<string, any>(incomingPlayers.map((p: any) => [p.id, p]))
    const currentSquadMap = new Map<string, any>(squad.players.map((sp: any) => [sp.fantasyPlayerId, sp]))

    let fundsGained = 0
    let fundsSpent = 0

    for (const t of transfers) {
      const outSp = currentSquadMap.get(t.playerOutId)!
      const inPlayer = incomingMap.get(t.playerInId)!

      fundsGained += outSp.fantasyPlayer.price
      fundsSpent += inPlayer.price
    }

    const newBank = Math.round((squad.bank + fundsGained - fundsSpent) * 10) / 10
    if (newBank < -0.001) {
      return NextResponse.json(
        {
          error: `Insufficient budget. Net transfer deficit is £${(-newBank).toFixed(1)}M. Remaining bank would be negative.`,
        },
        { status: 400 }
      )
    }

    // Construct the prospective new 15 players
    const remainingPlayers = squad.players.filter((sp: any) => !playerOutIds.has(sp.fantasyPlayerId))
    const newSquadAssignments = [
      ...remainingPlayers.map((sp: any) => ({
        fantasyPlayerId: sp.fantasyPlayerId,
        positionIndex: sp.positionIndex,
        isStartingXI: sp.isStartingXI,
        isCaptain: sp.isCaptain,
        isViceCaptain: sp.isViceCaptain,
        purchasePrice: sp.purchasePrice,
      })),
    ]

    // Map new incoming players to the sold positions
    transfers.forEach((t) => {
      const soldSp = currentSquadMap.get(t.playerOutId)!
      const inP = incomingMap.get(t.playerInId)!
      newSquadAssignments.push({
        fantasyPlayerId: inP.id,
        positionIndex: soldSp.positionIndex,
        isStartingXI: soldSp.isStartingXI,
        isCaptain: soldSp.isCaptain,
        isViceCaptain: soldSp.isViceCaptain,
        purchasePrice: inP.price,
      })
    })

    // Validate prospective squad
    const allProspectivePlayerIds = newSquadAssignments.map((a) => a.fantasyPlayerId)
    const allProspectiveDbPlayers = await prisma.fantasyPlayer.findMany({
      where: { id: { in: allProspectivePlayerIds } },
    })

    const validation = validateFantasySquad(
      allProspectiveDbPlayers.map((p: any) => ({
        id: p.id,
        teamId: p.teamId,
        position: p.position,
        price: p.price,
        webName: p.webName,
      })),
      newSquadAssignments,
      squad.squadValue + squad.bank
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Transfer validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Calculate transfer cost
    const activeChip = chip || squad.activeChip
    const transferCostResult = calculateTransferCost(transfers.length, squad.freeTransfers, activeChip)

    // Execute atomic transaction
    await prisma.$transaction(async (tx: any) => {
      // Record transfers
      for (const t of transfers) {
        const outSp = currentSquadMap.get(t.playerOutId)!
        const inPlayer = incomingMap.get(t.playerInId)!

        await tx.fantasyTransfer.create({
          data: {
            squadId: squad.id,
            gameweekId: currentGw.id,
            gameweekNumber: currentGw.gameweekNumber,
            playerInId: inPlayer.id,
            playerOutId: outSp.fantasyPlayerId,
            playerInPrice: inPlayer.price,
            playerOutPrice: outSp.fantasyPlayer.price,
            isFreeTransfer: transferCostResult.pointCost === 0,
            pointCost: transferCostResult.pointCost > 0 ? 4 : 0,
          },
        })
      }

      // Re-link squad players
      await tx.fantasySquadPlayer.deleteMany({
        where: { squadId: squad.id },
      })

      for (const a of newSquadAssignments) {
        await tx.fantasySquadPlayer.create({
          data: {
            squadId: squad.id,
            fantasyPlayerId: a.fantasyPlayerId,
            positionIndex: a.positionIndex,
            isStartingXI: a.isStartingXI,
            isCaptain: a.isCaptain,
            isViceCaptain: a.isViceCaptain,
            purchasePrice: a.purchasePrice || 0,
          },
        })
      }

      // Update squad totals
      await tx.fantasySquad.update({
        where: { id: squad.id },
        data: {
          bank: Math.max(0, newBank),
          squadValue: validation.details.totalCost,
          freeTransfers: transferCostResult.remainingFreeTransfers,
          totalTransfers: squad.totalTransfers + transfers.length,
          activeChip: activeChip || null,
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: `${transfers.length} transfer(s) confirmed!`,
      transfersCount: transfers.length,
      pointCost: transferCostResult.pointCost,
      newBank,
      remainingFreeTransfers: transferCostResult.remainingFreeTransfers,
    })
  } catch (err: any) {
    console.error('Error processing fantasy transfers:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to complete transfers.' },
      { status: 500 }
    )
  }
}
