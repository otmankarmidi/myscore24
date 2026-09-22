import { Player } from '@/types/player'
import { mockTeams } from './mockTeams'
import { matchLocalPlayerImage } from '@/lib/playerMatcher'

const t = (id: string) => mockTeams.find(tm => tm.id === id)!

const basePlayers: Player[] = [
  {
    id: '273005', slug: 'lamine-yamal', name: 'Lamine Yamal',
    firstName: 'Lamine', lastName: 'Yamal',
    photo: 'https://media.api-sports.io/football/players/273005.png',
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
    id: '249168', slug: 'erling-haaland', name: 'Erling Haaland',
    firstName: 'Erling', lastName: 'Haaland',
    photo: 'https://media.api-sports.io/football/players/249168.png',
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
    id: '230020', slug: 'kylian-mbappe', name: 'Kylian Mbappé',
    firstName: 'Kylian', lastName: 'Mbappé',
    photo: 'https://media.api-sports.io/football/players/230020.png',
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
    id: '260053', slug: 'bukayo-saka', name: 'Bukayo Saka',
    firstName: 'Bukayo', lastName: 'Saka',
    photo: 'https://media.api-sports.io/football/players/260053.png',
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
    id: '234479', slug: 'raphinha', name: 'Raphinha',
    firstName: 'Raphinha', lastName: 'Raphinha',
    photo: 'https://media.api-sports.io/football/players/234479.png',
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
    id: '173896', slug: 'mohamed-salah', name: 'Mohamed Salah',
    firstName: 'Mohamed', lastName: 'Salah',
    photo: 'https://media.api-sports.io/football/players/173896.png',
    nationality: 'Egypt', nationalityFlag: '🇪🇬',
    dateOfBirth: '1992-06-15', age: 32,
    height: 175, weight: 71,
    position: 'Right Winger', number: 11,
    team: t('liv'),
    marketValue: '€60M',
    stats: { appearances: 29, goals: 21, assists: 11, yellowCards: 0, redCards: 0, minutesPlayed: 2510, rating: 8.1 },
    seasonStats: { appearances: 29, goals: 21, assists: 11, yellowCards: 0, redCards: 0, minutesPlayed: 2510, rating: 8.1 },
  },
  {
    id: '249309', slug: 'vinicius-junior', name: 'Vinícius Júnior',
    firstName: 'Vinícius', lastName: 'Júnior',
    photo: 'https://media.api-sports.io/football/players/249309.png',
    nationality: 'Brazil', nationalityFlag: '🇧🇷',
    dateOfBirth: '2000-07-12', age: 24,
    height: 176, weight: 73,
    position: 'Left Winger', number: 7,
    team: t('rma'),
    marketValue: '€200M',
    stats: { appearances: 28, goals: 20, assists: 10, yellowCards: 4, redCards: 0, minutesPlayed: 2350, rating: 8.3 },
    seasonStats: { appearances: 28, goals: 20, assists: 10, yellowCards: 4, redCards: 0, minutesPlayed: 2350, rating: 8.3 },
  },
  {
    id: '282643', slug: 'jude-bellingham', name: 'Jude Bellingham',
    firstName: 'Jude', lastName: 'Bellingham',
    photo: 'https://media.api-sports.io/football/players/282643.png',
    nationality: 'England', nationalityFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    dateOfBirth: '2003-06-29', age: 21,
    height: 186, weight: 75,
    position: 'Attacking Midfield', number: 5,
    team: t('rma'),
    marketValue: '€180M',
    stats: { appearances: 26, goals: 13, assists: 11, yellowCards: 2, redCards: 0, minutesPlayed: 2200, rating: 8.2 },
    seasonStats: { appearances: 26, goals: 13, assists: 11, yellowCards: 2, redCards: 0, minutesPlayed: 2200, rating: 8.2 },
  },
  {
    id: '247738', slug: 'achraf-hakimi', name: 'Achraf Hakimi',
    firstName: 'Achraf', lastName: 'Hakimi',
    photo: 'https://media.api-sports.io/football/players/247738.png',
    nationality: 'Morocco', nationalityFlag: '🇲🇦',
    dateOfBirth: '1998-11-04', age: 26,
    height: 181, weight: 73,
    position: 'Right Back', number: 2,
    team: t('psg'),
    marketValue: '€65M',
    stats: { appearances: 27, goals: 6, assists: 9, yellowCards: 3, redCards: 0, minutesPlayed: 2300, rating: 7.9 },
    seasonStats: { appearances: 27, goals: 6, assists: 9, yellowCards: 3, redCards: 0, minutesPlayed: 2300, rating: 7.9 },
  },
  {
    id: '287579', slug: 'cole-palmer', name: 'Cole Palmer',
    firstName: 'Cole', lastName: 'Palmer',
    photo: 'https://media.api-sports.io/football/players/287579.png',
    nationality: 'England', nationalityFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    dateOfBirth: '2002-05-06', age: 22,
    height: 189, weight: 74,
    position: 'Attacking Midfield', number: 20,
    team: t('che'),
    marketValue: '€130M',
    stats: { appearances: 28, goals: 18, assists: 12, yellowCards: 3, redCards: 0, minutesPlayed: 2400, rating: 8.3 },
    seasonStats: { appearances: 28, goals: 18, assists: 12, yellowCards: 3, redCards: 0, minutesPlayed: 2400, rating: 8.3 },
  },
]

export const mockPlayers: Player[] = basePlayers.map((p) => {
  const teamName = p.team?.name || p.teamName || ''
  const matched = matchLocalPlayerImage(teamName, p.name, p.id, p.number, p.slug)
  if (matched) {
    return {
      ...p,
      image: matched.imagePath,
      imagePath: matched.imagePath,
      imageSourceUrl: matched.imageSourceUrl,
      squadNumber: matched.squadNumber || p.number,
      position: matched.position || p.position,
      slug: matched.slug || p.slug,
    }
  }
  return p
})

export const getTopScorers = (_leagueId?: string) => {
  return [...mockPlayers].sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
}

export const getPlayerBySlug = (slug: string) =>
  mockPlayers.find(p => p.slug === slug || p.id === slug)
