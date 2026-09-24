/**
 * Google Analytics 4 (GA4) Integration & Custom Event Tracking
 * Measurement ID: G-L96Q86DFG3
 */

export const GA_MEASUREMENT_ID = 'G-L96Q86DFG3'
export const CONSENT_STORAGE_KEY = 'myscore24_cookie_consent'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    _gaInitialized?: boolean
  }
}

/**
 * Checks whether analytics consent is granted by user.
 * Defaults to true under Google Consent Mode v2 unless explicitly denied.
 */
export function isAnalyticsConsentGranted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY)
    return consent !== 'denied'
  } catch {
    return true
  }
}

/**
 * Update Google Consent Mode v2 state dynamically
 */
export function updateAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied')
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
      })
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Send pageview to GA4
 */
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsConsentGranted()) return
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || (typeof document !== 'undefined' ? document.title : undefined),
  })
}

/**
 * Send generic custom event to GA4
 */
export function trackEvent(action: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined' || !window.gtag || !isAnalyticsConsentGranted()) return
  window.gtag('event', action, params)
}

// ── CUSTOM EVENTS ─────────────────────────────────────────────────────────────

/**
 * Triggered when a user opens/views a match detail page
 */
export function trackMatchOpen(params: {
  matchId: string | number
  homeTeam: string
  awayTeam: string
  competition?: string
  status?: string
}): void {
  trackEvent('match_open', {
    match_id: String(params.matchId),
    home_team: params.homeTeam,
    away_team: params.awayTeam,
    competition: params.competition || 'unknown',
    status: params.status || 'unknown',
  })
}

/**
 * Triggered when a user opens/views a team page
 */
export function trackTeamOpen(params: {
  teamId: string | number
  teamName: string
  country?: string
}): void {
  trackEvent('team_open', {
    team_id: String(params.teamId),
    team_name: params.teamName,
    country: params.country || 'unknown',
  })
}

/**
 * Triggered when a user opens/views a player page
 */
export function trackPlayerOpen(params: {
  playerId: string | number
  playerName: string
  teamName?: string
  position?: string
}): void {
  trackEvent('player_open', {
    player_id: String(params.playerId),
    player_name: params.playerName,
    team_name: params.teamName || 'unknown',
    position: params.position || 'unknown',
  })
}

/**
 * Triggered when a user opens/views a competition/league page
 */
export function trackCompetitionOpen(params: {
  competitionId: string | number
  competitionName: string
  country?: string
}): void {
  trackEvent('competition_open', {
    competition_id: String(params.competitionId),
    competition_name: params.competitionName,
    country: params.country || 'unknown',
  })
}

/**
 * Triggered when a user opens/reads a news article
 */
export function trackArticleOpen(params: {
  articleId: string | number
  articleTitle: string
  category?: string
}): void {
  trackEvent('article_open', {
    article_id: String(params.articleId),
    article_title: params.articleTitle,
    category: params.category || 'general',
  })
}

/**
 * Triggered when a user performs a search
 */
export function trackSearch(query: string, resultsCount?: number): void {
  if (!query || !query.trim()) return
  trackEvent('search', {
    search_term: query.trim(),
    results_count: resultsCount !== undefined ? resultsCount : -1,
  })
}

/**
 * Triggered when a user favorites or unfavorites a match
 */
export function trackFavoriteMatch(matchId: string | number, isFavorited: boolean): void {
  trackEvent('favorite_match', {
    match_id: String(matchId),
    action: isFavorited ? 'add' : 'remove',
  })
}

/**
 * Triggered when a user favorites or unfavorites a team
 */
export function trackFavoriteTeam(teamId: string | number, isFavorited: boolean): void {
  trackEvent('favorite_team', {
    team_id: String(teamId),
    action: isFavorited ? 'add' : 'remove',
  })
}

/**
 * Triggered when a user switches interface language
 */
export function trackLanguageChange(locale: string): void {
  trackEvent('language_change', {
    locale,
  })
}
