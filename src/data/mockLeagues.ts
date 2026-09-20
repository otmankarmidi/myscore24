import { League } from '@/types/league'

export const mockLeagues: League[] = [
  { id: 'laliga', slug: 'la-liga', name: 'La Liga', shortName: 'La Liga', country: 'Spain', countryCode: 'ESP', countryFlag: '🇪🇸', season: '2024/25', currentRound: 'Round 28', type: 'league' },
  { id: 'epl', slug: 'premier-league', name: 'Premier League', shortName: 'PL', country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', season: '2024/25', currentRound: 'Matchday 29', type: 'league' },
  { id: 'botola', slug: 'botola-pro', name: 'Botola Pro Inwi', shortName: 'Botola', country: 'Morocco', countryCode: 'MAR', countryFlag: '🇲🇦', season: '2024/25', currentRound: 'Journée 22', type: 'league' },
  { id: 'ucl', slug: 'champions-league', name: 'UEFA Champions League', shortName: 'UCL', country: 'Europe', countryCode: 'UEFA', countryFlag: '🇪🇺', season: '2024/25', currentRound: 'Quarter Finals', type: 'cup', continent: 'Europe' },
  { id: 'uel', slug: 'europa-league', name: 'UEFA Europa League', shortName: 'UEL', country: 'Europe', countryCode: 'UEFA', countryFlag: '🇪🇺', season: '2024/25', currentRound: 'Round of 16', type: 'cup', continent: 'Europe' },
  { id: 'ligue1', slug: 'ligue-1', name: 'Ligue 1', shortName: 'L1', country: 'France', countryCode: 'FRA', countryFlag: '🇫🇷', season: '2024/25', currentRound: 'Matchday 27', type: 'league' },
  { id: 'bundesliga', slug: 'bundesliga', name: 'Bundesliga', shortName: 'BL', country: 'Germany', countryCode: 'DEU', countryFlag: '🇩🇪', season: '2024/25', currentRound: 'Matchday 26', type: 'league' },
  { id: 'seriea', slug: 'serie-a', name: 'Serie A', shortName: 'SA', country: 'Italy', countryCode: 'ITA', countryFlag: '🇮🇹', season: '2024/25', currentRound: 'Round 30', type: 'league' },
  { id: 'caf', slug: 'caf-champions-league', name: 'CAF Champions League', shortName: 'CAF CL', country: 'Africa', countryCode: 'CAF', countryFlag: '🌍', season: '2024/25', currentRound: 'Semi Finals', type: 'cup', continent: 'Africa' },
  { id: 'afcon', slug: 'afcon', name: 'Africa Cup of Nations', shortName: 'AFCON', country: 'Africa', countryCode: 'INT', countryFlag: '🌍', season: '2025', currentRound: 'Group Stage', type: 'international', continent: 'Africa' },
]

export const getLeagueBySlug = (slug: string) => mockLeagues.find(l => l.slug === slug)
export const getLeagueById = (id: string) => mockLeagues.find(l => l.id === id)
