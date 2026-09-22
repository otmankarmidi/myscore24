/**
 * ESPN Public Soccer API Provider
 * 100% Real, Actual, Live Football Data for MyScore24.
 * Endpoints: https://site.api.espn.com/apis/site/v2/sports/soccer/
 */

export const CURRENT_SEASON = '2026/2027'

export interface EspnMatch {
  id: string
  date: string
  name: string
  shortName: string
  leagueId: string
  leagueName: string
  leagueLogo?: string
  status: {
    type: {
      id: string
      name: string
      state: 'pre' | 'in' | 'post'
      completed: boolean
      description: string
      detail: string
      shortDetail: string
    }
    clock?: number
    displayClock?: string
    period?: number
  }
  competitors: Array<{
    id: string
    uid: string
    type: string
    order: number
    homeAway: 'home' | 'away'
    winner?: boolean
    score?: string
    team: {
      id: string
      name: string
      displayName: string
      abbreviation: string
      logo?: string
    }
  }>
  venue?: {
    fullName: string
    address?: { city: string }
  }
}

export const LEAGUE_MAP: Record<string, { code: string; name: string; country: string; logo: string }> = {
  // Premier League
  '39': { code: 'eng.1', name: 'English Premier League', country: 'England', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png' },
  'premier-league': { code: 'eng.1', name: 'English Premier League', country: 'England', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png' },

  // La Liga
  '140': { code: 'esp.1', name: 'Spanish LALIGA', country: 'Spain', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png' },
  'la-liga': { code: 'esp.1', name: 'Spanish LALIGA', country: 'Spain', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png' },

  // Champions League
  '2': { code: 'uefa.champions', name: 'UEFA Champions League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },
  'champions-league': { code: 'uefa.champions', name: 'UEFA Champions League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },

  // Europa League
  '3': { code: 'uefa.europa', name: 'UEFA Europa League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2036.png' },
  'europa-league': { code: 'uefa.europa', name: 'UEFA Europa League', country: 'Europe', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2036.png' },

  // Bundesliga
  '78': { code: 'ger.1', name: 'German Bundesliga', country: 'Germany', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },
  'bundesliga': { code: 'ger.1', name: 'German Bundesliga', country: 'Germany', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png' },

  // Serie A
  '135': { code: 'ita.1', name: 'Italian Serie A', country: 'Italy', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png' },
  'serie-a': { code: 'ita.1', name: 'Italian Serie A', country: 'Italy', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png' },

  // Ligue 1
  '61': { code: 'fra.1', name: 'French Ligue 1', country: 'France', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png' },
  'ligue-1': { code: 'fra.1', name: 'French Ligue 1', country: 'France', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png' },

  // Botola Pro
  '200': { code: 'mar.1', name: 'Moroccan Botola Pro', country: 'Morocco', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1908.png' },
  'botola-pro': { code: 'mar.1', name: 'Moroccan Botola Pro', country: 'Morocco', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1908.png' },

  // Saudi Pro League
  '307': { code: 'ksa.1', name: 'Saudi Pro League', country: 'Saudi Arabia', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2744.png' },
  'saudi-pro-league': { code: 'ksa.1', name: 'Saudi Pro League', country: 'Saudi Arabia', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2744.png' },

  // Primeira Liga (Portugal)
  '94': { code: 'por.1', name: 'Portuguese Primeira Liga', country: 'Portugal', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/14.png' },
  'primeira-liga': { code: 'por.1', name: 'Portuguese Primeira Liga', country: 'Portugal', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/14.png' },

  // Eredivisie (Netherlands)
  '88': { code: 'ned.1', name: 'Dutch Eredivisie', country: 'Netherlands', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/11.png' },
  'eredivisie': { code: 'ned.1', name: 'Dutch Eredivisie', country: 'Netherlands', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/11.png' },

  // MLS (USA)
  '253': { code: 'usa.1', name: 'Major League Soccer', country: 'USA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png' },
  'mls': { code: 'usa.1', name: 'Major League Soccer', country: 'USA', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/19.png' },

  // International Friendlies
  'friendly': { code: 'fifa.friendly', name: 'International Friendlies', country: 'International', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png' },
  'fifa.friendly': { code: 'fifa.friendly', name: 'International Friendlies', country: 'International', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png' },

  // AFCON Qualifiers
  'afcon-qualifiers': { code: 'caf.nations_qual', name: 'AFCON Qualifiers', country: 'Africa', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/65.png' },
  'caf.nations_qual': { code: 'caf.nations_qual', name: 'AFCON Qualifiers', country: 'Africa', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/65.png' }
}

export function formatElapsedMinutes(rawClock?: number): number {
  if (!rawClock || rawClock <= 0) return 0
  let clock = rawClock
  if (clock > 120) {
    clock = Math.floor(clock / 60)
  }
  if (clock > 120) {
    clock = 90
  }
  return clock
}

/** Extract numeric ID from ESPN $ref URL like .../athletes/12345?lang=en */
function extractIdFromRef(ref: string): string {
  const match = ref.match(/\/(\d+)\?/)
  return match ? match[1] : ''
}

export const espnPublicProvider = {
  getEspnLeagueCode(slugOrId: string): string {
    const key = (slugOrId || '').toLowerCase()
    return LEAGUE_MAP[key]?.code || key || 'eng.1'
  },

  getLeagueMeta(slugOrId: string) {
    const key = (slugOrId || '').toLowerCase()
    return LEAGUE_MAP[key] || {
      code: key || 'eng.1',
      name: key.toUpperCase(),
      country: 'International',
      logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png'
    }
  },

  async fetchMatchesForLeague(leagueCode: string, dateStr?: string): Promise<EspnMatch[]> {
    try {
      const espnLeague = this.getEspnLeagueCode(leagueCode)
      let url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${espnLeague}/scoreboard`
      if (dateStr) {
        const formattedDate = dateStr.replace(/-/g, '')
        url += `?dates=${formattedDate}`
      }

      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return []
      const json = await res.json()

      const leagueName = json.leagues?.[0]?.name || 'Football League'
      const leagueLogo = json.leagues?.[0]?.logos?.[0]?.href || ''

      return (json.events || []).map((ev: any) => {
        const competition = ev.competitions?.[0] || {}
        const status = competition.status || ev.status || {}
        if (status.clock) {
          status.clock = formatElapsedMinutes(status.clock)
        }

        return {
          id: ev.id,
          date: ev.date,
          name: ev.name,
          shortName: ev.shortName,
          leagueId: espnLeague,
          leagueName,
          leagueLogo,
          status,
          competitors: competition.competitors || [],
          venue: competition.venue
        }
      })
    } catch (err) {
      console.error(`[EspnProvider] Error fetching matches for ${leagueCode}:`, err)
      return []
    }
  },

  async fetchAllTodayMatches(): Promise<EspnMatch[]> {
    const leagues = ['eng.1', 'esp.1', 'ger.1', 'ita.1', 'fra.1', 'uefa.champions', 'mar.1', 'ksa.1', 'por.1', 'ned.1', 'usa.1']
    const results = await Promise.allSettled(leagues.map(code => this.fetchMatchesForLeague(code)))
    const allMatches: EspnMatch[] = []

    results.forEach(res => {
      if (res.status === 'fulfilled') {
        allMatches.push(...res.value)
      }
    })

    return allMatches
  },

  async fetchStandings(leagueCode: string): Promise<any> {
    try {
      const espnLeague = this.getEspnLeagueCode(leagueCode)
      const url = `https://site.api.espn.com/apis/v2/sports/soccer/${espnLeague}/standings`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return []
      const json = await res.json()
      if (json.children && json.children.length > 0) {
        return json.children
      }
      return json.children?.[0]?.standings?.entries || []
    } catch (err) {
      console.error(`[EspnProvider] Error fetching standings for ${leagueCode}:`, err)
      return []
    }
  },

  async fetchTopScorers(leagueCode: string): Promise<any[]> {
    try {
      const espnLeague = this.getEspnLeagueCode(leagueCode)

      // Get active season year from standings
      let seasonYear = new Date().getFullYear()
      try {
        const stRes = await fetch(
          `https://site.api.espn.com/apis/v2/sports/soccer/${espnLeague}/standings`,
          { cache: 'no-store' }
        )
        if (stRes.ok) {
          const stJson = await stRes.json()
          if (stJson.season?.year) seasonYear = stJson.season.year
        }
      } catch {}

      // Try type=1 (regular season) first, then type=2, then previous season
      let res = await fetch(
        `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear}/types/1/leaders`,
        { cache: 'no-store' }
      )
      if (!res.ok) {
        res = await fetch(
          `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear}/types/2/leaders`,
          { cache: 'no-store' }
        )
      }
      if (!res.ok) {
        res = await fetch(
          `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear - 1}/types/1/leaders`,
          { cache: 'no-store' }
        )
      }
      if (!res.ok) {
        res = await fetch(
          `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${espnLeague}/seasons/${seasonYear - 1}/types/2/leaders`,
          { cache: 'no-store' }
        )
      }
      if (!res.ok) return []

      const json = await res.json()

      // Find goals category — ESPN uses different names per league
      const goalsCat = json.categories?.find(
        (c: any) =>
          c.name === 'goalsLeaders' ||
          c.name === 'goals' ||
          (typeof c.name === 'string' && c.name.toLowerCase().includes('goal'))
      )
      if (!goalsCat?.leaders?.length) return []

      const leadersSlice: any[] = goalsCat.leaders.slice(0, 10)

      // Resolve all player+team names in parallel
      const scorers = await Promise.all(
        leadersSlice.map(async (l: any, i: number) => {
          let athleteRef: string = l.athlete?.['$ref'] || ''
          let teamRef: string = l.team?.['$ref'] || ''
          if (athleteRef.startsWith('http:')) athleteRef = athleteRef.replace('http:', 'https:')
          if (teamRef.startsWith('http:')) teamRef = teamRef.replace('http:', 'https:')

          const athleteId = extractIdFromRef(athleteRef)
          const teamId = extractIdFromRef(teamRef)

          // Parse goal/appearance counts from displayValue e.g. "Matches: 4, Goals: 4"
          let goals = typeof l.value === 'number' ? l.value : 0
          let appearances = 0
          if (l.displayValue) {
            const gm = l.displayValue.match(/Goals:\s*(\d+)/i)
            const mm = l.displayValue.match(/Matches:\s*(\d+)/i)
            if (gm) goals = parseInt(gm[1])
            if (mm) appearances = parseInt(mm[1])
          }

          // Fetch player and team names in parallel
          let playerName = `Player ${i + 1}`
          let teamName = 'Club'
          try {
            const [athRes, teamRes] = await Promise.all([
              athleteRef ? fetch(athleteRef, { cache: 'no-store' }) : Promise.resolve(null),
              teamRef ? fetch(teamRef, { cache: 'no-store' }) : Promise.resolve(null)
            ])
            if (athRes?.ok) {
              const ath = await athRes.json()
              playerName = ath.displayName || ath.fullName || playerName
            }
            if (teamRes?.ok) {
              const team = await teamRes.json()
              teamName = team.displayName || team.name || teamName
            }
          } catch {}

          return {
            playerId: athleteId || String(i + 1),
            playerSlug: `player-${athleteId || i + 1}`,
            playerName,
            // Build ESPN CDN URLs directly from IDs — no extra fetches needed
            photo: athleteId
              ? `https://a.espncdn.com/i/headshots/soccer/players/full/${athleteId}.png`
              : '',
            teamId: teamId || String(i + 1),
            teamSlug: `team-${teamId || i + 1}`,
            teamName,
            teamLogo: teamId
              ? `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`
              : '',
            matches: appearances,
            goals,
            assists: 0,
            penalties: 0
          }
        })
      )

      return scorers.filter(s => s.goals > 0)
    } catch (err) {
      console.error(`[EspnProvider] Error fetching top scorers for ${leagueCode}:`, err)
      return []
    }
  },

  async fetchMatchSummary(eventId: string): Promise<any> {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${eventId}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      return await res.json()
    } catch (err) {
      console.error(`[EspnProvider] Error fetching match summary for ${eventId}:`, err)
      return null
    }
  }
}
