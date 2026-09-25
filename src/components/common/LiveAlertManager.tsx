'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MatchAlert } from '@/types/alerts'
import { useFavorites } from '@/hooks/useFavorites'
import { useMatchNotifications } from '@/hooks/useMatchNotifications'
import { soundAlerts } from '@/lib/soundAlerts'
import { GoalCelebrationOverlay } from '@/components/common/GoalCelebrationOverlay'

export function LiveAlertManager() {
  const router = useRouter()
  const { isMatchFavorite, isTeamFavorite } = useFavorites()
  const { isMatchNotified, soundEnabled } = useMatchNotifications()

  const [activeAlert, setActiveAlert] = useState<MatchAlert | null>(null)
  const [activeGoalAlert, setActiveGoalAlert] = useState<MatchAlert | null>(null)
  const seenAlertIds = useRef<Set<string>>(new Set())
  const isFirstRun = useRef<boolean>(true)

  const playAlertSound = useCallback(
    (type: MatchAlert['type']) => {
      if (!soundEnabled) return
      try {
        switch (type) {
          case 'goal':
            soundAlerts.playGoalSound()
            break
          case 'penalty':
            soundAlerts.playPenaltySound()
            break
          case 'red_card':
          case 'yellow_card':
            soundAlerts.playCardSound()
            break
          case 'match_started':
          case 'half_time':
          case 'full_time':
            soundAlerts.playWhistleSound()
            break
          default:
            soundAlerts.playGoalSound()
            break
        }
      } catch {
        // Audio error ignored
      }
    },
    [soundEnabled]
  )

  const showSystemNotification = useCallback((alert: MatchAlert) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    try {
      const notif = new Notification(alert.title, {
        body: `${alert.homeTeamName} ${alert.homeScore} - ${alert.awayScore} ${alert.awayTeamName}\n${alert.message}`,
        icon: alert.homeTeamLogo || '/favicon.ico',
        tag: alert.eventId || alert.id,
      })

      notif.onclick = () => {
        window.focus()
        window.location.href = `/match/${alert.matchId || alert.matchSlug}`
      }
    } catch {
      // Notification constructor error ignored
    }
  }, [])

  const checkAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?limit=15', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const alerts: MatchAlert[] = data.alerts || []

      if (!alerts || alerts.length === 0) return

      // On initial app mount, populate seenAlertIds to avoid spamming past alerts
      if (isFirstRun.current) {
        alerts.forEach((a) => seenAlertIds.current.add(a.id))
        isFirstRun.current = false
        return
      }

      // Find new unseen alerts matching subscribed match IDs or favorited teams/matches
      for (const alert of alerts) {
        if (seenAlertIds.current.has(alert.id)) continue
        seenAlertIds.current.add(alert.id)

        const isTestAlert = alert.matchId?.startsWith('test')
        const followsMatch = isMatchNotified(alert.matchId) || isMatchFavorite(alert.matchId)
        const followsTeam = isTeamFavorite(alert.homeTeamName) || isTeamFavorite(alert.awayTeamName)

        if (followsMatch || followsTeam || isTestAlert) {
          // Play audio alert
          playAlertSound(alert.type)
          // Fire browser notification
          showSystemNotification(alert)

          if (alert.type === 'goal' || alert.type === 'penalty') {
            // Full screen celebratory overlay animation
            setActiveGoalAlert(alert)

            // Dispatch global event for in-page visual score updates & row flashing
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('myscore24_goal_scored', {
                  detail: {
                    matchId: alert.matchId,
                    homeScore: alert.homeScore,
                    awayScore: alert.awayScore,
                    scorerName: alert.scorerName,
                    minute: alert.minute,
                    team: alert.team,
                    homeTeamName: alert.homeTeamName,
                    awayTeamName: alert.awayTeamName,
                  },
                })
              )
            }
          } else {
            // Display floating toast for other alerts
            setActiveAlert(alert)
          }
          break // show one toast at a time
        }
      }
    } catch {
      // Ignore network failures
    }
  }, [isMatchNotified, isMatchFavorite, isTeamFavorite, playAlertSound, showSystemNotification])

  // Poll for alerts every 10 seconds (initial check after 3 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout
    const initialTimer = setTimeout(() => {
      checkAlerts()
      interval = setInterval(checkAlerts, 10000)
    }, 3000)

    return () => {
      clearTimeout(initialTimer)
      if (interval) clearInterval(interval)
    }
  }, [checkAlerts])

  // Auto-dismiss toast after 7 seconds
  useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => {
      setActiveAlert(null)
    }, 7000)
    return () => clearTimeout(timer)
  }, [activeAlert])

  const getAlertIcon = (type: MatchAlert['type']) => {
    switch (type) {
      case 'goal':
        return '⚽'
      case 'penalty':
        return '🎯'
      case 'red_card':
        return '🟥'
      case 'yellow_card':
        return '🟨'
      case 'match_started':
        return '📢'
      case 'half_time':
      case 'full_time':
        return '⏱️'
      default:
        return '🔔'
    }
  }

  const getAlertBorderColor = (type: MatchAlert['type']) => {
    switch (type) {
      case 'goal':
      case 'penalty':
        return 'border-primary/80 shadow-[0_0_20px_rgba(204,255,128,0.25)]'
      case 'red_card':
        return 'border-error/80 shadow-[0_0_20px_rgba(255,100,100,0.25)]'
      case 'yellow_card':
        return 'border-amber-400/80'
      default:
        return 'border-surface-bright shadow-xl'
    }
  }

  return (
    <>
      {/* High-impact celebratory goal overlay with confetti & bouncing ball */}
      <GoalCelebrationOverlay
        alert={activeGoalAlert}
        onDismiss={() => setActiveGoalAlert(null)}
      />

      {/* Floating toast notification for cards, kickoffs, penalties, whistles */}
      {activeAlert && (
        <div
          role="alert"
          aria-live="assertive"
          onClick={() => {
            router.push(`/match/${activeAlert.matchId || activeAlert.matchSlug}`)
            setActiveAlert(null)
          }}
          className={`fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full bg-surface-container-high/95 backdrop-blur-md border rounded-xl p-3.5 shadow-2xl cursor-pointer hover:scale-[1.02] transition-all animate-bounce ${getAlertBorderColor(
            activeAlert.type
          )}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0 select-none">{getAlertIcon(activeAlert.type)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {activeAlert.title}
                  </span>
                  {activeAlert.minute ? (
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-bright text-on-surface-variant font-semibold">
                      {activeAlert.minute}&apos;
                    </span>
                  ) : null}
                </div>

                <h4 className="font-bold text-body-md text-on-surface leading-tight mt-0.5 truncate">
                  {activeAlert.homeTeamName} {activeAlert.homeScore ?? 0}–{activeAlert.awayScore ?? 0}{' '}
                  {activeAlert.awayTeamName}
                </h4>

                {activeAlert.scorerName && (
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5 truncate">
                    {activeAlert.scorerName}
                    {activeAlert.goalType === 'penalty' ? ' (PEN)' : ''}
                  </p>
                )}

                {!activeAlert.scorerName && activeAlert.message && (
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5 truncate">
                    {activeAlert.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveAlert(null)
              }}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-bright transition-colors shrink-0"
              aria-label="Dismiss alert"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
