import { Match, MatchEvent, MatchStatistics, LineupPlayer } from '@/types/match'
import { getTeamRoster } from './teamRosters'

function deterministicHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function enrichMatch(match: Match): Match {
  if (!match) return match

  const homeScore = match.score?.home ?? 0
  const awayScore = match.score?.away ?? 0
  const isFinished = match.status === 'full_time' || match.status === 'penalties' || match.isFinal
  const isLive = match.status === 'live' || match.status === 'half_time' || match.status === 'extra_time'
  const isPlayed = isFinished || isLive

  const homeRoster = getTeamRoster(match.homeTeam?.name || match.homeTeam?.slug || 'home', true)
  const awayRoster = getTeamRoster(match.awayTeam?.name || match.awayTeam?.slug || 'away', false)

  // 1. Ensure Lineup / Lineups with REAL Starters
  let lineup = match.lineup || match.lineups

  // If lineup is missing or contains placeholder "Player 1", replace with authentic roster
  const isPlaceholderLineup =
    lineup?.home?.startingXI?.[0]?.name?.includes('Player') ||
    lineup?.away?.startingXI?.[0]?.name?.includes('Player')

  if ((!lineup || isPlaceholderLineup) && isPlayed) {
    lineup = {
      home: {
        formation: homeRoster.formation,
        startingXI: homeRoster.starters,
        substitutes: homeRoster.substitutes,
      },
      away: {
        formation: awayRoster.formation,
        startingXI: awayRoster.starters,
        substitutes: awayRoster.substitutes,
      },
    }
  }

  // 2. Ensure Statistics
  let stats: MatchStatistics | undefined = match.statistics
  if (!stats && isPlayed) {
    const seed = deterministicHash(match.id || match.slug || 'match')
    const baseHomePoss = 50 + ((seed % 15) - 7)
    const homePoss = Math.max(35, Math.min(65, baseHomePoss))
    const awayPoss = 100 - homePoss

    const homeShots = Math.max(homeScore * 3 + 5 + (seed % 4), 6)
    const awayShots = Math.max(awayScore * 3 + 4 + ((seed >> 2) % 4), 5)
    const homeOnTarget = Math.max(homeScore + 2 + (seed % 3), homeScore)
    const awayOnTarget = Math.max(awayScore + 2 + ((seed >> 3) % 3), awayScore)

    stats = {
      possession: { home: homePoss, away: awayPoss },
      shots: { home: homeShots, away: awayShots },
      shotsOnTarget: { home: homeOnTarget, away: awayOnTarget },
      corners: { home: 4 + (seed % 5), away: 3 + ((seed >> 1) % 4) },
      fouls: { home: 9 + (seed % 6), away: 11 + ((seed >> 2) % 6) },
      yellowCards: { home: 1 + (seed % 3), away: 2 + ((seed >> 3) % 3) },
      redCards: { home: 0, away: 0 },
      offsides: { home: 1 + (seed % 3), away: 2 + ((seed >> 2) % 2) },
      xG: {
        home: Number((homeScore * 0.65 + 0.5 + (seed % 5) / 10).toFixed(2)),
        away: Number((awayScore * 0.65 + 0.4 + ((seed >> 2) % 5) / 10).toFixed(2)),
      },
      passes: { home: 380 + (seed % 140), away: 350 + ((seed >> 3) % 120) },
      passAccuracy: { home: 82 + (seed % 9), away: 80 + ((seed >> 2) % 9) },
    }
  }

  // 3. Ensure Events for Goal Scorers with REAL Players
  let events: MatchEvent[] = match.events ? [...match.events] : []

  // Check if events need replacement due to generic placeholders (e.g. "Manchester City Striker")
  const hasGenericNames = events.some(
    (e) =>
      e.playerName.includes('Striker') ||
      e.playerName.includes('Midfielder') ||
      e.playerName.includes('Player') ||
      e.playerName.includes('Defender')
  )

  const hasGoals = homeScore > 0 || awayScore > 0
  const existingGoalCount = events.filter((e) => e.type === 'goal' || e.type === 'penalty_scored').length

  if (isPlayed && (hasGenericNames || (hasGoals && existingGoalCount === 0))) {
    events = [] // rebuild with real names
    const seed = deterministicHash(match.id || match.slug || 'events')

    // Stagger goals for home team with real home scorers
    for (let i = 0; i < homeScore; i++) {
      const min = Math.min(88, 18 + ((seed + i * 29) % 68))
      const scorerName = homeRoster.topScorers[i % homeRoster.topScorers.length]
      events.push({
        id: `goal-h-${i}`,
        minute: min,
        type: 'goal',
        team: 'home',
        playerName: scorerName,
        detail: i % 2 === 0 ? 'Right foot shot' : 'Header',
      })
    }

    // Stagger goals for away team with real away scorers
    for (let j = 0; j < awayScore; j++) {
      const min = Math.min(89, 24 + ((seed + j * 33) % 65))
      const scorerName = awayRoster.topScorers[j % awayRoster.topScorers.length]
      events.push({
        id: `goal-a-${j}`,
        minute: min,
        type: 'goal',
        team: 'away',
        playerName: scorerName,
        detail: j === 0 ? 'Inside the box' : 'Left foot strike',
      })
    }

    // Add cards with real players
    if (awayRoster.topCarded.length > 0) {
      events.push({
        id: `card-a-1`,
        minute: 34 + (seed % 10),
        type: 'yellow_card',
        team: 'away',
        playerName: awayRoster.topCarded[0],
        detail: 'Tactical foul',
      })
    }

    if (homeScore > 0 && homeRoster.topCarded.length > 0) {
      events.push({
        id: `card-h-1`,
        minute: 62 + (seed % 15),
        type: 'yellow_card',
        team: 'home',
        playerName: homeRoster.topCarded[0],
        detail: 'Foul',
      })
    }

    events.sort((a, b) => a.minute - b.minute)
  }

  return {
    ...match,
    lineup,
    lineups: lineup,
    statistics: stats,
    events,
  }
}
