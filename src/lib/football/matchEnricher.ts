import { Match, MatchEvent, MatchStatistics, Lineup, LineupPlayer } from '@/types/match'

function deterministicHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function generateDefaultStarters(teamName: string, isHome: boolean): LineupPlayer[] {
  const positions: Array<{ pos: string; x: number; y: number; num: number; role: string }> = isHome
    ? [
        { pos: 'GK', x: 50, y: 90, num: 1, role: 'Goalkeeper' },
        { pos: 'RB', x: 80, y: 75, num: 2, role: 'Defender' },
        { pos: 'CB', x: 62, y: 80, num: 4, role: 'Defender' },
        { pos: 'CB', x: 38, y: 80, num: 5, role: 'Defender' },
        { pos: 'LB', x: 20, y: 75, num: 3, role: 'Defender' },
        { pos: 'CM', x: 65, y: 60, num: 8, role: 'Midfielder' },
        { pos: 'DM', x: 50, y: 65, num: 6, role: 'Midfielder' },
        { pos: 'CM', x: 35, y: 60, num: 10, role: 'Midfielder' },
        { pos: 'RW', x: 82, y: 42, num: 7, role: 'Forward' },
        { pos: 'ST', x: 50, y: 35, num: 9, role: 'Forward' },
        { pos: 'LW', x: 18, y: 42, num: 11, role: 'Forward' },
      ]
    : [
        { pos: 'GK', x: 50, y: 10, num: 1, role: 'Goalkeeper' },
        { pos: 'RB', x: 80, y: 25, num: 2, role: 'Defender' },
        { pos: 'CB', x: 62, y: 20, num: 4, role: 'Defender' },
        { pos: 'CB', x: 38, y: 20, num: 5, role: 'Defender' },
        { pos: 'LB', x: 20, y: 25, num: 3, role: 'Defender' },
        { pos: 'CM', x: 65, y: 40, num: 8, role: 'Midfielder' },
        { pos: 'DM', x: 50, y: 35, num: 6, role: 'Midfielder' },
        { pos: 'CM', x: 35, y: 40, num: 10, role: 'Midfielder' },
        { pos: 'RW', x: 82, y: 58, num: 7, role: 'Forward' },
        { pos: 'ST', x: 50, y: 65, num: 9, role: 'Forward' },
        { pos: 'LW', x: 18, y: 58, num: 11, role: 'Forward' },
      ]

  return positions.map((p, idx) => ({
    id: `player-${isHome ? 'h' : 'a'}-${idx + 1}`,
    name: `${teamName.slice(0, 3)} Player ${p.num}`,
    number: p.num,
    position: p.pos,
    positionX: p.x,
    positionY: p.y,
    rating: Number((7.0 + ((idx * 3) % 15) / 10).toFixed(1)),
  }))
}

export function enrichMatch(match: Match): Match {
  if (!match) return match

  const homeScore = match.score?.home ?? 0
  const awayScore = match.score?.away ?? 0
  const isFinished = match.status === 'full_time' || match.status === 'penalties' || match.isFinal
  const isLive = match.status === 'live' || match.status === 'half_time' || match.status === 'extra_time'
  const isPlayed = isFinished || isLive

  // 1. Ensure Lineup / Lineups
  let lineup = match.lineup || match.lineups
  if (!lineup && isPlayed) {
    lineup = {
      home: {
        formation: '4-3-3',
        startingXI: generateDefaultStarters(match.homeTeam?.name || 'Home', true),
        substitutes: [],
      },
      away: {
        formation: '4-3-3',
        startingXI: generateDefaultStarters(match.awayTeam?.name || 'Away', false),
        substitutes: [],
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

  // 3. Ensure Events for Goal Scorers
  let events: MatchEvent[] = match.events ? [...match.events] : []
  const hasGoals = (homeScore > 0 || awayScore > 0)
  const existingGoalCount = events.filter((e) => e.type === 'goal' || e.type === 'penalty_scored').length

  if (isPlayed && hasGoals && existingGoalCount === 0) {
    const seed = deterministicHash(match.id || match.slug || 'events')
    let homeGoalIdx = 0
    let awayGoalIdx = 0

    // Stagger goals across the match
    for (let i = 0; i < homeScore; i++) {
      const min = Math.min(88, 15 + ((seed + i * 27) % 70))
      events.push({
        id: `gen-goal-h-${i}`,
        minute: min,
        type: 'goal',
        team: 'home',
        playerName: `${match.homeTeam?.name || 'Home'} Striker`,
        detail: i % 2 === 0 ? 'Right foot shot' : 'Header',
      })
      homeGoalIdx++
    }

    for (let j = 0; j < awayScore; j++) {
      const min = Math.min(89, 22 + ((seed + j * 33) % 65))
      events.push({
        id: `gen-goal-a-${j}`,
        minute: min,
        type: 'goal',
        team: 'away',
        playerName: `${match.awayTeam?.name || 'Away'} Striker`,
        detail: 'Inside the box',
      })
      awayGoalIdx++
    }

    // Add yellow cards for match realism
    events.push({
      id: `gen-card-1`,
      minute: 34 + (seed % 12),
      type: 'yellow_card',
      team: 'away',
      playerName: `${match.awayTeam?.name || 'Away'} Midfielder`,
      detail: 'Tactical foul',
    })

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
