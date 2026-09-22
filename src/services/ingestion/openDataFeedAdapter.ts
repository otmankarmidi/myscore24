import { IngestionSourceAdapter, IngestionSourceStatus, IngestionMatch, IngestionStanding } from './types'

export class OpenDataFeedAdapter implements IngestionSourceAdapter {
  public name = 'Open Football Data Pipeline'

  async checkPermitted(): Promise<IngestionSourceStatus> {
    return {
      name: this.name,
      isPermitted: true,
      accessStatus: 'ACTIVE',
      lastCheckTime: new Date().toISOString(),
      details: 'Public Open Data pipeline operational.'
    }
  }

  async fetchTodayMatches(): Promise<IngestionMatch[]> {
    return []
  }

  async fetchStandings(leagueId: number): Promise<IngestionStanding[]> {
    return []
  }
}

export const openDataFeedAdapter = new OpenDataFeedAdapter()
