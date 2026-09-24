import { prisma } from '@/lib/prisma'
import { apiFootballProvider } from './apiFootballProvider'
import { Player, PlayerCompetitionItem, PlayerStats } from '@/types/player'
import { cacheEngine, CACHE_TTLS } from './cacheEngine'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// List of major domestic league names / keywords to detect primary league
const DOMESTIC_LEAGUE_KEYWORDS = [
  'la liga',
  'premier league',
  'serie a',
  'bundesliga',
  'ligue 1',
  'major league soccer',
  'mls',
  'primeira liga',
  'eredivisie',
  'pro league',
  'super lig',
  'botola',
  'saudi pro league',
]

export function isCalendarYearCompetition(country?: string | null, leagueName?: string | null): boolean {
  if (!country && !leagueName) return false
  const c = (country || '').toLowerCase()
  const l = (leagueName || '').toLowerCase()
  if (c === 'usa' || l.includes('mls') || l.includes('major league soccer')) return true
  if (c === 'brazil' || c === 'argentina' || c === 'japan' || c === 'norway' || c === 'sweden') return true
  return false
}

export function formatSeasonDisplay(season: number, isCalendarYear: boolean): string {
  if (isCalendarYear) {
    return String(season)
  }
  const nextYearShort = String((season + 1) % 100).padStart(2, '0')
  return `${season}/${nextYearShort}`
}

/**
 * Resolves current club and current national team deterministically:
 * Priority:
 * 1. API-Football /players/squads?player={playerId}
 * 2. Pick current club (national === false or not national team)
 * 3. Pick current national team (national === true)
 */
export async function resolvePlayerCurrentSquads(
  providerPlayerId: number
): Promise<{
  club: { providerId: number; name: string; logo?: string; position?: string; number?: number; photo?: string } | null
  national: { providerId: number; name: string; logo?: string; position?: string; number?: number; photo?: string } | null
}> {
  try {
    const squads = await apiFootballProvider.getPlayerSquads(providerPlayerId)
    if (!Array.isArray(squads) || squads.length === 0) {
      return { club: null, national: null }
    }

    let clubTeam: any = null
    let nationalTeam: any = null

    for (const sq of squads) {
      const teamObj = sq?.team
      const playerObj = sq?.players?.[0]
      if (!teamObj?.id) continue

      // Look up team in DB to check national flag if available
      const dbTeam = await prisma.team.findUnique({
        where: { providerId: Number(teamObj.id) },
        select: { national: true },
      })

      const isNational = dbTeam?.national ?? (
        teamObj.name?.toLowerCase().includes('national') ||
        ['spain', 'france', 'england', 'germany', 'argentina', 'brazil', 'portugal', 'poland', 'norway', 'morocco', 'netherlands', 'italy'].includes((teamObj.name || '').toLowerCase())
      )

      if (isNational) {
        if (!nationalTeam) {
          nationalTeam = {
            providerId: Number(teamObj.id),
            name: teamObj.name,
            logo: teamObj.logo,
            position: playerObj?.position,
            number: playerObj?.number,
            photo: playerObj?.photo,
          }
        }
      } else {
        // First valid club found is the primary current club
        if (!clubTeam) {
          clubTeam = {
            providerId: Number(teamObj.id),
            name: teamObj.name,
            logo: teamObj.logo,
            position: playerObj?.position,
            number: playerObj?.number,
            photo: playerObj?.photo,
          }
        }
      }
    }

    return { club: clubTeam, national: nationalTeam }
  } catch (err) {
    console.error(`[playerService] Error resolving squads for player ${providerPlayerId}:`, err)
    return { club: null, national: null }
  }
}

/**
 * Finds or links Team records in the database.
 */
async function ensureDbTeam(providerTeamId: number, teamName: string, teamLogo?: string | null): Promise<string | null> {
  try {
    const existing = await prisma.team.findUnique({
      where: { providerId: providerTeamId },
      select: { id: true },
    })
    if (existing) return existing.id

    const created = await prisma.team.create({
      data: {
        providerId: providerTeamId,
        name: teamName,
        logo: teamLogo || null,
      },
    })
    return created.id
  } catch {
    return null
  }
}

/**
 * Database-first player retriever with SWR caching and API-Football fallback for season 2026.
 */
export async function getOrSyncPlayerProfile(
  providerPlayerId: number,
  playerSlugOrName?: string
): Promise<Player | null> {
  const cacheKey = `player_profile_2026_${providerPlayerId}`

  return cacheEngine.fetchWithCache('player_full_profile', cacheKey, CACHE_TTLS.ENTITY_INFO, async () => {
    // 1. Check MySQL for Player record
    let dbPlayer = await prisma.player.findUnique({
      where: { providerPlayerId },
      include: {
        currentClub: true,
        currentNationalTeam: true,
        seasonStatistics: {
          where: { season: 2026 },
        },
      },
    })

    const STALE_THRESHOLD_MS = 24 * 3600 * 1000 // 24 hours
    const isDbFresh =
      dbPlayer &&
      dbPlayer.lastSyncedAt &&
      Date.now() - dbPlayer.lastSyncedAt.getTime() < STALE_THRESHOLD_MS &&
      dbPlayer.currentClubProviderId !== null &&
      dbPlayer.seasonStatistics.length > 0

    if (isDbFresh && dbPlayer) {
      return transformDbPlayerToPlayer(dbPlayer)
    }

    // 2. Fetch fresh data from API-Football if API key is present
    if (!apiFootballProvider.hasValidApiKey()) {
      if (dbPlayer) return transformDbPlayerToPlayer(dbPlayer)
      return null
    }

    try {
      // Step A: Resolve current squad (club & national)
      const squadResult = await resolvePlayerCurrentSquads(providerPlayerId)
      
      // Step B: Query 2026 statistics (/players?id={id}&season=2026)
      const rawApiData = await apiFootballProvider.getPlayerDetailsAndStats(providerPlayerId, 2026)
      if (!rawApiData || !rawApiData.player) {
        if (dbPlayer) return transformDbPlayerToPlayer(dbPlayer)
        return null
      }

      const p = rawApiData.player
      const statisticsList: any[] = Array.isArray(rawApiData.statistics) ? rawApiData.statistics : []

      // Step C: Link teams
      let clubDbId: string | null = null
      if (squadResult.club) {
        clubDbId = await ensureDbTeam(squadResult.club.providerId, squadResult.club.name, squadResult.club.logo)
      } else if (dbPlayer?.currentClubId) {
        clubDbId = dbPlayer.currentClubId
      }

      let nationalDbId: string | null = null
      if (squadResult.national) {
        nationalDbId = await ensureDbTeam(squadResult.national.providerId, squadResult.national.name, squadResult.national.logo)
      }

      // Safe photo persistence: Never overwrite valid photo with null/undefined/empty
      let resolvedPhoto = dbPlayer?.photo || null
      if (p.photo && typeof p.photo === 'string' && p.photo.trim().length > 0) {
        resolvedPhoto = p.photo
      } else if (squadResult.club?.photo && typeof squadResult.club.photo === 'string' && squadResult.club.photo.trim().length > 0) {
        resolvedPhoto = squadResult.club.photo
      }

      const playerName = p.name || `${p.firstname || ''} ${p.lastname || ''}`.trim() || 'Player'
      const pos = squadResult.club?.position || statisticsList[0]?.games?.position || p.position || 'Forward'
      const num = squadResult.club?.number ?? statisticsList[0]?.games?.number ?? null

      // Step D: UPSERT Player in MySQL
      const upsertedPlayer = await prisma.player.upsert({
        where: { providerPlayerId },
        create: {
          providerPlayerId,
          name: playerName,
          firstname: p.firstname || null,
          lastname: p.lastname || null,
          photo: resolvedPhoto,
          currentClubId: clubDbId,
          currentClubProviderId: squadResult.club ? squadResult.club.providerId : dbPlayer?.currentClubProviderId || null,
          currentNationalTeamId: nationalDbId,
          currentNationalProviderId: squadResult.national ? squadResult.national.providerId : null,
          currentSquadNumber: num,
          currentPosition: pos,
          nationality: p.nationality || 'Global',
          dateOfBirth: p.birth?.date || null,
          age: p.age || null,
          height: p.height ? String(p.height) : null,
          weight: p.weight ? String(p.weight) : null,
          lastSyncedAt: new Date(),
        },
        update: {
          name: playerName,
          firstname: p.firstname || undefined,
          lastname: p.lastname || undefined,
          ...(resolvedPhoto ? { photo: resolvedPhoto } : {}),
          ...(clubDbId ? { currentClubId: clubDbId } : {}),
          ...(squadResult.club ? { currentClubProviderId: squadResult.club.providerId } : {}),
          ...(nationalDbId ? { currentNationalTeamId: nationalDbId } : {}),
          ...(squadResult.national ? { currentNationalProviderId: squadResult.national.providerId } : {}),
          ...(num !== null ? { currentSquadNumber: num } : {}),
          ...(pos ? { currentPosition: pos } : {}),
          nationality: p.nationality || undefined,
          dateOfBirth: p.birth?.date || undefined,
          age: p.age || undefined,
          height: p.height ? String(p.height) : undefined,
          weight: p.weight ? String(p.weight) : undefined,
          lastSyncedAt: new Date(),
        },
      })

      // Step E: UPSERT all PlayerSeasonStatistic records for season 2026
      for (const st of statisticsList) {
        const teamObj = st.team
        const leagueObj = st.league
        if (!teamObj?.id || !leagueObj?.id) continue

        const statTeamProviderId = Number(teamObj.id)
        const statLeagueProviderId = Number(leagueObj.id)
        const statSeason = 2026 // Strictly 2026

        // Check if calendar year
        const calendarYear = isCalendarYearCompetition(leagueObj.country, leagueObj.name)

        // Ensure team and competition DB records exist
        const statTeamDbId = await ensureDbTeam(statTeamProviderId, teamObj.name, teamObj.logo)
        
        let statCompDbId: string | null = null
        try {
          const comp = await prisma.competition.findUnique({
            where: { providerId: statLeagueProviderId },
            select: { id: true },
          })
          if (comp) statCompDbId = comp.id
        } catch {
          // ignore
        }

        const parseNum = (val: any): number | null => {
          if (val === null || val === undefined) return null
          const n = Number(val)
          return isNaN(n) ? null : n
        }

        const parseRating = (val: any): number | null => {
          if (!val) return null
          const n = parseFloat(String(val))
          return isNaN(n) ? null : Number(n.toFixed(2))
        }

        await prisma.playerSeasonStatistic.upsert({
          where: {
            providerPlayerId_providerTeamId_providerLeagueId_season: {
              providerPlayerId,
              providerTeamId: statTeamProviderId,
              providerLeagueId: statLeagueProviderId,
              season: statSeason,
            },
          },
          create: {
            playerId: upsertedPlayer.id,
            teamId: statTeamDbId,
            competitionId: statCompDbId,
            providerPlayerId,
            providerTeamId: statTeamProviderId,
            providerLeagueId: statLeagueProviderId,
            season: statSeason,
            leagueName: leagueObj.name || 'Competition',
            leagueLogo: leagueObj.logo || null,
            leagueCountry: leagueObj.country || null,
            leagueFlag: leagueObj.flag || null,
            isCalendarYear: calendarYear,
            teamName: teamObj.name || 'Team',
            teamLogo: teamObj.logo || null,
            appearances: parseNum(st.games?.appearences),
            lineups: parseNum(st.games?.lineups),
            minutes: parseNum(st.games?.minutes),
            number: parseNum(st.games?.number),
            position: st.games?.position || null,
            rating: parseRating(st.games?.rating),
            captain: Boolean(st.games?.captain),
            goals: parseNum(st.goals?.total),
            conceded: parseNum(st.goals?.conceded),
            assists: parseNum(st.goals?.assists),
            saves: parseNum(st.goals?.saves),
            shotsTotal: parseNum(st.shots?.total),
            shotsOnTarget: parseNum(st.shots?.on),
            passesTotal: parseNum(st.passes?.total),
            passesKey: parseNum(st.passes?.key),
            passesAccuracy: parseNum(st.passes?.accuracy),
            tacklesTotal: parseNum(st.tackles?.total),
            blocks: parseNum(st.tackles?.blocks),
            interceptions: parseNum(st.tackles?.interceptions),
            duelsTotal: parseNum(st.duels?.total),
            duelsWon: parseNum(st.duels?.won),
            dribblesAttempts: parseNum(st.dribbles?.attempts),
            dribblesSuccess: parseNum(st.dribbles?.success),
            foulsDrawn: parseNum(st.fouls?.drawn),
            foulsCommitted: parseNum(st.fouls?.committed),
            yellowCards: parseNum(st.cards?.yellow),
            yellowRedCards: parseNum(st.cards?.yellowred),
            redCards: parseNum(st.cards?.red),
            penaltyWon: parseNum(st.penalty?.won),
            penaltyCommited: parseNum(st.penalty?.commited),
            penaltyScored: parseNum(st.penalty?.scored),
            penaltyMissed: parseNum(st.penalty?.missed),
            penaltySaved: parseNum(st.penalty?.saved),
          },
          update: {
            leagueName: leagueObj.name || 'Competition',
            leagueLogo: leagueObj.logo || undefined,
            leagueCountry: leagueObj.country || undefined,
            leagueFlag: leagueObj.flag || undefined,
            isCalendarYear: calendarYear,
            teamName: teamObj.name || 'Team',
            teamLogo: teamObj.logo || undefined,
            appearances: parseNum(st.games?.appearences),
            lineups: parseNum(st.games?.lineups),
            minutes: parseNum(st.games?.minutes),
            number: parseNum(st.games?.number),
            position: st.games?.position || undefined,
            rating: parseRating(st.games?.rating),
            captain: Boolean(st.games?.captain),
            goals: parseNum(st.goals?.total),
            conceded: parseNum(st.goals?.conceded),
            assists: parseNum(st.goals?.assists),
            saves: parseNum(st.goals?.saves),
            shotsTotal: parseNum(st.shots?.total),
            shotsOnTarget: parseNum(st.shots?.on),
            passesTotal: parseNum(st.passes?.total),
            passesKey: parseNum(st.passes?.key),
            passesAccuracy: parseNum(st.passes?.accuracy),
            tacklesTotal: parseNum(st.tackles?.total),
            blocks: parseNum(st.tackles?.blocks),
            interceptions: parseNum(st.tackles?.interceptions),
            duelsTotal: parseNum(st.duels?.total),
            duelsWon: parseNum(st.duels?.won),
            dribblesAttempts: parseNum(st.dribbles?.attempts),
            dribblesSuccess: parseNum(st.dribbles?.success),
            foulsDrawn: parseNum(st.fouls?.drawn),
            foulsCommitted: parseNum(st.fouls?.committed),
            yellowCards: parseNum(st.cards?.yellow),
            yellowRedCards: parseNum(st.cards?.yellowred),
            redCards: parseNum(st.cards?.red),
            penaltyWon: parseNum(st.penalty?.won),
            penaltyCommited: parseNum(st.penalty?.commited),
            penaltyScored: parseNum(st.penalty?.scored),
            penaltyMissed: parseNum(st.penalty?.missed),
            penaltySaved: parseNum(st.penalty?.saved),
          },
        })
      }

      // Re-fetch fully populated DB Player
      const reloaded = await prisma.player.findUnique({
        where: { id: upsertedPlayer.id },
        include: {
          currentClub: true,
          currentNationalTeam: true,
          seasonStatistics: {
            where: { season: 2026 },
          },
        },
      })

      return reloaded ? transformDbPlayerToPlayer(reloaded) : null
    } catch (err) {
      console.error(`[playerService] Error syncing player ${providerPlayerId}:`, err)
      if (dbPlayer) return transformDbPlayerToPlayer(dbPlayer)
      return null
    }
  })
}

/**
 * Transforms MySQL Player & PlayerSeasonStatistic records into the standard Player UI model.
 * Deterministically determines default competition using current club's primary domestic league.
 */
function transformDbPlayerToPlayer(dbPlayer: any): Player {
  const currentClub = dbPlayer.currentClub
  const statsList: any[] = Array.isArray(dbPlayer.seasonStatistics) ? dbPlayer.seasonStatistics : []

  // 1. Convert DB stats into PlayerCompetitionItem array
  const competitions: PlayerCompetitionItem[] = statsList.map((s: any) => ({
    competitionId: s.id,
    leagueId: s.providerLeagueId,
    leagueName: s.leagueName,
    leagueLogo: s.leagueLogo,
    leagueCountry: s.leagueCountry,
    teamId: s.teamId,
    teamProviderId: s.providerTeamId,
    teamName: s.teamName,
    teamLogo: s.teamLogo,
    season: s.season,
    isCalendarYear: s.isCalendarYear,
    appearances: s.appearances,
    lineups: s.lineups,
    minutes: s.minutes,
    goals: s.goals,
    assists: s.assists,
    yellowCards: s.yellowCards,
    redCards: s.redCards,
    rating: s.rating,
  }))

  // 2. Determine default competition:
  // Candidates: Season 2026 stats matching current club providerId
  const currentClubProviderId = dbPlayer.currentClubProviderId
  const currentClubStats = statsList.filter(
    (s: any) => currentClubProviderId && s.providerTeamId === currentClubProviderId
  )

  let primaryStat: any = null

  // Priority 1: Match primary domestic league of the current club
  if (currentClubStats.length > 0) {
    primaryStat = currentClubStats.find((s: any) => {
      const name = (s.leagueName || '').toLowerCase()
      return DOMESTIC_LEAGUE_KEYWORDS.some((kw) => name.includes(kw))
    })

    // Priority 2: Competition with highest appearances / minutes in current club
    if (!primaryStat) {
      primaryStat = [...currentClubStats].sort((a, b) => (b.appearances || 0) - (a.appearances || 0))[0]
    }
  }

  // Priority 3: Fall back to general stats with most appearances if no club stats
  if (!primaryStat && statsList.length > 0) {
    primaryStat = [...statsList].sort((a, b) => (b.appearances || 0) - (a.appearances || 0))[0]
  }

  // Determine season label (e.g. "2026/27" or "2026")
  const isCalendar = primaryStat ? primaryStat.isCalendarYear : false
  const seasonLabel = formatSeasonDisplay(2026, isCalendar)

  const defaultStats: PlayerStats = primaryStat
    ? {
        appearances: primaryStat.appearances,
        matches: primaryStat.appearances,
        lineups: primaryStat.lineups,
        goals: primaryStat.goals,
        assists: primaryStat.assists,
        yellowCards: primaryStat.yellowCards,
        redCards: primaryStat.redCards,
        minutesPlayed: primaryStat.minutes,
        minutes: primaryStat.minutes,
        rating: primaryStat.rating,
        shotsTotal: primaryStat.shotsTotal,
        shotsOnTarget: primaryStat.shotsOnTarget,
        dribbles: primaryStat.dribblesSuccess,
        passAccuracy: primaryStat.passesAccuracy,
        saves: primaryStat.saves,
      }
    : {
        appearances: null,
        matches: null,
        goals: null,
        assists: null,
        yellowCards: null,
        redCards: null,
        minutesPlayed: null,
        rating: null,
      }

  const teamName = currentClub?.name || (primaryStat?.teamName || '')
  const teamLogo = currentClub?.logo || (primaryStat?.teamLogo || undefined)
  const teamSlug = teamName ? slugify(teamName) : undefined

  return {
    id: String(dbPlayer.providerPlayerId),
    providerPlayerId: dbPlayer.providerPlayerId,
    slug: slugify(dbPlayer.name),
    name: dbPlayer.name,
    firstName: dbPlayer.firstname || dbPlayer.name.split(' ')[0] || '',
    lastName: dbPlayer.lastname || dbPlayer.name.split(' ').slice(1).join(' ') || '',
    photo: dbPlayer.photo,
    image: dbPlayer.photo,
    imagePath: dbPlayer.photo,
    squadNumber: dbPlayer.currentSquadNumber || primaryStat?.number || undefined,
    number: dbPlayer.currentSquadNumber || primaryStat?.number || undefined,
    nationality: dbPlayer.nationality || 'Global',
    nationalityFlag: dbPlayer.nationalityFlag || undefined,
    countryFlag: primaryStat?.leagueFlag || undefined,
    dateOfBirth: dbPlayer.dateOfBirth || '',
    age: dbPlayer.age || 0,
    height: dbPlayer.height || undefined,
    weight: dbPlayer.weight || undefined,
    position: dbPlayer.currentPosition || primaryStat?.position || 'Forward',
    teamId: currentClub?.id || primaryStat?.teamId || undefined,
    teamName,
    teamSlug,
    teamLogo,
    currentClubId: dbPlayer.currentClubId,
    currentClubProviderId: dbPlayer.currentClubProviderId,
    currentNationalTeamId: dbPlayer.currentNationalTeamId,
    currentNationalProviderId: dbPlayer.currentNationalProviderId,
    preferredFoot: dbPlayer.preferredFoot,
    marketValue: dbPlayer.marketValue,
    stats: defaultStats,
    seasonStats: defaultStats,
    competitions,
    defaultCompetitionId: primaryStat?.providerLeagueId || null,
    selectedCompetitionId: primaryStat?.providerLeagueId || null,
    seasonYear: 2026,
    seasonLabel,
  }
}
