import { Match, MatchStatus, MatchEvent, MatchStatistics, MatchCommentaryItem } from '@/types/match'
import { Standing } from '@/types/standing'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveHighlightlyStatus(description: string): MatchStatus {
  const d = (description || '').toLowerCase()
  if (d.includes('first half') || d.includes('second half') || d === 'in progress' || d === 'live') return 'live'
  if (d === 'halftime' || d === 'half time' || d.includes('half-time')) return 'half_time'
  if (d.includes('extra time')) return 'extra_time'
  if (d.includes('penalt')) return 'penalties'
  if (d === 'finished' || d.includes('full time') || d === 'ft' || d.includes('ended') || d.includes('final')) return 'full_time'
  if (d.includes('postponed')) return 'postponed'
  if (d.includes('cancel') || d.includes('abandon')) return 'cancelled'
  if (d.includes('suspend') || d.includes('interrupt')) return 'suspended'
  return 'scheduled'
}

function parseScore(scoreStr?: string): { home: number | null; away: number | null } {
  if (!scoreStr) return { home: null, away: null }
  const parts = scoreStr.replace(/\s/g, '').split('-').map((p) => parseInt(p, 10))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { home: parts[0], away: parts[1] }
  }
  return { home: null, away: null }
}

export function normalizeHighlightlyMatch(raw: any): Match {
  const homeName = raw?.homeTeam?.name || 'Home Team'
  const awayName = raw?.awayTeam?.name || 'Away Team'
  const leagueName = raw?.league?.name || raw?.country?.name || 'League'
  const state = raw?.state || {}
  const score = parseScore(state?.score?.current)
  const penScore = parseScore(state?.score?.penalties)
  const statusStr = resolveHighlightlyStatus(state?.description || '')
  const minute = typeof state?.clock === 'number' ? state.clock : undefined

  return {
    id: String(raw?.id || Math.random().toString(36).substring(7)),
    slug: `${slugify(homeName)}-vs-${slugify(awayName)}`,
    league: {
      id: String(raw?.league?.id || '0'),
      slug: slugify(leagueName),
      name: leagueName,
      shortName: leagueName.slice(0, 4).toUpperCase(),
      logo: raw?.league?.logo,
      country: raw?.country?.name || 'Global',
      countryCode: (raw?.country?.code || 'WW').toUpperCase(),
      countryFlag: raw?.country?.logo,
      season: String(raw?.league?.season || new Date().getFullYear()),
      currentRound: raw?.round,
      type: 'league',
    },
    homeTeam: {
      id: String(raw?.homeTeam?.id || '1'),
      slug: slugify(homeName),
      name: homeName,
      shortName: homeName.slice(0, 10),
      abbreviation: homeName.slice(0, 3).toUpperCase(),
      logo: raw?.homeTeam?.logo,
      country: raw?.country?.name || 'Global',
    },
    awayTeam: {
      id: String(raw?.awayTeam?.id || '2'),
      slug: slugify(awayName),
      name: awayName,
      shortName: awayName.slice(0, 10),
      abbreviation: awayName.slice(0, 3).toUpperCase(),
      logo: raw?.awayTeam?.logo,
      country: raw?.country?.name || 'Global',
    },
    score: {
      home: score.home,
      away: score.away,
      penalty: penScore.home !== null ? penScore : undefined,
    },
    status: statusStr,
    minute,
    kickoff: raw?.date || new Date().toISOString(),
    kickoffTime: raw?.date || new Date().toISOString(),
    venue: raw?.venue?.name,
    referee: raw?.referee?.name,
    round: raw?.round,
  }
}

export function normalizeHighlightlyMatchDetails(raw: any): Match {
  const base = normalizeHighlightlyMatch(raw)
  const homeTeamId = raw?.homeTeam?.id

  const events: MatchEvent[] = (raw?.events || []).map((evt: any, idx: number) => {
    const timeStr = String(evt?.time || '0')
    const minute = parseInt(timeStr.replace(/[^0-9]/g, ''), 10) || 0
    const evtType = (evt?.type || '').toLowerCase()
    let type: MatchEvent['type'] = 'goal'
    if (evtType.includes('goal')) type = 'goal'
    else if (evtType.includes('yellow')) type = 'yellow_card'
    else if (evtType.includes('red')) type = 'red_card'
    else if (evtType.includes('subst')) type = 'substitution'
    else if (evtType.includes('var')) type = 'var'
    else if (evtType.includes('penalty')) type = 'penalty_scored'
    const isHome = homeTeamId ? String(evt?.team?.id) === String(homeTeamId) : true
    return {
      id: `evt-${idx}-${minute}`,
      minute,
      type,
      team: isHome ? 'home' : 'away',
      playerName: evt?.player || 'Player',
      playerNameSecondary: evt?.assist || undefined,
      detail: evt?.type,
    }
  })

  const commentary: MatchCommentaryItem[] = events.map((e) => ({
    id: `comm-${e.id}`,
    minute: e.minute,
    type: (e.type === 'goal' || e.type === 'penalty_scored' ? 'goal' : e.type === 'yellow_card' || e.type === 'red_card' ? 'card' : 'comment') as MatchCommentaryItem['type'],
    text: `${e.playerName} - ${e.detail || e.type}`,
    isImportant: e.type === 'goal' || e.type === 'red_card',
  }))

  let statistics: MatchStatistics | undefined
  if (raw?.statistics && raw.statistics.length >= 2) {
    const homeStats: any[] = raw.statistics[0]?.statistics || []
    const awayStats: any[] = raw.statistics[1]?.statistics || []
    const hMap = new Map<string, number>(homeStats.map((s: any) => [s.displayName?.toLowerCase(), Number(s.value) || 0]))
    const aMap = new Map<string, number>(awayStats.map((s: any) => [s.displayName?.toLowerCase(), Number(s.value) || 0]))
    statistics = {
      possession: { home: Math.round((hMap.get('ball possession') || 0.5) * 100), away: Math.round((aMap.get('ball possession') || 0.5) * 100) },
      shots: { home: hMap.get('total shots') || hMap.get('shots') || 0, away: aMap.get('total shots') || aMap.get('shots') || 0 },
      shotsOnTarget: { home: hMap.get('shots on target') || 0, away: aMap.get('shots on target') || 0 },
      corners: { home: hMap.get('corners') || hMap.get('corner kicks') || 0, away: aMap.get('corners') || aMap.get('corner kicks') || 0 },
      fouls: { home: hMap.get('fouls') || 0, away: aMap.get('fouls') || 0 },
      yellowCards: { home: hMap.get('yellow cards') || 0, away: aMap.get('yellow cards') || 0 },
      redCards: { home: hMap.get('red cards') || 0, away: aMap.get('red cards') || 0 },
      offsides: { home: hMap.get('offsides') || 0, away: aMap.get('offsides') || 0 },
      passes: { home: hMap.get('passes') || 0, away: aMap.get('passes') || 0 },
      passAccuracy: { home: hMap.get('pass accuracy') || 80, away: aMap.get('pass accuracy') || 80 },
    }
  }

  return { ...base, events, commentary, statistics }
}

export function normalizeHighlightlyStanding(raw: any, index: number): Standing {
  const teamName = raw?.team?.name || raw?.teamName || 'Team'
  const teamSlug = slugify(teamName)
  const formStr: string = raw?.form || ''
  const form: string[] = formStr.split('').filter((c: string) => c === 'W' || c === 'D' || c === 'L')

  return {
    position: raw?.position || raw?.rank || index + 1,
    rank: raw?.position || raw?.rank || index + 1,
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
    played: raw?.played || raw?.matchesPlayed || 0,
    won: raw?.won || raw?.wins || 0,
    drawn: raw?.drawn || raw?.draws || 0,
    lost: raw?.lost || raw?.losses || 0,
    goalsFor: raw?.goalsFor || raw?.goalsScored || 0,
    goalsAgainst: raw?.goalsAgainst || raw?.goalsConceded || 0,
    goalDifference: raw?.goalDifference || (raw?.goalsFor || 0) - (raw?.goalsAgainst || 0),
    points: raw?.points || 0,
    form: form.length > 0 ? form : undefined,
  }
}
