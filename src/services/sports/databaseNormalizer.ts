import { Match, MatchStatus, MatchEvent, MatchStatistics } from '@/types/match'
import { Team } from '@/types/team'
import { League } from '@/types/league'
import { Standing } from '@/types/standing'

export function getLeagueCountry(nameOrSlug: string): string {
  const s = (nameOrSlug || '').toLowerCase()
  if (s.includes('la liga') || s.includes('laliga') || s.includes('esp') || s.includes('spain')) return 'Spain'
  if (s.includes('premier') || s.includes('eng') || s.includes('england')) return 'England'
  if (s.includes('bundesliga') || s.includes('ger') || s.includes('germany')) return 'Germany'
  if (s.includes('serie a') || s.includes('ita') || s.includes('italy')) return 'Italy'
  if (s.includes('ligue 1') || s.includes('fra') || s.includes('france')) return 'France'
  if (s.includes('botola') || s.includes('mar') || s.includes('morocco')) return 'Morocco'
  if (s.includes('saudi') || s.includes('sau') || s.includes('ksa')) return 'Saudi Arabia'
  if (s.includes('primeira') || s.includes('por') || s.includes('portugal')) return 'Portugal'
  if (s.includes('eredivisie') || s.includes('ned') || s.includes('dutch') || s.includes('netherlands')) return 'Netherlands'
  if (s.includes('mls') || s.includes('major league soccer') || s.includes('usa') || s.includes('america')) return 'USA'
  if (s.includes('champions') || s.includes('europa') || s.includes('uefa')) return 'Europe'
  return 'International'
}

export function mapDbStatusToMatchStatus(status: string): MatchStatus {
  const s = (status || '').toUpperCase()
  if (['NS', 'SCHEDULED', 'PRE'].includes(s)) return 'scheduled'
  if (['1H', '2H', 'LIVE', 'HT', 'IN'].includes(s)) return 'live'
  if (['FT', 'AET', 'PEN', 'FINISHED', 'POST'].includes(s)) return 'full_time'
  if (['CANC', 'CANCELLED'].includes(s)) return 'cancelled'
  if (['POSTP', 'POSTPONED'].includes(s)) return 'postponed'
  return 'scheduled'
}

export function mapDbLeagueToLeague(l: any): League {
  const leagueName = l?.name || 'Football League'
  const country = l?.country || getLeagueCountry(leagueName || l?.slug)
  return {
    id: String(l?.id || 39),
    slug: l?.slug || `league-${l?.id || 39}`,
    name: leagueName,
    shortName: l?.short_name || leagueName,
    logo: l?.logo_url || 'https://media.api-sports.io/football/leagues/39.png',
    country,
    countryCode: country.substring(0, 3).toUpperCase(),
    season: '2026/2027',
    currentSeason: '2026/2027',
    type: (l?.type as any) || 'league'
  }
}

export function mapDbTeamToTeam(t: any): Team {
  return {
    id: String(t?.id || 42),
    slug: t?.slug || `team-${t?.id || 42}`,
    name: t?.name || 'Club',
    shortName: t?.short_name || t?.name || 'Club',
    abbreviation: t?.code || (t?.name ? t.name.substring(0, 3).toUpperCase() : 'CLUB'),
    logo: t?.logo_url || 'https://media.api-sports.io/football/teams/42.png',
    country: t?.country || 'International',
    stadium: t?.venue_name || 'Stadium',
    stadiumCapacity: t?.venue_capacity || 50000
  }
}

export function mapDbMatchToMatch(m: any, homeTeamRecord?: any, awayTeamRecord?: any, leagueRecord?: any): Match {
  const league = mapDbLeagueToLeague(leagueRecord || m.league)
  const homeTeam = mapDbTeamToTeam(homeTeamRecord || m.home_team)
  const awayTeam = mapDbTeamToTeam(awayTeamRecord || m.away_team)

  const matchDate = m.match_date ? new Date(m.match_date) : new Date()
  const kickoffTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return {
    id: String(m.id),
    slug: `match-${m.id}`,
    league,
    homeTeam,
    awayTeam,
    status: mapDbStatusToMatchStatus(m.status),
    minute: m.elapsed || 0,
    kickoff: m.match_date || matchDate.toISOString(),
    kickoffTime,
    venue: m.venue || homeTeam.stadium || 'Stadium',
    round: m.round || 'Regular Season',
    score: {
      home: m.home_score ?? 0,
      away: m.away_score ?? 0
    }
  }
}

export function mapDbStandingToStanding(s: any, teamRecord?: any): Standing {
  const team = mapDbTeamToTeam(teamRecord || s.team)
  return {
    position: s.rank || 1,
    team,
    played: s.played || 0,
    won: s.won || 0,
    drawn: s.drawn || 0,
    lost: s.lost || 0,
    goalsFor: s.goals_for || 0,
    goalsAgainst: s.goals_against || 0,
    goalDifference: (s.goals_for || 0) - (s.goals_against || 0),
    points: s.points || 0,
    form: s.form ? s.form.split('') : ['W', 'W', 'W']
  }
}
