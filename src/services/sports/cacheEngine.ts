import { apiTelemetry } from './apiTelemetry'

export const CURRENT_CACHE_VERSION = 'v1'

export interface CacheEntry<T> {
  key: string
  version: string
  data: T
  freshUntil: number // Milliseconds epoch timestamp
  staleUntil: number // Milliseconds epoch timestamp
  isRevalidating?: boolean
}

export interface TTLConfig {
  freshMs: number
  staleMs: number
  isCritical?: boolean
}

export const CACHE_TTLS = {
  // Live matches: 45s fresh, 3m stale
  LIVE_MATCHES: { freshMs: 45 * 1000, staleMs: 3 * 60 * 1000, isCritical: true },
  // Live matches when 0 live matches active: 4m fresh, 10m stale
  LIVE_MATCHES_IDLE: { freshMs: 4 * 60 * 1000, staleMs: 10 * 60 * 1000, isCritical: false },
  // Today's fixtures: 15s fresh, 45s stale to keep live scores and match minutes in real-time
  TODAY_FIXTURES: { freshMs: 15 * 1000, staleMs: 45 * 1000, isCritical: true },
  // Upcoming / Date fixtures: 30m fresh, 2h stale
  DATE_FIXTURES: { freshMs: 30 * 60 * 1000, staleMs: 2 * 3600 * 1000, isCritical: false },
  // Completed match summary: 6h fresh, 24h stale
  FINISHED_MATCH_DETAILS: { freshMs: 6 * 3600 * 1000, staleMs: 24 * 3600 * 1000, isCritical: false },
  // Ongoing match details: 30s fresh, 2m stale
  LIVE_MATCH_DETAILS: { freshMs: 30 * 1000, staleMs: 2 * 60 * 1000, isCritical: true },
  // Standings: 20m fresh, 2h stale
  STANDINGS: { freshMs: 20 * 60 * 1000, staleMs: 2 * 3600 * 1000, isCritical: false },
  // Team / Player / League info: 24h fresh, 7d stale
  ENTITY_INFO: { freshMs: 24 * 3600 * 1000, staleMs: 7 * 24 * 3600 * 1000, isCritical: false },
  // Stadium / Venue: 7d fresh, 30d stale
  STADIUM_INFO: { freshMs: 7 * 24 * 3600 * 1000, staleMs: 30 * 24 * 3600 * 1000, isCritical: false },
}

// L1 In-Memory Cache Map
const l1Cache = new Map<string, CacheEntry<any>>()

// L2 Persistent In-Memory / DB Storage Adapter
const l2Storage = new Map<string, CacheEntry<any>>()

// Single-flight Request Coalescing Map
const inFlightRequests = new Map<string, Promise<any>>()

export function formatCacheKey(namespace: string, id: string): string {
  return `myscore24:${CURRENT_CACHE_VERSION}:${namespace}:${id}`
}

class CacheEngine {
  private pruneMemoryIfNeeded(): void {
    if (l1Cache.size > 500) {
      const now = Date.now()
      for (const [k, entry] of l1Cache.entries()) {
        if (now > entry.staleUntil) {
          l1Cache.delete(k)
        }
      }
    }
  }

  private setEntry<T>(key: string, data: T, ttl: TTLConfig): CacheEntry<T> {
    const now = Date.now()
    const warningLevel = apiTelemetry.getQuotaWarningLevel()

    // Multiply TTLs if quota is low to preserve API requests
    let multiplier = 1
    if (!ttl.isCritical) {
      if (warningLevel === 'THROTTLE_90') multiplier = 2
      else if (warningLevel === 'PROTECTION_95') multiplier = 4
    }

    const freshUntil = now + ttl.freshMs * multiplier
    const staleUntil = now + ttl.staleMs * multiplier

    const entry: CacheEntry<T> = {
      key,
      version: CURRENT_CACHE_VERSION,
      data,
      freshUntil,
      staleUntil,
      isRevalidating: false,
    }

    l1Cache.set(key, entry)
    l2Storage.set(key, entry)
    this.pruneMemoryIfNeeded()
    return entry
  }

  public getEntry<T>(key: string): CacheEntry<T> | null {
    // 1. Check L1 Memory
    let entry = l1Cache.get(key)
    // 2. Fallback to L2 Storage if missing in L1
    if (!entry) {
      entry = l2Storage.get(key)
      if (entry) l1Cache.set(key, entry)
    }
    return entry || null
  }

  /**
   * Executes a fetch request with Layered Caching (L1/L2), Single-Flight Request Coalescing,
   * Stale-While-Revalidate (SWR), and Telemetry tracking.
   */
  async fetchWithCache<T>(
    namespace: string,
    id: string,
    ttl: TTLConfig,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const key = formatCacheKey(namespace, id)
    const now = Date.now()
    const existing = this.getEntry<T>(key)

    // A. FRESH HIT: Data is 100% fresh -> Return immediately
    if (existing && now <= existing.freshUntil) {
      apiTelemetry.recordCacheHit()
      return existing.data
    }

    // B. STALE HIT (SWR): Data is stale but within staleUntil -> Return stale & revalidate in background
    if (existing && now > existing.freshUntil && now <= existing.staleUntil) {
      apiTelemetry.recordStaleHit()

      // Trigger background revalidation if not already revalidating & not in protection mode
      if (!existing.isRevalidating && !apiTelemetry.isQuotaProtectionMode()) {
        existing.isRevalidating = true
        apiTelemetry.recordRevalidation()
        this.runCoalescedFetch(key, fetchFn, namespace, id, ttl.freshMs)
          .then((freshData) => {
            if (freshData) this.setEntry(key, freshData, ttl)
          })
          .catch((err) => {
            console.warn(`[CacheEngine] Background revalidation failed for ${key}:`, err?.message || err)
          })
          .finally(() => {
            existing.isRevalidating = false
          })
      }

      return existing.data
    }

    // C. QUOTA PROTECTION FALLBACK: If quota is >= 95% or in cooldown, return valid stale data if available
    if (existing && apiTelemetry.isQuotaProtectionMode() && !ttl.isCritical) {
      apiTelemetry.recordStaleHit()
      return existing.data
    }

    // D. CACHE MISS / EXPIRED STALE: Must execute single-flight fetch
    apiTelemetry.recordCacheMiss()

    try {
      const freshData = await this.runCoalescedFetch(key, fetchFn, namespace, id, ttl.freshMs)
      if (freshData !== null && freshData !== undefined) {
        this.setEntry(key, freshData, ttl)
        return freshData
      }
    } catch (err: any) {
      // Graceful Failure: If external call fails, return stale cache if available
      if (existing) {
        console.warn(`[CacheEngine] External API fetch failed for ${key}, falling back to stale cache:`, err?.message || err)
        return existing.data
      }
      throw err
    }

    if (existing) return existing.data
    throw new Error(`Data fetch failed for ${key}`)
  }

  /**
   * Request Coalescing (Single-Flight): Deduplicates concurrent requests for the exact same key
   */
  private async runCoalescedFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    endpoint?: string,
    resourceId?: string,
    freshWindowMs?: number
  ): Promise<T> {
    if (inFlightRequests.has(key)) {
      apiTelemetry.recordCoalescedRequest()
      return inFlightRequests.get(key)!
    }

    const promise = (async () => {
      try {
        if (endpoint) {
          apiTelemetry.recordProviderRequest(endpoint, resourceId ? `${endpoint}:${resourceId}` : key, freshWindowMs)
        } else {
          apiTelemetry.recordExternalCall()
        }
        const result = await fetchFn()
        apiTelemetry.recordApiSuccess()
        return result
      } catch (error: any) {
        const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('limit')
        apiTelemetry.recordApiError(is429)
        throw error
      }
    })()

    inFlightRequests.set(key, promise)

    try {
      return await promise
    } finally {
      // Guaranteed cleanup in finally block
      inFlightRequests.delete(key)
    }
  }

  public getStats(): { l1Size: number; l2Size: number; inFlight: number; isHealthy: boolean } {
    return {
      l1Size: l1Cache.size,
      l2Size: l2Storage.size,
      inFlight: inFlightRequests.size,
      isHealthy: true,
    }
  }

  public invalidateNamespace(namespace: string): void {
    const prefix = `myscore24:${CURRENT_CACHE_VERSION}:${namespace}:`
    for (const k of l1Cache.keys()) {
      if (k.startsWith(prefix)) l1Cache.delete(k)
    }
    for (const k of l2Storage.keys()) {
      if (k.startsWith(prefix)) l2Storage.delete(k)
    }
  }

  public get<T>(namespace: string, id: string): T | null {
    const key = formatCacheKey(namespace, id)
    const entry = this.getEntry<T>(key)
    if (!entry) return null
    if (Date.now() > entry.staleUntil) return null
    return entry.data
  }

  public set<T>(namespace: string, id: string, data: T, ttl: TTLConfig): void {
    const key = formatCacheKey(namespace, id)
    this.setEntry(key, data, ttl)
  }

  public clearAllCache(): void {
    l1Cache.clear()
    l2Storage.clear()
    inFlightRequests.clear()
  }
}

export const cacheEngine = new CacheEngine()
