export interface ValidationPlayer {
  id: string
  teamId: string
  position: 'GKP' | 'DEF' | 'MID' | 'FWD' | string
  price: number
  webName?: string
  name?: string
}

export interface ValidationSquadPlayer {
  fantasyPlayerId: string
  positionIndex: number // 1-15 (1-11 starting XI, 12-15 bench)
  isStartingXI: boolean
  isCaptain: boolean
  isViceCaptain: boolean
  purchasePrice?: number
}

export interface SquadValidationResult {
  valid: boolean
  errors: string[]
  details: {
    totalPlayers: number
    gkpCount: number
    defCount: number
    midCount: number
    fwdCount: number
    startingGkp: number
    startingDef: number
    startingMid: number
    startingFwd: number
    totalCost: number
    formation: string
    clubCounts: Record<string, number>
    captainCount: number
    viceCaptainCount: number
  }
}

export const VALID_ROSTER_REQUIREMENTS = {
  TOTAL_PLAYERS: 15,
  STARTING_XI: 11,
  BENCH_PLAYERS: 4,
  MAX_PER_CLUB: 3,
  TOTAL_BUDGET: 100.0,
  POSITIONS: {
    GKP: 2,
    DEF: 5,
    MID: 5,
    FWD: 3,
  },
  STARTING_MINIMUMS: {
    GKP: 1,
    DEF: 3,
    MID: 2,
    FWD: 1,
  },
  STARTING_MAXIMUMS: {
    GKP: 1,
    DEF: 5,
    MID: 5,
    FWD: 3,
  },
}

/**
 * Validates a 15-man squad against all Fantasy Premier League constraints
 */
export function validateFantasySquad(
  players: ValidationPlayer[],
  squadAssignments: ValidationSquadPlayer[],
  maxBudget: number = 100.0
): SquadValidationResult {
  const errors: string[] = []
  const playerMap = new Map<string, ValidationPlayer>()
  players.forEach((p) => playerMap.set(p.id, p))

  if (squadAssignments.length !== VALID_ROSTER_REQUIREMENTS.TOTAL_PLAYERS) {
    errors.push(`Squad must contain exactly ${VALID_ROSTER_REQUIREMENTS.TOTAL_PLAYERS} players (received ${squadAssignments.length}).`)
  }

  // Duplicate checks
  const playerIds = new Set<string>()
  for (const a of squadAssignments) {
    if (playerIds.has(a.fantasyPlayerId)) {
      errors.push(`Duplicate player selected: ${a.fantasyPlayerId}`)
    }
    playerIds.add(a.fantasyPlayerId)
  }

  // Count by position, club, and budget
  let gkpCount = 0
  let defCount = 0
  let midCount = 0
  let fwdCount = 0

  let startingGkp = 0
  let startingDef = 0
  let startingMid = 0
  let startingFwd = 0

  let totalCost = 0
  const clubCounts: Record<string, number> = {}

  let captainCount = 0
  let viceCaptainCount = 0
  let captainId: string | null = null
  let viceCaptainId: string | null = null

  for (const a of squadAssignments) {
    const player = playerMap.get(a.fantasyPlayerId)
    if (!player) {
      errors.push(`Player with ID ${a.fantasyPlayerId} was not found in the player database.`)
      continue
    }

    const price = a.purchasePrice !== undefined ? a.purchasePrice : player.price
    totalCost += price

    // Club limits
    clubCounts[player.teamId] = (clubCounts[player.teamId] || 0) + 1
    if (clubCounts[player.teamId] > VALID_ROSTER_REQUIREMENTS.MAX_PER_CLUB) {
      errors.push(`Cannot select more than ${VALID_ROSTER_REQUIREMENTS.MAX_PER_CLUB} players from the same club.`)
    }

    // Position count
    if (player.position === 'GKP') gkpCount++
    else if (player.position === 'DEF') defCount++
    else if (player.position === 'MID') midCount++
    else if (player.position === 'FWD') fwdCount++

    // Starting XI vs Bench
    if (a.isStartingXI) {
      if (player.position === 'GKP') startingGkp++
      else if (player.position === 'DEF') startingDef++
      else if (player.position === 'MID') startingMid++
      else if (player.position === 'FWD') startingFwd++
    }

    // Captaincy
    if (a.isCaptain) {
      captainCount++
      captainId = a.fantasyPlayerId
      if (!a.isStartingXI) {
        errors.push(`Captain (${player.webName || player.name || 'player'}) must be in the Starting XI.`)
      }
    }

    if (a.isViceCaptain) {
      viceCaptainCount++
      viceCaptainId = a.fantasyPlayerId
      if (!a.isStartingXI) {
        errors.push(`Vice-captain (${player.webName || player.name || 'player'}) must be in the Starting XI.`)
      }
    }
  }

  // Budget check (allowing floating point epsilon)
  if (totalCost > maxBudget + 0.001) {
    errors.push(`Total squad cost (£${totalCost.toFixed(1)}M) exceeds available budget (£${maxBudget.toFixed(1)}M).`)
  }

  // Total position checks
  if (gkpCount !== VALID_ROSTER_REQUIREMENTS.POSITIONS.GKP) {
    errors.push(`Squad must have exactly ${VALID_ROSTER_REQUIREMENTS.POSITIONS.GKP} Goalkeepers (found ${gkpCount}).`)
  }
  if (defCount !== VALID_ROSTER_REQUIREMENTS.POSITIONS.DEF) {
    errors.push(`Squad must have exactly ${VALID_ROSTER_REQUIREMENTS.POSITIONS.DEF} Defenders (found ${defCount}).`)
  }
  if (midCount !== VALID_ROSTER_REQUIREMENTS.POSITIONS.MID) {
    errors.push(`Squad must have exactly ${VALID_ROSTER_REQUIREMENTS.POSITIONS.MID} Midfielders (found ${midCount}).`)
  }
  if (fwdCount !== VALID_ROSTER_REQUIREMENTS.POSITIONS.FWD) {
    errors.push(`Squad must have exactly ${VALID_ROSTER_REQUIREMENTS.POSITIONS.FWD} Forwards (found ${fwdCount}).`)
  }

  // Starting XI formation checks
  const startingCount = startingGkp + startingDef + startingMid + startingFwd
  if (startingCount !== VALID_ROSTER_REQUIREMENTS.STARTING_XI) {
    errors.push(`Starting XI must contain exactly 11 players (found ${startingCount}).`)
  }
  if (startingGkp !== 1) {
    errors.push(`Starting XI must have exactly 1 Goalkeeper (found ${startingGkp}).`)
  }
  if (startingDef < VALID_ROSTER_REQUIREMENTS.STARTING_MINIMUMS.DEF || startingDef > VALID_ROSTER_REQUIREMENTS.STARTING_MAXIMUMS.DEF) {
    errors.push(`Starting XI must have between 3 and 5 Defenders (found ${startingDef}).`)
  }
  if (startingMid < VALID_ROSTER_REQUIREMENTS.STARTING_MINIMUMS.MID || startingMid > VALID_ROSTER_REQUIREMENTS.STARTING_MAXIMUMS.MID) {
    errors.push(`Starting XI must have between 2 and 5 Midfielders (found ${startingMid}).`)
  }
  if (startingFwd < VALID_ROSTER_REQUIREMENTS.STARTING_MINIMUMS.FWD || startingFwd > VALID_ROSTER_REQUIREMENTS.STARTING_MAXIMUMS.FWD) {
    errors.push(`Starting XI must have between 1 and 3 Forwards (found ${startingFwd}).`)
  }

  // Captain & Vice-Captain checks
  if (captainCount !== 1) {
    errors.push(`Squad must have exactly one Captain selected (found ${captainCount}).`)
  }
  if (viceCaptainCount !== 1) {
    errors.push(`Squad must have exactly one Vice-Captain selected (found ${viceCaptainCount}).`)
  }
  if (captainId && viceCaptainId && captainId === viceCaptainId) {
    errors.push(`Captain and Vice-Captain cannot be the same player.`)
  }

  const formation = `${startingDef}-${startingMid}-${startingFwd}`

  return {
    valid: errors.length === 0,
    errors,
    details: {
      totalPlayers: squadAssignments.length,
      gkpCount,
      defCount,
      midCount,
      fwdCount,
      startingGkp,
      startingDef,
      startingMid,
      startingFwd,
      totalCost: Math.round(totalCost * 10) / 10,
      formation,
      clubCounts,
      captainCount,
      viceCaptainCount,
    },
  }
}

/**
 * Calculates transfer cost and point deductions
 */
export function calculateTransferCost(
  transfersCount: number,
  freeTransfers: number,
  activeChip?: string | null
): { pointCost: number; usedFreeTransfers: number; remainingFreeTransfers: number } {
  if (activeChip === 'WILDCARD' || activeChip === 'FREE_HIT') {
    return {
      pointCost: 0,
      usedFreeTransfers: 0,
      remainingFreeTransfers: freeTransfers,
    }
  }

  const usedFreeTransfers = Math.min(transfersCount, freeTransfers)
  const paidTransfers = Math.max(0, transfersCount - freeTransfers)
  const pointCost = paidTransfers * 4
  const remainingFreeTransfers = Math.max(1, freeTransfers - usedFreeTransfers)

  return {
    pointCost,
    usedFreeTransfers,
    remainingFreeTransfers,
  }
}
