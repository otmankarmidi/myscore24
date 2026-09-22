'use client'
import Link from 'next/link'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import FavoriteButton from '@/components/common/FavoriteButton'
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

  // Determine winner for bold styling
  const homeWins = score.home !== null && score.away !== null && score.home > score.away
  const awayWins = score.home !== null && score.away !== null && score.away > score.home

  // Events summary for sub-line
  const homeGoals = events?.filter(e => e.type === 'goal' && e.team === 'home').map(e => `${e.playerName} ${e.minute}'`)
  const awayGoals = events?.filter(e => e.type === 'goal' && e.team === 'away').map(e => `${e.playerName} ${e.minute}'`)
  const awayReds = events?.filter(e => (e.type === 'red_card' || e.type === 'second_yellow') && e.team === 'away') || []
  const homeReds = events?.filter(e => (e.type === 'red_card' || e.type === 'second_yellow') && e.team === 'home') || []
  const hasEvents = (homeGoals?.length || awayGoals?.length)

  return (
    <Link
      href={`/match/${match.id}`}
      className="match-row block p-2 group"
      aria-label={`${homeTeam.name} vs ${awayTeam.name}, ${status}`}
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
              <TeamLogo name={homeTeam.name} abbreviation={homeTeam.abbreviation} logo={homeTeam.logo} size="xs" />
              <span className={`font-inter text-[14px] truncate ${homeWins || (live && !awayWins) ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                {homeTeam.name}
              </span>
              {homeReds.map((_, i) => (
                <span key={i} className="w-2.5 h-3.5 rounded-[1px] inline-block shrink-0" style={{ backgroundColor: 'var(--color-error-container)' }} title="Red card" aria-label="Red card" />
              ))}
            </div>
            <span className={`font-geist font-bold text-[18px] tabular-nums leading-none shrink-0 ${
              score.home === null ? 'hidden' : homeWins ? 'text-on-surface' : 'text-outline'
            }`}>
              {score.home ?? ''}
            </span>
          </div>

          {/* Away */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo name={awayTeam.name} abbreviation={awayTeam.abbreviation} logo={awayTeam.logo} size="xs" />
              <span className={`font-inter text-[14px] truncate ${awayWins ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                {awayTeam.name}
              </span>
              {awayReds.map((_, i) => (
                <span key={i} className="w-2.5 h-3.5 rounded-[1px] inline-block shrink-0" style={{ backgroundColor: 'var(--color-error-container)' }} title="Red card" aria-label="Red card" />
              ))}
            </div>
            <span className={`font-geist font-bold text-[18px] tabular-nums leading-none shrink-0 ${
              score.away === null ? 'hidden' : awayWins ? 'text-on-surface' : 'text-outline'
            }`}>
              {score.away ?? ''}
            </span>
          </div>
        </div>

        {/* Favorite */}
        <div className="w-8 shrink-0 flex items-center justify-end">
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
