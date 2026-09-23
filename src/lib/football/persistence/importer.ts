import { prisma } from '@/lib/prisma'
import { apiFootballProvider } from '@/services/sports/apiFootballProvider'
import { apiTelemetry } from '@/services/sports/apiTelemetry'
import { upsertFixture } from './fixtures'

export interface HistoricalImportOptions {
  leagueProviderId: number
  seasonYear: number
  jobId?: string
  minQuotaThreshold?: number // Minimum remaining quota before pausing (default 15 requests)
}

export interface HistoricalImportResult {
  jobId: string
  competitionProviderId: number
  season: number
  status: 'COMPLETED' | 'PAUSED' | 'FAILED'
  fixturesReceived: number
  fixturesCreated: number
  fixturesUpdated: number
  fixturesSkipped: number
  requestsUsed: number
  remainingQuota: number | null
  message: string
  error?: string
}

/**
 * Checks existing coverage in MySQL for a competition season.
 */
export async function checkSeasonCoverage(competitionProviderId: number, seasonYear: number) {
  const matchCount = await prisma.match.count({
    where: {
      competition: { providerId: competitionProviderId },
      season: { year: seasonYear },
    },
  })

  const completedCount = await prisma.match.count({
    where: {
      competition: { providerId: competitionProviderId },
      season: { year: seasonYear },
      isFinal: true,
    },
  })

  return {
    competitionProviderId,
    seasonYear,
    totalStoredMatches: matchCount,
    finalMatches: completedCount,
    isComplete: matchCount > 0 && matchCount === completedCount,
  }
}

/**
 * Executes a quota-safe, idempotent historical import for a competition season.
 */
export async function syncCompetitionSeason(
  options: HistoricalImportOptions
): Promise<HistoricalImportResult> {
  const { leagueProviderId, seasonYear, minQuotaThreshold = 15 } = options

  // 1. Quota Safety Gate: Check provider telemetry before issuing external calls
  if (apiTelemetry.isInCooldown() || apiTelemetry.isQuotaProtectionMode()) {
    return {
      jobId: options.jobId || 'none',
      competitionProviderId: leagueProviderId,
      season: seasonYear,
      status: 'PAUSED',
      fixturesReceived: 0,
      fixturesCreated: 0,
      fixturesUpdated: 0,
      fixturesSkipped: 0,
      requestsUsed: 0,
      remainingQuota: null,
      message: 'Import PAUSED: API is in cooldown or quota protection threshold reached.',
    }
  }

  // 2. Locate or create persistent ImportJob tracker
  let job = options.jobId
    ? await prisma.importJob.findUnique({ where: { id: options.jobId } })
    : await prisma.importJob.findFirst({
        where: {
          competitionProviderId: leagueProviderId,
          season: seasonYear,
          status: { in: ['PENDING', 'RUNNING', 'PAUSED'] },
        },
        orderBy: { createdAt: 'desc' },
      })

  if (!job) {
    job = await prisma.importJob.create({
      data: {
        competitionProviderId: leagueProviderId,
        season: seasonYear,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    })
  } else {
    job = await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: 'RUNNING',
        startedAt: job.startedAt || new Date(),
      },
    })
  }

  // 3. Database-first completeness check
  const coverage = await checkSeasonCoverage(leagueProviderId, seasonYear)
  if (coverage.isComplete && coverage.totalStoredMatches >= 380) {
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        fixturesProcessed: coverage.totalStoredMatches,
        lastError: null,
      },
    })

    return {
      jobId: job.id,
      competitionProviderId: leagueProviderId,
      season: seasonYear,
      status: 'COMPLETED',
      fixturesReceived: coverage.totalStoredMatches,
      fixturesCreated: 0,
      fixturesUpdated: 0,
      fixturesSkipped: coverage.totalStoredMatches,
      requestsUsed: 0,
      remainingQuota: null,
      message: `Season already fully persisted in MySQL (${coverage.totalStoredMatches} matches). No API requests consumed.`,
    }
  }

  // 4. Efficient Single-Call Provider Request
  try {
    const rawFixtures = await apiFootballProvider.getLeagueFixtures(leagueProviderId, seasonYear)
    const requestsUsed = 1

    if (!rawFixtures || rawFixtures.length === 0) {
      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          requestsUsed: job.requestsUsed + requestsUsed,
          lastError: 'No fixtures returned by API-Football for this season (or season inaccessible).',
        },
      })

      return {
        jobId: job.id,
        competitionProviderId: leagueProviderId,
        season: seasonYear,
        status: 'FAILED',
        fixturesReceived: 0,
        fixturesCreated: 0,
        fixturesUpdated: 0,
        fixturesSkipped: 0,
        requestsUsed,
        remainingQuota: null,
        message: 'No fixtures returned by API-Football for this competition and season.',
        error: 'No fixtures returned by API-Football for this season (or season inaccessible).',
      }
    }

    // 5. Idempotent Upsert & Counter Tracking
    let created = 0
    let updated = 0
    let skipped = 0

    for (const f of rawFixtures) {
      if (!f?.fixture?.id) {
        skipped++
        continue
      }

      const existing = await prisma.match.findUnique({
        where: { providerFixtureId: Number(f.fixture.id) },
        select: { id: true, isFinal: true },
      })

      const upserted = await upsertFixture(f)
      if (upserted) {
        if (existing) {
          updated++
        } else {
          created++
        }
      } else {
        skipped++
      }
    }

    const completedJob = await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        fixturesProcessed: rawFixtures.length,
        fixturesCreated: job.fixturesCreated + created,
        fixturesUpdated: job.fixturesUpdated + updated,
        fixturesSkipped: job.fixturesSkipped + skipped,
        requestsUsed: job.requestsUsed + requestsUsed,
        lastError: null,
      },
    })

    return {
      jobId: completedJob.id,
      competitionProviderId: leagueProviderId,
      season: seasonYear,
      status: 'COMPLETED',
      fixturesReceived: rawFixtures.length,
      fixturesCreated: created,
      fixturesUpdated: updated,
      fixturesSkipped: skipped,
      requestsUsed,
      remainingQuota: null,
      message: `Successfully synchronized season ${seasonYear}. Processed ${rawFixtures.length} matches (${created} created, ${updated} updated).`,
    }
  } catch (err: any) {
    const is429 = err?.status === 429 || err?.message?.includes('429')
    const status = is429 ? 'PAUSED' : 'FAILED'

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status,
        lastError: err?.message || 'Unknown import error',
      },
    })

    return {
      jobId: job.id,
      competitionProviderId: leagueProviderId,
      season: seasonYear,
      status,
      fixturesReceived: 0,
      fixturesCreated: 0,
      fixturesUpdated: 0,
      fixturesSkipped: 0,
      requestsUsed: 1,
      remainingQuota: 0,
      message: is429 ? 'Import PAUSED: Rate limit (HTTP 429) encountered.' : 'Import failed.',
      error: err?.message,
    }
  }
}
