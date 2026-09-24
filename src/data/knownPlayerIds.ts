/**
 * Known API-Football Player IDs
 * ──────────────────────────────
 * Maps player slugs and name variations to their official API-Football numeric IDs.
 * Used for exact season stats lookups and official high-resolution player photos.
 */
export const KNOWN_API_PLAYER_IDS: Record<string, string> = {
  // FC Barcelona
  'lamine-yamal': '386828',
  'yamal': '386828',
  '386828': '386828',
  'robert-lewandowski': '521',
  'lewandowski': '521',
  '521': '521',
  'raphinha': '1496',
  '1496': '1496',
  'pedri': '133609',
  '133609': '133609',
  'gavi': '284322',
  'pablo-gavi': '284322',
  'dani-olmo': '1218',
  'olmo': '1218',
  'pau-cubarsi': '390892',
  'cubarsi': '390892',
  'fermin-lopez': '361407',
  'fermin': '361407',
  'marc-casado': '361408',
  'casado': '361408',
  'alejandro-balde': '183917',
  'balde': '183917',
  'inigo-martinez': '47498',
  'jules-kounde': '1179',
  'kounde': '1179',
  'frenkie-de-jong': '502',
  'de-jong': '502',
  'ferran-torres': '882',
  'torres': '882',
  'wojciech-szczesny': '272',
  'szczesny': '272',
  'marc-andre-ter-stegen': '127',
  'ter-stegen': '127',
  'ronald-araujo': '138822',
  'araujo': '138822',

  // Real Madrid
  'kylian-mbappe': '278',
  'mbappe': '278',
  '278': '278',
  'vinicius-junior': '762',
  'vinicius-jr': '762',
  'vinicius': '762',
  '762': '762',
  'jude-bellingham': '129718',
  'bellingham': '129718',
  '129718': '129718',
  'rodrygo': '759',
  'federico-valverde': '758',
  'valverde': '758',
  'luka-modric': '754',
  'modric': '754',
  'eduardo-camavinga': '138806',
  'camavinga': '138806',
  'aurelien-tchouameni': '21586',
  'tchouameni': '21586',
  'antonio-rudiger': '738',
  'rudiger': '738',
  'eder-militao': '742',
  'militao': '742',
  'thibaut-courtois': '730',
  'courtois': '730',
  'brahim-diaz': '757',
  'endrick': '341050',
  'arda-guler': '304313',
  'guler': '304313',

  // Manchester City
  'erling-haaland': '1100',
  'haaland': '1100',
  '1100': '1100',
  'kevin-de-bruyne': '629',
  'de-bruyne': '629',
  'phil-foden': '631',
  'foden': '631',
  'rodri': '44',
  '44': '44',
  'bernardo-silva': '635',
  'ruben-dias': '567',
  'josko-gvardiol': '128867',
  'gvardiol': '128867',

  // Arsenal
  'bukayo-saka': '1460',
  'saka': '1460',
  '1460': '1460',
  'martin-odegaard': '371',
  'odegaard': '371',
  'declan-rice': '293',
  'rice': '293',
  'kai-havertz': '907',
  'havertz': '907',
  'william-saliba': '1277',
  'saliba': '1277',
  'gabriel-magalhaes': '22090',

  // Liverpool
  'mohamed-salah': '306',
  'salah': '306',
  '306': '306',
  'virgil-van-dijk': '290',
  'van-dijk': '290',
  'trent-alexander-arnold': '283',
  'alexander-arnold': '283',
  'luis-diaz': '2476',
  'cody-gakpo': '2489',
  'gakpo': '2489',
  'darwin-nunez': '116117',
  'nunez': '116117',
  'alexis-mac-allister': '6716',
  'mac-allister': '6716',
  'dominik-szoboszlai': '1099',
  'alisson': '280',

  // Chelsea
  'cole-palmer': '152982',
  'palmer': '152982',
  '152982': '152982',
  'nicolas-jackson': '284242',
  'jackson': '284242',
  'enzo-fernandez': '5996',
  'moises-caicedo': '56628',

  // Bayern Munich
  'harry-kane': '184',
  'kane': '184',
  '184': '184',
  'jamal-musiala': '161907',
  'musiala': '161907',
  'michael-olise': '158694',
  'olise': '158694',
  'leroy-sane': '633',
  'sane': '633',
  'alphonso-davies': '1168',
  'davies': '1168',

  // Bayer Leverkusen
  'florian-wirtz': '161928',
  'wirtz': '161928',
  'jeremie-frimpong': '80171',
  'frimpong': '80171',

  // PSG
  'achraf-hakimi': '9',
  'hakimi': '9',
  '9': '9',
  'ousmane-dembele': '153',
  'dembele': '153',
  'bradley-barcola': '292026',
  'barcola': '292026',
  'vitinha': '41621',
  'marquinhos': '253',

  // Inter & Serie A
  'lautaro-martinez': '2842',
  'lautaro': '2842',
  'marcus-thuram': '21010',
  'nicolo-barella': '30776',
  'hakan-calhanoglu': '1580',
  'victor-osimhen': '33519',
  'khvicha-kvaratskhelia': '157052',

  // Other Global Icons
  'cristiano-ronaldo': '874',
  'ronaldo': '874',
  'cr7': '874',
  'lionel-messi': '154',
  'messi': '154',
  'antoine-griezmann': '244',
  'griezmann': '244',
  'heung-min-son': '186',
  'son': '186',
  'bruno-fernandes': '1485',
  'fernandes': '1485',
  'marcus-rashford': '909',
  'rashford': '909',
  'aleksander-isak': '2005',
  'isak': '2005',
  'ollie-watkins': '19194',
  'watkins': '19194',
}

/**
 * Resolves a player identifier (slug, ID, or name) to a verified API-Football numeric ID.
 */
export function resolveApiFootballPlayerId(identifier?: string | number): string | null {
  if (!identifier) return null
  const str = String(identifier).toLowerCase().trim()

  // Purely numeric ID
  if (/^\d+$/.test(str)) {
    return str
  }

  // Known dictionary lookup
  if (KNOWN_API_PLAYER_IDS[str]) {
    return KNOWN_API_PLAYER_IDS[str]
  }

  // Clean slug
  const cleanSlug = str.replace(/[^\w-]/g, '').replace(/\s+/g, '-')
  if (KNOWN_API_PLAYER_IDS[cleanSlug]) {
    return KNOWN_API_PLAYER_IDS[cleanSlug]
  }

  return null
}
