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

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const absScroll = Math.abs(scrollLeft)
    setCanScrollLeft(absScroll > 4)
    setCanScrollRight(absScroll < scrollWidth - clientWidth - 6)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      return () => el.removeEventListener('scroll', checkScroll)
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
      className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 mt-3 mb-2 select-none"
    >
      {/* Dark container matching reference design */}
      <div className="rounded-2xl bg-[#0c121e] border border-[#182335] p-2.5 sm:p-3 flex items-center gap-3 overflow-hidden shadow-md">
        {/* Left Section: Live & Upcoming Title + Scroll Left Chevron */}
        <div className="shrink-0 flex items-center gap-3 pe-3 border-e border-slate-800/80">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-white font-extrabold text-xs sm:text-sm leading-tight">
              <span className="material-symbols-outlined text-orange-500 text-base">local_fire_department</span>
              <span className="flex flex-col">
                <span>{isAr ? 'مباشر و' : 'Live &'}</span>
                <span>{isAr ? 'قادم' : 'Upcoming'}</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
              {isAr ? 'أهم مباريات اليوم' : locale === 'fr' ? 'Meilleurs matchs' : "Today's top matches"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll matches left"
            className="w-7 h-7 rounded-full bg-[#141d2e] hover:bg-[#1d2a42] border border-slate-700/60 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-base rtl:rotate-180">chevron_left</span>
          </button>
        </div>

        {/* Center Cards Track */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-2.5 overflow-x-auto scrollbar-none py-0.5 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[190px] sm:w-[205px] h-[78px] rounded-xl bg-[#121a29] animate-pulse border border-[#1b263b] p-2.5"
              />
            ))
          ) : displayMatches.length === 0 ? (
            <div className="w-full py-4 text-center text-xs text-slate-400 font-medium">
              {isAr ? 'لا توجد مباريات مجدولة لهذا اليوم' : 'No matches scheduled for this date'}
            </div>
          ) : (
            displayMatches.map((match) => {
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
                  className="shrink-0 w-[190px] sm:w-[205px] h-[78px] p-2 sm:p-2.5 rounded-xl bg-[#121a29] border border-[#1b263b] hover:border-slate-500 hover:bg-[#162134] transition-all flex flex-col justify-between cursor-pointer group shadow-sm"
                >
                  {/* Top Row: Kickoff / Live badge on Left, League name & logo on Right */}
                  <div className="flex items-center justify-between text-[11px] leading-tight gap-1">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-bold text-xs text-slate-200">{timeStr}</span>
                      {live && (
                        <span className="px-1.5 py-0.5 rounded bg-red-600 text-[9px] font-black text-white uppercase tracking-wider animate-pulse">
                          LIVE
                        </span>
                      )}
                      {isFinished && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {isAr ? 'انتهت' : 'FT'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 max-w-[110px] justify-end">
                      <span className="text-[10px] font-semibold text-slate-400 truncate">
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
                              isPl ? 'filter brightness-0 invert' : ''
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team 1 Row */}
                  <div className="flex items-center justify-between gap-1 leading-none">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <TeamLogo
                        logo={match.homeTeam?.logo}
                        name={match.homeTeam?.name || 'Home'}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                        {match.homeTeam?.name || 'Home'}
                      </span>
                    </div>
                    {!isScheduled && (
                      <span className="text-xs font-bold text-slate-200 tabular-nums shrink-0">
                        {match.score?.home ?? 0}
                      </span>
                    )}
                  </div>

                  {/* Team 2 Row */}
                  <div className="flex items-center justify-between gap-1 leading-none">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <TeamLogo
                        logo={match.awayTeam?.logo}
                        name={match.awayTeam?.name || 'Away'}
                        size="xs"
                      />
                      <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                        {match.awayTeam?.name || 'Away'}
                      </span>
                    </div>
                    {!isScheduled && (
                      <span className="text-xs font-bold text-slate-200 tabular-nums shrink-0">
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
            className="w-7 h-7 rounded-full bg-[#141d2e] hover:bg-[#1d2a42] border border-slate-700/60 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-base rtl:rotate-180">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}
