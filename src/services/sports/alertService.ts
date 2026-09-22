import { MatchAlert, MatchLiveState } from '@/types/alerts'
import { espnPublicProvider } from '@/services/sports/espnPublicProvider'

// In-memory store for server-side alert state & processed event IDs (durable across requests in server process)
const liveStateStore = new Map<string, MatchLiveState>()
const processedEventIds = new Set<string>()
const alertsHistory: MatchAlert[] = []
const MAX_HISTORY = 100

/**
 * Generate a deterministic event ID to guarantee deduplication
 */
export function generateEventId(
  matchId: string,
  type: string,
  details: { minute?: number; score?: string; teamId?: string; playerId?: string; detail?: string }
): string {
  const parts = [
    matchId,
    type,
    details.teamId || '',
    details.playerId || '',
    details.minute || 0,
    details.score || '',
    details.detail || ''
  ]
  return parts.join('_').replace(/[^a-zA-Z0-9_]/g, '')
}

/**
 * Server-side Alert Detector: Compare previous live state vs new ESPN data
 */
export function processMatchAlerts(newMatch: any): MatchAlert[] {
  const newAlerts: MatchAlert[] = []
  if (!newMatch || !newMatch.id) return newAlerts

  const matchId = String(newMatch.id)
  const homeComp = newMatch.competitors?.find((c: any) => c.homeAway === 'home') || {}
  const awayComp = newMatch.competitors?.find((c: any) => c.homeAway === 'away') || {}

  const homeScore = parseInt(homeComp.score || '0')
  const awayScore = parseInt(awayComp.score || '0')
  const statusState = newMatch.status?.type?.state || 'pre'
  const isCompleted = Boolean(newMatch.status?.type?.completed)
  const currentMinute = newMatch.status?.clock || 0

  let currentStatus = 'scheduled'
  if (isCompleted) currentStatus = 'full_time'
  else if (statusState === 'in') {
    currentStatus = newMatch.status?.period === 1 ? 'live' : newMatch.status?.period === 2 ? 'live' : 'half_time'
  }

  const prev = liveStateStore.get(matchId)

  // 1. MATCH_STARTED Alert (scheduled -> live)
  if (prev && prev.status === 'scheduled' && currentStatus === 'live') {
    const eventId = generateEventId(matchId, 'match_started', { score: '0-0' })
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        matchId,
        matchSlug: `match-${matchId}`,
        type: 'match_started',
        title: 'MATCH STARTED',
        message: `${homeComp.team?.displayName || 'Home'} vs ${awayComp.team?.displayName || 'Away'}`,
        homeTeamName: homeComp.team?.displayName || 'Home',
        awayTeamName: awayComp.team?.displayName || 'Away',
        homeTeamLogo: homeComp.team?.logo,
        awayTeamLogo: awayComp.team?.logo,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        priority: 'NORMAL',
        source: 'espn'
      }
      newAlerts.push(alert)
    }
  }

  // 2. HALF_TIME Alert (live -> half_time)
  if (prev && prev.status === 'live' && currentStatus === 'half_time') {
    const eventId = generateEventId(matchId, 'half_time', { score: `${homeScore}-${awayScore}` })
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        matchId,
        matchSlug: `match-${matchId}`,
        type: 'half_time',
        title: 'HALF-TIME',
        message: `${homeComp.team?.displayName || 'Home'} ${homeScore}–${awayScore} ${awayComp.team?.displayName || 'Away'}`,
        homeTeamName: homeComp.team?.displayName || 'Home',
        awayTeamName: awayComp.team?.displayName || 'Away',
        homeTeamLogo: homeComp.team?.logo,
        awayTeamLogo: awayComp.team?.logo,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        priority: 'NORMAL',
        source: 'espn'
      }
      newAlerts.push(alert)
    }
  }

  // 3. FULL_TIME Alert (live/extra_time/penalties -> full_time)
  if (prev && prev.status !== 'full_time' && currentStatus === 'full_time') {
    const eventId = generateEventId(matchId, 'full_time', { score: `${homeScore}-${awayScore}` })
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        matchId,
        matchSlug: `match-${matchId}`,
        type: 'full_time',
        title: 'FULL-TIME',
        message: `${homeComp.team?.displayName || 'Home'} ${homeScore}–${awayScore} ${awayComp.team?.displayName || 'Away'}`,
        homeTeamName: homeComp.team?.displayName || 'Home',
        awayTeamName: awayComp.team?.displayName || 'Away',
        homeTeamLogo: homeComp.team?.logo,
        awayTeamLogo: awayComp.team?.logo,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        priority: 'NORMAL',
        source: 'espn'
      }
      newAlerts.push(alert)
    }
  }

  // 4. GOAL & RED_CARD Alerts based on keyEvents
  if (newMatch.detailsKeyEvents && Array.isArray(newMatch.detailsKeyEvents)) {
    newMatch.detailsKeyEvents.forEach((ev: any) => {
      const isGoal = Boolean(ev.scoringPlay || ev.type?.text?.toLowerCase().includes('goal') || ev.text?.toLowerCase().includes('goal'))
      const isRedCard = Boolean(ev.type?.text?.toLowerCase().includes('red') || ev.text?.toLowerCase().includes('red card'))

      if (isGoal) {
        const scorerName = ev.participants?.[0]?.athlete?.displayName || undefined
        const minute = ev.clock?.value ? Math.floor(ev.clock.value / 60) : currentMinute
        const detailText = ev.text || ''
        let goalType: 'normal' | 'penalty' | 'own_goal' = 'normal'
        if (detailText.toLowerCase().includes('penalty')) goalType = 'penalty'
        else if (detailText.toLowerCase().includes('own goal')) goalType = 'own_goal'

        const eventId = String(ev.id || generateEventId(matchId, 'goal', { minute, playerId: scorerName, detail: detailText }))

        if (!processedEventIds.has(eventId)) {
          processedEventIds.add(eventId)
          const title = goalType === 'penalty' ? '⚽ Penalty Goal' : goalType === 'own_goal' ? '⚽ Own Goal' : '⚽ GOAL!'
          const alert: MatchAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventId,
            matchId,
            matchSlug: `match-${matchId}`,
            type: 'goal',
            title,
            message: `${homeComp.team?.displayName || 'Home'} ${homeScore}–${awayScore} ${awayComp.team?.displayName || 'Away'}`,
            homeTeamName: homeComp.team?.displayName || 'Home',
            awayTeamName: awayComp.team?.displayName || 'Away',
            homeTeamLogo: homeComp.team?.logo,
            awayTeamLogo: awayComp.team?.logo,
            homeScore,
            awayScore,
            scorerName,
            goalType,
            minute,
            createdAt: new Date().toISOString(),
            priority: 'HIGH',
            source: 'espn'
          }
          newAlerts.push(alert)
        }
      }

      if (isRedCard) {
        const playerName = ev.participants?.[0]?.athlete?.displayName || undefined
        const teamName = ev.team?.displayName || (ev.team?.id === homeComp.team?.id ? homeComp.team?.displayName : awayComp.team?.displayName) || 'Team'
        const minute = ev.clock?.value ? Math.floor(ev.clock.value / 60) : currentMinute
        const eventId = String(ev.id || generateEventId(matchId, 'red_card', { minute, playerId: playerName }))

        if (!processedEventIds.has(eventId)) {
          processedEventIds.add(eventId)
          const alert: MatchAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventId,
            matchId,
            matchSlug: `match-${matchId}`,
            type: 'red_card',
            title: '🟥 RED CARD',
            message: `${teamName}${playerName ? ` • ${playerName}` : ''} (${minute}')`,
            homeTeamName: homeComp.team?.displayName || 'Home',
            awayTeamName: awayComp.team?.displayName || 'Away',
            homeTeamLogo: homeComp.team?.logo,
            awayTeamLogo: awayComp.team?.logo,
            homeScore,
            awayScore,
            scorerName: playerName,
            minute,
            createdAt: new Date().toISOString(),
            priority: 'HIGH',
            source: 'espn'
          }
          newAlerts.push(alert)
        }
      }
    })
  }

  // Update latest known match state
  liveStateStore.set(matchId, {
    matchId,
    homeScore,
    awayScore,
    status: currentStatus,
    minute: currentMinute,
    redCardsHome: 0,
    redCardsAway: 0,
    lastUpdatedAt: new Date().toISOString()
  })

  // Add new alerts to history
  newAlerts.forEach(a => {
    alertsHistory.unshift(a)
    if (alertsHistory.length > MAX_HISTORY) alertsHistory.pop()
  })

  return newAlerts
}

export function getAlertsHistory(limit = 20): MatchAlert[] {
  return alertsHistory.slice(0, limit)
}

export function getLiveStateStore(): Map<string, MatchLiveState> {
  return liveStateStore
}
