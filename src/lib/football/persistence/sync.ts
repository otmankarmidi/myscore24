import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { persistFixturesBatch } from './fixtures'

/**
 * Idempotently synchronizes a competition season by fetching its fixtures
 * and upserting the competition, season, teams, and matches into MySQL.
 */
export async function syncCompetitionSeason(leagueProviderId: number, seasonYear: number) {
  try {
    const rawFixtures = await apiFootballProvider.getLeagueFixtures(leagueProviderId, seasonYear)
    if (!rawFixtures || rawFixtures.length === 0) {
      return { success: true, count: 0, message: 'No fixtures found for competition season' }
    }

    const saved = await persistFixturesBatch(rawFixtures)
    return {
      success: true,
      count: saved.length,
      leagueProviderId,
      seasonYear,
      message: `Successfully synchronized ${saved.length} fixtures for competition ${leagueProviderId}`,
    }
  } catch (err: any) {
    console.error(`[Football Persistence] Error syncing season ${seasonYear} for league ${leagueProviderId}:`, err)
    return {
      success: false,
      count: 0,
      error: err?.message || 'Failed to sync competition season',
    }
  }
}
