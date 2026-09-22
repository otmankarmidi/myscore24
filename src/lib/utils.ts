import { MatchStatus } from '@/types/match'
import { Match } from '@/types/match'
import { League } from '@/types/league'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getCasablancaDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Casablanca',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date) // Returns YYYY-MM-DD
}

export function getLocalDateString(date: Date = new Date(), timeZone?: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || (typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    return formatter.format(date) // Returns YYYY-MM-DD
  } catch {
    return date.toISOString().split('T')[0]
  }
}

function getBcpLocale(locale = 'en'): string {
  if (locale === 'ar') return 'ar-SA'
  if (locale === 'fr') return 'fr-FR'
  return 'en-GB'
}

export function formatMatchTime(kickoff: string, timeZone?: string, locale = 'en'): string {
  if (!kickoff) return ''
  const date = new Date(kickoff)
  if (isNaN(date.getTime())) return ''
  const bcp = getBcpLocale(locale)
  try {
    return date.toLocaleTimeString(bcp, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timeZone || undefined,
    })
  } catch {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
}

export function formatMatchDate(kickoff: string, timeZone?: string, locale = 'en'): string {
  if (!kickoff) return ''
  const date = new Date(kickoff)
  if (isNaN(date.getTime())) return ''
  const bcp = getBcpLocale(locale)
  try {
    return date.toLocaleDateString(bcp, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: timeZone || undefined,
    })
  } catch {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
}

export function formatDate(dateInput?: string | Date, formatPattern?: string, timeZone?: string, locale = 'en'): string {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return ''
  const bcp = getBcpLocale(locale)

  try {
    if (formatPattern === 'HH:mm') {
      return date.toLocaleTimeString(bcp, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timeZone || undefined,
      })
    }

    if (formatPattern === 'EEEE, d MMMM yyyy HH:mm') {
      return date.toLocaleDateString(bcp, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timeZone || undefined,
      })
    }

    return date.toLocaleDateString(bcp, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: timeZone || undefined,
    })
  } catch {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
}

export function formatRelativeDate(dateString: string, locale = 'en'): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) {
    return locale === 'ar' ? 'الآن' : locale === 'fr' ? 'À l\'instant' : 'Just now'
  }
  if (diffMins < 60) {
    return locale === 'ar' ? `منذ ${diffMins} د` : locale === 'fr' ? `Il y a ${diffMins} min` : `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return locale === 'ar' ? `منذ ${diffHours} س` : locale === 'fr' ? `Il y a ${diffHours} h` : `${diffHours}h ago`
  }
  if (diffDays === 1) {
    return locale === 'ar' ? 'أمس' : locale === 'fr' ? 'Hier' : 'Yesterday'
  }
  return formatMatchDate(dateString, undefined, locale)
}

export function getStatusBgClass(status: MatchStatus): string {
  switch (status) {
    case 'live':       return 'bg-error-container text-on-error-container'
    case 'half_time':  return 'bg-surface-bright text-primary'
    case 'full_time':  return 'bg-surface-container text-on-surface-variant'
    case 'extra_time': return 'bg-surface-bright text-primary-container'
    case 'penalties':  return 'bg-surface-bright text-primary-container'
    case 'postponed':  return 'bg-surface-container text-outline'
    case 'cancelled':  return 'bg-surface-container text-outline'
    default:           return 'bg-surface-container text-on-surface-variant'
  }
}

const STATUS_LABELS: Record<string, Record<MatchStatus, string>> = {
  en: {
    live: 'LIVE',
    half_time: 'HT',
    full_time: 'FT',
    extra_time: 'ET',
    penalties: 'PEN',
    scheduled: '',
    postponed: 'POSTP',
    cancelled: 'CANC',
    suspended: 'SUSP',
  },
  fr: {
    live: 'EN DIRECT',
    half_time: 'MT',
    full_time: 'FT',
    extra_time: 'PROL',
    penalties: 'T.A.B',
    scheduled: '',
    postponed: 'REP',
    cancelled: 'ANN',
    suspended: 'SUSP',
  },
  ar: {
    live: 'مباشر',
    half_time: 'إ.ن',
    full_time: 'نهاية',
    extra_time: 'إضافي',
    penalties: 'ركلات',
    scheduled: '',
    postponed: 'مؤجلة',
    cancelled: 'ملغاة',
    suspended: 'معلقة',
  },
}

export function getStatusLabel(status: MatchStatus, locale = 'en'): string {
  const dict = STATUS_LABELS[locale] || STATUS_LABELS.en
  return dict[status] || STATUS_LABELS.en[status] || ''
}

export function isLiveStatus(status: MatchStatus): boolean {
  return status === 'live' || status === 'half_time' || status === 'extra_time' || status === 'penalties'
}

export function generateDateRange(centerDate: Date = new Date(), daysBack = 3, daysForward = 3): Date[] {
  const dates: Date[] = []
  for (let i = -daysBack; i <= daysForward; i++) {
    const d = new Date(centerDate)
    d.setDate(centerDate.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function formatDayName(date: Date, locale = 'en'): string {
  const bcp = getBcpLocale(locale)
  return date.toLocaleDateString(bcp, { weekday: 'short' }).toUpperCase()
}

export function formatDayDate(date: Date, locale = 'en'): string {
  const day = date.getDate().toString().padStart(2, '0')
  const bcp = getBcpLocale(locale)
  const month = date.toLocaleDateString(bcp, { month: 'short' }).toUpperCase()
  return `${day} ${month}`
}

export function groupMatchesByLeague(
  matches: Match[]
): Record<string, { league: League; matches: Match[] }> {
  return matches.reduce(
    (groups, match) => {
      const key = match.league.id
      if (!groups[key]) groups[key] = { league: match.league, matches: [] }
      groups[key].matches.push(match)
      return groups
    },
    {} as Record<string, { league: League; matches: Match[] }>
  )
}

export function getFormColor(result: string): string {
  if (result === 'W') return 'text-secondary-container bg-secondary-container/20'
  if (result === 'L') return 'text-error bg-error/10'
  return 'text-outline bg-surface-container-high'
}

export function getTierBorderClass(tier?: string): string {
  switch (tier) {
    case 'champions_league': return 'border-l-2 border-l-secondary-container'
    case 'europa_league':    return 'border-l-2 border-l-secondary'
    case 'conference_league':return 'border-l-2 border-l-outline'
    case 'relegation':       return 'border-l-2 border-l-error-container'
    default:                 return ''
  }
}
