import { LeagueStandings } from '@/types/standing'
import { mockTeams } from './mockTeams'

const t = (id: string) => mockTeams.find(tm => tm.id === id)!

export const mockStandings: LeagueStandings[] = [
  // 1. Botola Pro Inwi (Morocco) - Matching Image 2
  {
    leagueId: 'botola',
    season: '2024/25',
    standings: [
      { position: 1, team: t('mas'), played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 7, form: ['W', 'W', 'D'] },
      { position: 2, team: t('uts'), played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 7, form: ['W', 'D', 'W'] },
      { position: 3, team: t('husa'), played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 9, goalsAgainst: 6, goalDifference: 3, points: 6, form: ['W', 'L', 'W'] },
      { position: 4, team: t('kacm'), played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 6, form: ['L', 'W', 'W'] },
      { position: 5, team: t('irt'), played: 3, won: 1, drawn: 1, lost: 1, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 4, form: ['W', 'D', 'L'] },
      { position: 6, team: t('rca'), played: 2, won: 1, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 4, form: ['W', 'D'] },
    ],
  },
  // 2. Premier League (England)
  {
    leagueId: 'epl',
    season: '2024/25',
    standings: [
      { position: 1, team: t('ars'), played: 29, won: 21, drawn: 5, lost: 3, goalsFor: 70, goalsAgainst: 22, goalDifference: 48, points: 68, form: ['W','W','W','D','W'], tier: 'champions_league' },
      { position: 2, team: t('mci'), played: 29, won: 20, drawn: 5, lost: 4, goalsFor: 65, goalsAgainst: 28, goalDifference: 37, points: 65, form: ['W','D','W','W','W'], tier: 'champions_league' },
      { position: 3, team: t('liv'), played: 29, won: 19, drawn: 6, lost: 4, goalsFor: 63, goalsAgainst: 30, goalDifference: 33, points: 63, form: ['W','W','D','W','D'], tier: 'champions_league' },
      { position: 4, team: t('new'), played: 29, won: 16, drawn: 7, lost: 6, goalsFor: 52, goalsAgainst: 33, goalDifference: 19, points: 55, form: ['W','D','W','L','W'], tier: 'champions_league' },
      { position: 5, team: t('tot'), played: 29, won: 14, drawn: 5, lost: 10, goalsFor: 55, goalsAgainst: 47, goalDifference: 8, points: 47, form: ['L','W','W','D','L'], tier: 'europa_league' },
      { position: 6, team: t('che'), played: 29, won: 13, drawn: 7, lost: 9, goalsFor: 48, goalsAgainst: 38, goalDifference: 10, points: 46, form: ['W','D','W','W','L'] },
    ],
  },
  // 3. La Liga (Spain)
  {
    leagueId: 'laliga',
    season: '2024/25',
    standings: [
      { position: 1, team: t('fcb'), played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 68, goalsAgainst: 28, goalDifference: 40, points: 65, form: ['W','W','D','W','W'], tier: 'champions_league' },
      { position: 2, team: t('rma'), played: 28, won: 19, drawn: 4, lost: 5, goalsFor: 62, goalsAgainst: 32, goalDifference: 30, points: 61, form: ['L','W','W','D','W'], tier: 'champions_league' },
      { position: 3, team: t('atm'), played: 28, won: 17, drawn: 6, lost: 5, goalsFor: 50, goalsAgainst: 26, goalDifference: 24, points: 57, form: ['W','D','W','W','D'], tier: 'champions_league' },
      { position: 4, team: t('ath'), played: 28, won: 16, drawn: 5, lost: 7, goalsFor: 48, goalsAgainst: 35, goalDifference: 13, points: 53, form: ['W','W','L','D','W'], tier: 'champions_league' },
      { position: 5, team: t('rso'), played: 28, won: 13, drawn: 7, lost: 8, goalsFor: 42, goalsAgainst: 38, goalDifference: 4, points: 46, form: ['D','L','W','W','D'], tier: 'europa_league' },
      { position: 6, team: t('sev'), played: 28, won: 12, drawn: 6, lost: 10, goalsFor: 38, goalsAgainst: 35, goalDifference: 3, points: 42, form: ['W','L','D','W','W'] },
    ],
  },
  // 4. Serie A (Italy)
  {
    leagueId: 'seriea',
    season: '2024/25',
    standings: [
      { position: 1, team: t('int'), played: 28, won: 21, drawn: 4, lost: 3, goalsFor: 64, goalsAgainst: 20, goalDifference: 44, points: 67, form: ['W','W','W','D','W'], tier: 'champions_league' },
      { position: 2, team: t('nap'), played: 28, won: 18, drawn: 6, lost: 4, goalsFor: 54, goalsAgainst: 24, goalDifference: 30, points: 60, form: ['W','D','W','W','D'], tier: 'champions_league' },
      { position: 3, team: t('juv'), played: 28, won: 16, drawn: 8, lost: 4, goalsFor: 48, goalsAgainst: 22, goalDifference: 26, points: 56, form: ['D','W','W','D','W'], tier: 'champions_league' },
      { position: 4, team: t('ata'), played: 28, won: 16, drawn: 6, lost: 6, goalsFor: 58, goalsAgainst: 30, goalDifference: 28, points: 54, form: ['W','W','L','W','W'], tier: 'champions_league' },
      { position: 5, team: t('acm'), played: 28, won: 15, drawn: 6, lost: 7, goalsFor: 50, goalsAgainst: 34, goalDifference: 16, points: 51, form: ['L','W','D','W','W'], tier: 'europa_league' },
      { position: 6, team: t('sev'), played: 28, won: 13, drawn: 7, lost: 8, goalsFor: 42, goalsAgainst: 33, goalDifference: 9, points: 46, form: ['W','D','L','W','D'] },
    ],
  },
  // 5. Ligue 1 (France)
  {
    leagueId: 'ligue1',
    season: '2024/25',
    standings: [
      { position: 1, team: t('psg'), played: 27, won: 20, drawn: 5, lost: 2, goalsFor: 68, goalsAgainst: 23, goalDifference: 45, points: 65, form: ['W','W','W','D','W'], tier: 'champions_league' },
      { position: 2, team: t('asm'), played: 27, won: 17, drawn: 5, lost: 5, goalsFor: 52, goalsAgainst: 28, goalDifference: 24, points: 56, form: ['W','W','D','W','L'], tier: 'champions_league' },
      { position: 3, team: t('om'), played: 27, won: 16, drawn: 5, lost: 6, goalsFor: 50, goalsAgainst: 29, goalDifference: 21, points: 53, form: ['W','D','W','W','W'], tier: 'champions_league' },
      { position: 4, team: t('los'), played: 27, won: 14, drawn: 8, lost: 5, goalsFor: 44, goalsAgainst: 26, goalDifference: 18, points: 50, form: ['D','W','W','L','W'], tier: 'champions_league' },
      { position: 5, team: t('ol'), played: 27, won: 13, drawn: 6, lost: 8, goalsFor: 46, goalsAgainst: 35, goalDifference: 11, points: 45, form: ['W','L','W','D','W'], tier: 'europa_league' },
      { position: 6, team: t('ogc') || t('los'), played: 27, won: 12, drawn: 7, lost: 8, goalsFor: 38, goalsAgainst: 30, goalDifference: 8, points: 43, form: ['L','W','D','W','D'] },
    ],
  },
]

export const getStandingsByLeagueId = (leagueId: string) => mockStandings.find(s => s.leagueId === leagueId)
