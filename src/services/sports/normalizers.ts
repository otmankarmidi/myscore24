import { Match, MatchStatus, MatchEvent, MatchStatistics, Lineup, LineupPlayer, MatchCommentaryItem } from '@/types/match'
import { Team } from '@/types/team'
import { League } from '@/types/league'
import { Player } from '@/types/player'
import { Standing, TopScorer } from '@/types/standing'
import { NewsArticle } from '@/types/news'
import { ApiFootballFixtureRaw, ApiFootballEventRaw, ApiFootballLineupRaw, ApiFootballTeamStatsRaw } from './apiFootballProvider'

// Pass-through normalizers
export const normalizeMatch = (raw: Match): Match => raw
export const normalizeTeam = (raw: Team): Team => raw
export const normalizeLeague = (raw: League): League => raw
export const normalizePlayer = (raw: Player): Player => raw
export const normalizeStanding = (raw: Standing): Standing => raw
export const normalizeNewsArticle = (raw: NewsArticle): NewsArticle => raw

function mapApiFootballStatus(shortStatus?: string): MatchStatus {
  switch (shortStatus) {
    case '1H':
    case '2H':
    case 'LIVE':
    case 'BT':
      return 'live'
    case 'HT':
      return 'half_time'
    case 'FT':
    case 'AET':
      return 'full_time'
    case 'ET':
      return 'extra_time'
    case 'P':
    case 'PEN':
      return 'penalties'
    case 'PST':
    case 'POST':
      return 'postponed'
    case 'CANC':
    case 'ABD':
    case 'AWD':
    case 'WO':
      return 'cancelled'
    case 'SUSP':
    case 'INT':
      return 'suspended'
    case 'NS':
    case 'TBD':
    default:
      return 'scheduled'
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeApiFootballMatch(raw: ApiFootballFixtureRaw): Match {
  const homeName = raw?.teams?.home?.name || 'Home Team'
  const awayName = raw?.teams?.away?.name || 'Away Team'
  const leagueName = raw?.league?.name || 'League'
  const matchSlug = `${slugify(homeName)}-vs-${slugify(awayName)}`

  return {
    id: String(raw?.fixture?.id || Math.random().toString(36).substring(7)),
    slug: matchSlug,
    league: {
      id: String(raw?.league?.id || '0'),
      slug: slugify(leagueName),
      name: leagueName,
      shortName: leagueName.slice(0, 4).toUpperCase(),
      logo: raw?.league?.logo,
      country: raw?.league?.country || 'Global',
      countryCode: (raw?.league?.country || 'WW').slice(0, 2).toUpperCase(),
      countryFlag: raw?.league?.flag,
      season: String(raw?.league?.season || 2026),
      currentRound: raw?.league?.round,
      type: 'league',
    },
    homeTeam: {
      id: String(raw?.teams?.home?.id || '1'),
      slug: slugify(homeName),
      name: homeName,
      shortName: homeName.slice(0, 10),
      abbreviation: homeName.slice(0, 3).toUpperCase(),
      logo: raw?.teams?.home?.logo,
      country: raw?.league?.country || 'Global',
    },
    awayTeam: {
      id: String(raw?.teams?.away?.id || '2'),
      slug: slugify(awayName),
      name: awayName,
      shortName: awayName.slice(0, 10),
      abbreviation: awayName.slice(0, 3).toUpperCase(),
      logo: raw?.teams?.away?.logo,
      country: raw?.league?.country || 'Global',
    },
    score: {
      home: raw?.goals?.home ?? null,
      away: raw?.goals?.away ?? null,
      halftime: raw?.score?.halftime
        ? { home: raw.score.halftime.home, away: raw.score.halftime.away }
        : undefined,
      extratime: raw?.score?.extratime
        ? { home: raw.score.extratime.home, away: raw.score.extratime.away }
        : undefined,
      penalty: raw?.score?.penalty
        ? { home: raw.score.penalty.home, away: raw.score.penalty.away }
        : undefined,
    },
    status: mapApiFootballStatus(raw?.fixture?.status?.short),
    minute: raw?.fixture?.status?.elapsed,
    kickoff: raw?.fixture?.date || new Date().toISOString(),
    kickoffTime: raw?.fixture?.date
      ? new Date(raw.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '20:00',
    venue: raw?.fixture?.venue?.name,
    referee: raw?.fixture?.referee,
    round: raw?.league?.round,
  }
}

function parseGridCoordinate(grid?: string, isHome = true): { x: number; y: number } {
  if (!grid || !grid.includes(':')) {
    return { x: 50, y: isHome ? 30 : 70 }
  }
  const [rowStr, colStr] = grid.split(':')
  const row = parseInt(rowStr, 10) || 1
  const col = parseInt(colStr, 10) || 1

  // Map 1-5 rows and columns to pitch percentage (0-100)
  const x = Math.min(90, Math.max(10, col * 20))
  const y = isHome ? Math.min(45, Math.max(10, row * 9)) : Math.min(90, Math.max(55, 100 - row * 9))

  return { x, y }
}

function normalizeEvents(rawEvents?: ApiFootballEventRaw[], homeTeamId?: number): MatchEvent[] {
  if (!rawEvents || !Array.isArray(rawEvents) || rawEvents.length === 0) return []

  return rawEvents.map((evt, idx) => {
    let type: MatchEvent['type'] = 'goal'
    const evtType = (evt?.type || '').toLowerCase()
    const detail = (evt?.detail || '').toLowerCase()

    if (evtType.includes('goal')) {
      type = detail.includes('penalty') ? 'penalty_scored' : 'goal'
    } else if (evtType.includes('card')) {
      if (detail.includes('yellow')) type = 'yellow_card'
      else if (detail.includes('red')) type = 'red_card'
    } else if (evtType.includes('subst')) {
      type = 'substitution'
    } else if (evtType.includes('var')) {
      type = 'var'
    }

    const isHome = homeTeamId ? evt?.team?.id === homeTeamId : true

    return {
      id: `evt-${idx}-${evt?.time?.elapsed || idx}`,
      minute: evt?.time?.elapsed || 0,
      extraMinute: evt?.time?.extra,
      type,
      team: isHome ? 'home' : 'away',
      playerName: evt?.player?.name || 'Player',
      playerId: evt?.player?.id ? String(evt.player.id) : undefined,
      playerNameSecondary: evt?.assist?.name,
      playerIdSecondary: evt?.assist?.id ? String(evt.assist.id) : undefined,
      detail: evt?.detail || '',
    }
  })
}

function normalizeCommentary(events: MatchEvent[]): MatchCommentaryItem[] {
  return events.map((e) => ({
    id: `comm-${e.id}`,
    minute: e.minute,
    extraMinute: e.extraMinute,
    type: e.type === 'goal' || e.type === 'penalty_scored' ? 'goal' : e.type === 'yellow_card' || e.type === 'red_card' ? 'card' : e.type === 'var' ? 'var' : e.type === 'substitution' ? 'sub' : 'comment',
    text: `${e.playerName} - ${e.detail || e.type}`,
    isImportant: e.type === 'goal' || e.type === 'red_card' || e.type === 'var',
  }))
}

function normalizeStatistics(rawStats?: ApiFootballTeamStatsRaw[]): MatchStatistics | undefined {
  if (!rawStats || !Array.isArray(rawStats) || rawStats.length < 2) return undefined

  const homeMap = new Map<string, number>()
  const awayMap = new Map<string, number>()

  if (Array.isArray(rawStats[0]?.statistics)) {
    rawStats[0].statistics.forEach((s) => {
      if (!s?.type) return
      const val = typeof s.value === 'string' ? parseInt(s.value.replace('%', ''), 10) || 0 : (s.value || 0)
      homeMap.set(s.type.toLowerCase(), val)
    })
  }

  if (Array.isArray(rawStats[1]?.statistics)) {
    rawStats[1].statistics.forEach((s) => {
      if (!s?.type) return
      const val = typeof s.value === 'string' ? parseInt(s.value.replace('%', ''), 10) || 0 : (s.value || 0)
      awayMap.set(s.type.toLowerCase(), val)
    })
  }

  return {
    possession: { home: homeMap.get('ball possession') || 50, away: awayMap.get('ball possession') || 50 },
    shots: { home: homeMap.get('total shots') || 0, away: awayMap.get('total shots') || 0 },
    shotsOnTarget: { home: homeMap.get('shots on goal') || 0, away: awayMap.get('shots on goal') || 0 },
    corners: { home: homeMap.get('corner kicks') || 0, away: awayMap.get('corner kicks') || 0 },
    fouls: { home: homeMap.get('fouls') || 0, away: awayMap.get('fouls') || 0 },
    yellowCards: { home: homeMap.get('yellow cards') || 0, away: awayMap.get('yellow cards') || 0 },
    redCards: { home: homeMap.get('red cards') || 0, away: awayMap.get('red cards') || 0 },
    offsides: { home: homeMap.get('offsides') || 0, away: awayMap.get('offsides') || 0 },
    passes: { home: homeMap.get('total passes') || 0, away: awayMap.get('total passes') || 0 },
    passAccuracy: { home: homeMap.get('passes %') || 80, away: awayMap.get('passes %') || 80 },
  }
}

function normalizeLineups(rawLineups?: ApiFootballLineupRaw[]): Lineup | undefined {
  if (!rawLineups || !Array.isArray(rawLineups) || rawLineups.length < 2) return undefined

  const homeRaw = rawLineups[0]
  const awayRaw = rawLineups[1]
  if (!homeRaw || !awayRaw) return undefined

  const parsePlayers = (list?: typeof homeRaw.startXI, isHome = true): LineupPlayer[] => {
    if (!list || !Array.isArray(list)) return []
    return list.map((item, idx) => {
      const coords = parseGridCoordinate(item?.player?.grid, isHome)
      return {
        id: String(item?.player?.id || idx),
        name: item?.player?.name || 'Player',
        number: item?.player?.number || (idx + 1),
        position: item?.player?.pos || 'M',
        positionX: coords.x,
        positionY: coords.y,
        rating: 7.0,
      }
    })
  }

  const parseBench = (list?: typeof homeRaw.substitutes): LineupPlayer[] => {
    if (!list || !Array.isArray(list)) return []
    return list.map((item, idx) => ({
      id: String(item?.player?.id || idx),
      name: item?.player?.name || 'Player',
      number: item?.player?.number || (idx + 1),
      position: item?.player?.pos || 'SUB',
      positionX: 50,
      positionY: 50,
    }))
  }

  return {
    home: {
      formation: homeRaw.formation || '4-3-3',
      starters: parsePlayers(homeRaw.startXI, true),
      bench: parseBench(homeRaw.substitutes),
      coach: homeRaw.coach?.name,
    },
    away: {
      formation: awayRaw.formation || '4-3-3',
      starters: parsePlayers(awayRaw.startXI, false),
      bench: parseBench(awayRaw.substitutes),
      coach: awayRaw.coach?.name,
    },
  }
}

export function normalizeApiFootballMatchDetails(raw: ApiFootballFixtureRaw): Match {
  const baseMatch = normalizeApiFootballMatch(raw)
  const homeTeamId = raw?.teams?.home?.id
  const events = normalizeEvents(raw?.events, homeTeamId)
  const commentary = normalizeCommentary(events)
  const statistics = normalizeStatistics(raw?.statistics)
  const lineups = normalizeLineups(raw?.lineups)

  return {
    ...baseMatch,
    events,
    commentary,
    statistics,
    lineups,
    lineup: lineups,
  }
}

export function normalizeApiFootballStanding(raw: any): Standing {
  const rank = raw?.rank || 1
  const teamName = raw?.team?.name || 'Team'
  const teamSlug = slugify(teamName)
  const formStr = raw?.form || ''
  const form: string[] = formStr
    .split('')
    .map((ch: string) => ch.toUpperCase())
    .filter((c: string) => c === 'W' || c === 'D' || c === 'L')

  return {
    position: rank,
    rank,
    team: {
      id: String(raw?.team?.id || '0'),
      slug: teamSlug,
      name: teamName,
      shortName: teamName.slice(0, 10),
      abbreviation: teamName.slice(0, 3).toUpperCase(),
      logo: raw?.team?.logo,
      country: 'Global',
    },
    teamId: String(raw?.team?.id || '0'),
    teamName,
    teamSlug,
    teamLogo: raw?.team?.logo,
    played: raw?.all?.played || 0,
    won: raw?.all?.win || 0,
    drawn: raw?.all?.draw || 0,
    lost: raw?.all?.lose || 0,
    goalsFor: raw?.all?.goals?.for || 0,
    goalsAgainst: raw?.all?.goals?.against || 0,
    goalDifference: raw?.goalsDiff ?? (raw?.all?.goals?.for || 0) - (raw?.all?.goals?.against || 0),
    points: raw?.points || 0,
    form: form.length > 0 ? form : undefined,
  }
}

export function normalizeApiFootballTopScorer(raw: any): TopScorer {
  const p = raw?.player
  const stats = raw?.statistics?.[0]
  const playerName = p?.name || `${p?.firstname || ''} ${p?.lastname || ''}`.trim() || 'Player'
  const teamName = stats?.team?.name || 'Team'

  return {
    playerId: String(p?.id || Math.random().toString(36).substring(7)),
    playerSlug: slugify(playerName),
    playerName,
    photo: p?.photo,
    teamId: String(stats?.team?.id || ''),
    teamSlug: slugify(teamName),
    teamName,
    teamLogo: stats?.team?.logo,
    matches: stats?.games?.appearences || 0,
    goals: stats?.goals?.total || 0,
    assists: stats?.goals?.assists || 0,
    penalties: stats?.penalty?.scored || 0,
  }
}

export function normalizeApiFootballTeamDetails(raw: any): Team {
  const t = raw?.team
  const v = raw?.venue
  const name = t?.name || 'Team'

  return {
    id: String(t?.id || '0'),
    slug: slugify(name),
    name,
    shortName: name.slice(0, 14),
    abbreviation: (t?.code || name).slice(0, 3).toUpperCase(),
    logo: t?.logo,
    country: t?.country || 'Global',
    founded: t?.founded || undefined,
    stadium: v?.name,
    stadiumCapacity: v?.capacity || undefined,
    manager: undefined,
  }
}

export function normalizeApiFootballSquadPlayer(raw: any): Player {
  const name = raw?.name || 'Player'
  const parts = name.split(' ')
  const firstName = parts[0] || name
  const lastName = parts.slice(1).join(' ') || ''

  return {
    id: String(raw?.id || Math.random().toString(36).substring(7)),
    slug: slugify(name),
    name,
    firstName,
    lastName,
    photo: raw?.photo,
    nationality: 'Global',
    dateOfBirth: '',
    age: raw?.age || 0,
    position: raw?.position || 'Player',
    number: raw?.number || undefined,
  }
}

export function normalizeApiFootballTeamStats(raw: any) {
  if (!raw) return null

  return {
    fixtures: {
      played: raw?.fixtures?.played?.total || 0,
      wins: raw?.fixtures?.wins?.total || 0,
      draws: raw?.fixtures?.draws?.total || 0,
      loses: raw?.fixtures?.loses?.total || 0,
    },
    goals: {
      for: raw?.goals?.for?.total?.total || 0,
      against: raw?.goals?.against?.total?.total || 0,
      avgFor: raw?.goals?.for?.average?.total || '0',
      avgAgainst: raw?.goals?.against?.average?.total || '0',
    },
    cleanSheets: raw?.clean_sheet?.total || 0,
    failedToScore: raw?.failed_to_score?.total || 0,
    penalty: {
      total: raw?.penalty?.total || 0,
      scored: raw?.penalty?.scored?.total || 0,
      missed: raw?.penalty?.missed?.total || 0,
    },
    form: raw?.form || '',
    biggestWin: raw?.biggest?.wins?.home ? `Home: ${raw.biggest.wins.home}` : raw?.biggest?.wins?.away ? `Away: ${raw.biggest.wins.away}` : null,
    biggestLoss: raw?.biggest?.loses?.home ? `Home: ${raw.biggest.loses.home}` : raw?.biggest?.loses?.away ? `Away: ${raw.biggest.loses.away}` : null,
  }
}

