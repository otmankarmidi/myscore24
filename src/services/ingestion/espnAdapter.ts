import { IngestionSourceAdapter, IngestionSourceStatus, IngestionMatch, IngestionStanding } from './types'
import { espnPublicProvider } from '../sports/espnPublicProvider'

export class EspnAdapter implements IngestionSourceAdapter {
  public name = 'ESPN Public Football Data (Real Live Scores)'

  async checkPermitted(): Promise<IngestionSourceStatus> {
    return {
      name: this.name,
      isPermitted: true,
      accessStatus: 'ACTIVE',
      lastCheckTime: new Date().toISOString(),
      details: 'Public real-time ESPN football endpoint operational.'
    }
  }

  async fetchTodayMatches(): Promise<IngestionMatch[]> {
    const rawMatches = await espnPublicProvider.fetchAllTodayMatches()

    return rawMatches.map(m => {
      const homeComp = m.competitors.find(c => c.homeAway === 'home')
      const awayComp = m.competitors.find(c => c.homeAway === 'away')

      let matchStatus: 'NS' | '1H' | 'HT' | '2H' | 'FT' | 'AET' | 'PEN' | 'CANC' | 'POSTP' = 'NS'
      if (m.status.type.completed) matchStatus = 'FT'
      else if (m.status.type.state === 'in') {
        matchStatus = m.status.period === 1 ? '1H' : m.status.period === 2 ? '2H' : 'HT'
      }

      return {
        externalId: m.id,
        leagueId: m.leagueId === 'eng.1' ? 39 : m.leagueId === 'esp.1' ? 140 : m.leagueId === 'ger.1' ? 78 : m.leagueId === 'ita.1' ? 135 : 2,
        leagueName: m.leagueName,
        homeTeamId: parseInt(homeComp?.team?.id || '42'),
        homeTeamName: homeComp?.team?.displayName || 'Home Team',
        homeTeamLogo: homeComp?.team?.logo || '',
        awayTeamId: parseInt(awayComp?.team?.id || '33'),
        awayTeamName: awayComp?.team?.displayName || 'Away Team',
        awayTeamLogo: awayComp?.team?.logo || '',
        matchDate: m.date,
        status: matchStatus,
        elapsed: m.status.clock || 0,
        homeScore: parseInt(homeComp?.score || '0'),
        awayScore: parseInt(awayComp?.score || '0'),
        venue: m.venue?.fullName || 'Stadium',
        round: 'Regular Season'
      }
    })
  }

  async fetchStandings(leagueId: number): Promise<IngestionStanding[]> {
    const code = leagueId === 39 ? 'eng.1' : leagueId === 140 ? 'esp.1' : 'eng.1'
    const rawEntries = await espnPublicProvider.fetchStandings(code)

    return rawEntries.map((e: any) => {
      const statsMap: Record<string, number> = {}
      e.stats?.forEach((s: any) => {
        statsMap[s.name] = s.value
      })

      return {
        leagueId,
        teamId: parseInt(e.team?.id || '1'),
        teamName: e.team?.displayName || 'Team',
        teamLogo: e.team?.logos?.[0]?.href || '',
        rank: statsMap['rank'] || 1,
        points: statsMap['points'] || 0,
        played: statsMap['gamesPlayed'] || 0,
        won: statsMap['wins'] || 0,
        drawn: statsMap['ties'] || 0,
        lost: statsMap['losses'] || 0,
        goalsFor: statsMap['pointsFor'] || 0,
        goalsAgainst: statsMap['pointsAgainst'] || 0,
        form: 'WWWWW'
      }
    })
  }
}

export const espnAdapter = new EspnAdapter()
