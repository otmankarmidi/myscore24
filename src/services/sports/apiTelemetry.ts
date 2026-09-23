/**
 * API Telemetry, Quota & Route Monitoring Service
 * ──────────────────────────────────────────────────
 * Tracks real external API metrics, endpoint consumption, cache performance,
 * rate limits, quota warning levels, deduplication, wasted requests,
 * and broken match route lookups server-side.
 */

export type TelemetryHitType =
  | 'CACHE_HIT'
  | 'DATABASE_HIT'
  | 'PROVIDER_HIT'
  | 'FALLBACK_HIT'
  | 'PROVIDER_ERROR'
  | 'DATABASE_ERROR'
  | 'QUOTA_ERROR'
  | 'RATE_LIMIT'
  | 'REQUEST_DEDUPLICATED'
  | 'UNNECESSARY_PROVIDER_REQUEST'
  | 'MATCH_NOT_FOUND'
  | 'INVALID_FIXTURE_ID'
  | 'MATCH_DB_MISS'
  | 'MATCH_PROVIDER_MISS'

export interface BrokenMatchEvent {
  timestamp: string
  fixtureId: string | number
  type: 'MATCH_NOT_FOUND' | 'INVALID_FIXTURE_ID' | 'MATCH_DB_MISS' | 'MATCH_PROVIDER_MISS'
  reason?: string
}

export interface WastedRequestEvent {
  timestamp: string
  endpoint: string
  resourceKey: string
  timeSinceLastMs: number
}

export interface TelemetryMetrics {
  externalApiCalls: number
  cacheHits: number
  databaseHits: number
  providerHits: number
  fallbackHits: number
  staleHits: number
  cacheMisses: number
  coalescedRequests: number
  revalidations: number
  apiErrors: number
  rateLimitErrors: number
  databaseErrors: number
  quotaErrors: number
  requestsDeduplicated: number
  unnecessaryProviderRequests: number
  requestsSavedByCache: number
  lastSuccessfulSync: string | null
  quotaProtectionMode: boolean
  quotaWarningLevel: 'NORMAL' | 'WARNING_80' | 'THROTTLE_90' | 'PROTECTION_95'
  dailyQuotaLimit: number
  requestsUsedToday: number
  quotaRemaining: number
  cooldownUntil: string | null

  // Endpoint breakdown
  endpointCalls: Record<string, number>

  // Match route integrity counters
  matchDetailCacheHits: number
  matchDetailDatabaseHits: number
  matchDetailProviderHits: number
  matchDetailFallbackHits: number
  matchDetailNotFound: number
  invalidFixtureId: number
  matchDbMiss: number
  matchProviderMiss: number

  // Recent diagnostics
  recentBrokenMatches: BrokenMatchEvent[]
  recentWastedRequests: WastedRequestEvent[]
}

class ApiTelemetryManager {
  private externalApiCalls = 0
  private cacheHits = 0
  private databaseHits = 0
  private providerHits = 0
  private fallbackHits = 0
  private staleHits = 0
  private cacheMisses = 0
  private coalescedRequests = 0
  private revalidations = 0
  private apiErrors = 0
  private rateLimitErrors = 0
  private databaseErrors = 0
  private quotaErrors = 0
  private requestsDeduplicated = 0
  private unnecessaryProviderRequests = 0
  private requestsSavedByCache = 0
  private lastSuccessfulSync: string | null = null
  private cooldownUntilTimestamp: number | null = null
  private readonly dailyQuotaLimit = 100
  private lastResetDate = new Date().toISOString().split('T')[0]

  // Endpoint calls tracker
  private endpointCalls: Record<string, number> = {
    fixtures: 0,
    standings: 0,
    teams: 0,
    players: 0,
    leagues: 0,
    h2h: 0,
    other: 0,
  }

  // Wasted request detection tracking: key -> timestamp
  private recentProviderRequests = new Map<string, { timestamp: number; windowMs: number }>()
  private recentWastedRequests: WastedRequestEvent[] = []

  // Match detail & route counters
  private matchDetailCacheHits = 0
  private matchDetailDatabaseHits = 0
  private matchDetailProviderHits = 0
  private matchDetailFallbackHits = 0
  private matchDetailNotFound = 0
  private invalidFixtureId = 0
  private matchDbMiss = 0
  private matchProviderMiss = 0

  private recentBrokenMatches: BrokenMatchEvent[] = []

  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0]
    if (today !== this.lastResetDate) {
      this.externalApiCalls = 0
      this.apiErrors = 0
      this.rateLimitErrors = 0
      this.databaseErrors = 0
      this.quotaErrors = 0
      this.unnecessaryProviderRequests = 0
      this.endpointCalls = {
        fixtures: 0,
        standings: 0,
        teams: 0,
        players: 0,
        leagues: 0,
        h2h: 0,
        other: 0,
      }
      this.recentProviderRequests.clear()
      this.lastResetDate = today
    }
  }

  public recordExternalCall(endpoint?: string): void {
    this.checkDailyReset()
    this.externalApiCalls++
    if (endpoint) {
      this.recordEndpointCall(endpoint)
    }
  }

  public recordEndpointCall(endpoint: string): void {
    this.checkDailyReset()
    const clean = endpoint.toLowerCase().trim()
    const key = this.endpointCalls[clean] !== undefined ? clean : 'other'
    this.endpointCalls[key] = (this.endpointCalls[key] || 0) + 1
  }

  /**
   * Tracks an upcoming or completed provider request and checks if it duplicates
   * an identical resource request made within its freshness window.
   */
  public recordProviderRequest(
    endpoint: string,
    resourceKey?: string,
    freshnessWindowMs = 60000
  ): boolean {
    this.recordExternalCall(endpoint)
    if (!resourceKey) return false

    const now = Date.now()
    const existing = this.recentProviderRequests.get(resourceKey)

    if (existing && now - existing.timestamp < existing.windowMs) {
      // Wasted / Unnecessary request detected!
      this.unnecessaryProviderRequests++
      const event: WastedRequestEvent = {
        timestamp: new Date().toISOString(),
        endpoint,
        resourceKey,
        timeSinceLastMs: now - existing.timestamp,
      }
      this.recentWastedRequests.unshift(event)
      if (this.recentWastedRequests.length > 20) this.recentWastedRequests.pop()
      console.warn(
        `[Telemetry Alert] UNNECESSARY_PROVIDER_REQUEST for '${resourceKey}' (${now - existing.timestamp}ms since last call, window was ${existing.windowMs}ms)`
      )
      return true
    }

    this.recentProviderRequests.set(resourceKey, { timestamp: now, windowMs: freshnessWindowMs })
    return false
  }

  public recordCacheHit(): void {
    this.cacheHits++
    this.requestsSavedByCache++
  }

  public recordDatabaseHit(): void {
    this.databaseHits++
    this.requestsSavedByCache++
  }

  public recordProviderHit(): void {
    this.providerHits++
  }

  public recordFallbackHit(): void {
    this.fallbackHits++
  }

  public recordStaleHit(): void {
    this.staleHits++
    this.requestsSavedByCache++
  }

  public recordCacheMiss(): void {
    this.cacheMisses++
  }

  public recordCoalescedRequest(): void {
    this.coalescedRequests++
    this.requestsDeduplicated++
    this.requestsSavedByCache++
  }

  public recordRevalidation(): void {
    this.revalidations++
  }

  public recordApiSuccess(): void {
    this.lastSuccessfulSync = new Date().toISOString()
  }

  public recordApiError(is429 = false, isQuota = false): void {
    this.apiErrors++
    if (is429) {
      this.rateLimitErrors++
      this.cooldownUntilTimestamp = Date.now() + 15 * 60 * 1000
    }
    if (isQuota) {
      this.quotaErrors++
    }
  }

  public recordDatabaseError(): void {
    this.databaseErrors++
  }

  public isInCooldown(): boolean {
    if (!this.cooldownUntilTimestamp) return false
    if (Date.now() > this.cooldownUntilTimestamp) {
      this.cooldownUntilTimestamp = null
      return false
    }
    return true
  }

  public getQuotaWarningLevel(): TelemetryMetrics['quotaWarningLevel'] {
    this.checkDailyReset()
    const pct = (this.externalApiCalls / this.dailyQuotaLimit) * 100
    if (pct >= 95) return 'PROTECTION_95'
    if (pct >= 90) return 'THROTTLE_90'
    if (pct >= 80) return 'WARNING_80'
    return 'NORMAL'
  }

  public isQuotaProtectionMode(): boolean {
    return this.getQuotaWarningLevel() === 'PROTECTION_95' || this.isInCooldown()
  }

  /**
   * Universal hit recorder covering all required monitoring event types.
   */
  public recordHit(type: TelemetryHitType, metadata?: any): void {
    switch (type) {
      case 'CACHE_HIT':
        this.recordCacheHit()
        this.matchDetailCacheHits++
        break
      case 'DATABASE_HIT':
        this.recordDatabaseHit()
        this.matchDetailDatabaseHits++
        break
      case 'PROVIDER_HIT':
        this.recordProviderHit()
        this.matchDetailProviderHits++
        break
      case 'FALLBACK_HIT':
        this.recordFallbackHit()
        this.matchDetailFallbackHits++
        break
      case 'REQUEST_DEDUPLICATED':
        this.recordCoalescedRequest()
        break
      case 'UNNECESSARY_PROVIDER_REQUEST':
        this.unnecessaryProviderRequests++
        break
      case 'PROVIDER_ERROR':
        this.recordApiError(false, false)
        break
      case 'RATE_LIMIT':
        this.recordApiError(true, false)
        break
      case 'QUOTA_ERROR':
        this.recordApiError(false, true)
        break
      case 'DATABASE_ERROR':
        this.recordDatabaseError()
        break
      case 'MATCH_NOT_FOUND':
        this.matchDetailNotFound++
        if (metadata?.fixtureId) {
          this.recordBrokenMatchRoute('MATCH_NOT_FOUND', metadata.fixtureId, metadata?.reason)
        }
        break
      case 'INVALID_FIXTURE_ID':
        this.invalidFixtureId++
        if (metadata?.fixtureId) {
          this.recordBrokenMatchRoute('INVALID_FIXTURE_ID', metadata.fixtureId, metadata?.reason)
        }
        break
      case 'MATCH_DB_MISS':
        this.matchDbMiss++
        if (metadata?.fixtureId) {
          this.recordBrokenMatchRoute('MATCH_DB_MISS', metadata.fixtureId, metadata?.reason)
        }
        break
      case 'MATCH_PROVIDER_MISS':
        this.matchProviderMiss++
        if (metadata?.fixtureId) {
          this.recordBrokenMatchRoute('MATCH_PROVIDER_MISS', metadata.fixtureId, metadata?.reason)
        }
        break
    }
  }

  public recordMatchDetailHit(
    type: 'CACHE_HIT' | 'DATABASE_HIT' | 'PROVIDER_HIT' | 'FALLBACK_HIT' | 'MATCH_NOT_FOUND'
  ): void {
    this.recordHit(type)
  }

  public recordBrokenMatchRoute(
    type: 'MATCH_NOT_FOUND' | 'INVALID_FIXTURE_ID' | 'MATCH_DB_MISS' | 'MATCH_PROVIDER_MISS',
    fixtureId: string | number,
    reason?: string
  ): void {
    const event: BrokenMatchEvent = {
      timestamp: new Date().toISOString(),
      fixtureId,
      type,
      reason,
    }
    this.recentBrokenMatches.unshift(event)
    if (this.recentBrokenMatches.length > 25) {
      this.recentBrokenMatches.pop()
    }
  }

  public getMetrics(): TelemetryMetrics {
    this.checkDailyReset()
    const level = this.getQuotaWarningLevel()
    const remaining = Math.max(0, this.dailyQuotaLimit - this.externalApiCalls)

    return {
      externalApiCalls: this.externalApiCalls,
      cacheHits: this.cacheHits,
      databaseHits: this.databaseHits,
      providerHits: this.providerHits,
      fallbackHits: this.fallbackHits,
      staleHits: this.staleHits,
      cacheMisses: this.cacheMisses,
      coalescedRequests: this.coalescedRequests,
      revalidations: this.revalidations,
      apiErrors: this.apiErrors,
      rateLimitErrors: this.rateLimitErrors,
      databaseErrors: this.databaseErrors,
      quotaErrors: this.quotaErrors,
      requestsDeduplicated: this.requestsDeduplicated,
      unnecessaryProviderRequests: this.unnecessaryProviderRequests,
      requestsSavedByCache: this.requestsSavedByCache,
      lastSuccessfulSync: this.lastSuccessfulSync,
      quotaProtectionMode: this.isQuotaProtectionMode(),
      quotaWarningLevel: level,
      dailyQuotaLimit: this.dailyQuotaLimit,
      requestsUsedToday: this.externalApiCalls,
      quotaRemaining: remaining,
      cooldownUntil: this.cooldownUntilTimestamp
        ? new Date(this.cooldownUntilTimestamp).toISOString()
        : null,
      endpointCalls: { ...this.endpointCalls },
      matchDetailCacheHits: this.matchDetailCacheHits,
      matchDetailDatabaseHits: this.matchDetailDatabaseHits,
      matchDetailProviderHits: this.matchDetailProviderHits,
      matchDetailFallbackHits: this.matchDetailFallbackHits,
      matchDetailNotFound: this.matchDetailNotFound,
      invalidFixtureId: this.invalidFixtureId,
      matchDbMiss: this.matchDbMiss,
      matchProviderMiss: this.matchProviderMiss,
      recentBrokenMatches: [...this.recentBrokenMatches],
      recentWastedRequests: [...this.recentWastedRequests],
    }
  }
}

export const apiTelemetry = new ApiTelemetryManager()
