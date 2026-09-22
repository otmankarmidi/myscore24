import { IngestionSourceAdapter, IngestionResult, IngestionSourceStatus } from './types'
import { sofascoreAdapter } from './sofascoreAdapter'
import { openDataFeedAdapter } from './openDataFeedAdapter'
import { localDb, isSupabaseConfigured, supabaseClient, DbIngestionLog } from '@/lib/supabaseClient'

export class IngestionEngine {
  private adapters: IngestionSourceAdapter[] = [
    sofascoreAdapter,
    openDataFeedAdapter
  ]

  /**
   * Returns health and compliance status for all registered adapters.
   */
  async getAdapterStatuses(): Promise<IngestionSourceStatus[]> {
    const statuses: IngestionSourceStatus[] = []
    for (const adapter of this.adapters) {
      const status = await adapter.checkPermitted()
      statuses.push(status)
    }
    return statuses
  }

  /**
   * Executes the full data ingestion pipeline across active, permitted adapters.
   */
  async runPipeline(): Promise<IngestionResult[]> {
    const results: IngestionResult[] = []

    for (const adapter of this.adapters) {
      const adapterStart = Date.now()
      const status = await adapter.checkPermitted()

      if (!status.isPermitted) {
        const result: IngestionResult = {
          sourceName: adapter.name,
          status: status.accessStatus === 'BLOCKED_BY_CLOUDFLARE' ? 'BLOCKED_BY_CLOUDFLARE' : 'WARNING',
          matchesProcessed: 0,
          message: status.details,
          executionTimeMs: Date.now() - adapterStart
        }
        results.push(result)
        await this.logExecution(result)
        continue
      }

      try {
        const matches = await adapter.fetchTodayMatches()
        let processedCount = 0

        for (const m of matches) {
          await this.upsertMatchToDb(m)
          processedCount++
        }

        const result: IngestionResult = {
          sourceName: adapter.name,
          status: 'SUCCESS',
          matchesProcessed: processedCount,
          message: `Successfully synchronized ${processedCount} real live matches into database.`,
          executionTimeMs: Date.now() - adapterStart
        }
        results.push(result)
        await this.logExecution(result)

      } catch (error: any) {
        const result: IngestionResult = {
          sourceName: adapter.name,
          status: 'FAILED',
          matchesProcessed: 0,
          message: `Ingestion error: ${error?.message || 'Unknown failure'}`,
          executionTimeMs: Date.now() - adapterStart
        }
        results.push(result)
        await this.logExecution(result)
      }
    }

    return results
  }

  private async upsertMatchToDb(m: any) {
    const matchId = typeof m.externalId === 'number' ? m.externalId : parseInt(String(m.externalId).replace(/\D/g, '')) || 999

    // Ensure teams & leagues exist in DB
    if (!localDb.teams.has(m.homeTeamId)) {
      localDb.teams.set(m.homeTeamId, {
        id: m.homeTeamId,
        name: m.homeTeamName,
        short_name: m.homeTeamName,
        code: m.homeTeamName.substring(0, 3).toUpperCase(),
        logo_url: m.homeTeamLogo || 'https://media.api-sports.io/football/teams/42.png',
        venue_name: m.venue || 'Stadium'
      })
    }

    if (!localDb.teams.has(m.awayTeamId)) {
      localDb.teams.set(m.awayTeamId, {
        id: m.awayTeamId,
        name: m.awayTeamName,
        short_name: m.awayTeamName,
        code: m.awayTeamName.substring(0, 3).toUpperCase(),
        logo_url: m.awayTeamLogo || 'https://media.api-sports.io/football/teams/33.png',
        venue_name: m.venue || 'Stadium'
      })
    }

    if (!localDb.leagues.has(m.leagueId)) {
      localDb.leagues.set(m.leagueId, {
        id: m.leagueId,
        name: m.leagueName || 'Premier League',
        slug: `league-${m.leagueId}`,
        logo_url: 'https://media.api-sports.io/football/leagues/39.png',
        type: 'league'
      })
    }

    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('matches').upsert({
        id: matchId,
        league_id: m.leagueId,
        home_team_id: m.homeTeamId,
        away_team_id: m.awayTeamId,
        match_date: m.matchDate,
        status: m.status,
        elapsed: m.elapsed,
        home_score: m.homeScore,
        away_score: m.awayScore,
        venue: m.venue,
        round: m.round,
        updated_at: new Date().toISOString()
      })
    } else {
      localDb.matches.set(matchId, {
        id: matchId,
        league_id: m.leagueId,
        home_team_id: m.homeTeamId,
        away_team_id: m.awayTeamId,
        match_date: m.matchDate,
        status: m.status,
        elapsed: m.elapsed,
        home_score: m.homeScore,
        away_score: m.awayScore,
        venue: m.venue,
        round: m.round
      })
    }
  }

  private async logExecution(result: IngestionResult) {
    if (isSupabaseConfigured && supabaseClient) {
      await supabaseClient.from('ingestion_logs').insert({
        source: result.sourceName,
        status: result.status,
        matches_processed: result.matchesProcessed,
        message: result.message,
        execution_time_ms: result.executionTimeMs,
        created_at: new Date().toISOString()
      })
    } else {
      const logEntry: DbIngestionLog = {
        id: localDb.ingestionLogs.length + 1,
        source: result.sourceName,
        status: result.status,
        matches_processed: result.matchesProcessed,
        message: result.message,
        execution_time_ms: result.executionTimeMs,
        created_at: new Date().toISOString()
      }
      localDb.ingestionLogs.unshift(logEntry)
    }
  }

  async getLogs(): Promise<DbIngestionLog[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data } = await supabaseClient
        .from('ingestion_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      return data || []
    }
    return localDb.ingestionLogs
  }
}

export const ingestionEngine = new IngestionEngine()
