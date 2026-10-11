'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MatchAlert } from '@/types/alerts'
import { useFavorites } from '@/hooks/useFavorites'
import { useMatchNotifications } from '@/hooks/useMatchNotifications'
import { useLanguage } from '@/context/LanguageContext'
import { soundAlerts } from '@/lib/soundAlerts'
import { GoalCelebrationOverlay } from '@/components/common/GoalCelebrationOverlay'
import PlayerImage from '@/components/common/PlayerImage'

export function LiveAlertManager() {
  const router = useRouter()
  const { locale, t } = useLanguage()
  const { isMatchFavorite, isTeamFavorite } = useFavorites()
  const { isMatchNotified, soundEnabled } = useMatchNotifications()

  const [activeAlert, setActiveAlert] = useState<MatchAlert | null>(null)
  const [activeGoalAlert, setActiveGoalAlert] = useState<MatchAlert | null>(null)
  const [toastProgress, setToastProgress] = useState<number>(100)
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
            // Full celebratory overlay animation
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
            // Display polished floating toast for halftime, fulltime, cards, etc.
            setActiveAlert(alert)
            setToastProgress(100)
            setTimeout(() => setToastProgress(0), 40)
          }
          break // show one toast at a time
        }
      }
    } catch {
      // Ignore network failures
    }
  }, [isMatchNotified, isMatchFavorite, isTeamFavorite, playAlertSound, showSystemNotification])

  // Listen for direct in-app test or client-dispatched alerts
  useEffect(() => {
    function handleCustomAlert(e: any) {
      if (e.detail) {
        setActiveAlert(e.detail)
        setToastProgress(100)
        setTimeout(() => setToastProgress(0), 40)
      }
    }
    window.addEventListener('myscore24_show_alert', handleCustomAlert)
    return () => {
      window.removeEventListener('myscore24_show_alert', handleCustomAlert)
    }
  }, [])

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

  // Auto-dismiss toast after 6.5 seconds
  useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => {
      setActiveAlert(null)
    }, 6500)
    return () => clearTimeout(timer)
  }, [activeAlert])

  const getAlertMetadata = (type: MatchAlert['type']) => {
    switch (type) {
      case 'half_time':
        return {
          icon: '⏱️',
          title: locale === 'ar' ? 'استراحة الشوطين' : locale === 'fr' ? 'MI-TEMPS' : 'HALF-TIME',
          subtitle: locale === 'ar' ? 'نهاية الشوط الأول' : locale === 'fr' ? 'Fin de la 1ère mi-temps' : 'Half-time result',
        }
      case 'full_time':
        return {
          icon: '🏁',
          title: locale === 'ar' ? 'نهاية المباراة' : locale === 'fr' ? 'FIN DU MATCH' : 'FULL-TIME',
          subtitle: locale === 'ar' ? 'النتيجة النهائية' : locale === 'fr' ? 'Résultat final' : 'Final result',
        }
      case 'goal':
      case 'penalty':
        return {
          icon: '⚽',
          title: locale === 'ar' ? 'هدف!' : locale === 'fr' ? 'BUT !' : 'GOAL!',
          subtitle: activeAlert?.scorerName ? `${activeAlert.scorerName}${activeAlert.minute ? ` (${activeAlert.minute}')` : ''}` : 'Goal scored',
        }
      case 'red_card':
        return {
          icon: '🟥',
          title: locale === 'ar' ? 'بطاقة حمراء' : locale === 'fr' ? 'CARTON ROUGE' : 'RED CARD',
          subtitle: activeAlert?.scorerName ? `${activeAlert.scorerName} - ${locale === 'ar' ? 'طرد' : 'Red card'}` : 'Player sent off',
        }
      case 'yellow_card':
        return {
          icon: '🟨',
          title: locale === 'ar' ? 'بطاقة صفراء' : locale === 'fr' ? 'CARTON JAUNE' : 'YELLOW CARD',
          subtitle: activeAlert?.scorerName ? `${activeAlert.scorerName} - ${locale === 'ar' ? 'إنذار' : 'Yellow card'}` : 'Caution',
        }
      case 'match_started':
        return {
          icon: '📢',
          title: locale === 'ar' ? 'انطلاق المباراة' : locale === 'fr' ? "COUP D'ENVOI" : 'MATCH KICK-OFF',
          subtitle: locale === 'ar' ? 'بدء اللقاء الآن' : locale === 'fr' ? 'Le match a débuté' : 'Match underway',
        }
      default:
        return {
          icon: '🔔',
          title: activeAlert?.title || 'MATCH UPDATE',
          subtitle: activeAlert?.message || '',
        }
    }
  }

  const alertMeta = activeAlert ? getAlertMetadata(activeAlert.type) : null

  return (
    <>
      {/* High-impact celebratory goal overlay with confetti & headshot */}
      <GoalCelebrationOverlay
        alert={activeGoalAlert}
        onDismiss={() => setActiveGoalAlert(null)}
      />

      {/* Floating toast notification matching reference image */}
      {activeAlert && alertMeta && (
        <aside
          role="alert"
          aria-live="assertive"
          onClick={() => {
            router.push(`/match/${activeAlert.matchId || activeAlert.matchSlug}`)
            setActiveAlert(null)
          }}
          className="fixed top-5 right-4 sm:right-6 z-50 w-[94%] sm:w-[350px] max-w-sm bg-white border border-[#E5E5E5] rounded-2xl p-3.5 sm:p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] cursor-pointer hover:shadow-[0_14px_40px_rgba(0,0,0,0.16)] transition-all animate-toast-spring overflow-hidden text-slate-900"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Top Row: Event Icon + Purple Pill Badge + Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none select-none">{alertMeta.icon}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#F3ECFA] text-[#6425A6] font-geist">
                {alertMeta.title}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveAlert(null)
              }}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 rounded-lg"
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Middle Body: Home Team - Cream Score Badge - Away Team */}
          <div className="mt-3 flex items-center justify-between gap-2">
            {/* Home Team (Logo on left, Name on right) */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {activeAlert.homeTeamLogo && (
                <img
                  src={activeAlert.homeTeamLogo}
                  alt={activeAlert.homeTeamName}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <span className="font-bold text-sm sm:text-[15px] text-slate-900 truncate">
                {activeAlert.homeTeamName}
              </span>
            </div>

            {/* Score in Warm Beige / Cream Badge with Amber Numbers */}
            <div className="bg-[#FBF2DE] text-[#9A6014] font-extrabold text-sm sm:text-[15px] px-2.5 sm:px-3 py-1 rounded-lg tabular-nums tracking-wide shrink-0 shadow-2xs min-w-[50px] text-center font-geist">
              {activeAlert.type === 'match_started' ? 'VS' : `${activeAlert.homeScore ?? 0} - ${activeAlert.awayScore ?? 0}`}
            </div>

            {/* Away Team (Name on left, Logo on right) */}
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <span className="font-bold text-sm sm:text-[15px] text-slate-900 truncate text-right rtl:text-left">
                {activeAlert.awayTeamName}
              </span>
              {activeAlert.awayTeamLogo && (
                <img
                  src={activeAlert.awayTeamLogo}
                  alt={activeAlert.awayTeamName}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </div>
          </div>

          {/* Subtitle / Event Description (e.g. Final result) */}
          <p className="text-xs text-slate-400 font-normal mt-1.5 truncate">
            {activeAlert.scorerName
              ? `${activeAlert.scorerName}${activeAlert.minute ? ` (${activeAlert.minute}')` : ''}`
              : alertMeta.subtitle || activeAlert.message || (activeAlert.type === 'full_time' ? 'Final result' : '')}
          </p>

          {/* Bottom Bar: Action link & Branding */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-[#6425A6] flex items-center gap-1.5 hover:underline">
              <span>{t('common.viewMatch', 'Open Match')}</span>
              <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              MyScore24 Live
            </span>
          </div>

          {/* Subtle Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#6425A6] transition-all duration-[6400ms] ease-linear"
              style={{ width: `${toastProgress}%` }}
            />
          </div>
        </aside>
      )}
    </>
  )
}
