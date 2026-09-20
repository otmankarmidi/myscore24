import { LeagueStandings } from '@/types/standing'
import { mockTeams } from './mockTeams'

const t = (id: string) => mockTeams.find(tm => tm.id === id)!

export const mockStandings: LeagueStandings[] = [
  {
    leagueId: 'laliga',
    season: '2024/25',
    standings: [
      { position: 1, team: t('fcb'), played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 68, goalsAgainst: 28, goalDifference: 40, points: 65, form: ['W','W','D','W','W'], tier: 'champions_league' },
      { position: 2, team: t('rma'), played: 28, won: 19, drawn: 4, lost: 5, goalsFor: 62, goalsAgainst: 32, goalDifference: 30, points: 61, form: ['L','W','W','D','W'], tier: 'champions_league' },
      { position: 3, team: t('atm'), played: 28, won: 17, drawn: 6, lost: 5, goalsFor: 50, goalsAgainst: 26, goalDifference: 24, points: 57, form: ['W','D','W','W','D'], tier: 'champions_league' },
      { position: 4, team: t('ath'), played: 28, won: 16, drawn: 5, lost: 7, goalsFor: 48, goalsAgainst: 35, goalDifference: 13, points: 53, form: ['W','W','L','D','W'], tier: 'champions_league' },
      { position: 5, team: t('rso'), played: 28, won: 13, drawn: 7, lost: 8, goalsFor: 42, goalsAgainst: 38, goalDifference: 4, points: 46, form: ['D','L','W','W','D'], tier: 'europa_league' },
      { position: 6, team: t('sev'), played: 28, won: 5, drawn: 6, lost: 17, goalsFor: 24, goalsAgainst: 55, goalDifference: -31, points: 21, form: ['L','L','D','L','L'], tier: 'relegation' },
    ],
  },
  {
    leagueId: 'epl',
    season: '2024/25',
    standings: [
      { position: 1, team: t('ars'), played: 29, won: 21, drawn: 5, lost: 3, goalsFor: 70, goalsAgainst: 22, goalDifference: 48, points: 68, form: ['W','W','W','D','W'], tier: 'champions_league' },
      { position: 2, team: t('mci'), played: 29, won: 20, drawn: 5, lost: 4, goalsFor: 65, goalsAgainst: 28, goalDifference: 37, points: 65, form: ['W','D','W','W','W'], tier: 'champions_league' },
      { position: 3, team: t('liv'), played: 29, won: 19, drawn: 6, lost: 4, goalsFor: 63, goalsAgainst: 30, goalDifference: 33, points: 63, form: ['W','W','D','W','D'], tier: 'champions_league' },
      { position: 4, team: t('new'), played: 29, won: 16, drawn: 7, lost: 6, goalsFor: 52, goalsAgainst: 33, goalDifference: 19, points: 55, form: ['W','D','W','L','W'], tier: 'champions_league' },
      { position: 5, team: t('tot'), played: 29, won: 14, drawn: 5, lost: 10, goalsFor: 55, goalsAgainst: 47, goalDifference: 8, points: 47, form: ['L','W','W','D','L'], tier: 'europa_league' },
      { position: 18, team: t('che'), played: 29, won: 8, drawn: 7, lost: 14, goalsFor: 38, goalsAgainst: 60, goalDifference: -22, points: 31, form: ['L','D','L','W','L'], tier: 'relegation' },
    ],
  },
]

export const getStandingsByLeagueId = (leagueId: string) => mockStandings.find(s => s.leagueId === leagueId)
