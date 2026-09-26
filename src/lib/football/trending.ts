import { Match } from '@/types/match'
import { getCompetitionPriority } from '@/config/competitions'

/**
 * High-profile global and regional clubs & national teams
 * Used for deterministic trending relevance scoring.
 */
const POPULAR_TEAMS_KEYWORDS = new Set([
  // Premier League
  'arsenal', 'manchester city', 'man city', 'liverpool', 'chelsea',
  'manchester united', 'man utd', 'tottenham', 'spurs', 'newcastle',
  'aston villa',

  // La Liga
  'real madrid', 'barcelona', 'fc barcelona', 'atletico madrid',
  'athletic club', 'real sociedad', 'sevilla', 'valencia', 'betis',

  // Serie A
  'inter', 'inter milan', 'ac milan', 'milan', 'juventus', 'napoli',
  'roma', 'as roma', 'lazio', 'atalanta',

  // Bundesliga
  'bayern munich', 'bayern münchen', 'borussia dortmund', 'dortmund',
  'bayer leverkusen', 'leverkusen', 'rb leipzig',

  // Ligue 1
  'paris saint-germain', 'psg', 'marseille', 'om', 'monaco', 'lyon',
  'lille',

  // Morocco (Botola Pro & African Giants)
  'wydad', 'wydad ac', 'wac', 'raja', 'raja ca', 'rca',
  'as far', 'far rabat', 'rs berkane', 'berkane', 'fus rabat',

  // Arab & African Giants
  'al ahly', 'ahly', 'zamalek', 'pyramids',
  'al hilal', 'al-hilal', 'al nassr', 'al-nassr', 'al ittihad', 'al-ittihad', 'al ahli',
  'esperance', 'esperance tunis', 'mamelodi sundowns', 'tp mazembe',

  // Major National Teams
  'morocco', 'argentina', 'brazil', 'france', 'england', 'spain',
  'germany', 'portugal', 'netherlands', 'italy', 'croatia', 'belgium',
  'egypt', 'senegal', 'algeria', 'nigeria', 'ivory coast', 'cote d\'ivoire',
  'japan', 'south korea', 'saudi arabia', 'usa', 'united states',
])

function isPopularTeam(team?: { name?: string; slug?: string } | null): boolean {
  if (!team?.name) return false
  const name = team.name.toLowerCase().trim()
  const slug = (team.slug || '').toLowerCase().trim()

  for (const keyword of POPULAR_TEAMS_KEYWORDS) {
    if (name.includes(keyword) || slug.includes(keyword)) {
      return true
    }
  }
  return false
}

/**
 * Deterministic Trending Scoring Algorithm
 * 
 * Rules:
 * 1. LIVE matches get highest priority (+15,000)
 * 2. European / Big 5 / Major international competitions (+4,000 to +8,500)
 * 3. Popular / followed teams (+2,200 per team, +4,500 for blockbuster head-to-head)
 * 4. Recently finished matches (+2,000 + recency bonus)
 * 5. Important upcoming matches today (+2,500 + kickoff closeness bonus)
 */
export function scoreMatchForTrending(match: Match): number {
  let score = 0
  const status = match.status
  const isLive = status === 'live' || status === 'half_time' || status === 'extra_time' || status === 'penalties'
  const isFinished = status === 'full_time'
  const isScheduled = status === 'scheduled'

  // 1. LIVE MATCHES (Always top of ticker)
  if (isLive) {
    score += 15000
    if (status === 'penalties') score += 1200
    if (status === 'extra_time') score += 900
    if (status === 'half_time') score += 500
    score += Math.min(match.minute || 0, 120) * 2
  }

  // 2. COMPETITION PRESTIGE
  const priority = getCompetitionPriority(match.league)
  if (priority <= 5) {
    // Big 5 (PL: 1, LaLiga: 2, Serie A: 3, Bundesliga: 4, Ligue 1: 5)
    score += 7000 - priority * 200
  } else if (priority === 10) {
    // Champions League
    score += 8500
  } else if (priority === 11) {
    // Europa League
    score += 5500
  } else if (priority === 12) {
    // Conference League
    score += 4000
  } else if (priority >= 20 && priority <= 27) {
    // Major International (World Cup, AFCON, Euro, Nations League, Qualifiers)
    score += 7500 - (priority - 20) * 150
  } else if (priority < 100) {
    // Other approved regional/domestic (Botola Pro, CAF CL, etc.)
    score += 3500 - priority * 20
  }

  // 3. POPULAR / FOLLOWED TEAMS
  const isHomePopular = isPopularTeam(match.homeTeam)
  const isAwayPopular = isPopularTeam(match.awayTeam)
  if (isHomePopular && isAwayPopular) {
    score += 4500 // Blockbuster clash (e.g., El Clasico, City vs Arsenal)
  } else if (isHomePopular || isAwayPopular) {
    score += 2200 // One heavyweight playing
  }

  // 4. RECENTLY FINISHED MATCHES
  if (isFinished) {
    score += 2000
    try {
      const kickoffTime = new Date(match.kickoff).getTime()
      const hoursAgo = (Date.now() - kickoffTime) / (1000 * 60 * 60)
      if (hoursAgo >= 0 && hoursAgo < 6) {
        score += Math.max(0, Math.floor((6 - hoursAgo) * 350))
      }
    } catch {}
  }

  // 5. IMPORTANT UPCOMING MATCHES TODAY
  if (isScheduled) {
    score += 2500
    try {
      const kickoffTime = new Date(match.kickoff).getTime()
      const hoursUntil = (kickoffTime - Date.now()) / (1000 * 60 * 60)
      if (hoursUntil > 0 && hoursUntil < 6) {
        score += Math.max(0, Math.floor((6 - hoursUntil) * 400))
      }
    } catch {}
  }

  return score
}

/**
 * Filters and deterministically sorts matches for the Trending Ticker.
 * Returns 8 to 12 top matches.
 */
export function getTrendingMatches(matches: Match[], max = 10): Match[] {
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return []
  }

  // Exclude cancelled / postponed matches unless nothing else exists
  const valid = matches.filter(
    (m) => m && m.homeTeam && m.awayTeam && m.status !== 'cancelled' && m.status !== 'postponed'
  )

  const candidatePool = valid.length > 0 ? valid : matches

  const scored = candidatePool.map((m) => ({
    match: m,
    score: scoreMatchForTrending(m),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, Math.max(8, Math.min(max, 12))).map((s) => s.match)
}

/**
 * Server-side helper to get initial trending matches without ANY external API calls.
 * Reads directly from L1 memory cache or MySQL database.
 */
export async function getInitialTrendingMatches(): Promise<Match[]> {
  try {
    const todayStr = new Date().toISOString().split('T')[0]
    const cacheKey = `approved_fixtures:${todayStr}`

    // 1. Check L1 Memory Cache (0 ms, 0 API calls)
    const { cacheEngine } = await import('@/services/sports/cacheEngine')
    const cachedApproved = cacheEngine.get<Match[]>('fixtures', cacheKey)
    if (cachedApproved && cachedApproved.length > 0) {
      return getTrendingMatches(cachedApproved, 10)
    }

    // 2. Check Persistent MySQL Database (0 API calls)
    const { getStoredMatchesByDate } = await import('@/lib/football/persistence/queries')
    const stored = await getStoredMatchesByDate(todayStr)
    if (stored && stored.length > 0) {
      return getTrendingMatches(stored, 10)
    }

    // 3. Fallback to mock data if empty
    const { mockMatches } = await import('@/data/mockMatches')
    if (mockMatches && mockMatches.length > 0) {
      return getTrendingMatches(mockMatches, 10)
    }

    return []
  } catch {
    return []
  }
}
