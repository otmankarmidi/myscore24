export interface PlayerMatchPerformance {
  fantasyPlayerId: string
  position: 'GKP' | 'DEF' | 'MID' | 'FWD' | string
  minutesPlayed: number
  goalsScored: number
  assists: number
  cleanSheet: boolean
  goalsConceded: number
  ownGoals: number
  penaltiesSaved: number
  penaltiesMissed: number
  yellowCards: number
  redCards: number
  saves: number
  bonusPoints: number
}

export interface PlayerScoreBreakdown {
  fantasyPlayerId: string
  totalPoints: number
  minutesPoints: number
  goalsPoints: number
  assistsPoints: number
  cleanSheetPoints: number
  concededPoints: number
  savesPoints: number
  penaltiesSavedPoints: number
  penaltiesMissedPoints: number
  cardsPoints: number
  ownGoalsPoints: number
  bonusPoints: number
  details: string[]
}

/**
 * Calculates deterministic fantasy points for a player in a match
 */
export function calculatePlayerPoints(perf: PlayerMatchPerformance): PlayerScoreBreakdown {
  const details: string[] = []
  let minutesPoints = 0
  let goalsPoints = 0
  let assistsPoints = 0
  let cleanSheetPoints = 0
  let concededPoints = 0
  let savesPoints = 0
  let penaltiesSavedPoints = 0
  let penaltiesMissedPoints = 0
  let cardsPoints = 0
  let ownGoalsPoints = 0

  // 1. Minutes Played
  if (perf.minutesPlayed >= 60) {
    minutesPoints = 2
    details.push('Played 60+ mins (+2)')
  } else if (perf.minutesPlayed > 0) {
    minutesPoints = 1
    details.push(`Played ${perf.minutesPlayed} mins (+1)`)
  }

  // 2. Goals Scored
  if (perf.goalsScored > 0) {
    let ptsPerGoal = 4
    if (perf.position === 'GKP' || perf.position === 'DEF') ptsPerGoal = 6
    else if (perf.position === 'MID') ptsPerGoal = 5
    goalsPoints = perf.goalsScored * ptsPerGoal
    details.push(`${perf.goalsScored} Goal(s) (+${goalsPoints})`)
  }

  // 3. Assists
  if (perf.assists > 0) {
    assistsPoints = perf.assists * 3
    details.push(`${perf.assists} Assist(s) (+${assistsPoints})`)
  }

  // 4. Clean Sheet (Must play 60+ minutes)
  if (perf.cleanSheet && perf.minutesPlayed >= 60) {
    if (perf.position === 'GKP' || perf.position === 'DEF') {
      cleanSheetPoints = 4
      details.push('Clean sheet (+4)')
    } else if (perf.position === 'MID') {
      cleanSheetPoints = 1
      details.push('Clean sheet (+1)')
    }
  }

  // 5. Goals Conceded (GKP and DEF: -1 per 2 goals conceded)
  if ((perf.position === 'GKP' || perf.position === 'DEF') && perf.goalsConceded >= 2) {
    const deductions = Math.floor(perf.goalsConceded / 2)
    concededPoints = -deductions
    details.push(`${perf.goalsConceded} goals conceded (-${deductions})`)
  }

  // 6. Goalkeeper Saves (1 pt every 3 saves)
  if (perf.position === 'GKP' && perf.saves >= 3) {
    savesPoints = Math.floor(perf.saves / 3)
    details.push(`${perf.saves} saves (+${savesPoints})`)
  }

  // 7. Penalties
  if (perf.penaltiesSaved > 0) {
    penaltiesSavedPoints = perf.penaltiesSaved * 5
    details.push(`${perf.penaltiesSaved} penalty save(s) (+${penaltiesSavedPoints})`)
  }
  if (perf.penaltiesMissed > 0) {
    penaltiesMissedPoints = -(perf.penaltiesMissed * 2)
    details.push(`${perf.penaltiesMissed} penalty miss(es) (${penaltiesMissedPoints})`)
  }

  // 8. Disciplinary
  if (perf.redCards > 0) {
    cardsPoints -= 3
    details.push('Red card (-3)')
  } else if (perf.yellowCards > 0) {
    cardsPoints -= 1
    details.push('Yellow card (-1)')
  }

  // 9. Own Goals
  if (perf.ownGoals > 0) {
    ownGoalsPoints = -(perf.ownGoals * 2)
    details.push(`${perf.ownGoals} own goal(s) (${ownGoalsPoints})`)
  }

  // 10. Bonus points
  const bonusPoints = perf.bonusPoints || 0
  if (bonusPoints > 0) {
    details.push(`Bonus (+${bonusPoints})`)
  }

  const totalPoints =
    minutesPoints +
    goalsPoints +
    assistsPoints +
    cleanSheetPoints +
    concededPoints +
    savesPoints +
    penaltiesSavedPoints +
    penaltiesMissedPoints +
    cardsPoints +
    ownGoalsPoints +
    bonusPoints

  return {
    fantasyPlayerId: perf.fantasyPlayerId,
    totalPoints,
    minutesPoints,
    goalsPoints,
    assistsPoints,
    cleanSheetPoints,
    concededPoints,
    savesPoints,
    penaltiesSavedPoints,
    penaltiesMissedPoints,
    cardsPoints,
    ownGoalsPoints,
    bonusPoints,
    details,
  }
}

export interface SquadPlayerState {
  fantasyPlayerId: string
  webName: string
  position: 'GKP' | 'DEF' | 'MID' | 'FWD'
  positionIndex: number // 1-11 starter, 12 bench GK, 13-15 bench outfield 1,2,3
  isStartingXI: boolean
  isCaptain: boolean
  isViceCaptain: boolean
  pointsScored: number
  minutesPlayed: number
}

export interface GameweekCalculationResult {
  grossPoints: number
  transferCost: number
  netPoints: number
  activeChip: string | null
  captainMultiplierUsed: number
  captainId: string
  effectiveCaptainId: string
  substitutionsMade: Array<{
    playerOutId: string
    playerOutName: string
    playerInId: string
    playerInName: string
    pointsGained: number
  }>
  playerPoints: Record<string, number>
}

/**
 * Calculates manager's total score for the gameweek including captain bonuses and valid auto-subs
 */
export function calculateManagerGameweekScore(
  squadPlayers: SquadPlayerState[],
  transferCost: number = 0,
  activeChip: string | null = null
): GameweekCalculationResult {
  const isBenchBoost = activeChip === 'BENCH_BOOST'
  const isTripleCaptain = activeChip === 'TRIPLE_CAPTAIN'
  const multiplier = isTripleCaptain ? 3 : 2

  const starters = squadPlayers.filter((p) => p.isStartingXI).sort((a, b) => a.positionIndex - b.positionIndex)
  const bench = squadPlayers.filter((p) => !p.isStartingXI).sort((a, b) => a.positionIndex - b.positionIndex)

  const originalCaptain = starters.find((p) => p.isCaptain) || starters[0]
  const originalViceCaptain = starters.find((p) => p.isViceCaptain) || starters[1]

  let effectiveCaptain = originalCaptain
  if (originalCaptain.minutesPlayed === 0 && originalViceCaptain && originalViceCaptain.minutesPlayed > 0) {
    effectiveCaptain = originalViceCaptain
  }

  const substitutionsMade: Array<{
    playerOutId: string
    playerOutName: string
    playerInId: string
    playerInName: string
    pointsGained: number
  }> = []

  // If bench boost is active, everyone plays, no auto-subs needed
  if (isBenchBoost) {
    let gross = 0
    const pointMap: Record<string, number> = {}

    for (const p of squadPlayers) {
      let pts = p.pointsScored
      if (p.fantasyPlayerId === effectiveCaptain.fantasyPlayerId) {
        pts = pts * multiplier
      }
      gross += pts
      pointMap[p.fantasyPlayerId] = pts
    }

    return {
      grossPoints: gross,
      transferCost,
      netPoints: Math.max(0, gross - transferCost),
      activeChip,
      captainMultiplierUsed: multiplier,
      captainId: originalCaptain.fantasyPlayerId,
      effectiveCaptainId: effectiveCaptain.fantasyPlayerId,
      substitutionsMade: [],
      playerPoints: pointMap,
    }
  }

  // Normal mode: auto substitutions for starters with 0 minutes
  const activeStarters = [...starters]
  const availableBench = [...bench]

  // 1. Check Goalkeeper replacement
  const startingGk = activeStarters.find((p) => p.position === 'GKP')
  const benchGk = availableBench.find((p) => p.position === 'GKP')

  if (startingGk && startingGk.minutesPlayed === 0 && benchGk && benchGk.minutesPlayed > 0) {
    // Replace GKP
    const starterIdx = activeStarters.indexOf(startingGk)
    activeStarters[starterIdx] = benchGk
    availableBench.splice(availableBench.indexOf(benchGk), 1)

    substitutionsMade.push({
      playerOutId: startingGk.fantasyPlayerId,
      playerOutName: startingGk.webName,
      playerInId: benchGk.fantasyPlayerId,
      playerInName: benchGk.webName,
      pointsGained: benchGk.pointsScored,
    })
  }

  // 2. Check Outfield replacements in bench order (indices 13, 14, 15)
  for (let i = 0; i < activeStarters.length; i++) {
    const starter = activeStarters[i]
    if (starter.position === 'GKP' || starter.minutesPlayed > 0) continue

    // Starter played 0 mins, find first valid bench replacement
    for (let b = 0; b < availableBench.length; b++) {
      const candidate = availableBench[b]
      if (candidate.position === 'GKP' || candidate.minutesPlayed === 0) continue

      // Verify that swapping starter with candidate retains valid formation:
      // at least 3 DEF, 2 MID, 1 FWD
      const tempStarters = [...activeStarters]
      tempStarters[i] = candidate

      const defCount = tempStarters.filter((p) => p.position === 'DEF').length
      const midCount = tempStarters.filter((p) => p.position === 'MID').length
      const fwdCount = tempStarters.filter((p) => p.position === 'FWD').length

      if (defCount >= 3 && midCount >= 2 && fwdCount >= 1) {
        // Valid formation preserved!
        activeStarters[i] = candidate
        availableBench.splice(b, 1)

        substitutionsMade.push({
          playerOutId: starter.fantasyPlayerId,
          playerOutName: starter.webName,
          playerInId: candidate.fantasyPlayerId,
          playerInName: candidate.webName,
          pointsGained: candidate.pointsScored,
        })
        break
      }
    }
  }

  let gross = 0
  const pointMap: Record<string, number> = {}

  for (const p of activeStarters) {
    let pts = p.pointsScored
    if (p.fantasyPlayerId === effectiveCaptain.fantasyPlayerId) {
      pts = pts * multiplier
    }
    gross += pts
    pointMap[p.fantasyPlayerId] = pts
  }

  return {
    grossPoints: gross,
    transferCost,
    netPoints: Math.max(0, gross - transferCost),
    activeChip,
    captainMultiplierUsed: multiplier,
    captainId: originalCaptain.fantasyPlayerId,
    effectiveCaptainId: effectiveCaptain.fantasyPlayerId,
    substitutionsMade,
    playerPoints: pointMap,
  }
}
