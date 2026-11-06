'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone } from '@/context/TimezoneContext'
import { formatMatchTime, isLiveStatus } from '@/lib/utils'
import { buildMatchUrl } from '@/lib/football/matchUrl'
import { getCompetitionPriority, getCleanLeagueDisplayName } from '@/config/competitions'

interface TopMatchesBarProps {
  matches: Match[]
  selectedDate?: Date
  onSelectDate?: (date: Date) => void
  isLoading?: boolean
}

export default function TopMatchesBar({
  matches = [],
  selectedDate,
  onSelectDate,
  isLoading = false,
}: TopMatchesBarProps) {
  const { locale, t } = useLanguage()
  const { activeTimezone } = useTimezone()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Sort matches by competition priority and kickoff time, prioritizing live matches
  const displayMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      // 1. Live matches first
      const aLive = isLiveStatus(a.status) ? 1 : 0
      const bLive = isLiveStatus(b.status) ? 1 : 0
      if (aLive !== bLive) return bLive - aLive

      // 2. Priority of league (Lower number = higher priority)
      const pA = getCompetitionPriority(a.league)
      const pB = getCompetitionPriority(b.league)
      if (pA !== pB) return pA - pB

      // 3. Chronological kickoff time
      const timeA = new Date(a.kickoff || 0).getTime()
      const timeB = new Date(b.kickoff || 0).getTime()
      return timeA - timeB
    })
  }, [matches])

  const rafRef = useRef<number | null>(null)

  const checkScroll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current
      if (!el) return
      const { scrollLeft, scrollWidth, clientWidth } = el
      const absScroll = Math.abs(scrollLeft)
      setCanScrollLeft(absScroll > 4)
      setCanScrollRight(absScroll < scrollWidth - clientWidth - 6)
    })
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => {
        el.removeEventListener('scroll', checkScroll)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }
  }, [displayMatches])

  const handleScroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 300
    const isRtl = locale === 'ar'
    const mult = dir === 'left' ? (isRtl ? 1 : -1) : (isRtl ? -1 : 1)
    scrollRef.current.scrollBy({ left: mult * amount, behavior: 'smooth' })
  }

  const isAr = locale === 'ar'

  return (
    <section
      aria-label="Matches Top Bar"
      className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 mt-4 mb-3 select-none"
    >
      {/* Container */}
      <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-3.5 flex items-center gap-3.5 overflow-hidden shadow-xs">
        {/* Left Section: Live & Upcoming Title + Scroll Left Chevron */}
        <div className="shrink-0 flex items-center gap-3 pe-3.5 border-e border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm leading-tight">
              <span className="material-symbols-outlined text-purple-600 dark:text-amber-400 text-base">local_fire_department</span>
              <span className="flex flex-col">
                <span>{isAr ? 'مباشر و' : 'Live &'}</span>
                <span>{isAr ? 'قادم' : 'Upcoming'}</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap mt-0.5">
              {isAr ? 'أهم مباريات اليوم' : locale === 'fr' ? 'Meilleurs matchs' : "Today's top matches"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll matches left"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-base rtl:rotate-180">chevron_left</span>
          </button>
        </div>

        {/* Center Cards Track with CSS scroll-snap */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[195px] sm:w-[215px] h-[86px] rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/80 dark:border-slate-800 p-3 snap-start"
              />
            ))
          ) : displayMatches.length === 0 ? (
            <div className="w-full py-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isAr ? 'لا توجد مباريات مجدولة لهذا اليوم' : 'No matches scheduled for this date'}
            </div>
          ) : (
            displayMatches.slice(0, 12).map((match) => {
              const live = isLiveStatus(match.status)
              const isFinished = match.status === 'full_time' || match.status === 'penalties'
              const isScheduled = match.status === 'scheduled'
              const matchHref = match.slug ? buildMatchUrl(match) : '#'

              const timeStr = formatMatchTime(match.kickoff, activeTimezone, locale)

              const leagueKey = String(match.league?.slug || match.league?.id || '').toLowerCase()
              const isPl = leagueKey.includes('premier') || leagueKey === 'epl' || leagueKey === '39'
              const isLaLiga = leagueKey.includes('liga') || leagueKey === 'laliga' || leagueKey === '140'
              const isSerieA = leagueKey.includes('serie') || leagueKey === '135'
              const isBotola = leagueKey.includes('botola') || leagueKey === '200'

              const leagueDisplay = isLaLiga
                ? 'LaLiga'
                : isPl
                ? 'Premier League'
                : isSerieA
                ? 'Serie A'
                : isBotola
                ? 'Botola Pro'
                : (getCleanLeagueDisplayName(match.league, locale) || match.league?.name || 'Football')

              const leagueLogo =
                match.league?.logo ||
                (isPl
                  ? 'https://media.api-sports.io/football/leagues/39.png'
                  : isLaLiga
                  ? 'https://media.api-sports.io/football/leagues/140.png'
                  : isSerieA
                  ? 'https://media.api-sports.io/football/leagues/135.png'
                  : isBotola
                  ? 'https://media.api-sports.io/football/leagues/200.png'
                  : undefined)

              return (
                <Link
                  key={match.id}
                  href={matchHref}
                  prefetch={false}
                  className="shrink-0 w-[195px] sm:w-[215px] h-[86px] p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 hover:bg-white dark:bg-[#131E33] dark:hover:bg-[#18263F] border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-700/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group snap-start"
                >
                  {/* Top Row: Kickoff / Live badge on Left, League name & logo on Right */}
                  <div className="flex items-center justify-between text-[11px] leading-tight gap-1">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{timeStr}</span>
                      {live && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-[9px] font-black text-white uppercase tracking-wider animate-pulse">
                          LIVE
                        </span>
                      )}
                      {isFinished && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isAr ? 'انتهت' : 'FT'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 max-w-[110px] justify-end">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {leagueDisplay}
                      </span>
                      {leagueLogo && (
                        <div className="w-3.5 h-3.5 relative shrink-0">
                          <Image
                            src={leagueLogo}
                            alt={leagueDisplay}
                            width={14}
                            height={14}
                            className={`object-contain ${
                              isPl ? 'filter brightness-0 dark:invert' : ''
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team 1 Row */}
                  <div className="flex items-center justify-between gap-1 leading-none">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <TeamLogo
                        logo={match.homeTeam?.logo}
                        name={match.homeTeam?.name || 'Home'}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                        {match.homeTeam?.name || 'Home'}
                      </span>
                    </div>
                    {!isScheduled && (
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                        {match.score?.home ?? 0}
                      </span>
                    )}
                  </div>

                  {/* Team 2 Row */}
                  <div className="flex items-center justify-between gap-1 leading-none">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <TeamLogo
                        logo={match.awayTeam?.logo}
                        name={match.awayTeam?.name || 'Away'}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                        {match.awayTeam?.name || 'Away'}
                      </span>
                    </div>
                    {!isScheduled && (
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                        {match.score?.away ?? 0}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Right Section: Scroll Right Chevron */}
        <div className="shrink-0 ps-1 flex items-center">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll matches right"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-base rtl:rotate-180">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}
