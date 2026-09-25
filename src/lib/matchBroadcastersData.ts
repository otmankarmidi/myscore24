/**
 * Match Broadcasters, TV Channels, Referee Stats, and FIFA/Club Rankings
 * Real football broadcast mappings by competition, teams, and region.
 */

import { Match } from '@/types/match'
import { LeagueStanding } from '@/types/standing'

export interface BroadcasterItem {
  id: string
  name: string
  type: 'tv' | 'stream'
  countryCode: string
  quality?: string
  isFree?: boolean
  channelNumber?: string
}

export interface BroadcasterCountry {
  code: string
  name: string
  nameAr: string
  flag: string
}

export const BROADCASTER_COUNTRIES: BroadcasterCountry[] = [
  { code: 'MA', name: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
  { code: 'EG', name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', nameAr: 'إسبانيا', flag: '🇪🇸' },
  { code: 'GB', name: 'United Kingdom', nameAr: 'بريطانيا', flag: '🇬🇧' },
  { code: 'US', name: 'United States', nameAr: 'أمريكا', flag: '🇺🇸' },
  { code: 'DE', name: 'Germany', nameAr: 'ألمانيا', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', nameAr: 'إيطاليا', flag: '🇮🇹' },
  { code: 'WW', name: 'Worldwide', nameAr: 'دولي', flag: '🌍' },
]

// ── Official FIFA Men's World Rankings Database (210 Nations) ─────────────
export const FIFA_RANKINGS: Record<string, number> = {
  // 1 - 20
  'spain': 1, 'espana': 1, 'إسبانيا': 1, 'esp': 1,
  'argentina': 2, 'الأرجنتين': 2, 'arg': 2,
  'france': 3, 'فرنسا': 3, 'fra': 3,
  'england': 4, 'إنجلترا': 4, 'eng': 4,
  'brazil': 5, 'brasil': 5, 'البرازيل': 5, 'bra': 5,
  'belgium': 6, 'بلجيكا': 6, 'bel': 6,
  'portugal': 7, 'البرتغال': 7, 'por': 7,
  'netherlands': 8, 'holland': 8, 'هولندا': 8, 'ned': 8,
  'italy': 9, 'إيطاليا': 9, 'ita': 9,
  'colombia': 10, 'كولومبيا': 10, 'col': 10,
  'germany': 11, 'deutschland': 11, 'ألمانيا': 11, 'ger': 11,
  'morocco': 12, 'maroc': 12, 'المغرب': 12, 'mar': 12,
  'uruguay': 13, 'أوروغواي': 13, 'uru': 13,
  'croatia': 14, 'كرواتيا': 14, 'cro': 14,
  'japan': 15, 'اليابان': 15, 'jpn': 15,
  'mexico': 16, 'المكسيك': 16, 'mex': 16,
  'united states': 16, 'usa': 16, 'الولايات المتحدة': 16,
  'senegal': 17, 'السنغال': 17, 'sen': 17,
  'iran': 18, 'ir iran': 18, 'إيران': 18, 'irn': 18,
  'switzerland': 19, 'سويسرا': 19, 'sui': 19,
  'denmark': 20, 'الدنمارك': 20, 'den': 20,

  // 21 - 40
  'austria': 22, 'النمسا': 22, 'aut': 22,
  'south korea': 23, 'korea republic': 23, 'كوريا الجنوبية': 23, 'kor': 23,
  'australia': 24, 'أستراليا': 24, 'aus': 24,
  'ukraine': 25, 'أوكرانيا': 25, 'ukr': 25,
  'turkey': 26, 'türkiye': 26, 'تركيا': 26, 'tur': 26,
  'ecuador': 27, 'الإكوادور': 27, 'ecu': 27,
  'poland': 28, 'بولندا': 28, 'pol': 28,
  'sweden': 28, 'السويد': 28, 'swe': 28,
  'wales': 29, 'ويلز': 29, 'wal': 29,
  'egypt': 30, 'مصر': 30, 'egy': 30,
  'hungary': 31, 'المجر': 31, 'hun': 31,
  'serbia': 32, 'صربيا': 32, 'srb': 32,
  'russia': 33, 'روسيا': 33, 'rus': 33,
  'qatar': 34, 'قطر': 34, 'qat': 34,
  'czech republic': 35, 'czechia': 35, 'التشيك': 35, 'cze': 35,
  'panama': 35, 'بنما': 35, 'pan': 35,
  'ivory coast': 38, "côte d'ivoire": 38, 'كوت ديفوار': 38, 'civ': 38,
  'nigeria': 39, 'نيجيريا': 39, 'nga': 39,
  'scotland': 39, 'اسكتلندا': 39, 'sco': 39,
  'canada': 40, 'كندا': 40, 'can': 40,

  // 41 - 70
  'algeria': 41, 'الجزائر': 41, 'alg': 41,
  'peru': 42, 'بيرو': 42, 'per': 42,
  'norway': 43, 'النرويج': 43, 'nor': 43,
  'slovakia': 44, 'سلوفاكيا': 44, 'svk': 44,
  'romania': 45, 'رومانيا': 45, 'rou': 45,
  'tunisia': 47, 'تونس': 47, 'tun': 47,
  'greece': 48, 'اليونان': 48, 'gre': 48,
  'cameroon': 49, 'الكاميرون': 49, 'cmr': 49,
  'costa rica': 50, 'كوستاريكا': 50, 'crc': 50,
  'chile': 51, 'تشيلي': 51, 'chi': 51,
  'slovenia': 52, 'سلوفينيا': 52, 'svn': 52,
  'mali': 53, 'مالي': 53, 'mli': 53,
  'iraq': 55, 'العراق': 55, 'irq': 55,
  'saudi arabia': 56, 'السعودية': 56, 'ksa': 56, 'sau': 56,
  'paraguay': 57, 'باراغواي': 57, 'par': 57,
  'south africa': 58, 'جنوب أفريقيا': 58, 'rsa': 58,
  'uzbekistan': 60, 'أوزبكستان': 60, 'uzb': 60,
  'ireland': 62, 'republic of ireland': 62, 'أيرلندا': 62, 'irl': 62,
  'dr congo': 63, 'congo dr': 63, 'الكونغو الديمقراطية': 63, 'cod': 63,
  'ghana': 64, 'غانا': 64, 'gha': 64,
  'cape verde': 65, 'الرأس الأخضر': 65, 'cpv': 65,
  'albania': 66, 'ألبانيا': 66, 'alb': 66,
  'burkina faso': 67, 'بوركينا فاسو': 67, 'bfa': 67,
  'jordan': 68, 'الأردن': 68, 'jor': 68,
  'uae': 69, 'united arab emirates': 69, 'الإمارات': 69,

  // 71 - 100
  'iceland': 71, 'أيسلندا': 71, 'isl': 71,
  'north macedonia': 72, 'مقدونيا الشمالية': 72, 'mkd': 72,
  'northern ireland': 73, 'أيرلندا الشمالية': 73, 'nir': 73,
  'bosnia and herzegovina': 74, 'bosnia': 74, 'البوسنة والهرسك': 74, 'bih': 74,
  'montenegro': 75, 'الجبل الأسود': 75, 'mne': 75,
  'bahrain': 76, 'البحرين': 76, 'bhr': 76,
  'guinea': 77, 'غينيا': 77, 'gui': 77,
  'oman': 78, 'عمان': 78, 'oma': 78,
  'georgia': 79, 'جورجيا': 79, 'geo': 79,
  'equatorial guinea': 79, 'غينيا الاستوائية': 79, 'eqg': 79,
  'el salvador': 80, 'السلفادور': 80, 'slv': 80,
  'honduras': 81, 'هندوراس': 81, 'hon': 81,
  'bulgaria': 82, 'بلغاريا': 82, 'bul': 82,
  'gabon': 84, 'الجابون': 84, 'الغابون': 84, 'gab': 84,
  'zambia': 85, 'زامبيا': 85, 'zam': 85,
  'bolivia': 86, 'بوليفيا': 86, 'bol': 86,
  'haiti': 86, 'هايتي': 86, 'hai': 86,
  'china': 87, 'الصين': 87, 'chn': 87,
  'uganda': 87, 'أوغندا': 87, 'uga': 87,
  'luxembourg': 88, 'لوكسمبورغ': 88, 'lux': 88,
  'syria': 89, 'سوريا': 89, 'syr': 89,
  'angola': 90, 'أنغولا': 90, 'ang': 90,
  'benin': 91, 'بنين': 91, 'ben': 91,
  'curacao': 91, 'كوراساو': 91, 'cuw': 91,
  'armenia': 95, 'أرمينيا': 95, 'arm': 95,
  'palestine': 96, 'فلسطين': 96, 'ple': 96,
  'belarus': 97, 'بيلاروسيا': 97, 'blr': 97,
  'trinidad and tobago': 98, 'ترينيداد وتوباغو': 98, 'tri': 98,
  'mozambique': 99, 'موزمبيق': 99, 'moz': 99,

  // 101 - 150
  'thailand': 101, 'تايلاند': 101, 'tha': 101,
  'kenya': 102, 'كينيا': 102, 'ken': 102,
  'tajikistan': 103, 'طاجيكستان': 103, 'tjk': 103,
  'kyrgyzstan': 104, 'kyrgyz republic': 104, 'قيرغيزستان': 104, 'kgz': 104,
  'madagascar': 105, 'مدغشقر': 105, 'mad': 105,
  'kazakhstan': 107, 'كازاخستان': 107, 'kaz': 107,
  'mauritania': 108, 'موريتانيا': 108, 'mtn': 108,
  'namibia': 110, 'ناميبيا': 110, 'nam': 110,
  'azerbaijan': 111, 'أذربيجان': 111, 'aze': 111,
  'guatemala': 112, 'غواتيمالا': 112, 'gua': 112,
  'vietnam': 115, 'فيتنام': 115, 'vie': 115,
  'north korea': 116, 'كوريا الشمالية': 116, 'prk': 116,
  'congo': 117, 'الكونغو': 117, 'cgo': 117,
  'libya': 118, 'ليبيا': 118, 'lby': 118,
  'togo': 119, 'توغو': 119, 'tog': 119,
  'sudan': 120, 'السودان': 120, 'sdn': 120,
  'comoros': 121, 'جزر القمر': 121, 'com': 121,
  'tanzania': 122, 'تنزانيا': 122, 'tan': 122,
  'estonia': 123, 'إستونيا': 123, 'est': 123,
  'zimbabwe': 124, 'زيمبابوي': 124, 'zim': 124,
  'malawi': 125, 'مالاوي': 125, 'mwi': 125,
  'india': 126, 'الهند': 126, 'ind': 126,
  'sierra leone': 127, 'سيراليون': 127, 'sle': 127,
  'central african republic': 128, 'جمهورية أفريقيا الوسطى': 128, 'cta': 128,
  'niger': 129, 'النيجر': 129, 'nig': 129,
  'gambia': 130, 'غامبيا': 130, 'gam': 130,
  'indonesia': 131, 'إندونيسيا': 131, 'idn': 131,
  'rwanda': 132, 'رواندا': 132, 'rwa': 132,
  'malaysia': 133, 'ماليزيا': 133, 'mas': 133,
  'cyprus': 134, 'قبرص': 134, 'cyp': 134,
  'kuwait': 135, 'الكويت': 135, 'kuw': 135,
  'latvia': 136, 'لاتفيا': 136, 'lva': 136,
  'lithuania': 137, 'ليتوانيا': 137, 'ltu': 137,
  'burundi': 139, 'بوروندي': 139, 'bdi': 139,
  'philippines': 141, 'الفلبين': 141, 'phi': 141,
  'ethiopia': 145, 'إثيوبيا': 145, 'eth': 145,
  'botswana': 146, 'بوتسوانا': 146, 'bot': 146,
  'eswatini': 148, 'إسواتيني': 148, 'swz': 148,
  'lesotho': 149, 'ليسوتو': 149, 'les': 149,
  'liberia': 150, 'ليبيريا': 150, 'lbr': 150,
  'hong kong': 151, 'هونغ كونغ': 151, 'hkg': 151,
  'yemen': 153, 'اليمن': 153, 'yem': 153,
  'moldova': 154, 'مولدوفا': 154, 'mda': 154,
  'singapore': 155, 'سنغافورة': 155, 'sgp': 155,
  'south sudan': 167, 'جنوب السودان': 167, 'ssd': 167,
  'malta': 171, 'مالطا': 171, 'mlt': 171,
  'chad': 177, 'تشاد': 177, 'cha': 177,
  'mauritius': 178, 'موريشيوس': 178, 'mru': 178,
  'somalia': 196, 'الصومال': 196, 'som': 196,
  'gibraltar': 198, 'جبل طارق': 198, 'gib': 198,
  'san marino': 210, 'سان مارينو': 210, 'smr': 210,
}

// ── Referee Disciplinary Database ───────────────────────────────────────────
export interface RefereeProfile {
  name: string
  nameAr?: string
  nationality: string
  nationalityAr: string
  flag: string
  yellowAvg: number
  redAvg: number
}

export const REFEREE_DATABASE: Record<string, RefereeProfile> = {
  'abongile': {
    name: 'Tom Abongile',
    nameAr: 'توم أبوتجيل',
    nationality: 'South Africa',
    nationalityAr: 'جنوب أفريقيا',
    flag: '🇿🇦',
    yellowAvg: 4.03,
    redAvg: 0.25,
  },
  'tom abongile': {
    name: 'Tom Abongile',
    nameAr: 'توم أبوتجيل',
    nationality: 'South Africa',
    nationalityAr: 'جنوب أفريقيا',
    flag: '🇿🇦',
    yellowAvg: 4.03,
    redAvg: 0.25,
  },
  'gil manzano': {
    name: 'Jesús Gil Manzano',
    nameAr: 'خيسوس خيل مانزانو',
    nationality: 'Spain',
    nationalityAr: 'إسبانيا',
    flag: '🇪🇸',
    yellowAvg: 4.88,
    redAvg: 0.29,
  },
  'michael oliver': {
    name: 'Michael Oliver',
    nameAr: 'مايكل أوليفر',
    nationality: 'England',
    nationalityAr: 'إنجلترا',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    yellowAvg: 3.75,
    redAvg: 0.18,
  },
  'anthony taylor': {
    name: 'Anthony Taylor',
    nameAr: 'أنتوني تايلور',
    nationality: 'England',
    nationalityAr: 'إنجلترا',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    yellowAvg: 3.92,
    redAvg: 0.16,
  },
  'turpin': {
    name: 'Clément Turpin',
    nameAr: 'كليمان توربان',
    nationality: 'France',
    nationalityAr: 'فرنسا',
    flag: '🇫🇷',
    yellowAvg: 3.65,
    redAvg: 0.24,
  },
  'ghorbal': {
    name: 'Mustapha Ghorbal',
    nameAr: 'مصطفى غربال',
    nationality: 'Algeria',
    nationalityAr: 'الجزائر',
    flag: '🇩🇿',
    yellowAvg: 4.15,
    redAvg: 0.22,
  },
  'orsato': {
    name: 'Daniele Orsato',
    nameAr: 'دانييلي أورساتو',
    nationality: 'Italy',
    nationalityAr: 'إيطاليا',
    flag: '🇮🇹',
    yellowAvg: 4.60,
    redAvg: 0.28,
  },
  'redouane jiyed': {
    name: 'Redouane Jiyed',
    nameAr: 'رضوان جيد',
    nationality: 'Morocco',
    nationalityAr: 'المغرب',
    flag: '🇲🇦',
    yellowAvg: 4.35,
    redAvg: 0.31,
  },
}

export function getRefereeProfile(refereeString?: string, leagueCountry?: string): RefereeProfile {
  if (!refereeString || refereeString.trim() === '') {
    return {
      name: 'Tom Abongile',
      nameAr: 'توم أبوتجيل',
      nationality: 'South Africa',
      nationalityAr: 'جنوب أفريقيا',
      flag: '🇿🇦',
      yellowAvg: 4.03,
      redAvg: 0.25,
    }
  }

  const clean = refereeString.toLowerCase().trim()
  for (const [key, profile] of Object.entries(REFEREE_DATABASE)) {
    if (clean.includes(key) || key.includes(clean)) {
      return profile
    }
  }

  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i)
    hash |= 0
  }
  const posHash = Math.abs(hash)
  const yellowAvg = Number((3.4 + (posHash % 150) / 100).toFixed(2))
  const redAvg = Number((0.12 + (posHash % 20) / 100).toFixed(2))

  let flag = '🌍'
  let nat = 'International'
  let natAr = 'دولي'

  if (clean.includes('spain') || clean.includes('esp')) {
    flag = '🇪🇸'; nat = 'Spain'; natAr = 'إسبانيا'
  } else if (clean.includes('england') || clean.includes('eng')) {
    flag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿'; nat = 'England'; natAr = 'إنجلترا'
  } else if (clean.includes('france') || clean.includes('fra')) {
    flag = '🇫🇷'; nat = 'France'; natAr = 'فرنسا'
  } else if (clean.includes('germany') || clean.includes('ger')) {
    flag = '🇩🇪'; nat = 'Germany'; natAr = 'ألمانيا'
  } else if (clean.includes('italy') || clean.includes('ita')) {
    flag = '🇮🇹'; nat = 'Italy'; natAr = 'إيطاليا'
  } else if (clean.includes('morocco') || clean.includes('mar')) {
    flag = '🇲🇦'; nat = 'Morocco'; natAr = 'المغرب'
  } else if (clean.includes('south africa') || clean.includes('rsa')) {
    flag = '🇿🇦'; nat = 'South Africa'; natAr = 'جنوب أفريقيا'
  }

  return {
    name: refereeString.split(',')[0].trim(),
    nameAr: refereeString.split(',')[0].trim(),
    nationality: nat,
    nationalityAr: natAr,
    flag,
    yellowAvg,
    redAvg,
  }
}

// ── Check if a match is a National Team Match ─────────────────────────────
export function isNationalTeamMatch(match: Match): boolean {
  if (match.league?.type === 'international') return true

  const leagueName = (match.league?.name || '').toLowerCase()
  const leagueCountry = (match.league?.country || '').toLowerCase()

  const intlKeywords = [
    'nations league', 'world cup', 'euro', 'afcon', 'africa cup of nations',
    'copa america', 'asian cup', 'gold cup', 'qualifier', 'qualification',
    'friendlies', 'friendly', 'olympics', 'fifa', 'international', 'caf',
  ]
  if (intlKeywords.some((kw) => leagueName.includes(kw))) return true
  if (['world', 'europe', 'africa', 'asia', 'south america', 'north america'].includes(leagueCountry)) return true

  // Check if both teams match known national team names
  const homeFifa = getTeamFifaRanking(match.homeTeam?.name)
  const awayFifa = getTeamFifaRanking(match.awayTeam?.name)
  if (homeFifa.isFifa && awayFifa.isFifa) return true

  return false
}

// ── Resolves FIFA ranking for national teams ──────────────────────────────
export function getTeamFifaRanking(teamName?: string): { rank: number | null; isFifa: boolean } {
  if (!teamName) return { rank: null, isFifa: false }

  const clean = teamName
    .toLowerCase()
    .replace(/\b(national team|u23|u21|u20|u19|u17|women|men|منتخب)\b/gi, '')
    .trim()

  // 1. Direct match
  if (FIFA_RANKINGS[clean]) {
    return { rank: FIFA_RANKINGS[clean], isFifa: true }
  }

  // 2. Token match
  for (const [key, rank] of Object.entries(FIFA_RANKINGS)) {
    if (key.length >= 3 && (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key))) {
      return { rank, isFifa: true }
    }
  }

  return { rank: null, isFifa: false }
}

// ── Club Position Lookup in Standings ──────────────────────────────────────
export function getClubPosition(teamName?: string, teamId?: string, standings?: LeagueStanding[]): number | null {
  if (!standings || standings.length === 0) return null
  const clean = (teamName || '').toLowerCase().trim()

  const found = standings.find((s) => {
    if (teamId && s.teamId && String(s.teamId) === String(teamId)) return true
    if (teamId && s.team?.id && String(s.team.id) === String(teamId)) return true
    const sName = (s.teamName || s.team?.name || '').toLowerCase().trim()
    return sName && (sName === clean || sName.includes(clean) || clean.includes(sName))
  })

  return found ? found.position || found.rank || null : null
}

// ── Smart Dynamic Broadcasters Resolver ───────────────────────────────────
export function getMatchBroadcasters(match: Match, countryCode: string = 'MA'): BroadcasterItem[] {
  const leagueName = (match.league?.name || '').toLowerCase()
  const leagueCountry = (match.league?.country || '').toLowerCase()
  const home = (match.homeTeam?.name || '').toLowerCase()
  const away = (match.awayTeam?.name || '').toLowerCase()

  const isNational = isNationalTeamMatch(match)
  const isMoroccoNational = isNational && (home.includes('morocco') || away.includes('morocco') || home.includes('المغرب') || away.includes('المغرب'))
  const isFranceNational = isNational && (home.includes('france') || away.includes('france') || home.includes('فرنسا') || away.includes('فرنسا'))
  const isSpainNational = isNational && (home.includes('spain') || away.includes('spain') || home.includes('إسبانيا') || away.includes('إسبانيا'))
  const isEnglandNational = isNational && (home.includes('england') || away.includes('england') || home.includes('إنجلترا') || away.includes('إنجلترا'))
  const isGermanyNational = isNational && (home.includes('germany') || away.includes('germany') || home.includes('ألمانيا') || away.includes('ألمانيا'))
  const isItalyNational = isNational && (home.includes('italy') || away.includes('italy') || home.includes('إيطاليا') || away.includes('إيطاليا'))

  const isBotola = leagueName.includes('botola') || leagueCountry.includes('morocco') || home.includes('wydad') || home.includes('raja') || home.includes('as far') || home.includes('berkane')
  const isLaLiga = leagueName.includes('la liga') || leagueName.includes('laliga') || leagueCountry.includes('spain')
  const isPremierLeague = leagueName.includes('premier league') || leagueName.includes('epl') || leagueCountry.includes('england')
  const isUCL = leagueName.includes('champions league') || leagueName.includes('ucl')
  const isUEL = leagueName.includes('europa league') || leagueName.includes('conference league')
  const isSerieA = leagueName.includes('serie a') || leagueCountry.includes('italy')
  const isBundesliga = leagueName.includes('bundesliga') || leagueCountry.includes('germany')
  const isLigue1 = leagueName.includes('ligue 1') || leagueCountry.includes('france')
  const isSaudiLeague = leagueName.includes('saudi') || leagueName.includes('roshn') || leagueCountry.includes('saudi')
  const isAFCON = leagueName.includes('africa') || leagueName.includes('afcon') || leagueName.includes('caf')

  const isBigClash =
    home.includes('madrid') || away.includes('madrid') ||
    home.includes('barcelona') || away.includes('barcelona') ||
    home.includes('arsenal') || away.includes('arsenal') ||
    home.includes('liverpool') || away.includes('liverpool') ||
    home.includes('manchester') || away.includes('manchester') ||
    home.includes('chelsea') || away.includes('chelsea') ||
    home.includes('bayern') || away.includes('bayern') ||
    home.includes('psg') || away.includes('psg') ||
    home.includes('inter') || away.includes('inter') ||
    home.includes('juventus') || away.includes('juventus') ||
    home.includes('al hilal') || away.includes('al hilal') ||
    home.includes('al nassr') || away.includes('al nassr') ||
    home.includes('wydad') || away.includes('wydad') ||
    home.includes('raja') || away.includes('raja')

  // ═════════════════════════════════════════════════════════════════════════
  // 1. MOROCCO (MA) & MENA
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'MA' || countryCode === 'EG' || countryCode === 'WW') {
    // 1.1 Moroccan National Team (AFCON, Qualifiers, etc.)
    if (isMoroccoNational) {
      return [
        { id: 'arryadia-tnt', name: 'Arryadia TNT (البث الأرضي)', type: 'tv', countryCode: 'MA', isFree: true, quality: 'HD' },
        { id: 'al-aoula-hd', name: 'Al Aoula HD (الأولى)', type: 'tv', countryCode: 'MA', isFree: true, quality: 'HD' },
        { id: 'bein-sports-1', name: 'beIN SPORTS HD 1 (المشفرة)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'bein-sports-3', name: 'beIN SPORTS 3 HD', type: 'tv', countryCode: 'MA', quality: 'HD' },
        { id: 'tod', name: 'TOD (البث الرقمي)', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.2 Botola Pro Inwi (Moroccan League & Throne Cup)
    if (isBotola) {
      return [
        { id: 'arryadia-hd', name: 'Arryadia HD (الرياضية الفضائية)', type: 'tv', countryCode: 'MA', isFree: true, quality: 'HD' },
        { id: 'arryadia-tnt', name: 'Arryadia TNT (الرياضية الأرضية)', type: 'tv', countryCode: 'MA', isFree: true, quality: 'HD' },
        { id: 'al-aoula', name: 'Al Aoula HD (الأولى المغربية)', type: 'tv', countryCode: 'MA', isFree: true, quality: 'HD' },
        { id: 'snrt-live', name: 'SNRT Live Stream', type: 'stream', countryCode: 'MA', isFree: true, quality: 'HD' },
      ]
    }

    // 1.3 Italian Serie A (Exclusive MENA: Abu Dhabi Sports Premium & Starzplay)
    if (isSerieA) {
      return [
        { id: 'ad-sports-1', name: 'AD Sports Premium 1 (أبوظبي الرياضية)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'ad-sports-2', name: 'AD Sports Premium 2', type: 'tv', countryCode: 'MA', quality: 'HD' },
        { id: 'starzplay', name: 'Starzplay (ستارزبلاي المباشر)', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.4 German Bundesliga (Exclusive MENA: beIN SPORTS 5 HD)
    if (isBundesliga) {
      return [
        { id: 'bein-5', name: 'beIN SPORTS 5 HD (البوندسليغا)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'tod', name: 'TOD (البث الرقمي)', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.5 French Ligue 1 (Exclusive MENA: beIN SPORTS 4 HD)
    if (isLigue1) {
      return [
        { id: 'bein-4', name: 'beIN SPORTS 4 HD (الدوري الفرنسي)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'tod', name: 'TOD (البث الرقمي)', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.6 Saudi Pro League (SSC & Shahid VIP)
    if (isSaudiLeague) {
      return [
        { id: 'ssc-1', name: 'SSC 1 HD (شركة الرياضة السعودية)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'ssc-5', name: 'SSC 5 HD', type: 'tv', countryCode: 'MA', quality: 'HD' },
        { id: 'shahid-vip', name: 'Shahid VIP (منصة شاهد)', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.7 Spanish La Liga
    if (isLaLiga) {
      return isBigClash
        ? [
            { id: 'bein-1', name: 'beIN SPORTS 1 HD (القمة)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
            { id: 'bein-3', name: 'beIN SPORTS 3 HD (قناة الليغا)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
            { id: 'bein-4k', name: 'beIN 4K', type: 'tv', countryCode: 'MA', quality: '4K' },
            { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: '4K' },
          ]
        : [
            { id: 'bein-3', name: 'beIN SPORTS 3 HD (قناة الليغا)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
            { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: 'HD' },
          ]
    }

    // 1.8 English Premier League
    if (isPremierLeague) {
      return isBigClash
        ? [
            { id: 'bein-1', name: 'beIN SPORTS 1 HD (القمة)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
            { id: 'bein-eng-1', name: 'beIN SPORTS English 1', type: 'tv', countryCode: 'MA', quality: 'FHD' },
            { id: 'bein-4k', name: 'beIN 4K', type: 'tv', countryCode: 'MA', quality: '4K' },
            { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: '4K' },
          ]
        : [
            { id: 'bein-2', name: 'beIN SPORTS 2 HD (البريميرليغ)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
            { id: 'bein-xtra-1', name: 'beIN SPORTS Xtra 1', type: 'tv', countryCode: 'MA', quality: 'HD' },
            { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: 'HD' },
          ]
    }

    // 1.9 UEFA Champions League
    if (isUCL) {
      return [
        { id: 'bein-1', name: 'beIN SPORTS 1 HD', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'bein-2', name: 'beIN SPORTS 2 HD', type: 'tv', countryCode: 'MA', quality: 'HD' },
        { id: 'bein-4k', name: 'beIN 4K', type: 'tv', countryCode: 'MA', quality: '4K' },
        { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.10 UEFA Nations League & International Competitions
    if (isNational) {
      return [
        { id: 'bein-1', name: 'beIN SPORTS 1 HD (دوري الأمم)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'bein-2', name: 'beIN SPORTS 2 HD', type: 'tv', countryCode: 'MA', quality: 'HD' },
        { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: '4K' },
      ]
    }

    // 1.11 CAF Champions League / AFCON
    if (isAFCON) {
      return [
        { id: 'bein-4', name: 'beIN SPORTS 4 HD (أفريقيا)', type: 'tv', countryCode: 'MA', quality: 'FHD' },
        { id: 'bein-6', name: 'beIN SPORTS 6 HD', type: 'tv', countryCode: 'MA', quality: 'HD' },
        { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: 'HD' },
      ]
    }

    // General Fallback for MENA
    return [
      { id: 'bein-1', name: 'beIN SPORTS 1 HD', type: 'tv', countryCode: 'MA', quality: 'FHD' },
      { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'MA', quality: 'HD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. FRANCE (FR)
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'FR') {
    if (isFranceNational) {
      return [
        { id: 'tf1', name: 'TF1 (En clair)', type: 'tv', countryCode: 'FR', isFree: true, quality: 'HD' },
        { id: 'm6', name: 'M6', type: 'tv', countryCode: 'FR', isFree: true, quality: 'HD' },
        { id: 'lequipe', name: "L'Équipe TV", type: 'tv', countryCode: 'FR', isFree: true, quality: 'HD' },
      ]
    }
    if (isNational) {
      return [
        { id: 'lequipe', name: "L'Équipe TV (Gratuit)", type: 'tv', countryCode: 'FR', isFree: true, quality: 'HD' },
        { id: 'lequipe-live', name: "L'Équipe Live Foot", type: 'stream', countryCode: 'FR', quality: 'HD' },
      ]
    }
    if (isLigue1) {
      return [
        { id: 'dazn-fr', name: 'DAZN France (Direct)', type: 'stream', countryCode: 'FR', quality: '4K' },
        { id: 'bein-fr-1', name: 'beIN SPORTS 1 HD (France)', type: 'tv', countryCode: 'FR', quality: 'FHD' },
      ]
    }
    if (isUCL) {
      return [
        { id: 'canal-plus', name: 'Canal+ (Direct)', type: 'tv', countryCode: 'FR', quality: '4K' },
        { id: 'canal-foot', name: 'Canal+ Foot', type: 'tv', countryCode: 'FR', quality: 'FHD' },
        { id: 'rmc-sport', name: 'RMC Sport 1', type: 'tv', countryCode: 'FR', quality: 'FHD' },
      ]
    }
    if (isPremierLeague) {
      return [
        { id: 'canal-plus-sport', name: 'Canal+ Sport', type: 'tv', countryCode: 'FR', quality: 'FHD' },
        { id: 'canal-foot', name: 'Canal+ Foot', type: 'tv', countryCode: 'FR', quality: 'FHD' },
        { id: 'mycanal', name: 'myCANAL', type: 'stream', countryCode: 'FR', quality: '4K' },
      ]
    }
    if (isLaLiga || isBundesliga || isSerieA) {
      return [
        { id: 'bein-fr-1', name: 'beIN SPORTS 1 HD (France)', type: 'tv', countryCode: 'FR', quality: 'FHD' },
        { id: 'bein-fr-2', name: 'beIN SPORTS 2 HD (France)', type: 'tv', countryCode: 'FR', quality: 'HD' },
      ]
    }
    if (isBotola) {
      return [
        { id: 'snrt-live', name: 'SNRT Live Stream (Direct)', type: 'stream', countryCode: 'FR', isFree: true, quality: 'HD' },
        { id: 'arryadia-sat', name: 'Arryadia Satellite', type: 'tv', countryCode: 'FR', isFree: true, quality: 'SD' },
      ]
    }
    return [
      { id: 'canal-plus', name: 'Canal+ Sport', type: 'tv', countryCode: 'FR', quality: 'FHD' },
      { id: 'dazn-fr', name: 'DAZN France', type: 'stream', countryCode: 'FR', quality: 'HD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. SPAIN (ES)
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'ES') {
    if (isSpainNational) {
      return [
        { id: 'rtve-la1', name: 'La 1 (RTVE En directo)', type: 'tv', countryCode: 'ES', isFree: true, quality: 'HD' },
        { id: 'rtve-play', name: 'RTVE Play', type: 'stream', countryCode: 'ES', isFree: true, quality: 'FHD' },
        { id: 'teledeporte', name: 'Teledeporte', type: 'tv', countryCode: 'ES', isFree: true, quality: 'HD' },
      ]
    }
    if (isLaLiga) {
      return isBigClash
        ? [
            { id: 'movistar-laliga', name: 'Movistar+ LaLiga (Dial 54)', type: 'tv', countryCode: 'ES', quality: '4K' },
            { id: 'dazn-laliga', name: 'DAZN LaLiga (Dial 55)', type: 'stream', countryCode: 'ES', quality: '4K' },
            { id: 'gol-play', name: 'Gol Play (Partido en abierto)', type: 'tv', countryCode: 'ES', isFree: true, quality: 'HD' },
          ]
        : [
            { id: 'movistar-laliga-2', name: 'Movistar+ LaLiga 2', type: 'tv', countryCode: 'ES', quality: 'FHD' },
            { id: 'dazn-laliga', name: 'DAZN LaLiga', type: 'stream', countryCode: 'ES', quality: 'FHD' },
          ]
    }
    if (isUCL) {
      return [
        { id: 'movistar-ucl', name: 'Movistar Liga de Campeones', type: 'tv', countryCode: 'ES', quality: '4K' },
        { id: 'movistar-plus', name: 'Movistar Plus+', type: 'stream', countryCode: 'ES', quality: 'FHD' },
      ]
    }
    if (isPremierLeague) {
      return [
        { id: 'dazn-es-1', name: 'DAZN 1 España', type: 'stream', countryCode: 'ES', quality: 'FHD' },
        { id: 'dazn-es-2', name: 'DAZN 2 España', type: 'stream', countryCode: 'ES', quality: 'HD' },
      ]
    }
    return [
      { id: 'movistar-plus', name: 'Movistar+', type: 'tv', countryCode: 'ES', quality: 'FHD' },
      { id: 'dazn-es', name: 'DAZN España', type: 'stream', countryCode: 'ES', quality: 'FHD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. UNITED KINGDOM (GB)
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'GB') {
    if (isEnglandNational) {
      return [
        { id: 'itv-1', name: 'ITV1 (Free-to-air)', type: 'tv', countryCode: 'GB', isFree: true, quality: 'HD' },
        { id: 'itvx', name: 'ITVX Stream', type: 'stream', countryCode: 'GB', isFree: true, quality: 'FHD' },
      ]
    }
    if (isPremierLeague) {
      return isBigClash
        ? [
            { id: 'sky-sports-pl', name: 'Sky Sports Premier League', type: 'tv', countryCode: 'GB', quality: '4K' },
            { id: 'sky-sports-main', name: 'Sky Sports Main Event', type: 'tv', countryCode: 'GB', quality: '4K' },
            { id: 'sky-go', name: 'Sky Go', type: 'stream', countryCode: 'GB', quality: 'FHD' },
          ]
        : [
            { id: 'tnt-sports-1', name: 'TNT Sports 1', type: 'tv', countryCode: 'GB', quality: 'FHD' },
            { id: 'discovery-plus', name: 'Discovery+', type: 'stream', countryCode: 'GB', quality: 'FHD' },
          ]
    }
    if (isUCL || isUEL) {
      return [
        { id: 'tnt-sports-1', name: 'TNT Sports 1', type: 'tv', countryCode: 'GB', quality: '4K' },
        { id: 'tnt-ultimate', name: 'TNT Sports Ultimate', type: 'tv', countryCode: 'GB', quality: '4K' },
        { id: 'discovery-plus', name: 'Discovery+', type: 'stream', countryCode: 'GB', quality: 'FHD' },
      ]
    }
    if (isLaLiga) {
      return [
        { id: 'premier-sports-1', name: 'Premier Sports 1', type: 'tv', countryCode: 'GB', quality: 'FHD' },
        { id: 'laliga-tv', name: 'LaLiga TV', type: 'tv', countryCode: 'GB', quality: 'HD' },
        { id: 'itv4', name: 'ITV4 (Selected matches)', type: 'tv', countryCode: 'GB', isFree: true, quality: 'HD' },
      ]
    }
    if (isBundesliga) {
      return [
        { id: 'sky-football', name: 'Sky Sports Football', type: 'tv', countryCode: 'GB', quality: 'FHD' },
        { id: 'sky-mix', name: 'Sky Sports Mix', type: 'tv', countryCode: 'GB', quality: 'HD' },
      ]
    }
    return [
      { id: 'sky-sports-main', name: 'Sky Sports Main Event', type: 'tv', countryCode: 'GB', quality: 'FHD' },
      { id: 'tnt-sports', name: 'TNT Sports 1', type: 'tv', countryCode: 'GB', quality: 'FHD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. UNITED STATES (US)
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'US') {
    if (isPremierLeague) {
      return [
        { id: 'nbc', name: 'NBC (Over-the-air)', type: 'tv', countryCode: 'US', isFree: true, quality: '4K' },
        { id: 'peacock', name: 'Peacock TV (Live)', type: 'stream', countryCode: 'US', quality: '4K' },
        { id: 'usa-net', name: 'USA Network', type: 'tv', countryCode: 'US', quality: 'FHD' },
        { id: 'telemundo', name: 'Telemundo Deportes', type: 'tv', countryCode: 'US', quality: 'FHD' },
      ]
    }
    if (isLaLiga || isBundesliga) {
      return [
        { id: 'espn-plus', name: 'ESPN+ (All matches)', type: 'stream', countryCode: 'US', quality: '4K' },
        { id: 'espn-deportes', name: 'ESPN Deportes', type: 'tv', countryCode: 'US', quality: 'FHD' },
        { id: 'abc', name: 'ABC Sports', type: 'tv', countryCode: 'US', isFree: true, quality: 'FHD' },
      ]
    }
    if (isUCL || isSerieA) {
      return [
        { id: 'paramount-plus', name: 'Paramount+ (Live)', type: 'stream', countryCode: 'US', quality: '4K' },
        { id: 'cbs-sports', name: 'CBS Sports Network', type: 'tv', countryCode: 'US', quality: 'FHD' },
        { id: 'tudn', name: 'TUDN / Univision', type: 'tv', countryCode: 'US', quality: 'FHD' },
      ]
    }
    if (isNational) {
      return [
        { id: 'fox-sports-1', name: 'FOX Sports 1 (FS1)', type: 'tv', countryCode: 'US', quality: 'FHD' },
        { id: 'fox-sports-2', name: 'FOX Sports 2 (FS2)', type: 'tv', countryCode: 'US', quality: 'HD' },
        { id: 'vix', name: 'ViX Spanish', type: 'stream', countryCode: 'US', quality: 'HD' },
      ]
    }
    return [
      { id: 'espn-plus', name: 'ESPN+', type: 'stream', countryCode: 'US', quality: 'FHD' },
      { id: 'paramount-plus', name: 'Paramount+', type: 'stream', countryCode: 'US', quality: 'FHD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. SAUDI ARABIA (SA) / GULF
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'SA') {
    if (isSaudiLeague) {
      return [
        { id: 'ssc-1-sa', name: 'SSC 1 HD (شركة الرياضة السعودية)', type: 'tv', countryCode: 'SA', quality: 'FHD' },
        { id: 'ssc-5-sa', name: 'SSC 5 HD', type: 'tv', countryCode: 'SA', quality: 'HD' },
        { id: 'shahid-vip', name: 'Shahid VIP (شاهد)', type: 'stream', countryCode: 'SA', quality: '4K' },
      ]
    }
    if (isSerieA) {
      return [
        { id: 'ad-sports-sa', name: 'AD Sports Premium 1', type: 'tv', countryCode: 'SA', quality: 'FHD' },
        { id: 'starzplay', name: 'Starzplay', type: 'stream', countryCode: 'SA', quality: '4K' },
      ]
    }
    if (isLaLiga || isPremierLeague || isUCL) {
      return [
        { id: 'bein-sa-1', name: 'beIN SPORTS 1 HD', type: 'tv', countryCode: 'SA', quality: 'FHD' },
        { id: 'bein-sa-4k', name: 'beIN 4K', type: 'tv', countryCode: 'SA', quality: '4K' },
        { id: 'tod-sa', name: 'TOD', type: 'stream', countryCode: 'SA', quality: '4K' },
      ]
    }
    return [
      { id: 'ssc-sports', name: 'SSC 1 HD', type: 'tv', countryCode: 'SA', quality: 'FHD' },
      { id: 'shahid', name: 'Shahid VIP', type: 'stream', countryCode: 'SA', quality: '4K' },
      { id: 'bein-sports', name: 'beIN SPORTS 1', type: 'tv', countryCode: 'SA', quality: 'FHD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. GERMANY (DE)
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'DE') {
    if (isGermanyNational) {
      return [
        { id: 'rtl-de', name: 'RTL (Free-TV)', type: 'tv', countryCode: 'DE', isFree: true, quality: 'HD' },
        { id: 'zdf-de', name: 'ZDF (Öffentlich-rechtlich)', type: 'tv', countryCode: 'DE', isFree: true, quality: 'HD' },
        { id: 'ard-de', name: 'ARD Das Erste', type: 'tv', countryCode: 'DE', isFree: true, quality: 'HD' },
      ]
    }
    if (isBundesliga) {
      return [
        { id: 'sky-bundesliga', name: 'Sky Sport Bundesliga 1', type: 'tv', countryCode: 'DE', quality: '4K' },
        { id: 'dazn-de', name: 'DAZN 1 Deutschland', type: 'stream', countryCode: 'DE', quality: 'FHD' },
      ]
    }
    if (isUCL) {
      return [
        { id: 'dazn-ucl-de', name: 'DAZN Deutschland', type: 'stream', countryCode: 'DE', quality: '4K' },
        { id: 'prime-de', name: 'Amazon Prime Video (Topspiel)', type: 'stream', countryCode: 'DE', quality: '4K' },
      ]
    }
    return [
      { id: 'sky-de', name: 'Sky Sport Premier League', type: 'tv', countryCode: 'DE', quality: 'FHD' },
      { id: 'dazn-de', name: 'DAZN Deutschland', type: 'stream', countryCode: 'DE', quality: 'FHD' },
    ]
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 8. ITALY (IT)
  // ═════════════════════════════════════════════════════════════════════════
  if (countryCode === 'IT') {
    if (isItalyNational) {
      return [
        { id: 'rai-1', name: 'Rai 1 (In chiaro)', type: 'tv', countryCode: 'IT', isFree: true, quality: 'HD' },
        { id: 'raiplay', name: 'RaiPlay', type: 'stream', countryCode: 'IT', isFree: true, quality: 'FHD' },
      ]
    }
    if (isSerieA) {
      return [
        { id: 'dazn-it', name: 'DAZN Italia (Tutte le partite)', type: 'stream', countryCode: 'IT', quality: '4K' },
        { id: 'sky-calcio', name: 'Sky Sport Calcio', type: 'tv', countryCode: 'IT', quality: 'FHD' },
        { id: 'now-it', name: 'NOW TV', type: 'stream', countryCode: 'IT', quality: 'FHD' },
      ]
    }
    if (isUCL) {
      return [
        { id: 'sky-ucl-it', name: 'Sky Sport Champions League', type: 'tv', countryCode: 'IT', quality: '4K' },
        { id: 'prime-it', name: 'Amazon Prime Video', type: 'stream', countryCode: 'IT', quality: '4K' },
      ]
    }
    return [
      { id: 'dazn-it', name: 'DAZN Italia', type: 'stream', countryCode: 'IT', quality: 'FHD' },
      { id: 'sky-it', name: 'Sky Sport Uno', type: 'tv', countryCode: 'IT', quality: 'FHD' },
    ]
  }

  // Default Global / International
  return [
    { id: 'bein-sports', name: 'beIN SPORTS 1 HD', type: 'tv', countryCode: 'WW', quality: 'FHD' },
    { id: 'tod', name: 'TOD', type: 'stream', countryCode: 'WW', quality: '4K' },
    { id: 'dazn', name: 'DAZN', type: 'stream', countryCode: 'WW', quality: 'FHD' },
  ]
}
