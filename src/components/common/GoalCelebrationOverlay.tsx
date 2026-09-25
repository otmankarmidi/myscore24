'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MatchAlert } from '@/types/alerts'
import { useLanguage } from '@/context/LanguageContext'

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

  useEffect(() => {
    if (alert && (alert.type === 'goal' || alert.type === 'penalty')) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onDismiss()
      }, 7000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [alert, onDismiss])

  // Generate confetti particles
  const confetti = useMemo(() => {
    if (!visible) return []
    const colors = ['#ccff80', '#4ae176', '#ffffff', '#ffd700', '#ff4757', '#00d2d3']
    const pieces: ConfettiPiece[] = []
    for (let i = 0; i < 40; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // percentage 0-100vw
        y: -10 - Math.random() * 20,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2,
      })
    }
    return pieces
  }, [visible])

  if (!alert || !visible) return null

  const isPenalty = alert.goalType === 'penalty' || alert.type === 'penalty'
  const goalTitle =
    locale === 'ar'
      ? isPenalty
        ? '⚽ هدف من ركلة جزاء!'
        : '⚽ هدفففففف!'
      : locale === 'fr'
      ? isPenalty
        ? '⚽ BUT SUR PENALTY !'
        : '⚽ BUUUUUUT !'
      : isPenalty
      ? '⚽ PENALTY GOAL!'
      : '⚽ GOOOAL!'

  const handleCardClick = () => {
    setVisible(false)
    onDismiss()
    router.push(`/match/${alert.matchId || alert.matchSlug}`)
  }

  return (
    <aside
      aria-label="Live Match Goal Celebration"
      className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-4 md:pt-8 px-4"
    >
      {/* Confetti Rain Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute rounded-sm opacity-90 animate-fall"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.size}px`,
              height: `${c.size * 1.6}px`,
              backgroundColor: c.color,
              transform: `rotate(${c.rotation}deg)`,
              animation: `confetti-fall ${c.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${c.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Celebratory Banner Card */}
      <div
        role="alert"
        aria-live="assertive"
        onClick={handleCardClick}
        className="pointer-events-auto relative w-full max-w-lg bg-surface-container-high/95 backdrop-blur-xl border-2 border-primary rounded-2xl p-4 md:p-6 shadow-[0_0_50px_rgba(204,255,128,0.35)] cursor-pointer hover:scale-[1.02] transition-transform animate-goal-glow z-20 overflow-hidden"
      >
        {/* Dynamic Light Rays / Sheen effect */}
        <div
          className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none animate-shimmer"
          aria-hidden="true"
        />

        {/* Top Header with Bouncing Soccer Ball & Big Typography */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="text-4xl md:text-5xl animate-goal-ball filter drop-shadow-[0_0_15px_rgba(204,255,128,0.8)] select-none">
            ⚽
          </div>

          <h2 className="text-2xl md:text-4xl font-extrabold tracking-wider uppercase font-geist bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent animate-goal-text mt-1">
            {goalTitle}
          </h2>

          {alert.minute ? (
            <span className="inline-block mt-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
              {alert.minute}&apos; MINUTE
            </span>
          ) : null}
        </div>

        {/* Match Score Display */}
        <div className="mt-4 flex items-center justify-between gap-3 bg-surface-container/80 rounded-xl p-3 border border-surface-bright/50">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-2 min-w-0 justify-end text-right">
            <span className="font-bold text-sm md:text-base text-on-surface truncate">
              {alert.homeTeamName}
            </span>
            {alert.homeTeamLogo ? (
              <img
                src={alert.homeTeamLogo}
                alt={alert.homeTeamName}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
              />
            ) : null}
          </div>

          {/* Scores */}
          <div className="px-3 py-1 bg-surface-container-lowest rounded-lg border border-primary/50 text-center shrink-0">
            <span className="font-geist text-xl md:text-2xl font-black text-primary tabular-nums tracking-wider">
              {alert.homeScore ?? 0} – {alert.awayScore ?? 0}
            </span>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center gap-2 min-w-0 justify-start text-left">
            {alert.awayTeamLogo ? (
              <img
                src={alert.awayTeamLogo}
                alt={alert.awayTeamName}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
              />
            ) : null}
            <span className="font-bold text-sm md:text-base text-on-surface truncate">
              {alert.awayTeamName}
            </span>
          </div>
        </div>

        {/* Scorer Spotlight */}
        {alert.scorerName && (
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-on-surface">
              <span className="text-primary font-bold">Goalscorer:</span> {alert.scorerName}
            </p>
          </div>
        )}

        {/* Bottom CTA & Dismiss */}
        <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-bright/40">
          <span className="flex items-center gap-1 text-primary font-semibold hover:underline">
            {t('common.viewMatch', 'Open Match Center')}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setVisible(false)
              onDismiss()
            }}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-colors"
            aria-label="Close goal alert"
          >
            <span className="material-symbols-outlined text-[18px] block">close</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
