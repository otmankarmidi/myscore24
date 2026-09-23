import { prisma } from '@/lib/prisma'
import { ApiFootballFixtureRaw } from '@/services/sports/apiFootballProvider'

// Terminal match statuses that denote a permanently finished fixture
export const TERMINAL_STATUSES = ['FT', 'AET', 'PEN']

/**
 * Checks whether a match status string represents a permanently final match.
 */
export function isTerminalStatus(shortStatus?: string | null): boolean {
  if (!shortStatus) return false
  return TERMINAL_STATUSES.includes(shortStatus.toUpperCase())
}

/**
 * Upsert Country record based on country metadata.
 */
export async function upsertCountry(countryName?: string, countryCode?: string, countryFlag?: string) {
  if (!countryName) return null
  const cleanName = countryName.trim()
  const existing = await prisma.country.findFirst({
    where: { name: cleanName },
  })
  if (existing) {
    if ((countryFlag && !existing.flag) || (countryCode && !existing.code)) {
      return prisma.country.update({
        where: { id: existing.id },
        data: {
          flag: countryFlag || existing.flag,
          code: countryCode || existing.code,
        },
      })
    }
    return existing
  }
  return prisma.country.create({
    data: {
      name: cleanName,
      code: countryCode || null,
      flag: countryFlag || null,
    },
  })
}

/**
 * Upsert Competition record based on API-Football league object.
 */
export async function upsertCompetition(leagueRaw: ApiFootballFixtureRaw['league']) {
  if (!leagueRaw?.id) return null
  const providerId = Number(leagueRaw.id)

  let countryId: string | null = null
  if (leagueRaw.country) {
    const country = await upsertCountry(leagueRaw.country, undefined, leagueRaw.flag)
    if (country) countryId = country.id
  }

  return prisma.competition.upsert({
    where: { providerId },
    update: {
      name: leagueRaw.name || 'Unknown League',
      type: 'league',
      logo: leagueRaw.logo || null,
      countryId: countryId ?? undefined,
    },
    create: {
      providerId,
      name: leagueRaw.name || 'Unknown League',
      type: 'league',
      logo: leagueRaw.logo || null,
      countryId: countryId || null,
    },
  })
}

/**
 * Upsert Season record based on competition ID and year.
 */
export async function upsertSeason(competitionDbId: string, seasonYear?: number | string) {
  const year = Number(seasonYear) || new Date().getFullYear()

  return prisma.season.upsert({
    where: {
      competitionId_year: {
        competitionId: competitionDbId,
        year,
      },
    },
    update: {
      current: true,
    },
    create: {
      competitionId: competitionDbId,
      year,
      current: true,
    },
  })
}

/**
 * Upsert Team record based on API-Football home/away team object.
 */
export async function upsertTeam(teamRaw: { id: number; name: string; logo?: string }, venueRaw?: ApiFootballFixtureRaw['fixture']['venue']) {
  if (!teamRaw?.id) return null
  const providerId = Number(teamRaw.id)

  return prisma.team.upsert({
    where: { providerId },
    update: {
      name: teamRaw.name,
      logo: teamRaw.logo || null,
      venueId: venueRaw?.id ? Number(venueRaw.id) : undefined,
      venueName: venueRaw?.name || undefined,
      venueCity: venueRaw?.city || undefined,
      lastSyncedAt: new Date(),
    },
    create: {
      providerId,
      name: teamRaw.name,
      logo: teamRaw.logo || null,
      venueId: venueRaw?.id ? Number(venueRaw.id) : null,
      venueName: venueRaw?.name || null,
      venueCity: venueRaw?.city || null,
      lastSyncedAt: new Date(),
    },
  })
}

/**
 * Upsert a single Fixture into MySQL database.
 * Completely idempotent: updates if exists (providerFixtureId unique), inserts otherwise.
 */
export async function upsertFixture(raw: ApiFootballFixtureRaw) {
  if (!raw?.fixture?.id || !raw?.teams?.home?.id || !raw?.teams?.away?.id || !raw?.league?.id) {
    return null
  }

  const providerFixtureId = Number(raw.fixture.id)

  // 1. Ensure Competition & Season exist
  const competition = await upsertCompetition(raw.league)
  if (!competition) return null

  const season = await upsertSeason(competition.id, raw.league.season)
  if (!season) return null

  // 2. Ensure Teams exist
  const homeTeam = await upsertTeam(raw.teams.home, raw.fixture.venue)
  const awayTeam = await upsertTeam(raw.teams.away)
  if (!homeTeam || !awayTeam) return null

  // 3. Extract match details
  const kickoffDate = raw.fixture.date ? new Date(raw.fixture.date) : new Date(raw.fixture.timestamp * 1000)
  const shortStatus = (raw.fixture.status?.short || 'NS').toUpperCase()
  const isFinal = isTerminalStatus(shortStatus)

  return prisma.match.upsert({
    where: { providerFixtureId },
    update: {
      competitionId: competition.id,
      seasonId: season.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      kickoff: kickoffDate,
      timezone: raw.fixture.timezone || null,
      round: raw.league.round || null,
      status: shortStatus,
      statusLong: raw.fixture.status?.long || null,
      elapsed: raw.fixture.status?.elapsed ?? null,
      homeScore: raw.goals?.home ?? null,
      awayScore: raw.goals?.away ?? null,
      halftimeHome: raw.score?.halftime?.home ?? null,
      halftimeAway: raw.score?.halftime?.away ?? null,
      fulltimeHome: raw.score?.fulltime?.home ?? null,
      fulltimeAway: raw.score?.fulltime?.away ?? null,
      extraTimeHome: raw.score?.extratime?.home ?? null,
      extraTimeAway: raw.score?.extratime?.away ?? null,
      penaltyHome: raw.score?.penalty?.home ?? null,
      penaltyAway: raw.score?.penalty?.away ?? null,
      venueId: raw.fixture.venue?.id ? Number(raw.fixture.venue.id) : null,
      venueName: raw.fixture.venue?.name || null,
      venueCity: raw.fixture.venue?.city || null,
      referee: raw.fixture.referee || null,
      isFinal,
      lastSyncedAt: new Date(),
    },
    create: {
      providerFixtureId,
      competitionId: competition.id,
      seasonId: season.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      kickoff: kickoffDate,
      timezone: raw.fixture.timezone || null,
      round: raw.league.round || null,
      status: shortStatus,
      statusLong: raw.fixture.status?.long || null,
      elapsed: raw.fixture.status?.elapsed ?? null,
      homeScore: raw.goals?.home ?? null,
      awayScore: raw.goals?.away ?? null,
      halftimeHome: raw.score?.halftime?.home ?? null,
      halftimeAway: raw.score?.halftime?.away ?? null,
      fulltimeHome: raw.score?.fulltime?.home ?? null,
      fulltimeAway: raw.score?.fulltime?.away ?? null,
      extraTimeHome: raw.score?.extratime?.home ?? null,
      extraTimeAway: raw.score?.extratime?.away ?? null,
      penaltyHome: raw.score?.penalty?.home ?? null,
      penaltyAway: raw.score?.penalty?.away ?? null,
      venueId: raw.fixture.venue?.id ? Number(raw.fixture.venue.id) : null,
      venueName: raw.fixture.venue?.name || null,
      venueCity: raw.fixture.venue?.city || null,
      referee: raw.fixture.referee || null,
      isFinal,
      lastSyncedAt: new Date(),
    },
  })
}

/**
 * Batch upserts a list of fixtures safely in sequence or chunked promises.
 */
export async function persistFixturesBatch(fixtures: ApiFootballFixtureRaw[]) {
  if (!fixtures || fixtures.length === 0) return []
  const results = []
  for (const f of fixtures) {
    try {
      const match = await upsertFixture(f)
      if (match) results.push(match)
    } catch (err) {
      console.error(`[Football Persistence] Error upserting fixture ${f?.fixture?.id}:`, err)
    }
  }
  return results
}
