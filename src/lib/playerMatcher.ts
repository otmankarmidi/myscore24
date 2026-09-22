import manifest from '@/data/players.json'

export interface ManifestPlayer {
  id: string
  season: string
  club_key: string
  club: string
  squad_number: number
  position: string
  display_name: string
  full_name: string
  slug: string
  image_path: string
  profile_url: string
  image_source_url: string
  squad_source_url: string
  collected_at: string
  image_width: number
  image_height: number
  image_mime: string
  image_bytes: number
}

export interface EnrichedPlayerInfo {
  image: string
  imagePath: string
  imageSourceUrl: string
  slug: string
  squadNumber: number
  position: string
  fullName: string
  displayName: string
  clubKey: string
}

/**
 * Resolves player image path ensuring clean '/images/players/{club}/{filename}' URL.
 * Converts 'teams/fc-barcelona/players/10-lamine-yamal.webp'
 * to '/images/players/fc-barcelona/10-lamine-yamal.webp'
 */
export function resolvePlayerImagePath(imagePath?: string): string | null {
  if (!imagePath) return null;

  const cleanPath = imagePath
    .replace(/^\/?teams\//, '')
    .replace(/\/players\//, '/')
    .replace(/^\/+/, '');

  return `/images/players/${cleanPath}`;
}

/**
 * Normalizes name strings for fuzzy comparison:
 * - Removes accents/diacritics
 * - Lowercase
 * - Removes extra spaces, dots, hyphens, and common honorifics
 */
export function normalizeNameForMatching(name: string): string {
  if (!name) return ''
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[.\-_']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Custom nickname / shortened name alias dictionary
const PLAYER_NAME_ALIASES: Record<string, string> = {
  'vini jr': 'vinicius junior',
  'vini jr.': 'vinicius junior',
  'vinicius jr': 'vinicius junior',
  'vinicius jr.': 'vinicius junior',
  'brahim': 'brahim diaz',
  'courtois': 'thibaut courtois',
  'rodrygo': 'rodrygo goes',
  'lunin': 'andriy lunin',
  'gavi': 'pablo gavi',
  'pedri': 'pedro gonzalez',
  'szczesny': 'wojciech szczesny',
  'mbappe': 'kylian mbappe',
  'bellingham': 'jude bellingham',
}

const MANIFEST_PLAYERS: ManifestPlayer[] = (manifest.players || []) as ManifestPlayer[]

/**
 * Pre-processed lookup cache for fast player matching
 */
const PLAYER_MAP_BY_ID = new Map<string, ManifestPlayer>()
const PLAYER_MAP_BY_CLUB_NAME = new Map<string, ManifestPlayer>()
const PLAYER_MAP_BY_CLUB_SLUG = new Map<string, ManifestPlayer>()

MANIFEST_PLAYERS.forEach((mp) => {
  if (!mp) return
  // ID lookup
  if (mp.id) PLAYER_MAP_BY_ID.set(mp.id.toLowerCase(), mp)

  const club = mp.club_key.toLowerCase()

  // Full name & Display name lookup
  const normFull = normalizeNameForMatching(mp.full_name)
  const normDisplay = normalizeNameForMatching(mp.display_name)

  if (normFull) PLAYER_MAP_BY_CLUB_NAME.set(`${club}:${normFull}`, mp)
  if (normDisplay) PLAYER_MAP_BY_CLUB_NAME.set(`${club}:${normDisplay}`, mp)

  // Slug lookup
  if (mp.slug) PLAYER_MAP_BY_CLUB_SLUG.set(`${club}:${mp.slug.toLowerCase()}`, mp)
})

/**
 * Match a player record against local player manifest using strict priority:
 * 1. Stable player ID when explicitly mapped
 * 2. Club key plus exact normalized player name (or explicit alias)
 * 3. Club key plus exact slug
 * (Squad-number-only matching removed to prevent false positives)
 */
export function matchLocalPlayerImage(
  clubInput: string,
  playerName?: string,
  playerId?: string | number,
  playerSlug?: string
): EnrichedPlayerInfo | null {
  const normClub = clubInput ? clubInput.toLowerCase().trim() : ''
  let clubKey = ''
  if (normClub.includes('barcelona') || normClub.includes('fcb') || normClub === 'fc-barcelona') {
    clubKey = 'fc-barcelona'
  } else if (normClub.includes('madrid') || normClub.includes('real') || normClub === 'real-madrid') {
    clubKey = 'real-madrid'
  } else {
    return null
  }

  // Priority 1: Match by ID
  if (playerId) {
    const idStr = String(playerId).toLowerCase()
    if (PLAYER_MAP_BY_ID.has(idStr)) {
      const match = PLAYER_MAP_BY_ID.get(idStr)!
      return formatResult(match)
    }
  }

  // Priority 2: Match by Club + Normalized Full Name (with Alias Resolution)
  if (playerName) {
    let normName = normalizeNameForMatching(playerName)
    if (PLAYER_NAME_ALIASES[normName]) {
      normName = PLAYER_NAME_ALIASES[normName]
    }

    const key = `${clubKey}:${normName}`
    if (PLAYER_MAP_BY_CLUB_NAME.has(key)) {
      return formatResult(PLAYER_MAP_BY_CLUB_NAME.get(key)!)
    }

    // Try token matching (e.g. "Courtois" matching "Thibaut Courtois")
    for (const [mapKey, mp] of PLAYER_MAP_BY_CLUB_NAME.entries()) {
      if (mapKey.startsWith(`${clubKey}:`)) {
        const targetName = mapKey.replace(`${clubKey}:`, '')
        if (targetName.includes(normName) || normName.includes(targetName)) {
          return formatResult(mp)
        }
      }
    }
  }

  // Priority 3: Match by Club + Slug
  if (playerSlug) {
    const key = `${clubKey}:${playerSlug.toLowerCase()}`
    if (PLAYER_MAP_BY_CLUB_SLUG.has(key)) {
      return formatResult(PLAYER_MAP_BY_CLUB_SLUG.get(key)!)
    }
  }

  return null
}

function formatResult(mp: ManifestPlayer): EnrichedPlayerInfo {
  const publicPath = resolvePlayerImagePath(mp.image_path) || `/images/players/${mp.club_key}/${mp.slug}.webp`

  return {
    image: publicPath,
    imagePath: publicPath,
    imageSourceUrl: mp.image_source_url,
    slug: mp.slug,
    squadNumber: mp.squad_number,
    position: mp.position,
    fullName: mp.full_name,
    displayName: mp.display_name,
    clubKey: mp.club_key,
  }
}

export function getAllManifestPlayers(): ManifestPlayer[] {
  return MANIFEST_PLAYERS
}
