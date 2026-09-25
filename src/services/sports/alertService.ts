import { MatchAlert, MatchLiveState, AlertType } from '@/types/alerts'
import { pushNotificationService } from '@/services/notifications/pushNotificationService'

// In-memory store for server-side alert state & processed event IDs
const liveStateStore = new Map<string, MatchLiveState>()
const processedEventIds = new Set<string>()
const alertsHistory: MatchAlert[] = []
const MAX_HISTORY = 100

/**
 * Generate a deterministic event ID to guarantee deduplication across multiple polls
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

interface ParsedMatchData {
  matchId: string
  matchSlug: string
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  homeTeamId?: string
  awayTeamId?: string
  homeScore: number
  awayScore: number
  status: string // 'scheduled' | 'live' | 'half_time' | 'full_time' | 'penalties'
  minute: number
  events: Array<{
    id?: string
    type: 'goal' | 'penalty' | 'red_card' | 'yellow_card' | string
    team: 'home' | 'away'
    teamName: string
    playerName?: string
    minute?: number
    detail?: string
  }>
}

/**
 * Normalizes any incoming match shape (ApiFootballFixtureRaw, normalized Match, or legacy ESPN object)
 * into a standard format for alert analysis.
 */
function extractMatchData(raw: any): ParsedMatchData | null {
  if (!raw) return null

  // Format 1: ApiFootballFixtureRaw (from API-Football)
  if (raw.fixture && raw.teams) {
    const matchId = String(raw.fixture.id)
    const homeTeamName = raw.teams.home?.name || 'Home'
    const awayTeamName = raw.teams.away?.name || 'Away'
    const homeScore = typeof raw.goals?.home === 'number' ? raw.goals.home : 0
    const awayScore = typeof raw.goals?.away === 'number' ? raw.goals.away : 0
    const minute = raw.fixture.status?.elapsed || 0

    const shortStatus = (raw.fixture.status?.short || '').toUpperCase()
    let status = 'scheduled'
    if (['1H', '2H', 'ET', 'LIVE'].includes(shortStatus)) status = 'live'
    else if (shortStatus === 'HT') status = 'half_time'
    else if (shortStatus === 'PEN') status = 'penalties'
    else if (['FT', 'AET', 'PEN_FT'].includes(shortStatus)) status = 'full_time'
    else if (['PST', 'CANC', 'ABD', 'AWD'].includes(shortStatus)) status = 'cancelled'

    const events: ParsedMatchData['events'] = []
    if (Array.isArray(raw.events)) {
      raw.events.forEach((ev: any, idx: number) => {
        const evType = (ev.type || '').toLowerCase()
        const evDetail = (ev.detail || '').toLowerCase()
        const isHome = ev.team?.id === raw.teams.home?.id
        const teamName = isHome ? homeTeamName : awayTeamName

        if (evType === 'goal') {
          const isPenalty = evDetail.includes('penalty')
          events.push({
            id: `api_${matchId}_goal_${idx}_${ev.time?.elapsed || 0}`,
            type: isPenalty ? 'penalty' : 'goal',
            team: isHome ? 'home' : 'away',
            teamName,
            playerName: ev.player?.name,
            minute: ev.time?.elapsed,
            detail: ev.detail
          })
        } else if (evType === 'card') {
          if (evDetail.includes('red')) {
            events.push({
              id: `api_${matchId}_red_${idx}_${ev.time?.elapsed || 0}`,
              type: 'red_card',
              team: isHome ? 'home' : 'away',
              teamName,
              playerName: ev.player?.name,
              minute: ev.time?.elapsed,
              detail: ev.detail
            })
          } else if (evDetail.includes('yellow')) {
            events.push({
              id: `api_${matchId}_yellow_${idx}_${ev.time?.elapsed || 0}`,
              type: 'yellow_card',
              team: isHome ? 'home' : 'away',
              teamName,
              playerName: ev.player?.name,
              minute: ev.time?.elapsed,
              detail: ev.detail
            })
          }
        }
      })
    }

    return {
      matchId,
      matchSlug: String(raw.fixture.id),
      homeTeamName,
      awayTeamName,
      homeTeamLogo: raw.teams.home?.logo,
      awayTeamLogo: raw.teams.away?.logo,
      homeTeamId: String(raw.teams.home?.id || ''),
      awayTeamId: String(raw.teams.away?.id || ''),
      homeScore,
      awayScore,
      status,
      minute,
      events
    }
  }

  // Format 2: Normalized internal Match
  if (raw.homeTeam && raw.awayTeam && raw.score) {
    const matchId = String(raw.id)
    const homeScore = typeof raw.score.home === 'number' ? raw.score.home : 0
    const awayScore = typeof raw.score.away === 'number' ? raw.score.away : 0
    const events: ParsedMatchData['events'] = []

    if (Array.isArray(raw.events)) {
      raw.events.forEach((ev: any) => {
        const type = ev.type === 'penalty_scored' || ev.type === 'penalty'
          ? 'penalty'
          : ev.type === 'yellow_card'
          ? 'yellow_card'
          : ev.type === 'red_card' || ev.type === 'second_yellow'
          ? 'red_card'
          : ev.type === 'goal'
          ? 'goal'
          : ev.type

        events.push({
          id: ev.id,
          type,
          team: ev.team === 'away' ? 'away' : 'home',
          teamName: ev.team === 'away' ? raw.awayTeam.name : raw.homeTeam.name,
          playerName: ev.playerName,
          minute: ev.minute,
          detail: ev.detail
        })
      })
    }

    return {
      matchId,
      matchSlug: raw.slug || matchId,
      homeTeamName: raw.homeTeam.name || 'Home',
      awayTeamName: raw.awayTeam.name || 'Away',
      homeTeamLogo: raw.homeTeam.logo,
      awayTeamLogo: raw.awayTeam.logo,
      homeTeamId: String(raw.homeTeam.id || ''),
      awayTeamId: String(raw.awayTeam.id || ''),
      homeScore,
      awayScore,
      status: raw.status || 'scheduled',
      minute: raw.minute || 0,
      events
    }
  }

  // Format 3: Legacy ESPN / competitor format
  if (raw.id && raw.competitors) {
    const matchId = String(raw.id)
    const homeComp = raw.competitors.find((c: any) => c.homeAway === 'home') || {}
    const awayComp = raw.competitors.find((c: any) => c.awayAway === 'away' || c.homeAway === 'away') || {}
    const homeScore = parseInt(homeComp.score || '0', 10) || 0
    const awayScore = parseInt(awayComp.score || '0', 10) || 0
    const statusState = raw.status?.type?.state || 'pre'
    const isCompleted = Boolean(raw.status?.type?.completed)
    let status = 'scheduled'
    if (isCompleted) status = 'full_time'
    else if (statusState === 'in') {
      status = raw.status?.period === 1 ? 'live' : raw.status?.period === 2 ? 'live' : 'half_time'
    }

    return {
      matchId,
      matchSlug: raw.slug || `match-${matchId}`,
      homeTeamName: homeComp.team?.displayName || 'Home',
      awayTeamName: awayComp.team?.displayName || 'Away',
      homeTeamLogo: homeComp.team?.logo,
      awayTeamLogo: awayComp.team?.logo,
      homeTeamId: String(homeComp.team?.id || ''),
      awayTeamId: String(awayComp.team?.id || ''),
      homeScore,
      awayScore,
      status,
      minute: raw.status?.clock || 0,
      events: []
    }
  }

  return null
}

/**
 * Server-side Alert Detector: Compare previous live state vs new match data
 */
export function processMatchAlerts(rawMatch: any): MatchAlert[] {
  const match = extractMatchData(rawMatch)
  if (!match) return []

  const newAlerts: MatchAlert[] = []
  const { matchId, matchSlug, homeTeamName, awayTeamName, homeTeamLogo, awayTeamLogo, homeScore, awayScore, status, minute, events } = match
  const prev = liveStateStore.get(matchId)

  // 1. MATCH_STARTED Alert (scheduled -> live)
  if (prev && prev.status === 'scheduled' && status === 'live') {
    const eventId = generateEventId(matchId, 'match_started', { score: '0-0' })
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        matchId,
        matchSlug,
        type: 'match_started',
        title: 'MATCH KICK-OFF',
        message: `${homeTeamName} vs ${awayTeamName} has kicked off!`,
        homeTeamName,
        awayTeamName,
        homeTeamLogo,
        awayTeamLogo,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        priority: 'NORMAL',
        source: 'api-football'
      }
      newAlerts.push(alert)
    }
  }

  // 2. HALF_TIME Alert (live -> half_time)
  if (prev && prev.status === 'live' && status === 'half_time') {
    const eventId = generateEventId(matchId, 'half_time', { score: `${homeScore}-${awayScore}` })
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        matchId,
        matchSlug,
        type: 'half_time',
        title: 'HALF-TIME',
        message: `${homeTeamName} ${homeScore}–${awayScore} ${awayTeamName}`,
        homeTeamName,
        awayTeamName,
        homeTeamLogo,
        awayTeamLogo,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        priority: 'NORMAL',
        source: 'api-football'
      }
      newAlerts.push(alert)
    }
  }

  // 3. FULL_TIME Alert (live/half_time/penalties -> full_time)
  if (prev && prev.status !== 'full_time' && status === 'full_time') {
    const eventId = generateEventId(matchId, 'full_time', { score: `${homeScore}-${awayScore}` })
    if (!processedEventIds.has(eventId)) {
      processedEventIds.add(eventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        matchId,
        matchSlug,
        type: 'full_time',
        title: 'FULL-TIME RESULT',
        message: `${homeTeamName} ${homeScore}–${awayScore} ${awayTeamName}`,
        homeTeamName,
        awayTeamName,
        homeTeamLogo,
        awayTeamLogo,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        priority: 'NORMAL',
        source: 'api-football'
      }
      newAlerts.push(alert)
    }
  }

  // 4. Score-Jump Fallback Detection (if scores increase and no specific event caught yet)
  if (prev && (homeScore > prev.homeScore || awayScore > prev.awayScore)) {
    const scoringTeam = homeScore > prev.homeScore ? homeTeamName : awayTeamName
    const scoreJumpEventId = generateEventId(matchId, 'score_jump', { score: `${homeScore}-${awayScore}` })
    if (!processedEventIds.has(scoreJumpEventId)) {
      processedEventIds.add(scoreJumpEventId)
      const alert: MatchAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventId: scoreJumpEventId,
        matchId,
        matchSlug,
        type: 'goal',
        title: '⚽ GOAL!',
        message: `${scoringTeam} scored! ${homeTeamName} ${homeScore}–${awayScore} ${awayTeamName}`,
        homeTeamName,
        awayTeamName,
        homeTeamLogo,
        awayTeamLogo,
        homeScore,
        awayScore,
        minute,
        createdAt: new Date().toISOString(),
        priority: 'HIGH',
        source: 'api-football'
      }
      newAlerts.push(alert)
    }
  }

  // 5. Explicit Event-Level Detection (Goals, Penalties, Cards)
  if (events && events.length > 0) {
    events.forEach((ev) => {
      if (ev.type === 'goal' || ev.type === 'penalty') {
        const isPenalty = ev.type === 'penalty' || (ev.detail && ev.detail.toLowerCase().includes('penalty'))
        const eventId = ev.id || generateEventId(matchId, isPenalty ? 'penalty' : 'goal', {
          minute: ev.minute,
          playerId: ev.playerName,
          detail: ev.detail
        })

        if (!processedEventIds.has(eventId)) {
          processedEventIds.add(eventId)
          const alertType: AlertType = isPenalty ? 'penalty' : 'goal'
          const title = isPenalty ? '⚽ PENALTY GOAL!' : '⚽ GOAL!'
          const alert: MatchAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventId,
            matchId,
            matchSlug,
            type: alertType,
            title,
            message: `${ev.teamName} GOAL! ${homeTeamName} ${homeScore}–${awayScore} ${awayTeamName}`,
            homeTeamName,
            awayTeamName,
            homeTeamLogo,
            awayTeamLogo,
            homeScore,
            awayScore,
            scorerName: ev.playerName,
            goalType: isPenalty ? 'penalty' : 'normal',
            minute: ev.minute || minute,
            createdAt: new Date().toISOString(),
            priority: 'HIGH',
            source: 'api-football'
          }
          newAlerts.push(alert)
        }
      } else if (ev.type === 'red_card') {
        const eventId = ev.id || generateEventId(matchId, 'red_card', {
          minute: ev.minute,
          playerId: ev.playerName
        })

        if (!processedEventIds.has(eventId)) {
          processedEventIds.add(eventId)
          const alert: MatchAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventId,
            matchId,
            matchSlug,
            type: 'red_card',
            title: '🟥 RED CARD',
            message: `${ev.teamName} Red Card: ${ev.playerName || 'Player'} (${ev.minute || minute}')`,
            homeTeamName,
            awayTeamName,
            homeTeamLogo,
            awayTeamLogo,
            homeScore,
            awayScore,
            scorerName: ev.playerName,
            minute: ev.minute || minute,
            createdAt: new Date().toISOString(),
            priority: 'HIGH',
            source: 'api-football'
          }
          newAlerts.push(alert)
        }
      } else if (ev.type === 'yellow_card') {
        const eventId = ev.id || generateEventId(matchId, 'yellow_card', {
          minute: ev.minute,
          playerId: ev.playerName
        })

        if (!processedEventIds.has(eventId)) {
          processedEventIds.add(eventId)
          const alert: MatchAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventId,
            matchId,
            matchSlug,
            type: 'yellow_card',
            title: '🟨 YELLOW CARD',
            message: `${ev.teamName} Yellow Card: ${ev.playerName || 'Player'} (${ev.minute || minute}')`,
            homeTeamName,
            awayTeamName,
            homeTeamLogo,
            awayTeamLogo,
            homeScore,
            awayScore,
            scorerName: ev.playerName,
            minute: ev.minute || minute,
            createdAt: new Date().toISOString(),
            priority: 'NORMAL',
            source: 'api-football'
          }
          newAlerts.push(alert)
        }
      }
    })
  }

  // Update current live state store
  liveStateStore.set(matchId, {
    matchId,
    homeScore,
    awayScore,
    status,
    minute,
    redCardsHome: 0,
    redCardsAway: 0,
    lastUpdatedAt: new Date().toISOString()
  })

  // Add newly created alerts to history and broadcast to Web Push subscribers
  newAlerts.forEach((a) => {
    alertsHistory.unshift(a)
    if (alertsHistory.length > MAX_HISTORY) alertsHistory.pop()
    pushNotificationService.sendAlertToSubscribers(a).catch((err) => {
      console.warn('[WebPush] Error sending alert to subscribers:', err?.message || err)
    })
  })

  return newAlerts
}

/**
 * Manually inject a test alert into the active stream (useful for tests and mock simulation)
 */
export function pushCustomAlert(alertData: Partial<MatchAlert> & { matchId: string; type: AlertType }): MatchAlert {
  const alert: MatchAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventId: `test_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    matchId: String(alertData.matchId),
    matchSlug: alertData.matchSlug || String(alertData.matchId),
    type: alertData.type,
    title: alertData.title || (alertData.type === 'goal' ? '⚽ GOAL!' : alertData.type === 'penalty' ? '⚽ PENALTY GOAL!' : alertData.type === 'red_card' ? '🟥 RED CARD' : '🔔 MATCH ALERT'),
    message: alertData.message || 'Live match event',
    homeTeamName: alertData.homeTeamName || 'Home Team',
    awayTeamName: alertData.awayTeamName || 'Away Team',
    homeTeamLogo: alertData.homeTeamLogo,
    awayTeamLogo: alertData.awayTeamLogo,
    homeScore: alertData.homeScore ?? 1,
    awayScore: alertData.awayScore ?? 0,
    scorerName: alertData.scorerName,
    goalType: alertData.goalType || (alertData.type === 'penalty' ? 'penalty' : 'normal'),
    minute: alertData.minute || 45,
    createdAt: new Date().toISOString(),
    priority: alertData.priority || 'HIGH',
    source: 'system'
  }

  alertsHistory.unshift(alert)
  if (alertsHistory.length > MAX_HISTORY) alertsHistory.pop()
  pushNotificationService.sendAlertToSubscribers(alert).catch((err) => {
    console.warn('[WebPush] Error sending test alert:', err?.message || err)
  })
  return alert
}

export function getAlertsHistory(limit = 20): MatchAlert[] {
  return alertsHistory.slice(0, limit)
}

export function getLiveStateStore(): Map<string, MatchLiveState> {
  return liveStateStore
}
