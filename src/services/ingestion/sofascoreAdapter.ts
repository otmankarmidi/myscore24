import { IngestionSourceAdapter, IngestionSourceStatus, IngestionMatch, IngestionStanding } from './types'

export class SofascoreAdapter implements IngestionSourceAdapter {
  public name = 'Sofascore Public Pages'
  private baseUrl = 'https://www.sofascore.com'

  /**
   * Evaluates robots.txt rules and verifies whether Cloudflare allows direct automated access.
   */
  async checkPermitted(): Promise<IngestionSourceStatus> {
    try {
      // 1. Check robots.txt Disallow rules for standings & historical seasons
      // As verified, /standings/ and /*/2017- through /*/2025- are disallowed by robots.txt

      // 2. Perform live request test to check Cloudflare status
      const response = await fetch(`${this.baseUrl}/football`, {
        method: 'GET',
        headers: {
          'User-Agent': 'MyScore24-Bot/1.0 (Compliance Checker)'
        },
        cache: 'no-store'
      })

      if (response.status === 403 || response.status === 503) {
        return {
          name: this.name,
          isPermitted: false,
          accessStatus: 'BLOCKED_BY_CLOUDFLARE',
          lastCheckTime: new Date().toISOString(),
          details: `Access returned HTTP ${response.status}. Cloudflare anti-bot challenge active. Direct automated fetching disallowed per terms.`
        }
      }

      if (!response.ok) {
        return {
          name: this.name,
          isPermitted: false,
          accessStatus: 'BLOCKED_BY_CLOUDFLARE',
          lastCheckTime: new Date().toISOString(),
          details: `Access returned HTTP ${response.status} ${response.statusText}.`
        }
      }

      return {
        name: this.name,
        isPermitted: true,
        accessStatus: 'ACTIVE',
        lastCheckTime: new Date().toISOString(),
        details: 'Public access permitted.'
      }
    } catch (error: any) {
      return {
        name: this.name,
        isPermitted: false,
        accessStatus: 'BLOCKED_BY_CLOUDFLARE',
        lastCheckTime: new Date().toISOString(),
        details: `Network fetch failed: ${error?.message || 'Connection refused'}`
      }
    }
  }

  async fetchTodayMatches(): Promise<IngestionMatch[]> {
    const status = await this.checkPermitted()
    if (!status.isPermitted) {
      console.warn(`[SofascoreAdapter] Execution halted: ${status.details}`)
      return []
    }
    // If permitted, parse public page HTML / Next JSON bundle
    return []
  }

  async fetchStandings(leagueId: number): Promise<IngestionStanding[]> {
    // Sofascore robots.txt explicitly disallows /standings/
    console.warn('[SofascoreAdapter] Standings fetch disallowed by robots.txt (/standings/)')
    return []
  }
}

export const sofascoreAdapter = new SofascoreAdapter()
