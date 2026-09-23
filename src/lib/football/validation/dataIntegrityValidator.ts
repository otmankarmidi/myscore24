/**
 * Football Data Integrity Validator & Audit Engine
 * ──────────────────────────────────────────────────
 * Reusable validation layer that audits stored football data in MySQL
 * and in-memory data structures for MyScore24.
 *
 * Rules:
 * - Flags questionable records for review (never auto-deletes).
 * - Zero external API calls during validation/auditing.
 */

import { prisma } from '@/lib/prisma'

export interface ValidationIssue {
  entityType: 'MATCH' | 'TEAM' | 'COMPETITION' | 'SEASON' | 'PLAYER' | 'STANDING'
  entityId: string | number
  severity: 'ERROR' | 'WARNING'
  code: string
  message: string
  details?: Record<string, any>
}

export interface DataAuditResult {
  timestamp: string
  scanned: {
    matches: number
    teams: number
    competitions: number
    seasons: number
    countries: number
  }
  summary: {
    totalIssues: number
    errors: number
    warnings: number
    invalidMatches: number
    duplicates: number
    brokenRelations: number
    seasonErrors: number
    suspiciousScores: number
  }
  issues: ValidationIssue[]
}

const VALID_MATCH_STATUSES = new Set([
  'scheduled',
  'live',
  'half_time',
  'full_time',
  'extra_time',
  'penalties',
  'postponed',
  'cancelled',
  'suspended',
  // API-Football short codes
  'TBD', 'NS', '1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO', 'LIVE'
])

const FINAL_STATUSES = new Set(['full_time', 'penalties', 'FT', 'AET', 'PEN', 'AWD', 'WO'])

/**
 * Validates a single Match entity against integrity rules.
 */
export function validateMatchRecord(match: any): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const matchId = match.providerFixtureId || match.id

  // 1. providerFixtureId exists and is valid (> 0)
  if (
    match.providerFixtureId == null ||
    typeof match.providerFixtureId !== 'number' ||
    isNaN(match.providerFixtureId) ||
    match.providerFixtureId <= 0
  ) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'INVALID_FIXTURE_ID',
      message: `Match has invalid or missing providerFixtureId: ${match.providerFixtureId}`,
      details: { providerFixtureId: match.providerFixtureId, internalId: match.id },
    })
  }

  // 2. homeTeam exists
  if (!match.homeTeamId || (!match.homeTeam && match.homeTeam !== undefined)) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'MISSING_HOME_TEAM',
      message: `Match is missing homeTeam relation or homeTeamId`,
      details: { homeTeamId: match.homeTeamId },
    })
  }

  // 3. awayTeam exists
  if (!match.awayTeamId || (!match.awayTeam && match.awayTeam !== undefined)) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'MISSING_AWAY_TEAM',
      message: `Match is missing awayTeam relation or awayTeamId`,
      details: { awayTeamId: match.awayTeamId },
    })
  }

  // 4. homeTeam != awayTeam
  if (match.homeTeamId && match.awayTeamId && match.homeTeamId === match.awayTeamId) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'SAME_HOME_AND_AWAY_TEAM',
      message: `Match has identical home and away team IDs: ${match.homeTeamId}`,
      details: { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId },
    })
  }

  // 5. competition exists
  if (!match.competitionId || (!match.competition && match.competition !== undefined)) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'MISSING_COMPETITION',
      message: `Match is missing competition relation or competitionId`,
      details: { competitionId: match.competitionId },
    })
  }

  // 6. season exists
  if (!match.seasonId || (!match.season && match.season !== undefined)) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'MISSING_SEASON',
      message: `Match is missing season relation or seasonId`,
      details: { seasonId: match.seasonId },
    })
  }

  // 7. kickoff date is valid
  if (!match.kickoff || isNaN(new Date(match.kickoff).getTime())) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'ERROR',
      code: 'INVALID_KICKOFF_DATE',
      message: `Match kickoff timestamp is invalid: ${match.kickoff}`,
      details: { kickoff: match.kickoff },
    })
  }

  // 8. match status is valid
  const normalizedStatus = (match.status || '').trim()
  if (!normalizedStatus || !VALID_MATCH_STATUSES.has(normalizedStatus)) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'WARNING',
      code: 'INVALID_STATUS',
      message: `Match status '${match.status}' is not in recognized status dictionary`,
      details: { status: match.status },
    })
  }

  // 9. scores are valid numbers or null
  const checkScore = (val: any, label: string) => {
    if (val != null) {
      if (typeof val !== 'number' || isNaN(val) || val < 0 || !Number.isInteger(val)) {
        issues.push({
          entityType: 'MATCH',
          entityId: matchId,
          severity: 'ERROR',
          code: 'INVALID_SCORE_VALUE',
          message: `Match ${label} score is invalid: ${val}`,
          details: { [label]: val },
        })
      } else if (val > 30) {
        issues.push({
          entityType: 'MATCH',
          entityId: matchId,
          severity: 'WARNING',
          code: 'SUSPICIOUS_SCORE',
          message: `Match ${label} score is suspiciously high: ${val}`,
          details: { [label]: val },
        })
      }
    }
  }

  checkScore(match.homeScore, 'homeScore')
  checkScore(match.awayScore, 'awayScore')
  checkScore(match.halftimeHome, 'halftimeHome')
  checkScore(match.halftimeAway, 'halftimeAway')

  // 10. final matches have appropriate final status
  if (match.isFinal === true && !FINAL_STATUSES.has(normalizedStatus)) {
    issues.push({
      entityType: 'MATCH',
      entityId: matchId,
      severity: 'WARNING',
      code: 'FINAL_FLAG_STATUS_MISMATCH',
      message: `Match is marked isFinal=true but has non-final status '${match.status}'`,
      details: { isFinal: match.isFinal, status: match.status },
    })
  }

  // 11. competition/season relationship is valid
  if (match.season && match.competitionId && match.season.competitionId) {
    if (match.season.competitionId !== match.competitionId) {
      issues.push({
        entityType: 'MATCH',
        entityId: matchId,
        severity: 'ERROR',
        code: 'SEASON_COMPETITION_MISMATCH',
        message: `Match season (${match.season.id}) belongs to competition ${match.season.competitionId}, but match has competition ${match.competitionId}`,
        details: { matchCompetitionId: match.competitionId, seasonCompetitionId: match.season.competitionId },
      })
    }
  }

  return issues
}

/**
 * Validates a single Team entity.
 */
export function validateTeamRecord(team: any): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const teamId = team.providerId || team.id

  if (team.providerId == null || typeof team.providerId !== 'number' || team.providerId <= 0) {
    issues.push({
      entityType: 'TEAM',
      entityId: teamId,
      severity: 'ERROR',
      code: 'MISSING_PROVIDER_ID',
      message: `Team has missing or invalid providerId: ${team.providerId}`,
      details: { providerId: team.providerId, name: team.name },
    })
  }

  if (!team.name || !team.name.trim()) {
    issues.push({
      entityType: 'TEAM',
      entityId: teamId,
      severity: 'ERROR',
      code: 'MISSING_NAME',
      message: `Team providerId=${team.providerId} has an empty name`,
    })
  }

  if (team.logo && !team.logo.startsWith('http://') && !team.logo.startsWith('https://')) {
    issues.push({
      entityType: 'TEAM',
      entityId: teamId,
      severity: 'WARNING',
      code: 'BROKEN_LOGO_URL',
      message: `Team providerId=${team.providerId} has malformed logo URL: ${team.logo}`,
      details: { logo: team.logo },
    })
  }

  return issues
}

/**
 * Validates a single Competition entity.
 */
export function validateCompetitionRecord(comp: any): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const compId = comp.providerId || comp.id

  if (comp.providerId == null || typeof comp.providerId !== 'number' || comp.providerId <= 0) {
    issues.push({
      entityType: 'COMPETITION',
      entityId: compId,
      severity: 'ERROR',
      code: 'MISSING_PROVIDER_ID',
      message: `Competition has missing or invalid providerId: ${comp.providerId}`,
      details: { providerId: comp.providerId, name: comp.name },
    })
  }

  if (!comp.name || !comp.name.trim()) {
    issues.push({
      entityType: 'COMPETITION',
      entityId: compId,
      severity: 'ERROR',
      code: 'MISSING_NAME',
      message: `Competition providerId=${comp.providerId} has an empty name`,
    })
  }

  return issues
}

/**
 * Validates in-memory standings rows for consistency.
 */
export function validateStandingsData(rows: any[], competitionId?: string | number): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const seenTeams = new Set<string>()

  rows.forEach((row, idx) => {
    const teamId = String(row.teamId || row.team?.id || '')
    if (teamId) {
      if (seenTeams.has(teamId)) {
        issues.push({
          entityType: 'STANDING',
          entityId: teamId,
          severity: 'ERROR',
          code: 'DUPLICATE_STANDING_TEAM',
          message: `Team ID ${teamId} appears multiple times in standings table`,
          details: { teamId, row: idx + 1 },
        })
      }
      seenTeams.add(teamId)
    }

    if (row.position != null && (row.position < 1 || !Number.isInteger(row.position))) {
      issues.push({
        entityType: 'STANDING',
        entityId: teamId || idx,
        severity: 'ERROR',
        code: 'IMPOSSIBLE_POSITION',
        message: `Standings row has impossible rank/position: ${row.position}`,
        details: { position: row.position },
      })
    }
  })

  return issues
}

/**
 * Performs a comprehensive database-level data audit across all stored football tables.
 * Guaranteed 0 external API calls.
 */
export async function scanStoredFootballData(): Promise<DataAuditResult> {
  const issues: ValidationIssue[] = []

  // 1. Fetch counts
  const [matchesCount, teamsCount, competitionsCount, seasonsCount, countriesCount] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.competition.count(),
    prisma.season.count(),
    prisma.country.count(),
  ])

  // 2. Fetch and audit Competitions
  const competitions = await prisma.competition.findMany({
    include: { seasons: true, country: true },
  })
  const compIdMap = new Set<string>()
  const compProviderIdSet = new Set<number>()

  for (const comp of competitions) {
    compIdMap.add(comp.id)
    if (compProviderIdSet.has(comp.providerId)) {
      issues.push({
        entityType: 'COMPETITION',
        entityId: comp.providerId,
        severity: 'ERROR',
        code: 'DUPLICATE_PROVIDER_ID',
        message: `Duplicate competition providerId detected: ${comp.providerId}`,
      })
    }
    compProviderIdSet.add(comp.providerId)
    issues.push(...validateCompetitionRecord(comp))
  }

  // 3. Fetch and audit Teams
  const teams = await prisma.team.findMany()
  const teamIdMap = new Set<string>()
  const teamProviderIdSet = new Set<number>()

  for (const team of teams) {
    teamIdMap.add(team.id)
    if (teamProviderIdSet.has(team.providerId)) {
      issues.push({
        entityType: 'TEAM',
        entityId: team.providerId,
        severity: 'ERROR',
        code: 'DUPLICATE_PROVIDER_ID',
        message: `Duplicate team providerId detected: ${team.providerId}`,
      })
    }
    teamProviderIdSet.add(team.providerId)
    issues.push(...validateTeamRecord(team))
  }

  // 4. Fetch and audit Seasons
  const seasons = await prisma.season.findMany()
  const seasonIdMap = new Set<string>()

  for (const season of seasons) {
    seasonIdMap.add(season.id)
    if (season.year < 1900 || season.year > 2100) {
      issues.push({
        entityType: 'SEASON',
        entityId: season.id,
        severity: 'ERROR',
        code: 'INVALID_SEASON_YEAR',
        message: `Season year is out of valid range: ${season.year}`,
        details: { year: season.year, seasonId: season.id },
      })
    }
    if (!compIdMap.has(season.competitionId)) {
      issues.push({
        entityType: 'SEASON',
        entityId: season.id,
        severity: 'ERROR',
        code: 'BROKEN_COMPETITION_RELATION',
        message: `Season references non-existent competitionId: ${season.competitionId}`,
        details: { competitionId: season.competitionId },
      })
    }
  }

  // 5. Fetch and audit Matches
  const matches = await prisma.match.findMany({
    include: {
      season: true,
      competition: true,
      homeTeam: true,
      awayTeam: true,
    },
  })

  const fixtureIdSet = new Set<number>()
  for (const match of matches) {
    if (fixtureIdSet.has(match.providerFixtureId)) {
      issues.push({
        entityType: 'MATCH',
        entityId: match.providerFixtureId,
        severity: 'ERROR',
        code: 'DUPLICATE_FIXTURE_ID',
        message: `Duplicate providerFixtureId found in database: ${match.providerFixtureId}`,
        details: { providerFixtureId: match.providerFixtureId, internalId: match.id },
      })
    }
    fixtureIdSet.add(match.providerFixtureId)

    // Run record validation
    const matchIssues = validateMatchRecord(match)
    issues.push(...matchIssues)
  }

  // 6. Aggregate summaries
  const errors = issues.filter((i) => i.severity === 'ERROR').length
  const warnings = issues.filter((i) => i.severity === 'WARNING').length
  const invalidMatches = issues.filter((i) => i.entityType === 'MATCH' && i.severity === 'ERROR').length
  const duplicates = issues.filter((i) => i.code.includes('DUPLICATE')).length
  const brokenRelations = issues.filter(
    (i) => i.code.includes('MISSING_') || i.code.includes('BROKEN_') || i.code.includes('MISMATCH')
  ).length
  const seasonErrors = issues.filter((i) => i.entityType === 'SEASON' || i.code.includes('SEASON')).length
  const suspiciousScores = issues.filter((i) => i.code === 'SUSPICIOUS_SCORE').length

  return {
    timestamp: new Date().toISOString(),
    scanned: {
      matches: matchesCount,
      teams: teamsCount,
      competitions: competitionsCount,
      seasons: seasonsCount,
      countries: countriesCount,
    },
    summary: {
      totalIssues: issues.length,
      errors,
      warnings,
      invalidMatches,
      duplicates,
      brokenRelations,
      seasonErrors,
      suspiciousScores,
    },
    issues,
  }
}
