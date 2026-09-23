/**
 * MyScore24 Approved Competitions Configuration
 * 
 * Reusable whitelist and prioritization for competitions displayed on the homepage.
 * Homepage shows ONLY approved competitions:
 * 1. BIG 5 (Highest Priority: Premier League, LaLiga, Serie A, Bundesliga, Ligue 1)
 * 2. EUROPE (Champions League, Europa League, Conference League)
 * 3. INTERNATIONAL (World Cup, World Cup Qualifiers, EURO, EURO Qualifiers, 
 *    UEFA Nations League, AFCON, AFCON Qualifiers, International Friendlies)
 */

export interface CompetitionConfig {
  id: number
  slug: string
  name: string
  displayName: string
  country: string
  category: 'big5' | 'europe' | 'international'
  priority: number // Lower number = higher priority
  localLogo?: string
  aliases?: string[]
}

export const APPROVED_COMPETITIONS: CompetitionConfig[] = [
  // ── 1. BIG 5 (Highest Priority) ───────────────────────────────────────────
  {
    id: 39,
    slug: 'premier-league',
    name: 'Premier League',
    displayName: 'Premier League',
    country: 'England',
    category: 'big5',
    priority: 1,
    localLogo: '/leagues/premier-league.png',
    aliases: ['Premier League', 'English Premier League', 'EPL'],
  },
  {
    id: 140,
    slug: 'la-liga',
    name: 'La Liga',
    displayName: 'LaLiga',
    country: 'Spain',
    category: 'big5',
    priority: 2,
    localLogo: '/leagues/laliga.png',
    aliases: ['La Liga', 'LaLiga', 'Primera División'],
  },
  {
    id: 135,
    slug: 'serie-a',
    name: 'Serie A',
    displayName: 'Serie A',
    country: 'Italy',
    category: 'big5',
    priority: 3,
    localLogo: '/leagues/serie-a.png',
    aliases: ['Serie A', 'Italian Serie A'],
  },
  {
    id: 78,
    slug: 'bundesliga',
    name: 'Bundesliga',
    displayName: 'Bundesliga',
    country: 'Germany',
    category: 'big5',
    priority: 4,
    localLogo: '/leagues/bundesliga.png',
    aliases: ['Bundesliga', 'German Bundesliga'],
  },
  {
    id: 61,
    slug: 'ligue-1',
    name: 'Ligue 1',
    displayName: 'Ligue 1',
    country: 'France',
    category: 'big5',
    priority: 5,
    localLogo: '/leagues/ligue-1.png',
    aliases: ['Ligue 1', 'French Ligue 1', 'Ligue 1 McDonald\'s', 'Ligue 1 Uber Eats'],
  },

  // ── 2. EUROPE ─────────────────────────────────────────────────────────────
  {
    id: 2,
    slug: 'champions-league',
    name: 'UEFA Champions League',
    displayName: 'UEFA Champions League',
    country: 'World',
    category: 'europe',
    priority: 10,
    localLogo: '/leagues/champions-league.png',
    aliases: ['UEFA Champions League', 'Champions League', 'UCL'],
  },
  {
    id: 3,
    slug: 'europa-league',
    name: 'UEFA Europa League',
    displayName: 'UEFA Europa League',
    country: 'World',
    category: 'europe',
    priority: 11,
    aliases: ['UEFA Europa League', 'Europa League', 'UEL'],
  },
  {
    id: 848,
    slug: 'uefa-conference-league',
    name: 'UEFA Europa Conference League',
    displayName: 'UEFA Conference League',
    country: 'World',
    category: 'europe',
    priority: 12,
    aliases: [
      'UEFA Europa Conference League',
      'UEFA Conference League',
      'Europa Conference League',
      'Conference League',
      'UECL',
    ],
  },

  // ── 3. INTERNATIONAL ──────────────────────────────────────────────────────
  {
    id: 1,
    slug: 'world-cup',
    name: 'World Cup',
    displayName: 'FIFA World Cup',
    country: 'World',
    category: 'international',
    priority: 20,
    aliases: ['World Cup', 'FIFA World Cup'],
  },
  // World Cup Qualifiers (API-Football uses IDs 29, 30, 31, 32, 33, 34, 37)
  {
    id: 32,
    slug: 'world-cup-qualification-europe',
    name: 'World Cup - Qualification Europe',
    displayName: 'World Cup Qualifiers (Europe)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification Europe', 'World Cup Qualification Europe'],
  },
  {
    id: 34,
    slug: 'world-cup-qualification-south-america',
    name: 'World Cup - Qualification South America',
    displayName: 'World Cup Qualifiers (South America)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification South America', 'CONMEBOL World Cup Qualifiers'],
  },
  {
    id: 29,
    slug: 'world-cup-qualification-africa',
    name: 'World Cup - Qualification Africa',
    displayName: 'World Cup Qualifiers (Africa)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification Africa', 'CAF World Cup Qualifiers'],
  },
  {
    id: 30,
    slug: 'world-cup-qualification-asia',
    name: 'World Cup - Qualification Asia',
    displayName: 'World Cup Qualifiers (Asia)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification Asia', 'AFC World Cup Qualifiers'],
  },
  {
    id: 31,
    slug: 'world-cup-qualification-concacaf',
    name: 'World Cup - Qualification CONCACAF',
    displayName: 'World Cup Qualifiers (CONCACAF)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification CONCACAF'],
  },
  {
    id: 33,
    slug: 'world-cup-qualification-oceania',
    name: 'World Cup - Qualification Oceania',
    displayName: 'World Cup Qualifiers (Oceania)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification Oceania'],
  },
  {
    id: 37,
    slug: 'world-cup-qualification-intercontinental',
    name: 'World Cup - Qualification Intercontinental Play-offs',
    displayName: 'World Cup Qualifiers (Play-offs)',
    country: 'World',
    category: 'international',
    priority: 21,
    aliases: ['World Cup - Qualification Intercontinental Play-offs'],
  },
  {
    id: 4,
    slug: 'euro-championship',
    name: 'Euro Championship',
    displayName: 'EURO',
    country: 'World',
    category: 'international',
    priority: 22,
    aliases: ['Euro Championship', 'UEFA European Championship', 'UEFA Euro', 'EURO'],
  },
  {
    id: 960,
    slug: 'euro-qualification',
    name: 'European Championship - Qualification',
    displayName: 'EURO Qualifiers',
    country: 'World',
    category: 'international',
    priority: 23,
    aliases: ['European Championship - Qualification', 'Euro Qualification', 'EURO Qualifiers'],
  },
  {
    id: 5,
    slug: 'uefa-nations-league',
    name: 'UEFA Nations League',
    displayName: 'UEFA Nations League',
    country: 'World',
    category: 'international',
    priority: 24,
    aliases: ['UEFA Nations League', 'Nations League'],
  },
  {
    id: 6,
    slug: 'africa-cup-of-nations',
    name: 'Africa Cup of Nations',
    displayName: 'AFCON',
    country: 'World',
    category: 'international',
    priority: 25,
    aliases: ['Africa Cup of Nations', 'AFCON', 'Coupe d\'Afrique des Nations'],
  },
  {
    id: 7,
    slug: 'africa-cup-of-nations-qualification',
    name: 'Africa Cup of Nations - Qualification',
    displayName: 'AFCON Qualifiers',
    country: 'World',
    category: 'international',
    priority: 26,
    aliases: ['Africa Cup of Nations - Qualification', 'AFCON Qualifiers', 'AFCON Qualification'],
  },
  {
    id: 36,
    slug: 'africa-cup-of-nations-qualification-alt',
    name: 'Africa Cup of Nations - Qualification',
    displayName: 'AFCON Qualifiers',
    country: 'World',
    category: 'international',
    priority: 26,
    aliases: ['Africa Cup of Nations - Qualification'],
  },
  {
    id: 10,
    slug: 'friendlies',
    name: 'Friendlies',
    displayName: 'International Friendlies',
    country: 'World',
    category: 'international',
    priority: 27,
    aliases: ['Friendlies', 'International Friendlies', 'Friendly International'],
  },
]

// Set of all approved numeric IDs for fast O(1) lookup
export const APPROVED_COMPETITION_IDS = new Set<number>(APPROVED_COMPETITIONS.map((c) => c.id))

// Fast lookup maps
const CONFIG_BY_ID = new Map<number, CompetitionConfig>()
const CONFIG_BY_SLUG = new Map<string, CompetitionConfig>()
const CONFIG_BY_ALIAS = new Map<string, CompetitionConfig>()

APPROVED_COMPETITIONS.forEach((c) => {
  CONFIG_BY_ID.set(c.id, c)
  CONFIG_BY_SLUG.set(c.slug.toLowerCase(), c)
  if (c.aliases) {
    c.aliases.forEach((alias) => {
      CONFIG_BY_ALIAS.set(alias.toLowerCase().trim(), c)
    })
  }
})

/**
 * Normalizes an ID representation to a number if valid
 */
export function normalizeLeagueId(id: string | number | undefined | null): number | null {
  if (id === undefined || id === null) return null
  const num = typeof id === 'number' ? id : parseInt(String(id).replace(/^[a-z]+-/, ''), 10)
  return isNaN(num) || num <= 0 ? null : num
}

/**
 * Checks whether a given competition matches our approved whitelist
 */
export function isApprovedCompetition(league: {
  id?: string | number | null
  name?: string | null
  country?: string | null
  slug?: string | null
}): boolean {
  if (!league) return false

  // 1. Direct ID match
  const numericId = normalizeLeagueId(league.id)
  if (numericId && APPROVED_COMPETITION_IDS.has(numericId)) {
    return true
  }

  // 2. Slug match
  if (league.slug && CONFIG_BY_SLUG.has(league.slug.toLowerCase().trim())) {
    return true
  }

  // 3. Name & alias match
  if (league.name) {
    const cleanName = league.name.toLowerCase().trim()
    const matched = CONFIG_BY_ALIAS.get(cleanName)
    if (matched) {
      // Avoid false positive (e.g. Bhutan Premier League vs England Premier League)
      if (matched.category === 'big5') {
        const country = (league.country || '').toLowerCase().trim()
        if (country && !matched.country.toLowerCase().includes(country) && !country.includes(matched.country.toLowerCase())) {
          return false
        }
      }
      return true
    }

    // Keyword heuristics for international qualifiers & friendlies
    if (cleanName.includes('world cup') && cleanName.includes('qualif')) return true
    if (cleanName.includes('european championship') && cleanName.includes('qualif')) return true
    if (cleanName.includes('euro') && cleanName.includes('qualif')) return true
    if (cleanName.includes('africa cup of nations') && cleanName.includes('qualif')) return true
    if (cleanName.includes('afcon') && cleanName.includes('qualif')) return true
    if (cleanName === 'friendlies' || cleanName === 'international friendlies') return true
  }

  return false
}

/**
 * Returns the sorting priority number for a competition.
 * Big 5 have priorities 1-5 (highest).
 * If not in approved list, returns 999.
 */
export function getCompetitionPriority(league: {
  id?: string | number | null
  name?: string | null
  country?: string | null
  slug?: string | null
}): number {
  if (!league) return 999

  const numericId = normalizeLeagueId(league.id)
  if (numericId && CONFIG_BY_ID.has(numericId)) {
    return CONFIG_BY_ID.get(numericId)!.priority
  }

  if (league.slug && CONFIG_BY_SLUG.has(league.slug.toLowerCase().trim())) {
    return CONFIG_BY_SLUG.get(league.slug.toLowerCase().trim())!.priority
  }

  if (league.name) {
    const cleanName = league.name.toLowerCase().trim()
    const matched = CONFIG_BY_ALIAS.get(cleanName)
    if (matched) return matched.priority

    // Fallbacks
    if (cleanName.includes('world cup')) return 21
    if (cleanName.includes('euro')) return 23
    if (cleanName.includes('afcon') || cleanName.includes('africa cup')) return 26
    if (cleanName.includes('friendl')) return 27
  }

  return 999
}

/**
 * Returns the local logo fallback path if available
 */
export function getLocalLeagueLogo(league: {
  id?: string | number | null
  name?: string | null
  slug?: string | null
}): string | undefined {
  if (!league) return undefined

  const numericId = normalizeLeagueId(league.id)
  if (numericId && CONFIG_BY_ID.has(numericId)) {
    return CONFIG_BY_ID.get(numericId)!.localLogo
  }

  if (league.slug && CONFIG_BY_SLUG.has(league.slug.toLowerCase().trim())) {
    return CONFIG_BY_SLUG.get(league.slug.toLowerCase().trim())!.localLogo
  }

  if (league.name) {
    const matched = CONFIG_BY_ALIAS.get(league.name.toLowerCase().trim())
    if (matched) return matched.localLogo
  }

  return undefined
}
