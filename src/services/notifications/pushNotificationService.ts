import webpush from 'web-push'
import { PUSH_CONFIG } from '@/config/pushConfig'
import { MatchAlert } from '@/types/alerts'
import fs from 'fs'
import path from 'path'

// Configure Web Push VAPID credentials
webpush.setVapidDetails(
  PUSH_CONFIG.subject,
  PUSH_CONFIG.publicKey,
  PUSH_CONFIG.privateKey
)

export interface WebPushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface StoredPushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  matchIds: string[]
  updatedAt: number
}

// In-memory subscription registry backed by local persistent file
const subscriptionsMap = new Map<string, StoredPushSubscription>()
const STORAGE_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json')

function loadSubscriptionsFromDisk(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8')
      const list: StoredPushSubscription[] = JSON.parse(raw)
      if (Array.isArray(list)) {
        list.forEach((sub) => {
          if (sub?.endpoint) {
            subscriptionsMap.set(sub.endpoint, sub)
          }
        })
      }
    }
  } catch (err) {
    console.warn('[Push Service] Could not load stored subscriptions:', err)
  }
}

function saveSubscriptionsToDisk(): void {
  try {
    const dir = path.dirname(STORAGE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const data = Array.from(subscriptionsMap.values())
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.warn('[Push Service] Could not save subscriptions to disk:', err)
  }
}

// Initialize on boot
loadSubscriptionsFromDisk()

export const pushNotificationService = {
  /**
   * Returns the public VAPID key for client subscriptions
   */
  getPublicKey(): string {
    return PUSH_CONFIG.publicKey
  },

  /**
   * Subscribe a device push endpoint to a specific match
   */
  subscribe(subscription: WebPushSubscriptionData, matchId: string | number): void {
    const endpoint = subscription.endpoint
    const matchIdStr = String(matchId)

    const existing = subscriptionsMap.get(endpoint)
    if (existing) {
      if (!existing.matchIds.includes(matchIdStr)) {
        existing.matchIds.push(matchIdStr)
      }
      existing.keys = subscription.keys
      existing.updatedAt = Date.now()
    } else {
      subscriptionsMap.set(endpoint, {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        matchIds: [matchIdStr],
        updatedAt: Date.now(),
      })
    }

    saveSubscriptionsToDisk()
  },

  /**
   * Unsubscribe a device from a specific match (or all matches)
   */
  unsubscribe(endpoint: string, matchId?: string | number): void {
    const existing = subscriptionsMap.get(endpoint)
    if (!existing) return

    if (matchId) {
      const matchIdStr = String(matchId)
      existing.matchIds = existing.matchIds.filter((id) => id !== matchIdStr)
      if (existing.matchIds.length === 0) {
        subscriptionsMap.delete(endpoint)
      }
    } else {
      subscriptionsMap.delete(endpoint)
    }

    saveSubscriptionsToDisk()
  },

  /**
   * Get all active subscribers for a given match ID
   */
  getSubscribersForMatch(matchId: string | number): StoredPushSubscription[] {
    const matchIdStr = String(matchId)
    const matched: StoredPushSubscription[] = []

    for (const sub of subscriptionsMap.values()) {
      if (sub.matchIds.includes(matchIdStr) || sub.matchIds.includes('*')) {
        matched.push(sub)
      }
    }

    return matched
  },

  /**
   * Send background push notification to all devices subscribed to this match
   */
  async sendAlertToSubscribers(alert: MatchAlert): Promise<{ sent: number; failed: number }> {
    const subscribers = this.getSubscribersForMatch(alert.matchId)
    if (subscribers.length === 0) {
      return { sent: 0, failed: 0 }
    }

    const payload = JSON.stringify({
      title: alert.title,
      message: `${alert.homeTeamName} ${alert.homeScore} - ${alert.awayScore} ${alert.awayTeamName}\n${alert.message}`,
      icon: alert.homeTeamLogo || '/favicon.png',
      matchId: alert.matchId,
      matchSlug: alert.matchSlug,
      url: `/match/${alert.matchId || alert.matchSlug}`,
      tag: `myscore24-match-${alert.matchId}-${alert.type}`,
    })

    let sent = 0
    let failed = 0

    await Promise.allSettled(
      subscribers.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload,
            {
              TTL: 60, // 60 seconds delivery window for live sports
              urgency: alert.priority === 'HIGH' ? 'high' : 'normal',
            }
          )
          sent++
        } catch (err: any) {
          failed++
          // Automatically clean up expired or unregistered push subscriptions
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            subscriptionsMap.delete(sub.endpoint)
            saveSubscriptionsToDisk()
          }
        }
      })
    )

    return { sent, failed }
  },
}
