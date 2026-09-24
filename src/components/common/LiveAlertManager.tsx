'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MatchAlert } from '@/types/alerts'
import { useFavorites } from '@/hooks/useFavorites'

export function LiveAlertManager() {
  const router = useRouter()
  const { isMatchFavorite, isTeamFavorite } = useFavorites()
  const [activeAlert, setActiveAlert] = useState<MatchAlert | null>(null)

  const checkAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?limit=10')
      if (!res.ok) return
      const data = await res.json()
      const alerts: MatchAlert[] = data.alerts || []

      if (alerts.length === 0) return

      // Filter alerts for matches or teams followed by the user
      const relevant = alerts.find(a => {
        // If user follows the match or home/away team, or has no favorites yet show followed matches
        const followsMatch = isMatchFavorite(a.matchId)
        const followsHome = isTeamFavorite(a.homeTeamName)
        const followsAway = isTeamFavorite(a.awayTeamName)
        return followsMatch || followsHome || followsAway
      })

      if (relevant && relevant.id !== activeAlert?.id) {
        setActiveAlert(relevant)
      }
    } catch {
      // Ignore network failures
    }
  }, [isMatchFavorite, isTeamFavorite, activeAlert])

  // Poll for alerts every 15 seconds (deferred after initial page load)
  useEffect(() => {
    let interval: NodeJS.Timeout
    const initialTimer = setTimeout(() => {
      checkAlerts()
      interval = setInterval(checkAlerts, 15000)
    }, 6000)

    return () => {
      clearTimeout(initialTimer)
      if (interval) clearInterval(interval)
    }
  }, [checkAlerts])

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => {
      setActiveAlert(null)
    }, 6000)
    return () => clearTimeout(timer)
  }, [activeAlert])

  if (!activeAlert) return null

  return (
    <div
      onClick={() => {
        router.push(`/match/${activeAlert.matchId || activeAlert.matchSlug}`)
        setActiveAlert(null)
      }}
      className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full bg-surface-container/95 backdrop-blur border-2 border-primary/40 rounded-xl p-3.5 shadow-2xl cursor-pointer hover:border-primary transition-all animate-bounce"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {activeAlert.type === 'goal' ? '⚽' : activeAlert.type === 'red_card' ? '🟥' : '🔔'}
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
              {activeAlert.title}
            </span>
            <h4 className="font-bold text-body-md text-on-surface leading-tight">
              {activeAlert.homeTeamName || 'Home'} {activeAlert.homeScore ?? 0}–{activeAlert.awayScore ?? 0} {activeAlert.awayTeamName || 'Away'}
            </h4>
            {activeAlert.scorerName && (
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                {activeAlert.scorerName} {activeAlert.minute ? `· ${activeAlert.minute}'` : ''}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setActiveAlert(null)
          }}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container-high transition-colors"
          aria-label="Dismiss alert"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  )
}
