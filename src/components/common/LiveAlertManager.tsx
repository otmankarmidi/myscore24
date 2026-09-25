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
          subtitle: locale === 'ar' ? 'نهاية الشوط الأول' : locale === 'fr' ? 'Fin de la 1ère mi-temps' : 'End of first half',
          borderColor: 'border-cyan-400/80 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_25px_rgba(34,211,238,0.25)]',
          badgeBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
          accentColor: 'text-cyan-400',
        }
      case 'full_time':
        return {
          icon: '🏁',
          title: locale === 'ar' ? 'نهاية المباراة' : locale === 'fr' ? 'FIN DU MATCH' : 'FULL-TIME',
          subtitle: locale === 'ar' ? 'النتيجة النهائية' : locale === 'fr' ? 'Résultat final' : 'Final result',
          borderColor: 'border-amber-400/80 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_25px_rgba(251,191,36,0.3)]',
          badgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          accentColor: 'text-amber-400',
        }
      case 'red_card':
        return {
          icon: '🟥',
          title: locale === 'ar' ? 'بطاقة حمراء' : locale === 'fr' ? 'CARTON ROUGE' : 'RED CARD',
          subtitle: locale === 'ar' ? 'طرد مباشر' : locale === 'fr' ? 'Expulsion' : 'Player sent off',
          borderColor: 'border-red-500/80 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_30px_rgba(239,68,68,0.35)]',
          badgeBg: 'bg-red-500/20 text-red-400 border border-red-500/40',
          accentColor: 'text-red-400',
        }
      case 'yellow_card':
        return {
          icon: '🟨',
          title: locale === 'ar' ? 'بطاقة صفراء' : locale === 'fr' ? 'CARTON JAUNE' : 'YELLOW CARD',
          subtitle: locale === 'ar' ? 'إنذار' : locale === 'fr' ? 'Avertissement' : 'Caution',
          borderColor: 'border-amber-400/70 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.2)]',
          badgeBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
          accentColor: 'text-amber-300',
        }
      case 'match_started':
        return {
          icon: '📢',
          title: locale === 'ar' ? 'انطلاق المباراة' : locale === 'fr' ? "COUP D'ENVOI" : 'MATCH KICK-OFF',
          subtitle: locale === 'ar' ? 'بدء اللقاء الآن' : locale === 'fr' ? 'Le match a débuté' : 'Match underway',
          borderColor: 'border-emerald-400/80 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_25px_rgba(16,185,129,0.25)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          accentColor: 'text-emerald-400',
        }
      default:
        return {
          icon: '🔔',
          title: activeAlert?.title || 'MATCH UPDATE',
          subtitle: activeAlert?.message || '',
          borderColor: 'border-surface-bright/80 shadow-2xl',
          badgeBg: 'bg-surface-bright text-on-surface-variant',
          accentColor: 'text-primary',
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

      {/* Floating expert-motion toast notification for Halftime, Fulltime, Cards & Kickoff */}
      {activeAlert && alertMeta && (
        <aside
          role="alert"
          aria-live="assertive"
          onClick={() => {
            router.push(`/match/${activeAlert.matchId || activeAlert.matchSlug}`)
            setActiveAlert(null)
          }}
          className={`fixed top-4 md:top-6 right-3 sm:right-6 z-50 w-[94%] sm:w-[380px] max-w-sm bg-surface-container-high/95 backdrop-blur-2xl border-2 rounded-2xl p-3.5 shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform animate-toast-spring overflow-hidden ${alertMeta.borderColor}`}
        >
          {/* Top Row: Event Badge, Minute, and Dismiss Button */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-surface-bright/40">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">{alertMeta.icon}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-[11px] font-black tracking-wider uppercase font-geist ${alertMeta.badgeBg}`}>
                {alertMeta.title}
              </span>
              {activeAlert.minute ? (
                <span className="font-mono text-[10px] md:text-[11px] font-bold px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant border border-surface-bright/60 tabular-nums">
                  ⏱️ {activeAlert.minute}&apos;
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveAlert(null)
              }}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-bright/80 transition-colors shrink-0"
              aria-label="Dismiss alert"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>
          </div>

          {/* Middle Body: Team Matchup, Scores & Event Spotlight */}
          <div className="mt-2.5 flex items-center gap-3">
            {/* Player Headshot if card event with player */}
            {(activeAlert.type === 'red_card' || activeAlert.type === 'yellow_card') && activeAlert.scorerName ? (
              <div className="shrink-0">
                <PlayerImage
                  playerId={activeAlert.playerId}
                  photo={activeAlert.playerPhoto}
                  name={activeAlert.scorerName}
                  size="md"
                  className={activeAlert.type === 'red_card' ? 'border-2 border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'border border-amber-400/80'}
                />
              </div>
            ) : null}

            <div className="flex-1 min-w-0">
              {/* Match Headline / Score Display */}
              <div className="flex items-center gap-2">
                {/* Home Team */}
                <div className="flex items-center gap-1 min-w-0 max-w-[42%]">
                  {activeAlert.homeTeamLogo && (
                    <img
                      src={activeAlert.homeTeamLogo}
                      alt={activeAlert.homeTeamName}
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <span className="font-bold text-xs md:text-sm text-on-surface truncate">
                    {activeAlert.homeTeamName}
                  </span>
                </div>

                {/* Score or VS Badge */}
                <span className={`px-2 py-0.5 rounded font-mono font-extrabold text-xs md:text-sm tabular-nums bg-surface-container-lowest shrink-0 ${alertMeta.accentColor}`}>
                  {activeAlert.type === 'match_started' ? 'VS' : `${activeAlert.homeScore ?? 0} – ${activeAlert.awayScore ?? 0}`}
                </span>

                {/* Away Team */}
                <div className="flex items-center gap-1 min-w-0 max-w-[42%]">
                  <span className="font-bold text-xs md:text-sm text-on-surface truncate">
                    {activeAlert.awayTeamName}
                  </span>
                  {activeAlert.awayTeamLogo && (
                    <img
                      src={activeAlert.awayTeamLogo}
                      alt={activeAlert.awayTeamName}
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                </div>
              </div>

              {/* Event detail description (e.g. Dani Carvajal (68') or "First half ended") */}
              <p className="text-[11px] md:text-xs text-on-surface-variant font-medium mt-1 truncate">
                {activeAlert.scorerName
                  ? `${activeAlert.scorerName}${activeAlert.minute ? ` (${activeAlert.minute}')` : ''}`
                  : alertMeta.subtitle || activeAlert.message}
              </p>
            </div>
          </div>

          {/* Bottom Bar: Action prompt + Smooth countdown bar */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-on-surface-variant/80 pt-1.5 border-t border-surface-bright/30">
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1 font-semibold hover:underline">
              {t('common.viewMatch', 'Open Match')}
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant/60">
              MyScore24 Live
            </span>
          </div>

          {/* Smooth Linear Progress Countdown Bar */}
          <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-surface-container-highest overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r transition-all duration-[6400ms] ease-linear ${
                activeAlert.type === 'half_time'
                  ? 'from-cyan-400 to-blue-500'
                  : activeAlert.type === 'full_time'
                  ? 'from-amber-400 to-yellow-500'
                  : activeAlert.type === 'red_card'
                  ? 'from-red-500 to-rose-600'
                  : activeAlert.type === 'yellow_card'
                  ? 'from-yellow-400 to-amber-500'
                  : 'from-emerald-400 to-green-500'
              }`}
              style={{ width: `${toastProgress}%` }}
            />
          </div>
        </aside>
      )}
    </>
  )
}
