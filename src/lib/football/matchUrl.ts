/**
 * Utility functions for generating, extracting, and validating
 * canonical SEO-friendly match URLs for MyScore24.
 *
 * Format: /match/{homeTeam}-vs-{awayTeam}-{providerFixtureId}
 * Example: /match/spain-vs-portugal-1234567
 */

import { Match } from '@/types/match'

export function slugifyTeamName(text?: string | null): string {
  if (!text) return 'team'
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'team'
  )
}

/**
 * Generates the canonical SEO slug for a match.
 * Example: "spain-vs-portugal-1234567"
 */
export function buildMatchSlug(
  homeName: string,
  awayName: string,
  fixtureId: number | string
): string {
  const homeSlug = slugifyTeamName(homeName)
  const awaySlug = slugifyTeamName(awayName)
  const id = String(fixtureId).trim()
  return `${homeSlug}-vs-${awaySlug}-${id}`
}

/**
 * Builds the canonical match URL path.
 * Example: "/match/spain-vs-portugal-1234567"
 */
export function buildMatchUrl(
  match: {
    homeTeam?: { name?: string }
    awayTeam?: { name?: string }
    id?: string | number
    providerFixtureId?: string | number
    slug?: string
  } | Match
): string {
  if (!match) return '#'
  const id = match.id || (match as any).providerFixtureId
  if (!id || String(id).trim() === '' || String(id) === 'undefined') return '#'

  // If match already has a canonical slug with -vs- and ends with -[id], use it
  if (
    match.slug &&
    match.slug.includes('-vs-') &&
    match.slug.endsWith(`-${id}`)
  ) {
    return `/match/${match.slug}`
  }

  const home = match.homeTeam?.name || 'home'
  const away = match.awayTeam?.name || 'away'
  return `/match/${buildMatchSlug(home, away, id)}`
}

/**
 * Extracts the numeric providerFixtureId from any slug variation or ID.
 * Supports:
 * - "spain-vs-portugal-1234567" -> 1234567
 * - "match-1234567" -> 1234567
 * - "1234567" -> 1234567
 */
export function extractFixtureId(slugOrId?: string | number | null): number | null {
  if (!slugOrId) return null
  const str = String(slugOrId).trim().replace(/^match-/, '')
  const match = str.match(/(?:^|-)(\d+)$/)
  if (match) {
    const id = Number(match[1])
    if (!isNaN(id) && id > 0) return id
  }
  return null
}

/**
 * Checks if the current URL slug matches the canonical SEO slug.
 */
export function isCanonicalMatchSlug(
  currentSlug: string,
  homeName: string,
  awayName: string,
  fixtureId: number | string
): boolean {
  if (!currentSlug) return false
  const canonical = buildMatchSlug(homeName, awayName, fixtureId)
  return currentSlug.toLowerCase().trim() === canonical.toLowerCase().trim()
}

/**
 * Generates dynamic, factual SEO Title for a match based on its current lifecycle state.
 */
export function buildMatchSeoTitle(match: Match, locale: string = 'en'): string {
  const home = match.homeTeam?.name || 'Home Team'
  const away = match.awayTeam?.name || 'Away Team'
  const isAr = locale === 'ar'

  // LIVE MATCHES
  if (
    match.status === 'live' ||
    match.status === 'half_time' ||
    match.status === 'extra_time'
  ) {
    if (isAr) {
      return `مباشر: مباراة ${home} ضد ${away} - النتيجة والأحداث | MyScore24`
    }
    return `${home} vs ${away} Live Score & Match Updates | MyScore24`
  }

  // FINISHED MATCHES
  if (
    match.isFinal ||
    match.status === 'full_time' ||
    match.status === 'penalties'
  ) {
    const homeScore = match.score?.home ?? 0
    const awayScore = match.score?.away ?? 0
    if (isAr) {
      return `نتيجة مباراة ${home} ${homeScore}-${awayScore} ${away}: الأهداف وملخص اللقاء | MyScore24`
    }
    return `${home} ${homeScore}-${awayScore} ${away}: Result, Goals & Match Stats | MyScore24`
  }

  // POSTPONED / CANCELLED
  if (match.status === 'postponed') {
    if (isAr) return `تأجيل مباراة ${home} ضد ${away}: تفاصيل اللقاء | MyScore24`
    return `${home} vs ${away} (Postponed): Match Information | MyScore24`
  }
  if (match.status === 'cancelled') {
    if (isAr) return `إلغاء مباراة ${home} ضد ${away}: تفاصيل اللقاء | MyScore24`
    return `${home} vs ${away} (Cancelled): Match Information | MyScore24`
  }

  // UPCOMING MATCHES (Scheduled)
  if (isAr) {
    return `موعد مباراة ${home} ضد ${away}: التوقيت، المعاينة وأخبار الفريقين | MyScore24`
  }
  return `${home} vs ${away}: Kick-Off Time, Match Preview & Team News | MyScore24`
}

/**
 * Generates dynamic, factual Meta Description based on stored match information.
 */
export function buildMatchMetaDescription(match: Match, locale: string = 'en'): string {
  const home = match.homeTeam?.name || 'Home Team'
  const away = match.awayTeam?.name || 'Away Team'
  const comp = match.league?.name || 'Football'
  const isAr = locale === 'ar'

  const kickoffDate = match.kickoff ? new Date(match.kickoff) : null
  const formattedDate = kickoffDate
    ? kickoffDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  // LIVE MATCHES
  if (
    match.status === 'live' ||
    match.status === 'half_time' ||
    match.status === 'extra_time'
  ) {
    if (isAr) {
      return `تابع البث المباشر لمباراة ${home} ضد ${away} في ${comp}. تحديثات الأهداف، إحصائيات المباراة وتشكيلة الفريقين لحظة بلحظة على MyScore24.`
    }
    return `Follow ${home} vs ${away} in ${comp}. Real-time live score updates, match timeline, starting lineups and head-to-head statistics on MyScore24.`
  }

  // FINISHED MATCHES
  if (
    match.isFinal ||
    match.status === 'full_time' ||
    match.status === 'penalties'
  ) {
    const homeScore = match.score?.home ?? 0
    const awayScore = match.score?.away ?? 0
    if (isAr) {
      return `النتيجة النهائية لمباراة ${home} ${homeScore}-${awayScore} ${away} في ${comp}. تعرف على إحصائيات المباراة، مسجلي الأهداف وتاريخ المواجهات على MyScore24.`
    }
    return `Full-time result: ${home} ${homeScore} - ${awayScore} ${away} in ${comp}. View match statistics, goals, lineups and head-to-head history on MyScore24.`
  }

  // UPCOMING MATCHES
  const venueClause = match.venue
    ? isAr
      ? ` على ملعب ${match.venue}`
      : ` at ${match.venue}`
    : ''

  if (isAr) {
    return `يلتقي ${home} مع ${away} بتاريخ ${formattedDate}${venueClause} ضمن منافسات ${comp}. تعرف على موعد المباراة، معلومات اللقاء، وتحديثات البث المباشر على MyScore24.`
  }
  return `${home} face ${away} on ${formattedDate}${venueClause} in ${comp}. Get the kick-off time, match information, team form and live score updates on MyScore24.`
}
