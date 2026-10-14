import { prisma } from '@/lib/prisma'

export const PL_COMPETITION_ID = 'cmuddjekz0001ua5kmnfa44u6'
export const CURRENT_FANTASY_SEASON = 2026

/**
 * Fetch all gameweeks for the current Premier League fantasy season
 */
export async function getFantasyGameweeks() {
  return prisma.fantasyGameweek.findMany({
    where: {
      competitionId: PL_COMPETITION_ID,
      seasonYear: CURRENT_FANTASY_SEASON,
    },
    orderBy: { gameweekNumber: 'asc' },
    include: {
      fixtures: {
        include: {
          match: {
            include: {
              homeTeam: { select: { id: true, name: true, code: true, logo: true } },
              awayTeam: { select: { id: true, name: true, code: true, logo: true } },
            },
          },
        },
      },
    },
  })
}

/**
 * Get active/current gameweek
 */
export async function getCurrentGameweek() {
  const current = await prisma.fantasyGameweek.findFirst({
    where: {
      competitionId: PL_COMPETITION_ID,
      seasonYear: CURRENT_FANTASY_SEASON,
      isCurrent: true,
    },
    include: {
      fixtures: {
        include: {
          match: {
            include: {
              homeTeam: { select: { id: true, name: true, code: true, logo: true } },
              awayTeam: { select: { id: true, name: true, code: true, logo: true } },
            },
          },
        },
      },
    },
  })

  if (current) return current

  // Fallback to latest upcoming or latest gameweek
  return prisma.fantasyGameweek.findFirst({
    where: {
      competitionId: PL_COMPETITION_ID,
      seasonYear: CURRENT_FANTASY_SEASON,
    },
    orderBy: { gameweekNumber: 'desc' },
  })
}

/**
 * Fetch players catalogue with optional filters
 */
export async function getFantasyPlayersCatalogue(filters?: {
  position?: string
  teamId?: string
  search?: string
  maxPrice?: number
  minPrice?: number
  sortBy?: 'price' | 'totalPoints' | 'name' | 'selectedByPercent'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}) {
  const where: any = {}

  if (filters?.position && filters.position !== 'ALL') {
    where.position = filters.position
  }

  if (filters?.teamId && filters.teamId !== 'ALL') {
    where.teamId = filters.teamId
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const q = filters.search.trim()
    where.OR = [
      { name: { contains: q } },
      { webName: { contains: q } },
      { teamShortName: { contains: q } },
    ]
  }

  if (filters?.maxPrice !== undefined) {
    where.price = { ...(where.price || {}), lte: filters.maxPrice }
  }

  if (filters?.minPrice !== undefined) {
    where.price = { ...(where.price || {}), gte: filters.minPrice }
  }

  const orderByField = filters?.sortBy || 'totalPoints'
  const orderDirection = filters?.sortOrder || 'desc'

  return prisma.fantasyPlayer.findMany({
    where,
    orderBy: { [orderByField]: orderDirection },
    take: filters?.limit || 300,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          code: true,
          logo: true,
        },
      },
    },
  })
}

/**
 * Fetch full squad details for a user
 */
export async function getUserFantasySquad(userId: string) {
  return prisma.fantasySquad.findUnique({
    where: { userId },
    include: {
      players: {
        orderBy: { positionIndex: 'asc' },
        include: {
          fantasyPlayer: {
            include: {
              team: {
                select: { id: true, name: true, code: true, logo: true },
              },
            },
          },
        },
      },
      user: {
        select: { id: true, managerName: true, teamName: true, email: true },
      },
    },
  })
}

/**
 * Fetch leaderboard for a given league code
 */
export async function getLeagueLeaderboard(leagueCode: string = 'GLOBAL', page: number = 1, perPage: number = 50) {
  const league = await prisma.fantasyLeague.findUnique({
    where: { code: leagueCode },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, managerName: true, teamName: true },
          },
          squad: {
            select: {
              id: true,
              totalPoints: true,
              overallRank: true,
              bank: true,
              squadValue: true,
              activeChip: true,
            },
          },
        },
      },
    },
  })

  if (!league) return null

  // Sort members by squad total points descending
  const sortedMembers = [...league.members].sort(
    (a, b) => (b.squad?.totalPoints || 0) - (a.squad?.totalPoints || 0)
  )

  const total = sortedMembers.length
  const startIndex = (page - 1) * perPage
  const paginated = sortedMembers.slice(startIndex, startIndex + perPage).map((m, idx) => ({
    rank: startIndex + idx + 1,
    memberId: m.id,
    userId: m.userId,
    managerName: m.user.managerName,
    teamName: m.user.teamName,
    totalPoints: m.squad?.totalPoints || 0,
    squadId: m.squadId,
    joinedAt: m.joinedAt,
  }))

  return {
    league: {
      id: league.id,
      name: league.name,
      code: league.code,
      type: league.type,
      isPublic: league.isPublic,
      totalMembers: total,
    },
    standings: paginated,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
}
