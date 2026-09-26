'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { useTimezone } from '@/context/TimezoneContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatMatchTime, isLiveStatus } from '@/lib/utils'
import { getTrendingMatches } from '@/lib/football/trending'

interface TrendingMatchesProps {
  matches?: Match[]
  initialMatches?: Match[]
  onSelectToday?: () => void
}

function getAbbreviatedName(team?: { name?: string; shortName?: string; abbreviation?: string } | null): string {
  if (!team) return 'FC'
  if (team.abbreviation && team.abbreviation.length <= 4) return team.abbreviation.toUpperCase()
  if (team.shortName && team.shortName.length <= 6) return team.shortName
  if (team.name) {
    const parts = team.name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 5)
    // Take first letter of each or first word
    return parts[0].length <= 5 ? parts[0] : parts[0].slice(0, 4)
  }
  return 'FC'
}

export default function TrendingMatches({
  matches = [],
  initialMatches = [],
  onSelectToday,
}: TrendingMatchesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { activeTimezone } = useTimezone()
  const { locale, t } = useLanguage()

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [liveOverrides, setLiveOverrides] = useState<
    Record<string, { homeScore: number; awayScore: number; minute?: number; flashing?: boolean }>
  >({})

  // Compute trending matches deterministically from provided matches or initial SSR matches
  const trendingList = useMemo(() => {
    const sourceMatches = matches.length > 0 ? matches : initialMatches
    return getTrendingMatches(sourceMatches, 10)
  }, [matches, initialMatches])

  // Listen for real-time goal events dispatched globally
  useEffect(() => {
    function handleGoalScored(e: Event) {
      const customEvent = e as CustomEvent<{
        matchId: string
        homeScore: number
        awayScore: number
        minute?: number
      }>
      const detail = customEvent.detail
      if (!detail?.matchId) return

      setLiveOverrides((prev) => ({
        ...prev,
        [detail.matchId]: {
          homeScore: detail.homeScore,
          awayScore: detail.awayScore,
          minute: detail.minute,
          flashing: true,
        },
      }))

      // Clear flash after 2 seconds
      setTimeout(() => {
        setLiveOverrides((prev) => {
          if (!prev[detail.matchId]) return prev
          return {
            ...prev,
            [detail.matchId]: {
              ...prev[detail.matchId],
              flashing: false,
            },
          }
        })
      }, 2500)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('myscore24_goal_scored', handleGoalScored)
      return () => window.removeEventListener('myscore24_goal_scored', handleGoalScored)
    }
  }, [])

  // Check scroll boundary visibility for arrow buttons
  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const isRtl = document.documentElement.dir === 'rtl'
    
    if (isRtl) {
      // In RTL, scrollLeft can be negative or positive depending on engine
      const maxScroll = el.scrollWidth - el.clientWidth
      const currentScroll = Math.abs(el.scrollLeft)
      setCanScrollLeft(currentScroll < maxScroll - 5)
      setCanScrollRight(currentScroll > 5)
    } else {
      setCanScrollLeft(el.scrollLeft > 5)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [trendingList.length])

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const isRtl = document.documentElement.dir === 'rtl'
    const distance = 260

    if (isRtl) {
      el.scrollBy({
        left: direction === 'left' ? distance : -distance,
        behavior: 'smooth',
      })
    } else {
      el.scrollBy({
        left: direction === 'left' ? -distance : distance,
        behavior: 'smooth',
      })
    }
  }

  // If no matches available, hide cleanly (Empty State requirement)
  if (trendingList.length === 0) {
    return null
  }

  return (
    <div
      aria-label="Trending Matches Ticker"
      className="sticky top-14 z-20 w-full bg-surface/95 backdrop-blur-md border-b border-surface-bright/40 select-none transition-colors"
    >
      <div className="max-w-[1480px] mx-auto px-2 sm:px-4 h-[52px] sm:h-[54px] flex items-center gap-1.5 sm:gap-2">
        {/* Left static controls: Flame Badge & Today Link */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Flame Trending Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface-container border border-surface-bright/50 text-[11px] font-bold font-geist text-primary select-none">
            <span className="text-xs select-none">🔥</span>
            <span className="hidden sm:inline">
              {locale === 'ar' ? 'الرائجة' : locale === 'fr' ? 'Tendances' : 'Trending'}
            </span>
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="hidden sm:flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-surface-container border border-surface-bright/50 hover:bg-surface-container-high hover:text-primary text-on-surface-variant transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] block">
              {locale === 'ar' ? 'navigate_next' : 'navigate_before'}
            </span>
          </button>

          {/* Today Button / Link */}
          {onSelectToday ? (
            <button
              type="button"
              onClick={onSelectToday}
              className="px-2 py-1 rounded-md bg-surface-container-high hover:bg-surface-bright text-[11px] font-semibold text-on-surface border border-surface-bright/50 transition-colors shrink-0 cursor-pointer"
            >
              {t('common.today', 'Today')}
            </button>
          ) : (
            <Link
              href="/"
              prefetch={false}
              className="px-2 py-1 rounded-md bg-surface-container-high hover:bg-surface-bright text-[11px] font-semibold text-on-surface border border-surface-bright/50 transition-colors shrink-0"
            >
              {t('common.today', 'Today')}
            </Link>
          )}
        </div>

        {/* Scrollable Track of Compact Match Cards */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trendingList.map((match) => {
            const override = liveOverrides[match.id]
            const isLive = isLiveStatus(match.status)
            const isHT = match.status === 'half_time'
            const isFinished = match.status === 'full_time' || match.status === 'penalties'
            const isScheduled = match.status === 'scheduled'

            const homeScore = override ? override.homeScore : (match.score?.home ?? null)
            const awayScore = override ? override.awayScore : (match.score?.away ?? null)
            const currentMinute = override?.minute || match.minute

            const homeName = match.homeTeam?.name || 'Home'
            const awayName = match.awayTeam?.name || 'Away'
            const homeAbbr = getAbbreviatedName(match.homeTeam)
            const awayAbbr = getAbbreviatedName(match.awayTeam)

            const formattedTime = formatMatchTime(match.kickoff, activeTimezone, locale)
            const matchCanonicalId = match.slug || match.id

            return (
              <Link
                key={match.id}
                href={`/match/${matchCanonicalId}`}
                prefetch={false}
                title={`${homeName} vs ${awayName} (${match.league?.name || 'Match'})`}
                className={`shrink-0 flex flex-col justify-center px-2 py-1 rounded-lg border bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer w-[145px] sm:w-[165px] md:w-[185px] h-[44px] sm:h-[46px] select-none group ${
                  override?.flashing
                    ? 'border-primary shadow-[0_0_12px_rgba(204,255,128,0.45)] bg-primary/10'
                    : isLive
                    ? 'border-error/40 hover:border-error/80'
                    : 'border-surface-bright/70 hover:border-primary/50'
                }`}
              >
                {/* Row 1: Competition Logo + Status / Time */}
                <div className="flex items-center justify-between gap-1 leading-none">
                  <div className="flex items-center gap-1 min-w-0">
                    <CompetitionLogo
                      logo={match.league?.logo}
                      name={match.league?.name}
                      country={match.league?.country}
                      countryFlag={match.league?.countryFlag}
                      providerId={match.league?.id}
                      slug={match.league?.slug}
                      size={12}
                      className="shrink-0"
                    />

                    {isLive ? (
                      <span className="flex items-center gap-1 font-mono font-black text-[9px] sm:text-[10px] text-error tracking-tight">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-error" />
                        </span>
                        {isHT ? 'HT' : `LIVE ${currentMinute ? `${currentMinute}'` : ''}`}
                      </span>
                    ) : isFinished ? (
                      <span className="font-mono font-bold text-[9px] sm:text-[10px] text-on-surface-variant/80">
                        {match.status === 'penalties' ? 'PEN' : 'FT'}
                      </span>
                    ) : (
                      <span className="font-mono font-medium text-[9px] sm:text-[10px] text-on-surface-variant">
                        {formattedTime || 'Today'}
                      </span>
                    )}
                  </div>

                  {/* Competition short identifier */}
                  <span className="text-[8px] sm:text-[9px] text-on-surface-variant/60 font-semibold uppercase truncate max-w-[45px]">
                    {match.league?.shortName || match.league?.countryCode || ''}
                  </span>
                </div>

                {/* Row 2: Teams & Live Score */}
                <div className="flex items-center justify-between gap-1 mt-1 leading-tight">
                  {/* Home Team */}
                  <div className="flex items-center gap-1 min-w-0 flex-1 justify-start">
                    <TeamLogo
                      name={homeName}
                      abbreviation={homeAbbr}
                      logo={match.homeTeam?.logo}
                      size="xs"
                    />
                    <span className="text-[11px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {homeAbbr}
                    </span>
                  </div>

                  {/* Score or VS in Center */}
                  <div className="shrink-0 px-1 text-center font-mono">
                    {homeScore !== null && awayScore !== null && !isScheduled ? (
                      <span
                        className={`text-xs font-black tabular-nums ${
                          isLive ? 'text-error' : 'text-on-surface'
                        }`}
                      >
                        {homeScore} - {awayScore}
                      </span>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        vs
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
                    <span className="text-[11px] font-bold text-on-surface truncate group-hover:text-primary transition-colors text-right">
                      {awayAbbr}
                    </span>
                    <TeamLogo
                      name={awayName}
                      abbreviation={awayAbbr}
                      logo={match.awayTeam?.logo}
                      size="xs"
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Right Arrow Button */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="hidden sm:flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-surface-container border border-surface-bright/50 hover:bg-surface-container-high hover:text-primary text-on-surface-variant transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] block">
              {locale === 'ar' ? 'navigate_before' : 'navigate_next'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
