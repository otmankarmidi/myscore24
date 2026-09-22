import { League } from '@/types/league'

export const mockLeagues: League[] = [
  { id: '140', slug: 'la-liga', name: 'La Liga', shortName: 'La Liga', country: 'Spain', countryCode: 'ESP', countryFlag: '🇪🇸', season: '2024/25', currentRound: 'Round 28', type: 'league' },
  { id: '39', slug: 'premier-league', name: 'Premier League', shortName: 'PL', country: 'England', countryCode: 'ENG', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', season: '2024/25', currentRound: 'Matchday 29', type: 'league' },
  { id: '200', slug: 'botola-pro', name: 'Botola Pro Inwi', shortName: 'Botola', country: 'Morocco', countryCode: 'MAR', countryFlag: '🇲🇦', season: '2024/25', currentRound: 'Journée 22', type: 'league' },
  { id: '307', slug: 'saudi-pro-league', name: 'Saudi Pro League', shortName: 'SPL', country: 'Saudi Arabia', countryCode: 'KSA', countryFlag: '🇸🇦', season: '2024/25', currentRound: 'Matchday 25', type: 'league' },
  { id: '94', slug: 'primeira-liga', name: 'Primeira Liga', shortName: 'Liga Portugal', country: 'Portugal', countryCode: 'POR', countryFlag: '🇵🇹', season: '2024/25', currentRound: 'Matchday 26', type: 'league' },
  { id: '88', slug: 'eredivisie', name: 'Eredivisie', shortName: 'ERE', country: 'Netherlands', countryCode: 'NED', countryFlag: '🇳🇱', season: '2024/25', currentRound: 'Matchday 26', type: 'league' },
  { id: '253', slug: 'mls', name: 'Major League Soccer', shortName: 'MLS', country: 'USA', countryCode: 'USA', countryFlag: '🇺🇸', season: '2025', currentRound: 'Regular Season', type: 'league' },
  { id: '2', slug: 'champions-league', name: 'UEFA Champions League', shortName: 'UCL', country: 'Europe', countryCode: 'UEFA', countryFlag: '🇪🇺', season: '2024/25', currentRound: 'Quarter Finals', type: 'cup', continent: 'Europe' },
  { id: '3', slug: 'europa-league', name: 'UEFA Europa League', shortName: 'UEL', country: 'Europe', countryCode: 'UEFA', countryFlag: '🇪🇺', season: '2024/25', currentRound: 'Round of 16', type: 'cup', continent: 'Europe' },
  { id: '61', slug: 'ligue-1', name: 'Ligue 1', shortName: 'L1', country: 'France', countryCode: 'FRA', countryFlag: '🇫🇷', season: '2024/25', currentRound: 'Matchday 27', type: 'league' },
  { id: '78', slug: 'bundesliga', name: 'Bundesliga', shortName: 'BL', country: 'Germany', countryCode: 'DEU', countryFlag: '🇩🇪', season: '2024/25', currentRound: 'Matchday 26', type: 'league' },
  { id: '135', slug: 'serie-a', name: 'Serie A', shortName: 'SA', country: 'Italy', countryCode: 'ITA', countryFlag: '🇮🇹', season: '2024/25', currentRound: 'Round 30', type: 'league' },
]

export const getLeagueBySlug = (slug: string) => mockLeagues.find(l => l.slug === slug || l.id === slug)
export const getLeagueById = (id: string) => mockLeagues.find(l => l.id === id || l.slug === id)
