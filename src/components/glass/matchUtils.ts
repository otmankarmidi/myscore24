import { Match } from '@/types/match'
import { isLiveStatus } from '@/lib/utils'
import { getCompetitionPriority } from '@/config/competitions'

export const isFinished = (m: Match) => m.status === 'full_time' || m.status === 'penalties'
export const isLive = (m: Match) => isLiveStatus(m.status)
export const isUpcoming = (m: Match) => m.status === 'scheduled'

export const byPriorityThenKickoff = (a: Match, b: Match) => {
  const p = getCompetitionPriority(a.league) - getCompetitionPriority(b.league)
  if (p !== 0) return p
  return new Date(a.kickoff || 0).getTime() - new Date(b.kickoff || 0).getTime()
}

/** Live first, then the next kickoff, then the most recent result — by competition priority. */
export function pickFeatured(matches: Match[]): Match | null {
  if (!matches.length) return null
  const live = matches.filter(isLive).sort(byPriorityThenKickoff)
  if (live.length) return live[0]
  const next = matches.filter(isUpcoming).sort(byPriorityThenKickoff)
  if (next.length) return next[0]
  return matches.filter(isFinished).sort(byPriorityThenKickoff)[0] || matches[0]
}

export const leagueKey = (m: Match) => String(m.league?.id || m.league?.slug || 'misc')

export function goalScorers(m: Match, side: 'home' | 'away', limit = 3): string[] {
  return (m.events || [])
    .filter((e) => e && e.type === 'goal' && e.team === side)
    .slice(0, limit)
    .map((e) => `${e.playerName} ${e.minute}'`)
}

export function redCards(m: Match, side: 'home' | 'away'): number {
  return (m.events || []).filter((e) => e && (e.type === 'red_card' || e.type === 'second_yellow') && e.team === side).length
}
