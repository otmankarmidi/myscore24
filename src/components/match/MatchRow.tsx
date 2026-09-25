'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import FavoriteButton from '@/components/common/FavoriteButton'
import { MatchNotificationButton } from '@/components/common/MatchNotificationButton'
import MatchStatusBadge from '@/components/common/MatchStatusBadge'
import { formatMatchTime, isLiveStatus } from '@/lib/utils'
import { useFavorites } from '@/hooks/useFavorites'
import { useTimezone } from '@/context/TimezoneContext'
import { useLanguage } from '@/context/LanguageContext'

interface MatchRowProps {
  match: Match
  isFavorited?: boolean
  onToggleFavorite?: () => void
}

export default function MatchRow({ match, isFavorited, onToggleFavorite }: MatchRowProps) {
  const { activeTimezone } = useTimezone()
  const { locale } = useLanguage()
  const { isMatchFavorite, toggleFavoriteMatch } = useFavorites()
  const favorited = isFavorited !== undefined ? isFavorited : isMatchFavorite(match.id)
  const handleToggle = onToggleFavorite || (() => toggleFavoriteMatch(match.id))

  const { homeTeam, awayTeam, score, status, minute, kickoff, events } = match
  const live = isLiveStatus(status)
  const isHT = status === 'half_time'
  const isFinished = status === 'full_time' || status === 'penalties'

  const safeHome = homeTeam || { name: 'Home Team', abbreviation: 'HOM', logo: '' }
  const safeAway = awayTeam || { name: 'Away Team', abbreviation: 'AWY', logo: '' }

  const homeScore = score?.home ?? null
  const awayScore = score?.away ?? null

  // Goal flashing states
  const [isFlashingGoal, setIsFlashingGoal] = useState<boolean>(false)
  const [lastScoringSide, setLastScoringSide] = useState<'home' | 'away' | null>(null)

  const prevScoreRef = useRef<{ home: number | null; away: number | null }>({
    home: homeScore,
    away: awayScore,
  })

  // Detect score jumps while live
  useEffect(() => {
    const prev = prevScoreRef.current
    if (prev.home !== null && homeScore !== null && homeScore > prev.home) {
      setIsFlashingGoal(true)
      setLastScoringSide('home')
      const t = setTimeout(() => setIsFlashingGoal(false), 8000)
      return () => clearTimeout(t)
    }
    if (prev.away !== null && awayScore !== null && awayScore > prev.away) {
      setIsFlashingGoal(true)
      setLastScoringSide('away')
      const t = setTimeout(() => setIsFlashingGoal(false), 8000)
      return () => clearTimeout(t)
    }
    prevScoreRef.current = { home: homeScore, away: awayScore }
  }, [homeScore, awayScore])

  // Listen to global live alert event for goals
  useEffect(() => {
    const handleGoalEvent = (e: Event) => {
      const ce = e as CustomEvent<{ matchId: string; team?: 'home' | 'away' }>
      if (ce.detail && String(ce.detail.matchId) === String(match.id)) {
        setIsFlashingGoal(true)
        if (ce.detail.team) setLastScoringSide(ce.detail.team)
        setTimeout(() => setIsFlashingGoal(false), 8000)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('myscore24_goal_scored', handleGoalEvent)
      return () => window.removeEventListener('myscore24_goal_scored', handleGoalEvent)
    }
  }, [match.id])

  // Determine winner for bold styling
  const homeWins = homeScore !== null && awayScore !== null && homeScore > awayScore
  const awayWins = homeScore !== null && awayScore !== null && awayScore > homeScore

  // Events summary for sub-line
  const homeGoals = events?.filter(e => e && e.type === 'goal' && e.team === 'home').map(e => `${e.playerName} ${e.minute}'`) || []
  const awayGoals = events?.filter(e => e && e.type === 'goal' && e.team === 'away').map(e => `${e.playerName} ${e.minute}'`) || []
  const awayReds = events?.filter(e => e && (e.type === 'red_card' || e.type === 'second_yellow') && e.team === 'away') || []
  const homeReds = events?.filter(e => e && (e.type === 'red_card' || e.type === 'second_yellow') && e.team === 'home') || []
  const hasEvents = (homeGoals.length > 0 || awayGoals.length > 0)
  const hasValidId = Boolean(match.id && String(match.id).trim() !== '' && String(match.id) !== 'undefined')
  const matchHref = hasValidId ? `/match/${match.id}` : '#'

  return (
    <Link
      href={matchHref}
      prefetch={false}
      onClick={(e) => {
        if (!hasValidId) e.preventDefault()
      }}
      className={`match-row block p-2 group transition-all duration-300 relative ${
        isFlashingGoal
          ? 'animate-score-flash ring-2 ring-primary/80 rounded-lg shadow-[0_0_20px_rgba(204,255,128,0.35)]'
          : ''
      }`}
      aria-label={`${safeHome.name} vs ${safeAway.name}, ${status || 'scheduled'}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Status column */}
        <div className="w-14 shrink-0 flex flex-col items-start justify-center gap-0.5">
          {status === 'scheduled' ? (
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-geist font-bold text-[11px] tabular-nums">
              {formatMatchTime(kickoff, activeTimezone, locale)}
            </span>
          ) : (
            <MatchStatusBadge status={status} minute={live && !isHT ? minute : undefined} />
          )}
        </div>

        {/* Teams & scores */}
        <div className="flex-1 flex flex-col min-w-0 gap-1">
          {/* Home */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo name={safeHome.name} abbreviation={safeHome.abbreviation} logo={safeHome.logo} size="xs" />
              <span className={`font-inter text-[14px] truncate ${homeWins || (live && !awayWins) ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                {safeHome.name}
              </span>
              {homeReds.map((_, i) => (
                <span key={i} className="w-2.5 h-3.5 rounded-[1px] inline-block shrink-0" style={{ backgroundColor: 'var(--color-error-container)' }} title="Red card" aria-label="Red card" />
              ))}
            </div>
            {/* Home Score */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isFlashingGoal && (lastScoringSide === 'home' || !lastScoringSide) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-black animate-bounce shadow">
                  GOAL!
                </span>
              )}
              <span className={`font-geist font-bold text-[18px] tabular-nums leading-none shrink-0 transition-transform ${
                homeScore === null ? 'hidden' : isFlashingGoal && (lastScoringSide === 'home' || !lastScoringSide) ? 'text-primary scale-125' : homeWins ? 'text-on-surface' : 'text-outline'
              }`}>
                {homeScore ?? ''}
              </span>
            </div>
          </div>

          {/* Away */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo name={safeAway.name} abbreviation={safeAway.abbreviation} logo={safeAway.logo} size="xs" />
              <span className={`font-inter text-[14px] truncate ${awayWins ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                {safeAway.name}
              </span>
              {awayReds.map((_, i) => (
                <span key={i} className="w-2.5 h-3.5 rounded-[1px] inline-block shrink-0" style={{ backgroundColor: 'var(--color-error-container)' }} title="Red card" aria-label="Red card" />
              ))}
            </div>
            {/* Away Score */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isFlashingGoal && (lastScoringSide === 'away' || !lastScoringSide) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-black animate-bounce shadow">
                  GOAL!
                </span>
              )}
              <span className={`font-geist font-bold text-[18px] tabular-nums leading-none shrink-0 transition-transform ${
                awayScore === null ? 'hidden' : isFlashingGoal && (lastScoringSide === 'away' || !lastScoringSide) ? 'text-primary scale-125' : awayWins ? 'text-on-surface' : 'text-outline'
              }`}>
                {awayScore ?? ''}
              </span>
            </div>
          </div>
        </div>

        {/* Actions: Notifications & Favorite */}
        <div className="shrink-0 flex items-center gap-1 justify-end">
          <MatchNotificationButton
            matchId={match.id}
            matchLabel={`${homeTeam.name} vs ${awayTeam.name}`}
            size="sm"
          />
          <FavoriteButton
            isFavorited={favorited}
            onToggle={handleToggle}
            label={`${homeTeam.name} vs ${awayTeam.name}`}
          />
        </div>
      </div>

      {/* Event sub-line */}
      {hasEvents ? (
        <div className="mt-1.5 flex items-center justify-between font-geist text-[10px] text-on-surface-variant gap-2 overflow-hidden">
          <span className="truncate">
            {homeGoals?.map(g => `⚽ ${g}`).join('  ')}
          </span>
          <span className="truncate text-right rtl:text-left">
            {awayGoals?.map(g => `⚽ ${g}`).join('  ')}
          </span>
        </div>
      ) : null}
    </Link>
  )
}
