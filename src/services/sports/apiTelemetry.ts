/**
 * API Telemetry & Quota Monitoring Service
 * ──────────────────────────────────────────
 * Tracks real external API metrics, cache performance, rate limits,
 * and manages quota protection modes server-side.
 */

export interface TelemetryMetrics {
  externalApiCalls: number
  cacheHits: number
  staleHits: number
  cacheMisses: number
  coalescedRequests: number
  revalidations: number
  apiErrors: number
  rateLimitErrors: number
  requestsSavedByCache: number
  lastSuccessfulSync: string | null
  quotaProtectionMode: boolean
  quotaWarningLevel: 'NORMAL' | 'WARNING_80' | 'THROTTLE_90' | 'PROTECTION_95'
  dailyQuotaLimit: number
  requestsUsedToday: number
  cooldownUntil: string | null
}

class ApiTelemetryManager {
  private externalApiCalls = 0
  private cacheHits = 0
  private staleHits = 0
  private cacheMisses = 0
  private coalescedRequests = 0
  private revalidations = 0
  private apiErrors = 0
  private rateLimitErrors = 0
  private requestsSavedByCache = 0
  private lastSuccessfulSync: string | null = null
  private cooldownUntilTimestamp: number | null = null
  private readonly dailyQuotaLimit = 100
  private lastResetDate = new Date().toISOString().split('T')[0]

  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0]
    if (today !== this.lastResetDate) {
      this.externalApiCalls = 0
      this.apiErrors = 0
      this.rateLimitErrors = 0
      this.lastResetDate = today
    }
  }

  public recordExternalCall(): void {
    this.checkDailyReset()
    this.externalApiCalls++
  }

  public recordCacheHit(): void {
    this.cacheHits++
    this.requestsSavedByCache++
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
    this.requestsSavedByCache++
  }

  public recordRevalidation(): void {
    this.revalidations++
  }

  public recordApiSuccess(): void {
    this.lastSuccessfulSync = new Date().toISOString()
  }

  public recordApiError(is429 = false): void {
    this.apiErrors++
    if (is429) {
      this.rateLimitErrors++
      // Set 15-minute cooldown on 429 rate limit error to prevent request storms
      this.cooldownUntilTimestamp = Date.now() + 15 * 60 * 1000
    }
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

  public getMetrics(): TelemetryMetrics {
    this.checkDailyReset()
    const level = this.getQuotaWarningLevel()
    return {
      externalApiCalls: this.externalApiCalls,
      cacheHits: this.cacheHits,
      staleHits: this.staleHits,
      cacheMisses: this.cacheMisses,
      coalescedRequests: this.coalescedRequests,
      revalidations: this.revalidations,
      apiErrors: this.apiErrors,
      rateLimitErrors: this.rateLimitErrors,
      requestsSavedByCache: this.requestsSavedByCache,
      lastSuccessfulSync: this.lastSuccessfulSync,
      quotaProtectionMode: this.isQuotaProtectionMode(),
      quotaWarningLevel: level,
      dailyQuotaLimit: this.dailyQuotaLimit,
      requestsUsedToday: this.externalApiCalls,
      cooldownUntil: this.cooldownUntilTimestamp ? new Date(this.cooldownUntilTimestamp).toISOString() : null,
    }
  }
}

export const apiTelemetry = new ApiTelemetryManager()
