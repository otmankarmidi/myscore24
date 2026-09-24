import { prisma } from '@/lib/prisma'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { apiTelemetry } from '@/services/sports/apiTelemetry'
import { cacheEngine, formatCacheKey, CACHE_TTLS } from '@/services/sports/cacheEngine'
import {
  upsertCompetition,
  upsertSeason,
  persistFixturesBatch,
} from './fixtures'
import {
  getCurrentSeasonForCompetition,
  getStoredMatchesByCompetition,
  getStoredTeamsByCompetition,
} from './queries'

export interface CompetitionSyncResult {
  competitionName: string
  competitionId: number
  currentSeason: number | null
  fixturesStored: number
  teamsStored: number
  standingsStored: number
  scorersStored: number
  apiRequestsUsed: number
  cacheDbHits: number
  coverageLimitations: string[]
  status: 'SUCCESS' | 'PAUSED' | 'FAILED' | 'CURRENT_SEASON_UNRESOLVED'
  message: string
  lastUpdated: string
}

/**
 * Controlled current-season sync for a single competition:
 * 1. Checks MySQL first
 * 2. Resolves authoritative current season from API-Football (/leagues) where current === true
 * 3. Never hardcodes season year
 * 4. Checks coverage before requesting fixtures, standings, scorers
 * 5. Respects API quota and pauses if quota protection triggers
 * 6. Avoids duplicate requests and updates existing DB records
 */
export async function resolveAndSyncCurrentSeason(
  leagueProviderId: number,
  options: { forceRefresh?: boolean } = {}
): Promise<CompetitionSyncResult> {
  const lastUpdated = new Date().toISOString()
  const coverageLimitations: string[] = []
  let apiRequestsUsed = 0
  let cacheDbHits = 0

  // 1. Quota Gate: Stop/pause automatically if quota protection activates
  if (apiTelemetry.isInCooldown() || apiTelemetry.isQuotaProtectionMode()) {
    return {
      competitionName: `League ${leagueProviderId}`,
      competitionId: leagueProviderId,
      currentSeason: null,
      fixturesStored: 0,
      teamsStored: 0,
      standingsStored: 0,
      scorersStored: 0,
      apiRequestsUsed: 0,
      cacheDbHits: 0,
      coverageLimitations: ['API in cooldown or quota protection threshold reached'],
      status: 'PAUSED',
      message: 'Sync PAUSED: API quota protection is active.',
      lastUpdated,
    }
  }

  // 2. Check MySQL First for Existing Current Season
  const existingDbSeason = await getCurrentSeasonForCompetition(leagueProviderId)
  if (existingDbSeason) {
    cacheDbHits++
  }

  // 3. Resolve Authoritative League Metadata and Current Season from API-Football
  let leagueDetails = await apiFootballProvider.getLeagueDetails(leagueProviderId)
  let resolvedSeason: number | null = null
  let seasonCoverage: any = null
  let competitionName = `League ${leagueProviderId}`

  if (leagueDetails) {
    competitionName = leagueDetails.league?.name || competitionName
    const seasons: any[] = leagueDetails.seasons || []

    // Authoritative check: Find season where current === true
    const apiCurrentSeason = seasons.find((s) => s.current === true)

    if (apiCurrentSeason) {
      resolvedSeason = Number(apiCurrentSeason.year)
      seasonCoverage = apiCurrentSeason.coverage || {}

      // Persist Competition & Seasons in MySQL
      const comp = await upsertCompetition(leagueDetails.league)
      if (comp) {
        // Upsert the authoritative current season
        await upsertSeason(
          comp.id,
          resolvedSeason,
          true,
          apiCurrentSeason.start ? new Date(apiCurrentSeason.start) : null,
          apiCurrentSeason.end ? new Date(apiCurrentSeason.end) : null
        )

        // Persist all historical and other seasons with current = false for selector dropdown
        for (const s of seasons) {
          if (s.year !== resolvedSeason) {
            await upsertSeason(
              comp.id,
              s.year,
              false,
              s.start ? new Date(s.start) : null,
              s.end ? new Date(s.end) : null
            )
          }
        }
      }
    } else {
      // Rule 3: If no season has current === true, do NOT automatically mark latest season as current.
      // Keep last verified MySQL current season and report CURRENT_SEASON_UNRESOLVED.
      coverageLimitations.push('CURRENT_SEASON_UNRESOLVED: No season marked current=true by API-Football')
      if (existingDbSeason) {
        resolvedSeason = existingDbSeason
      } else {
        return {
          competitionName,
          competitionId: leagueProviderId,
          currentSeason: null,
          fixturesStored: 0,
          teamsStored: 0,
          standingsStored: 0,
          scorersStored: 0,
          apiRequestsUsed,
          cacheDbHits,
          coverageLimitations,
          status: 'CURRENT_SEASON_UNRESOLVED',
          message: 'Could not resolve current season: No season marked current=true in API-Football and none in MySQL.',
          lastUpdated,
        }
      }
    }
  } else if (existingDbSeason) {
    resolvedSeason = existingDbSeason
    coverageLimitations.push('API-Football league query unavailable; using MySQL current season')
  } else {
    return {
      competitionName,
      competitionId: leagueProviderId,
      currentSeason: null,
      fixturesStored: 0,
      teamsStored: 0,
      standingsStored: 0,
      scorersStored: 0,
      apiRequestsUsed,
      cacheDbHits,
      coverageLimitations: ['Failed to fetch league metadata from API-Football'],
      status: 'FAILED',
      message: 'Failed to retrieve league metadata from API-Football or MySQL.',
      lastUpdated,
    }
  }

  // 4. Coverage-Gated Fixtures Sync
  let fixturesStored = 0
  const existingMatches = await getStoredMatchesByCompetition(leagueProviderId, resolvedSeason)
  const hasExistingMatches = existingMatches.length > 0

  if (hasExistingMatches && !options.forceRefresh) {
    fixturesStored = existingMatches.length
    cacheDbHits++
  } else {
    // Check coverage before requesting fixtures
    const fixturesSupported = seasonCoverage ? Boolean(seasonCoverage.fixtures) : true

    if (fixturesSupported) {
      if (apiTelemetry.isInCooldown() || apiTelemetry.isQuotaProtectionMode()) {
        coverageLimitations.push('Quota protection prevented fixtures fetch')
      } else {
        try {
          const rawFixtures = await apiFootballProvider.getLeagueFixtures(leagueProviderId, resolvedSeason)
          apiRequestsUsed++
          if (rawFixtures && rawFixtures.length > 0) {
            const saved = await persistFixturesBatch(rawFixtures)
            fixturesStored = saved.length
          } else {
            coverageLimitations.push(`API-Football returned 0 fixtures for season ${resolvedSeason}`)
          }
        } catch (err: any) {
          coverageLimitations.push(`Fixtures fetch error: ${err.message}`)
        }
      }
    } else {
      coverageLimitations.push('Fixtures endpoint not supported in season coverage')
    }
  }

  // 5. Coverage-Gated Standings Sync
  let standingsStored = 0
  const standingsKey = formatCacheKey('standings', `${leagueProviderId}_${resolvedSeason}`)
  const cachedStandings = cacheEngine.getEntry(standingsKey)

  if (cachedStandings?.data && !options.forceRefresh) {
    standingsStored = Array.isArray(cachedStandings.data) ? cachedStandings.data.length : 1
    cacheDbHits++
  } else {
    const standingsSupported = seasonCoverage ? Boolean(seasonCoverage.standings) : true

    if (standingsSupported) {
      if (apiTelemetry.isInCooldown() || apiTelemetry.isQuotaProtectionMode()) {
        coverageLimitations.push('Quota protection prevented standings fetch')
      } else {
        try {
          const rawStandings = await apiFootballProvider.getLeagueStandings(leagueProviderId, resolvedSeason)
          apiRequestsUsed++
          if (rawStandings && rawStandings.length > 0) {
            standingsStored = rawStandings.length
          } else {
            coverageLimitations.push(`API-Football returned 0 standings rows for season ${resolvedSeason}`)
          }
        } catch (err: any) {
          coverageLimitations.push(`Standings fetch error: ${err.message}`)
        }
      }
    } else {
      coverageLimitations.push('Standings endpoint not supported in season coverage')
    }
  }

  // 6. Coverage-Gated Top Scorers Sync
  let scorersStored = 0
  const scorersKey = formatCacheKey('topscorers', `${leagueProviderId}_${resolvedSeason}`)
  const cachedScorers = cacheEngine.getEntry(scorersKey)

  if (cachedScorers?.data && !options.forceRefresh) {
    scorersStored = Array.isArray(cachedScorers.data) ? cachedScorers.data.length : 0
    cacheDbHits++
  } else {
    const scorersSupported = seasonCoverage ? Boolean(seasonCoverage.top_scorers) : true

    if (scorersSupported) {
      if (apiTelemetry.isInCooldown() || apiTelemetry.isQuotaProtectionMode()) {
        coverageLimitations.push('Quota protection prevented top scorers fetch')
      } else {
        try {
          const rawScorers = await apiFootballProvider.getLeagueTopScorers(leagueProviderId, resolvedSeason)
          apiRequestsUsed++
          if (rawScorers && rawScorers.length > 0) {
            scorersStored = rawScorers.length
          }
        } catch (err: any) {
          coverageLimitations.push(`Top scorers fetch error: ${err.message}`)
        }
      }
    } else {
      coverageLimitations.push('Top scorers endpoint not supported in season coverage')
    }
  }

  // 7. Teams Stored Count in MySQL for this competition & season
  const storedTeams = await getStoredTeamsByCompetition(leagueProviderId, resolvedSeason)
  const teamsStored = storedTeams.length

  return {
    competitionName,
    competitionId: leagueProviderId,
    currentSeason: resolvedSeason,
    fixturesStored,
    teamsStored,
    standingsStored,
    scorersStored,
    apiRequestsUsed,
    cacheDbHits,
    coverageLimitations,
    status: 'SUCCESS',
    message: `Successfully synchronized ${competitionName} season ${resolvedSeason}.`,
    lastUpdated,
  }
}
