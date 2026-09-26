import { prisma } from '@/lib/prisma'
import { Match, MatchStatus } from '@/types/match'

function mapDbStatusToMatchStatus(status: string): MatchStatus {
  switch (status.toUpperCase()) {
    case '1H':
    case '2H':
    case 'LIVE':
    case 'BT':
      return 'live'
    case 'HT':
      return 'half_time'
    case 'FT':
    case 'AET':
      return 'full_time'
    case 'ET':
      return 'extra_time'
    case 'P':
    case 'PEN':
      return 'penalties'
    case 'PST':
    case 'POST':
      return 'postponed'
    case 'CANC':
    case 'ABD':
    case 'AWD':
    case 'WO':
      return 'cancelled'
    case 'SUSP':
    case 'INT':
      return 'suspended'
    case 'NS':
    case 'TBD':
    default:
      return 'scheduled'
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Transforms a Prisma Match record (with competition, season, homeTeam, awayTeam)
 * into the MyScore24 application Match type.
 */
export function formatDbMatchToAppMatch(m: any): Match {
  const homeName = m.homeTeam?.name || 'Home Team'
  const awayName = m.awayTeam?.name || 'Away Team'
  const leagueName = m.competition?.name || 'Competition'
  const matchSlug = `${slugify(homeName)}-vs-${slugify(awayName)}`
  const kickoffDate = new Date(m.kickoff)

  return {
    id: String(m.providerFixtureId),
    slug: matchSlug,
    league: {
      id: String(m.competition?.providerId || m.competitionId),
      slug: slugify(leagueName),
      name: leagueName,
      shortName: leagueName.slice(0, 4).toUpperCase(),
      logo: m.competition?.logo || undefined,
      country: m.competition?.country?.name || 'Global',
      countryCode: (m.competition?.country?.code || 'WW').toUpperCase(),
      countryFlag: m.competition?.country?.flag || undefined,
      season: String(m.season?.year || kickoffDate.getFullYear()),
      currentRound: m.round || undefined,
      type: 'league',
    },
    homeTeam: {
      id: String(m.homeTeam?.providerId || m.homeTeamId),
      slug: slugify(homeName),
      name: homeName,
      shortName: homeName.slice(0, 10),
      abbreviation: (m.homeTeam?.code || homeName.slice(0, 3)).toUpperCase(),
      logo: m.homeTeam?.logo || undefined,
      country: m.homeTeam?.country || 'Global',
    },
    awayTeam: {
      id: String(m.awayTeam?.providerId || m.awayTeamId),
      slug: slugify(awayName),
      name: awayName,
      shortName: awayName.slice(0, 10),
      abbreviation: (m.awayTeam?.code || awayName.slice(0, 3)).toUpperCase(),
      logo: m.awayTeam?.logo || undefined,
      country: m.awayTeam?.country || 'Global',
    },
    score: {
      home: m.homeScore,
      away: m.awayScore,
      halftime: {
        home: m.halftimeHome,
        away: m.halftimeAway,
      },
      extratime: {
        home: m.extraTimeHome,
        away: m.extraTimeAway,
      },
      penalty: {
        home: m.penaltyHome,
        away: m.penaltyAway,
      },
    },
    status: mapDbStatusToMatchStatus(m.status),
    minute: m.elapsed || undefined,
    kickoff: kickoffDate.toISOString(),
    venue: m.venueName ? `${m.venueName}${m.venueCity ? ', ' + m.venueCity : ''}` : undefined,
    referee: m.referee || undefined,
    round: m.round || undefined,
    isFinal: Boolean(m.isFinal),
  }
}

/**
 * Retrieves matches stored in MySQL for a specific calendar date (UTC day boundaries).
 */
export async function getStoredMatchesByDate(dateStr: string): Promise<Match[]> {
  try {
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`)

    const records = await prisma.match.findMany({
      where: {
        kickoff: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        competition: {
          include: { country: true },
        },
        season: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        kickoff: 'asc',
      },
    })

    return records.map(formatDbMatchToAppMatch)
  } catch (err) {
    console.error(`[Football Persistence] Error retrieving matches for ${dateStr}:`, err)
    return []
  }
}

/**
 * Checks whether historical matches for a past date already exist and are final in MySQL.
 */
export async function hasFinalMatchesForDate(dateStr: string): Promise<boolean> {
  try {
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`)

    const count = await prisma.match.count({
      where: {
        kickoff: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isFinal: true,
      },
    })
    return count > 0
  } catch {
    return false
  }
}

/**
 * Retrieves stored matches by competition providerId.
 */
export async function getStoredMatchesByCompetition(competitionProviderId: number, seasonYear?: number): Promise<Match[]> {
  try {
    const records = await prisma.match.findMany({
      where: {
        competition: {
          providerId: competitionProviderId,
        },
        ...(seasonYear ? { season: { year: seasonYear } } : {}),
      },
      include: {
        competition: {
          include: { country: true },
        },
        season: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        kickoff: 'asc',
      },
    })
    return records.map(formatDbMatchToAppMatch)
  } catch {
    return []
  }
}

/**
 * Retrieves a single stored match by providerFixtureId.
 */
export async function getStoredMatchByFixtureId(providerFixtureId: number): Promise<Match | null> {
  try {
    const record = await prisma.match.findUnique({
      where: { providerFixtureId },
      include: {
        competition: {
          include: { country: true },
        },
        season: true,
        homeTeam: true,
        awayTeam: true,
      },
    })
    if (!record) return null
    return formatDbMatchToAppMatch(record)
  } catch (err) {
    console.error(`[Football Persistence] Error querying match by fixtureId ${providerFixtureId}:`, err)
    return null
  }
}

/**
 * Retrieves a stored match by slug or non-numeric identifier (supporting team names or mock matches).
 */
export async function getStoredMatchBySlug(slug: string): Promise<Match | null> {
  if (!slug) return null
  const clean = slug.replace(/^match-/, '').trim()

  // 1. Direct number or trailing number in slug
  const directNum = Number(clean)
  if (!isNaN(directNum) && directNum > 0) {
    return getStoredMatchByFixtureId(directNum)
  }
  const parts = clean.split('-')
  const lastNum = Number(parts[parts.length - 1])
  if (!isNaN(lastNum) && lastNum > 0) {
    return getStoredMatchByFixtureId(lastNum)
  }

  // 2. Check team names if slug contains '-vs-'
  if (clean.includes('-vs-')) {
    try {
      const [homeToken, awayToken] = clean.split('-vs-')
      const homeQuery = homeToken.replace(/-/g, ' ').trim()
      const awayQuery = awayToken.replace(/-/g, ' ').trim()

      if (homeQuery && awayQuery) {
        const records = await prisma.match.findMany({
          where: {
            AND: [
              { homeTeam: { name: { contains: homeQuery } } },
              { awayTeam: { name: { contains: awayQuery } } },
            ],
          },
          include: {
            competition: {
              include: { country: true },
            },
            season: true,
            homeTeam: true,
            awayTeam: true,
          },
          orderBy: { kickoff: 'desc' },
          take: 1,
        })

        if (records.length > 0) {
          return formatDbMatchToAppMatch(records[0])
        }
      }
    } catch (dbErr) {
      console.warn(`[Football Persistence] Error searching match by slug "${slug}":`, dbErr)
    }
  }

  // 3. Fallback to mock matches (e.g. fc-barcelona-vs-real-madrid, laliga-fcb-rma-001)
  try {
    const { mockMatches } = await import('@/data/mockMatches')
    const foundMock = mockMatches.find((m) => m.slug === clean || m.id === clean || m.slug === slug || m.id === slug)
    if (foundMock) return foundMock
  } catch {}

  return null
}

/**
 * Gets the verified current season year for a competition from MySQL.
 */
export async function getCurrentSeasonForCompetition(competitionProviderId: number): Promise<number | null> {
  try {
    const season = await prisma.season.findFirst({
      where: {
        competition: { providerId: competitionProviderId },
        current: true,
      },
      select: { year: true },
    })
    return season?.year || null
  } catch {
    return null
  }
}

/**
 * Gets all available seasons for a competition from MySQL.
 */
export async function getAvailableSeasonsForCompetition(
  competitionProviderId: number
): Promise<Array<{ year: number; current: boolean; label: string }>> {
  try {
    const seasons = await prisma.season.findMany({
      where: {
        competition: { providerId: competitionProviderId },
      },
      orderBy: { year: 'desc' },
      select: { year: true, current: true },
    })

    return seasons.map((s: { year: number; current: boolean }) => ({
      year: s.year,
      current: s.current,
      label: `${s.year}/${s.year + 1}`,
    }))
  } catch {
    return []
  }
}

/**
 * Retrieves stored matches for a specific team by team providerId.
 */
export async function getStoredMatchesByTeam(teamProviderId: number, seasonYear?: number): Promise<Match[]> {
  try {
    const records = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { providerId: teamProviderId } },
          { awayTeam: { providerId: teamProviderId } },
        ],
        ...(seasonYear ? { season: { year: seasonYear } } : {}),
      },
      include: {
        competition: {
          include: { country: true },
        },
        season: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        kickoff: 'asc',
      },
    })
    return records.map(formatDbMatchToAppMatch)
  } catch {
    return []
  }
}

/**
 * Retrieves distinct teams that have matches in a competition season.
 */
export async function getStoredTeamsByCompetition(competitionProviderId: number, seasonYear?: number): Promise<any[]> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        competition: { providerId: competitionProviderId },
        ...(seasonYear ? { season: { year: seasonYear } } : {}),
      },
      select: {
        homeTeam: true,
        awayTeam: true,
      },
    })

    const teamMap = new Map<number, any>()
    for (const m of matches) {
      if (m.homeTeam?.providerId && !teamMap.has(m.homeTeam.providerId)) {
        teamMap.set(m.homeTeam.providerId, m.homeTeam)
      }
      if (m.awayTeam?.providerId && !teamMap.has(m.awayTeam.providerId)) {
        teamMap.set(m.awayTeam.providerId, m.awayTeam)
      }
    }
    return Array.from(teamMap.values())
  } catch {
    return []
  }
}
