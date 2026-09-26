/**
 * Canonical Country & Football Association Mapping for MyScore24
 *
 * Normalizes country names, ISO codes (2-letter & 3-letter FIFA/IOC codes),
 * real flag asset URLs (prioritizing stored DB flags and football-association specific flags),
 * and emojis.
 *
 * CRITICAL FOOTBALL IDENTITY RULE:
 * England, Scotland, Wales, and Northern Ireland must retain their distinct
 * football association flags (e.g. England St. George cross) rather than
 * generic UK Union Jack flags.
 */

export interface CountryInfo {
  name: string
  code2: string
  code3: string
  flagUrl: string
  emoji: string
  aliases?: string[]
}

export const COUNTRIES_REGISTRY: Record<string, CountryInfo> = {
  morocco: {
    name: 'Morocco',
    code2: 'MA',
    code3: 'MAR',
    flagUrl: 'https://media.api-sports.io/flags/ma.svg',
    emoji: '🇲🇦',
    aliases: ['maroc', 'المغرب', 'mar'],
  },
  england: {
    name: 'England',
    code2: 'GB-ENG',
    code3: 'ENG',
    flagUrl: 'https://flagcdn.com/gb-eng.svg',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    aliases: ['eng', 'angleterre', 'إنجلترا'],
  },
  spain: {
    name: 'Spain',
    code2: 'ES',
    code3: 'ESP',
    flagUrl: 'https://media.api-sports.io/flags/es.svg',
    emoji: '🇪🇸',
    aliases: ['espana', 'espagne', 'esp', 'إسبانيا'],
  },
  france: {
    name: 'France',
    code2: 'FR',
    code3: 'FRA',
    flagUrl: 'https://media.api-sports.io/flags/fr.svg',
    emoji: '🇫🇷',
    aliases: ['fra', 'فرنسا'],
  },
  italy: {
    name: 'Italy',
    code2: 'IT',
    code3: 'ITA',
    flagUrl: 'https://media.api-sports.io/flags/it.svg',
    emoji: '🇮🇹',
    aliases: ['italia', 'italie', 'ita', 'إيطاليا'],
  },
  germany: {
    name: 'Germany',
    code2: 'DE',
    code3: 'GER',
    flagUrl: 'https://media.api-sports.io/flags/de.svg',
    emoji: '🇩🇪',
    aliases: ['deutschland', 'allemagne', 'ger', 'deu', 'ألمانيا'],
  },
  portugal: {
    name: 'Portugal',
    code2: 'PT',
    code3: 'POR',
    flagUrl: 'https://media.api-sports.io/flags/pt.svg',
    emoji: '🇵🇹',
    aliases: ['por', 'البرتغال'],
  },
  netherlands: {
    name: 'Netherlands',
    code2: 'NL',
    code3: 'NED',
    flagUrl: 'https://media.api-sports.io/flags/nl.svg',
    emoji: '🇳🇱',
    aliases: ['holland', 'pays-bas', 'ned', 'nld', 'هولندا'],
  },
  'saudi arabia': {
    name: 'Saudi Arabia',
    code2: 'SA',
    code3: 'KSA',
    flagUrl: 'https://media.api-sports.io/flags/sa.svg',
    emoji: '🇸🇦',
    aliases: ['saudi-arabia', 'arabie saoudite', 'ksa', 'sau', 'المملكة العربية السعودية', 'السعودية'],
  },
  usa: {
    name: 'USA',
    code2: 'US',
    code3: 'USA',
    flagUrl: 'https://media.api-sports.io/flags/us.svg',
    emoji: '🇺🇸',
    aliases: ['united states', 'united states of america', 'etats-unis', 'us', 'الولايات المتحدة'],
  },
  brazil: {
    name: 'Brazil',
    code2: 'BR',
    code3: 'BRA',
    flagUrl: 'https://media.api-sports.io/flags/br.svg',
    emoji: '🇧🇷',
    aliases: ['brasil', 'brésil', 'bra', 'البرازيل'],
  },
  argentina: {
    name: 'Argentina',
    code2: 'AR',
    code3: 'ARG',
    flagUrl: 'https://media.api-sports.io/flags/ar.svg',
    emoji: '🇦🇷',
    aliases: ['argentine', 'arg', 'الأرجنتين'],
  },
  scotland: {
    name: 'Scotland',
    code2: 'GB-SCT',
    code3: 'SCO',
    flagUrl: 'https://flagcdn.com/gb-sct.svg',
    emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    aliases: ['sco', 'ecosse'],
  },
  wales: {
    name: 'Wales',
    code2: 'GB-WLS',
    code3: 'WAL',
    flagUrl: 'https://flagcdn.com/gb-wls.svg',
    emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    aliases: ['wal', 'pays de galles'],
  },
  'northern ireland': {
    name: 'Northern Ireland',
    code2: 'GB-NIR',
    code3: 'NIR',
    flagUrl: 'https://flagcdn.com/gb-nir.svg',
    emoji: '🇬🇧',
    aliases: ['nir', 'irlande du nord'],
  },
  belgium: {
    name: 'Belgium',
    code2: 'BE',
    code3: 'BEL',
    flagUrl: 'https://media.api-sports.io/flags/be.svg',
    emoji: '🇧🇪',
    aliases: ['belgique', 'bel', 'بلجيكا'],
  },
  croatia: {
    name: 'Croatia',
    code2: 'HR',
    code3: 'CRO',
    flagUrl: 'https://media.api-sports.io/flags/hr.svg',
    emoji: '🇭🇷',
    aliases: ['croatie', 'cro', 'hrv', 'كرواتيا'],
  },
  japan: {
    name: 'Japan',
    code2: 'JP',
    code3: 'JPN',
    flagUrl: 'https://media.api-sports.io/flags/jp.svg',
    emoji: '🇯🇵',
    aliases: ['japon', 'jpn', 'اليابان'],
  },
  egypt: {
    name: 'Egypt',
    code2: 'EG',
    code3: 'EGY',
    flagUrl: 'https://media.api-sports.io/flags/eg.svg',
    emoji: '🇪🇬',
    aliases: ['egypte', 'egy', 'مصر'],
  },
  senegal: {
    name: 'Senegal',
    code2: 'SN',
    code3: 'SEN',
    flagUrl: 'https://media.api-sports.io/flags/sn.svg',
    emoji: '🇸🇳',
    aliases: ['sénégal', 'sen', 'السنغال'],
  },
  algeria: {
    name: 'Algeria',
    code2: 'DZ',
    code3: 'ALG',
    flagUrl: 'https://media.api-sports.io/flags/dz.svg',
    emoji: '🇩🇿',
    aliases: ['algérie', 'alg', 'dza', 'الجزائر'],
  },
  tunisia: {
    name: 'Tunisia',
    code2: 'TN',
    code3: 'TUN',
    flagUrl: 'https://media.api-sports.io/flags/tn.svg',
    emoji: '🇹🇳',
    aliases: ['tunisie', 'tun', 'تونس'],
  },
  turkey: {
    name: 'Turkey',
    code2: 'TR',
    code3: 'TUR',
    flagUrl: 'https://media.api-sports.io/flags/tr.svg',
    emoji: '🇹🇷',
    aliases: ['türkiye', 'turquie', 'tur', 'تركيا'],
  },
  switzerland: {
    name: 'Switzerland',
    code2: 'CH',
    code3: 'SUI',
    flagUrl: 'https://media.api-sports.io/flags/ch.svg',
    emoji: '🇨🇭',
    aliases: ['suisse', 'sui', 'che', 'سويسرا'],
  },
  uruguay: {
    name: 'Uruguay',
    code2: 'UY',
    code3: 'URU',
    flagUrl: 'https://media.api-sports.io/flags/uy.svg',
    emoji: '🇺🇾',
    aliases: ['uru', 'أوروغواي'],
  },
  colombia: {
    name: 'Colombia',
    code2: 'CO',
    code3: 'COL',
    flagUrl: 'https://media.api-sports.io/flags/co.svg',
    emoji: '🇨🇴',
    aliases: ['colombie', 'col', 'كولومبيا'],
  },
  mexico: {
    name: 'Mexico',
    code2: 'MX',
    code3: 'MEX',
    flagUrl: 'https://media.api-sports.io/flags/mx.svg',
    emoji: '🇲🇽',
    aliases: ['mexique', 'mex', 'المكسيك'],
  },
  world: {
    name: 'World',
    code2: 'WW',
    code3: 'INT',
    flagUrl: 'https://media.api-sports.io/flags/eu.svg',
    emoji: '🌍',
    aliases: ['international', 'global', 'العالم'],
  },
  europe: {
    name: 'Europe',
    code2: 'EU',
    code3: 'UEFA',
    flagUrl: 'https://media.api-sports.io/flags/eu.svg',
    emoji: '🇪🇺',
    aliases: ['uefa', 'أوروبا'],
  },
}

// Fast reverse index lookup map
const LOOKUP_MAP = new Map<string, CountryInfo>()

Object.values(COUNTRIES_REGISTRY).forEach((info) => {
  LOOKUP_MAP.set(info.name.toLowerCase().trim(), info)
  LOOKUP_MAP.set(info.code2.toLowerCase().trim(), info)
  LOOKUP_MAP.set(info.code3.toLowerCase().trim(), info)
  if (info.aliases) {
    info.aliases.forEach((alias) => {
      LOOKUP_MAP.set(alias.toLowerCase().trim(), info)
    })
  }
})

/**
 * Normalizes any country name or code into canonical CountryInfo.
 */
export function getCountryInfo(query?: string | null): CountryInfo | null {
  if (!query) return null
  const clean = query.trim().toLowerCase()
  if (LOOKUP_MAP.has(clean)) {
    return LOOKUP_MAP.get(clean)!
  }

  // Handle generic UK / Great Britain
  if (clean === 'united kingdom' || clean === 'uk' || clean === 'gb') {
    return COUNTRIES_REGISTRY['england']
  }

  // Fallback for any 2-character ISO code
  if (clean.length === 2) {
    const codeUpper = clean.toUpperCase()
    return {
      name: codeUpper,
      code2: codeUpper,
      code3: codeUpper,
      flagUrl: `https://media.api-sports.io/flags/${clean}.svg`,
      emoji: getFlagEmoji(codeUpper),
    }
  }

  return null
}

/**
 * Returns the best country flag image URL with fallback chain:
 * 1. Existing flag if valid URL (e.g. from MySQL Country.flag)
 *    - BUT if country is England/Scotland/Wales and flag is generic gb.svg, upgrade to football association flag!
 * 2. Canonical country registry flag URL
 * 3. Fallback flagcdn.com URL
 */
export function getCountryFlagUrl(countryName?: string | null, existingFlag?: string | null): string | null {
  if (!countryName && !existingFlag) return null

  const info = getCountryInfo(countryName)

  // Respect football association identity
  if (info && (info.code2 === 'GB-ENG' || info.code2 === 'GB-SCT' || info.code2 === 'GB-WLS' || info.code2 === 'GB-NIR')) {
    return info.flagUrl
  }

  if (existingFlag && isFlagUrl(existingFlag)) {
    return existingFlag
  }

  if (info?.flagUrl) {
    return info.flagUrl
  }

  return null
}

/**
 * Returns canonical 3-letter country code (MAR, ENG, ESP, FRA, ITA, GER, etc.)
 */
export function getCountryCode(countryName?: string | null, fallbackCode?: string | null): string {
  if (!countryName && !fallbackCode) return 'WW'
  const info = getCountryInfo(countryName || fallbackCode)
  if (info?.code3) return info.code3
  if (fallbackCode && fallbackCode.trim().length > 0) return fallbackCode.trim().slice(0, 3).toUpperCase()
  if (countryName && countryName.trim().length > 0) return countryName.trim().slice(0, 3).toUpperCase()
  return 'WW'
}

/**
 * Checks whether a string is a valid HTTP(S) or relative flag image URL.
 */
export function isFlagUrl(str?: string | null): boolean {
  if (!str) return false
  const trimmed = str.trim().toLowerCase()
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.endsWith('.svg') ||
    trimmed.endsWith('.png') ||
    trimmed.endsWith('.webp')
  )
}

/**
 * Helper to generate Unicode flag emoji from a 2-letter ISO code.
 */
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
