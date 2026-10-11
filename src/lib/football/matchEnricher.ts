import { Match } from '@/types/match'

/**
 * Normalizes a match object without ever inventing data.
 * Real lineups, events and statistics come exclusively from the provider
 * (API-Football). This only keeps the `lineup` / `lineups` aliases in sync.
 */
export function enrichMatch(match: Match): Match {
  if (!match) return match
  const lineup = match.lineup || match.lineups
  return {
    ...match,
    lineup,
    lineups: lineup,
    events: match.events ? [...match.events] : match.events,
  }
}
