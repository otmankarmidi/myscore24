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

export const KNOWN_NATIONAL_TEAMS = new Set([
  'spain', 'espagne', 'españa',
  'argentina', 'argentine',
  'france',
  'england', 'angleterre',
  'germany', 'allemagne',
  'brazil', 'brésil', 'brasil',
  'portugal',
  'poland', 'pologne',
  'norway', 'norvège',
  'morocco', 'maroc',
  'netherlands', 'pays-bas', 'holland',
  'italy', 'italie',
  'belgium', 'belgique',
  'croatia', 'croatie',
  'uruguay',
  'colombia', 'colombie',
  'senegal', 'sénégal',
  'ivory coast', "côte d'ivoire",
  'ghana',
  'nigeria',
  'egypt', 'égypte',
  'algeria', 'algérie',
  'tunisia', 'tunisie',
  'cameroon', 'cameroun',
  'japan', 'japon',
  'south korea', 'corée du sud',
  'saudi arabia', 'arabie saoudite',
  'australia', 'australie',
  'switzerland', 'suisse',
  'austria', 'autriche',
  'denmark', 'danemark',
  'sweden', 'suède',
  'serbia', 'serbie',
  'turkey', 'turquie',
  'scotland', 'écosse',
  'wales', 'pays de galles',
  'ukraine',
  'czech republic', 'tchéquie',
  'hungary', 'hongrie',
  'romania', 'roumanie',
  'slovenia', 'slovénie',
  'slovakia', 'slovaquie',
  'greece', 'grèce',
  'chile', 'chili',
  'peru', 'pérou',
  'mexico', 'mexique',
  'usa', 'united states', 'états-unis',
  'canada',
  'ecuador', 'équateur',
  'venezuela',
  'paraguay',
  'bolivia', 'bolivie',
  'mali',
  'dr congo',
  'south africa', 'afrique du sud',
  'qatar',
  'iraq',
  'iran',
  'united arab emirates', 'uae',
  'uzbekistan',
  'jordan', 'jordanie',
  'new zealand', 'nouvelle-zélande',
])

export function isNationalTeam(teamName?: string | null, dbIsNational?: boolean): boolean {
  if (dbIsNational === true) return true
  if (!teamName) return false
  const lower = teamName.toLowerCase().trim()
  if (KNOWN_NATIONAL_TEAMS.has(lower)) return true
  if (lower.includes('national') || lower.includes('selected') || lower.includes('national team')) return true
  if (/\b(u17|u18|u19|u20|u21|u23|olympic)\b/.test(lower)) return true
  return false
}

export function isExhibitionTeam(teamName?: string | null): boolean {
  if (!teamName) return false
  const lower = teamName.toLowerCase().trim()
  return lower.includes('all-star') || lower.includes('all stars') || lower.includes(' xi') || lower.includes('exhibition')
}

export function getCountryFlagEmoji(country?: string | null): string {
  if (!country) return ''
  const map: Record<string, string> = {
    spain: '🇪🇸',
    argentina: '🇦🇷',
    france: '🇫🇷',
    england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    brazil: '🇧🇷',
    germany: '🇩🇪',
    portugal: '🇵🇹',
    norway: '🇳🇴',
    morocco: '🇲🇦',
    netherlands: '🇳🇱',
    italy: '🇮🇹',
    belgium: '🇧🇪',
    egypt: '🇪🇬',
    poland: '🇵🇱',
    uruguay: '🇺🇾',
    croatia: '🇭🇷',
    senegal: '🇸🇳',
    usa: '🇺🇸',
    colombia: '🇨🇴',
    japan: '🇯🇵',
    algeria: '🇩🇿',
    tunisia: '🇹🇳',
    'saudi arabia': '🇸🇦',
    turkey: '🇹🇷',
  }
  return map[country.toLowerCase().trim()] || ''
}

export function isCalendarYearCompetition(country?: string | null, leagueName?: string | null): boolean {
  if (!country && !leagueName) return false
  const c = (country || '').toLowerCase()
  const l = (leagueName || '').toLowerCase()
  if (c === 'usa' || l.includes('mls') || l.includes('major league soccer')) return true
  if (c === 'brazil' || c === 'argentina' || c === 'japan' || c === 'norway' || c === 'sweden') return true
  return false
}

export function formatSeasonDisplay(season: number, isCalendarYear: boolean): string {
  const normSeason = season || 2026
  if (isCalendarYear) {
    return String(normSeason)
  }
  const nextYear = normSeason + 1
  return `${normSeason}/${nextYear}`
}

/**
 * Resolves current club and current national team deterministically:
 * Priority:
 * 1. API-Football /players/squads?player={playerId}
 * 2. Pick current club (isNational === false and isExhibition === false)
 * 3. Pick current national team (isNational === true)
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

      const teamName = teamObj.name || ''

      // Look up team in DB to check national flag if available
      const dbTeam = await prisma.team.findUnique({
        where: { providerId: Number(teamObj.id) },
        select: { national: true },
      })

      const national = isNationalTeam(teamName, dbTeam?.national)
      const exhibition = isExhibitionTeam(teamName)

      if (national) {
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
      } else if (!exhibition) {
        // First valid real club found is the primary current club
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
async function ensureDbTeam(
  providerTeamId: number,
  teamName: string,
  teamLogo?: string | null,
  isNational = false
): Promise<string | null> {
  try {
    const existing = await prisma.team.findUnique({
      where: { providerId: providerTeamId },
      select: { id: true, national: true },
    })
    if (existing) {
      if (isNational && !existing.national) {
        await prisma.team.update({
          where: { providerId: providerTeamId },
          data: { national: true },
        })
      }
      return existing.id
    }

    const created = await prisma.team.create({
      data: {
        providerId: providerTeamId,
        name: teamName,
        logo: teamLogo || null,
        national: isNational,
      },
    })
    return created.id
  } catch {
    return null
  }
}

/**
 * Database-first player retriever with SWR caching and API-Football fallback for current active season.
 */
export async function getOrSyncPlayerProfile(
  providerPlayerId: number,
  playerSlugOrName?: string
): Promise<Player | null> {
  const cacheKey = `player_profile_${providerPlayerId}`

  return cacheEngine.fetchWithCache('player_full_profile', cacheKey, CACHE_TTLS.ENTITY_INFO, async () => {
    // 1. Check MySQL for Player record
    let dbPlayer = await prisma.player.findUnique({
      where: { providerPlayerId },
      include: {
        currentClub: true,
        currentNationalTeam: true,
        seasonStatistics: {
          orderBy: { season: 'desc' },
        },
      },
    })

    const STALE_THRESHOLD_MS = 24 * 3600 * 1000 // 24 hours
    const isDbFresh =
      dbPlayer &&
      dbPlayer.lastSyncedAt &&
      Date.now() - dbPlayer.lastSyncedAt.getTime() < STALE_THRESHOLD_MS &&
      dbPlayer.currentClubProviderId !== null &&
      !isNationalTeam(dbPlayer.currentClub?.name) &&
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
      
      // Step B: Query current/active season statistics for 2026 (2026/2027 season)
      let rawApiData = await apiFootballProvider.getPlayerDetailsAndStats(providerPlayerId, 2026)
      let statSeason = 2026
      if (!rawApiData || !rawApiData.player || !Array.isArray(rawApiData.statistics) || rawApiData.statistics.length === 0) {
        const altData = await apiFootballProvider.getPlayerDetailsAndStats(providerPlayerId, 2025)
        if (altData && altData.player) {
          rawApiData = altData
          statSeason = 2026
        }
      }

      if (!rawApiData || !rawApiData.player) {
        if (dbPlayer) return transformDbPlayerToPlayer(dbPlayer)
        return null
      }

      const p = rawApiData.player
      const statisticsList: any[] = Array.isArray(rawApiData.statistics) ? rawApiData.statistics : []

      // Fallback: If squads did not identify a club, resolve it from statisticsList
      if (!squadResult.club && statisticsList.length > 0) {
        const candidateStat = statisticsList.find((st: any) => {
          const tName = st.team?.name || ''
          return !isNationalTeam(tName) && !isExhibitionTeam(tName)
        })
        if (candidateStat?.team?.id) {
          squadResult.club = {
            providerId: Number(candidateStat.team.id),
            name: candidateStat.team.name,
            logo: candidateStat.team.logo,
            position: candidateStat.games?.position,
            number: candidateStat.games?.number,
            photo: p.photo,
          }
        }
      }

      if (!squadResult.national && statisticsList.length > 0) {
        const natStat = statisticsList.find((st: any) => {
          return isNationalTeam(st.team?.name)
        })
        if (natStat?.team?.id) {
          squadResult.national = {
            providerId: Number(natStat.team.id),
            name: natStat.team.name,
            logo: natStat.team.logo,
            position: natStat.games?.position,
            number: natStat.games?.number,
            photo: p.photo,
          }
        }
      }

      // Step C: Link teams
      let clubDbId: string | null = null
      if (squadResult.club) {
        clubDbId = await ensureDbTeam(squadResult.club.providerId, squadResult.club.name, squadResult.club.logo, false)
      } else if (dbPlayer?.currentClubId && !isNationalTeam(dbPlayer.currentClub?.name)) {
        clubDbId = dbPlayer.currentClubId
      }

      let nationalDbId: string | null = null
      if (squadResult.national) {
        nationalDbId = await ensureDbTeam(squadResult.national.providerId, squadResult.national.name, squadResult.national.logo, true)
      }

      // Safe photo persistence: Never overwrite valid photo with null/undefined/empty
      let resolvedPhoto = dbPlayer?.photo || null
      if (p.photo && typeof p.photo === 'string' && p.photo.trim().length > 0) {
        resolvedPhoto = p.photo
      } else if (squadResult.club?.photo && typeof squadResult.club.photo === 'string' && squadResult.club.photo.trim().length > 0) {
        resolvedPhoto = squadResult.club.photo
      }

      let resolvedDisplayName = p.name || 'Player'
      if (providerPlayerId === 154) {
        resolvedDisplayName = 'Lionel Messi'
      } else if (providerPlayerId === 874) {
        resolvedDisplayName = 'Cristiano Ronaldo'
      } else if (providerPlayerId === 386828) {
        resolvedDisplayName = 'Lamine Yamal'
      } else if (/^[A-Z]\.\s+/.test(resolvedDisplayName) && p.firstname && p.lastname) {
        resolvedDisplayName = `${p.firstname} ${p.lastname}`.replace(/\s+/g, ' ').trim()
      }
      const playerName = resolvedDisplayName

      const clubStatFallback = statisticsList.find((st: any) => !isNationalTeam(st.team?.name) && !isExhibitionTeam(st.team?.name))
      const pos = squadResult.club?.position || clubStatFallback?.games?.position || statisticsList[0]?.games?.position || p.position || 'Forward'
      const num = squadResult.club?.number ?? clubStatFallback?.games?.number ?? statisticsList[0]?.games?.number ?? null

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
        const targetSeason = Number(statSeason) || 2026

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
              season: targetSeason,
            },
          },
          create: {
            playerId: upsertedPlayer.id,
            teamId: statTeamDbId,
            competitionId: statCompDbId,
            providerPlayerId,
            providerTeamId: statTeamProviderId,
            providerLeagueId: statLeagueProviderId,
            season: targetSeason,
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
            orderBy: { season: 'desc' },
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

  // 2. Separate club stats from national team & exhibition stats
  const clubStats = statsList.filter(
    (s: any) => !isNationalTeam(s.teamName) && !isExhibitionTeam(s.teamName)
  )

  let resolvedClubName = ''
  let resolvedClubLogo: string | undefined = undefined
  let resolvedClubProviderId: number | undefined = undefined

  if (currentClub && !isNationalTeam(currentClub.name)) {
    resolvedClubName = currentClub.name
    resolvedClubLogo = currentClub.logo || undefined
    resolvedClubProviderId = dbPlayer.currentClubProviderId || undefined
  } else if (clubStats.length > 0) {
    const topClubStat = clubStats[0]
    resolvedClubName = topClubStat.teamName
    resolvedClubLogo = topClubStat.teamLogo || undefined
    resolvedClubProviderId = topClubStat.providerTeamId || undefined
  }

  const targetedClubStats = resolvedClubProviderId
    ? clubStats.filter((s: any) => s.providerTeamId === resolvedClubProviderId)
    : clubStats

  let primaryStat: any = null

  // Priority 1: Match primary domestic league of the current club
  if (targetedClubStats.length > 0) {
    primaryStat = targetedClubStats.find((s: any) => {
      const name = (s.leagueName || '').toLowerCase()
      return DOMESTIC_LEAGUE_KEYWORDS.some((kw) => name.includes(kw))
    })

    // Priority 2: Competition with highest appearances / minutes in current club
    if (!primaryStat) {
      primaryStat = [...targetedClubStats].sort((a, b) => (b.appearances || 0) - (a.appearances || 0))[0]
    }
  }

  // Priority 3: Fall back to general club stats, then any stats
  if (!primaryStat) {
    primaryStat = clubStats[0] || statsList[0] || null
  }

  // Sort competitions: Current club domestic competition first, then other club comps, then national team
  competitions.sort((a, b) => {
    if (primaryStat && a.leagueId === primaryStat.providerLeagueId) return -1
    if (primaryStat && b.leagueId === primaryStat.providerLeagueId) return 1
    const aIsClub = !isNationalTeam(a.teamName) && !isExhibitionTeam(a.teamName)
    const bIsClub = !isNationalTeam(b.teamName) && !isExhibitionTeam(b.teamName)
    if (aIsClub && !bIsClub) return -1
    if (!aIsClub && bIsClub) return 1
    return (b.appearances || 0) - (a.appearances || 0)
  })

  // Determine season label (e.g. "2026/2027", or "2026")
  const activeSeasonYear = primaryStat?.season || 2026
  const isCalendar = primaryStat ? primaryStat.isCalendarYear : false
  const seasonLabel = formatSeasonDisplay(activeSeasonYear, isCalendar)

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

  // Resolve current team: ensure it's a club, not a national team
  const teamName = resolvedClubName || (currentClub && !isNationalTeam(currentClub.name) ? currentClub.name : '') || primaryStat?.teamName || ''
  const teamLogo = resolvedClubLogo || (currentClub && !isNationalTeam(currentClub.name) ? currentClub.logo : undefined) || primaryStat?.teamLogo || undefined
  const teamSlug = teamName ? slugify(teamName) : undefined

  // Squad number & position
  const squadNumber = (dbPlayer.currentSquadNumber !== null && dbPlayer.currentSquadNumber !== undefined)
    ? dbPlayer.currentSquadNumber
    : (primaryStat?.number || undefined)
  const number = squadNumber

  const position = (!isNationalTeam(dbPlayer.currentPosition) && dbPlayer.currentPosition)
    ? dbPlayer.currentPosition
    : (primaryStat?.position || 'Forward')

  const nationalityFlag = getCountryFlagEmoji(dbPlayer.nationality)
  const countryFlag = nationalityFlag || primaryStat?.leagueFlag || undefined

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
    squadNumber,
    number,
    nationality: dbPlayer.nationality || 'Global',
    nationalityFlag: dbPlayer.nationalityFlag || nationalityFlag || undefined,
    countryFlag,
    dateOfBirth: dbPlayer.dateOfBirth || '',
    age: dbPlayer.age || 0,
    height: dbPlayer.height || undefined,
    weight: dbPlayer.weight || undefined,
    position,
    teamId: currentClub?.id || primaryStat?.teamId || undefined,
    teamName,
    teamSlug,
    teamLogo,
    currentClubId: dbPlayer.currentClubId,
    currentClubProviderId: resolvedClubProviderId || dbPlayer.currentClubProviderId,
    currentNationalTeamId: dbPlayer.currentNationalTeamId,
    currentNationalProviderId: dbPlayer.currentNationalProviderId,
    preferredFoot: dbPlayer.preferredFoot,
    marketValue: dbPlayer.marketValue,
    stats: defaultStats,
    seasonStats: defaultStats,
    competitions,
    defaultCompetitionId: primaryStat?.providerLeagueId || null,
    selectedCompetitionId: primaryStat?.providerLeagueId || null,
    seasonYear: activeSeasonYear,
    seasonLabel,
  }
}
