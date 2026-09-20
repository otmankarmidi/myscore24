import { Player } from '@/types/player'
import { mockTeams } from './mockTeams'

const t = (id: string) => mockTeams.find(tm => tm.id === id)!

export const mockPlayers: Player[] = [
  {
    id: 'lamine-yamal', slug: 'lamine-yamal', name: 'Lamine Yamal',
    firstName: 'Lamine', lastName: 'Yamal',
    nationality: 'Spain', nationalityFlag: '🇪🇸',
    dateOfBirth: '2007-07-13', age: 17,
    height: 180, weight: 73,
    position: 'Right Winger', number: 19,
    team: t('fcb'),
    marketValue: '€180M',
    stats: { appearances: 28, goals: 14, assists: 17, yellowCards: 2, redCards: 0, minutesPlayed: 2312, rating: 8.4, dribbles: 118, shotsOnTarget: 42 },
    seasonStats: { appearances: 28, goals: 14, assists: 17, yellowCards: 2, redCards: 0, minutesPlayed: 2312, rating: 8.4, dribbles: 118, shotsOnTarget: 42 },
  },
  {
    id: 'erling-haaland', slug: 'erling-haaland', name: 'Erling Haaland',
    firstName: 'Erling', lastName: 'Haaland',
    nationality: 'Norway', nationalityFlag: '🇳🇴',
    dateOfBirth: '2000-07-21', age: 24,
    height: 194, weight: 88,
    position: 'Centre Forward', number: 9,
    team: t('mci'),
    marketValue: '€200M',
    stats: { appearances: 29, goals: 28, assists: 5, yellowCards: 1, redCards: 0, minutesPlayed: 2434, rating: 8.7, shotsOnTarget: 89 },
    seasonStats: { appearances: 29, goals: 28, assists: 5, yellowCards: 1, redCards: 0, minutesPlayed: 2434, rating: 8.7, shotsOnTarget: 89 },
  },
  {
    id: 'kylian-mbappe', slug: 'kylian-mbappe', name: 'Kylian Mbappé',
    firstName: 'Kylian', lastName: 'Mbappé',
    nationality: 'France', nationalityFlag: '🇫🇷',
    dateOfBirth: '1998-12-20', age: 26,
    height: 178, weight: 73,
    position: 'Centre Forward', number: 9,
    team: t('rma'),
    marketValue: '€180M',
    stats: { appearances: 27, goals: 22, assists: 9, yellowCards: 3, redCards: 0, minutesPlayed: 2198, rating: 8.1 },
    seasonStats: { appearances: 27, goals: 22, assists: 9, yellowCards: 3, redCards: 0, minutesPlayed: 2198, rating: 8.1 },
  },
  {
    id: 'bukayo-saka', slug: 'bukayo-saka', name: 'Bukayo Saka',
    firstName: 'Bukayo', lastName: 'Saka',
    nationality: 'England', nationalityFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    dateOfBirth: '2001-09-05', age: 23,
    height: 178, weight: 72,
    position: 'Right Winger', number: 7,
    team: t('ars'),
    marketValue: '€160M',
    stats: { appearances: 29, goals: 16, assists: 14, yellowCards: 1, redCards: 0, minutesPlayed: 2498, rating: 8.2 },
    seasonStats: { appearances: 29, goals: 16, assists: 14, yellowCards: 1, redCards: 0, minutesPlayed: 2498, rating: 8.2 },
  },
  {
    id: 'raphinha', slug: 'raphinha', name: 'Raphinha',
    firstName: 'Raphinha', lastName: 'Raphinha',
    nationality: 'Brazil', nationalityFlag: '🇧🇷',
    dateOfBirth: '1996-12-14', age: 27,
    height: 176, weight: 68,
    position: 'Left Winger', number: 11,
    team: t('fcb'),
    marketValue: '€85M',
    stats: { appearances: 28, goals: 19, assists: 12, yellowCards: 4, redCards: 0, minutesPlayed: 2215, rating: 8.0 },
    seasonStats: { appearances: 28, goals: 19, assists: 12, yellowCards: 4, redCards: 0, minutesPlayed: 2215, rating: 8.0 },
  },
  {
    id: 'mohamed-salah', slug: 'mohamed-salah', name: 'Mohamed Salah',
    firstName: 'Mohamed', lastName: 'Salah',
    nationality: 'Egypt', nationalityFlag: '🇪🇬',
    dateOfBirth: '1992-06-15', age: 32,
    height: 175, weight: 71,
    position: 'Right Winger', number: 11,
    team: t('liv'),
    marketValue: '€60M',
    stats: { appearances: 29, goals: 21, assists: 11, yellowCards: 0, redCards: 0, minutesPlayed: 2510, rating: 8.1 },
    seasonStats: { appearances: 29, goals: 21, assists: 11, yellowCards: 0, redCards: 0, minutesPlayed: 2510, rating: 8.1 },
  },
]

export const getTopScorers = (_leagueId?: string) => {
  return [...mockPlayers].sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
}

export const getPlayerBySlug = (slug: string) => mockPlayers.find(p => p.slug === slug)
