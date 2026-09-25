'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MatchAlert } from '@/types/alerts'
import { useLanguage } from '@/context/LanguageContext'
import PlayerImage from '@/components/common/PlayerImage'

interface GoalCelebrationOverlayProps {
  alert: MatchAlert | null
  onDismiss: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
  delay: number
  duration: number
}

export function GoalCelebrationOverlay({ alert, onDismiss }: GoalCelebrationOverlayProps) {
  const router = useRouter()
  const { locale, t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [progressWidth, setProgressWidth] = useState(100)

  useEffect(() => {
    if (alert && (alert.type === 'goal' || alert.type === 'penalty')) {
      setVisible(true)
      setProgressWidth(100)

      // Start progress bar shrink on next tick
      const animTimer = setTimeout(() => {
        setProgressWidth(0)
      }, 50)

      const dismissTimer = setTimeout(() => {
        setVisible(false)
        onDismiss()
      }, 6500)

      return () => {
        clearTimeout(animTimer)
        clearTimeout(dismissTimer)
      }
    } else {
      setVisible(false)
    }
  }, [alert, onDismiss])

  // Generate lightweight, elegant celebratory micro-particles
  const confetti = useMemo(() => {
    if (!visible) return []
    const colors = ['#ccff80', '#4ae176', '#ffffff', '#ffd700', '#38bdf8', '#fb7185']
    const pieces: ConfettiPiece[] = []
    for (let i = 0; i < 28; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 96 + 2,
        y: -15 - Math.random() * 15,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.8,
      })
    }
    return pieces
  }, [visible])

  if (!alert || !visible) return null

  const isPenalty = alert.goalType === 'penalty' || alert.type === 'penalty'
  const isOwnGoal = alert.goalType === 'own_goal'

  const goalTitle =
    locale === 'ar'
      ? isOwnGoal
        ? '⚡ هدف عكسي!'
        : isPenalty
        ? '🎯 هدف من ركلة جزاء!'
        : '⚽ هدفففف!'
      : locale === 'fr'
      ? isOwnGoal
        ? '⚡ CONTRE SON CAMP !'
        : isPenalty
        ? '🎯 BUT SUR PENALTY !'
        : '⚽ BUUUUT !'
      : isOwnGoal
      ? '⚡ OWN GOAL!'
      : isPenalty
      ? '🎯 PENALTY GOAL!'
      : '⚽ GOOOAL!'

  const handleCardClick = () => {
    setVisible(false)
    onDismiss()
    router.push(`/match/${alert.matchId || alert.matchSlug}`)
  }

  const scorerDisplayName = alert.scorerName || (alert.team === 'home' ? alert.homeTeamName : alert.awayTeamName)

  return (
    <aside
      aria-label="Live Match Goal Celebration"
      className="fixed inset-x-0 top-0 z-50 pointer-events-none flex justify-center pt-3 sm:pt-4 md:pt-6 px-3"
    >
      {/* Refined micro-confetti particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute rounded-full opacity-90"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.size}px`,
              height: `${c.size * 1.4}px`,
              backgroundColor: c.color,
              transform: `rotate(${c.rotation}deg)`,
              animation: `confetti-fall ${c.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${c.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Sleek, Expert-Engineered Goal Celebration Bar */}
      <div
        role="alert"
        aria-live="assertive"
        onClick={handleCardClick}
        className="pointer-events-auto relative w-full max-w-[500px] bg-surface-container-high/95 backdrop-blur-2xl border-2 border-primary/90 rounded-2xl p-3 md:p-3.5 shadow-[0_16px_45px_rgba(0,0,0,0.6),0_0_35px_rgba(204,255,128,0.3)] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-transform animate-goal-bar z-20 overflow-hidden"
      >
        {/* Dynamic Light Sheen / Shimmer beam */}
        <div
          className="absolute -inset-full bg-gradient-to-r from-transparent via-white/12 to-transparent rotate-45 pointer-events-none animate-shimmer"
          aria-hidden="true"
        />

        <div className="flex items-center gap-3 relative z-10">
          {/* Scorer Player Headshot / Badge */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 md:w-15 md:h-15 w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-primary via-emerald-400 to-primary shadow-[0_0_15px_rgba(204,255,128,0.45)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-container flex items-center justify-center">
                {alert.scorerName ? (
                  <PlayerImage
                    playerId={alert.playerId}
                    photo={alert.scorerPhoto}
                    name={alert.scorerName}
                    size="custom"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={alert.team === 'away' ? alert.awayTeamLogo : alert.homeTeamLogo}
                    alt="Scoring Team"
                    className="w-7 h-7 md:w-8 md:h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Floating Mini Ball Badge */}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container-lowest border border-primary/80 flex items-center justify-center text-[10px] shadow-md select-none animate-whistle-pulse">
              ⚽
            </span>
          </div>

          {/* Goal & Player Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Header pill: Animated Title + Minute Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-geist font-black text-xs md:text-sm tracking-wide text-primary drop-shadow-[0_0_8px_rgba(204,255,128,0.5)]">
                {goalTitle}
              </span>

              {alert.minute ? (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 font-mono text-[10px] md:text-[11px] font-bold tabular-nums">
                  ⏱️ {alert.minute}&apos;
                </span>
              ) : null}
            </div>

            {/* Scorer Name */}
            <h3 className="font-geist font-extrabold text-sm md:text-base text-on-surface leading-tight truncate mt-0.5">
              {scorerDisplayName}
            </h3>

            {/* Matchup & Real-Time Score */}
            <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
              {/* Home Team */}
              <div className="flex items-center gap-1.5 min-w-0 max-w-[40%]">
                {alert.homeTeamLogo ? (
                  <img
                    src={alert.homeTeamLogo}
                    alt={alert.homeTeamName}
                    className="w-4 h-4 object-contain shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                <span className="font-semibold text-on-surface truncate text-[11px] md:text-xs">
                  {alert.homeTeamName}
                </span>
              </div>

              {/* Score Badge */}
              <span className="font-mono font-black text-primary bg-surface-container-lowest px-2 py-0.5 rounded border border-primary/40 tabular-nums text-xs md:text-sm shrink-0">
                {alert.homeScore ?? 0} – {alert.awayScore ?? 0}
              </span>

              {/* Away Team */}
              <div className="flex items-center gap-1.5 min-w-0 max-w-[40%]">
                <span className="font-semibold text-on-surface truncate text-[11px] md:text-xs">
                  {alert.awayTeamName}
                </span>
                {alert.awayTeamLogo ? (
                  <img
                    src={alert.awayTeamLogo}
                    alt={alert.awayTeamName}
                    className="w-4 h-4 object-contain shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Dismiss & Open Controls */}
          <div className="flex flex-col items-center justify-between self-stretch shrink-0 pl-1 border-l border-surface-bright/50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setVisible(false)
                onDismiss()
              }}
              className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/80 transition-colors"
              aria-label="Close goal alert"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>

            <span
              className="text-primary hover:text-white transition-colors p-1"
              title={t('common.viewMatch', 'Open Match')}
            >
              <span className="material-symbols-outlined text-[18px] block">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Smooth Linear Progress Countdown Bar */}
        <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-surface-container-highest overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary transition-all duration-[6400ms] ease-linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </aside>
  )
}
