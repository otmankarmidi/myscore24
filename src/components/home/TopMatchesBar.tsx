'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone } from '@/context/TimezoneContext'
import { formatMatchTime, isLiveStatus, isToday } from '@/lib/utils'
import { buildMatchUrl } from '@/lib/football/matchUrl'
import { getCompetitionPriority, getCleanLeagueDisplayName } from '@/config/competitions'

interface TopMatchesBarProps {
  matches: Match[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
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
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Pre-calculated dates for Yesterday, Today, Tomorrow
  const today = useMemo(() => new Date(), [])
  const yesterday = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  }, [])
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Collect unique leagues for the dropdown with clean names & priority order
  const uniqueLeagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string; priority: number }>()
    matches.forEach((m) => {
      const key = String(m.league?.id || m.league?.slug || '')
      if (key && !map.has(key)) {
        map.set(key, {
          id: key,
          name: getCleanLeagueDisplayName(m.league, locale),
          priority: getCompetitionPriority(m.league),
        })
      }
    })
    const list = Array.from(map.values())
    list.sort((a, b) => a.priority - b.priority)
    return list
  }, [matches, locale])

  // Filter matches by selected competition & ALWAYS sort top 6 leagues and top games FIRST!
  const displayMatches = useMemo(() => {
    const baseList =
      selectedLeagueId === 'all'
        ? matches
        : matches.filter(
            (m) => String(m.league?.id || m.league?.slug || '') === selectedLeagueId
          )

    return [...baseList].sort((a, b) => {
      // 1. Top 6 leagues / competition priority first (Lower number = higher priority)
      const pA = getCompetitionPriority(a.league)
      const pB = getCompetitionPriority(b.league)
      if (pA !== pB) return pA - pB

      // 2. Live matches first within the same tier
      const aLive = isLiveStatus(a.status) ? 1 : 0
      const bLive = isLiveStatus(b.status) ? 1 : 0
      if (aLive !== bLive) return bLive - aLive

      // 3. Chronological kickoff time
      const timeA = new Date(a.kickoff || 0).getTime()
      const timeB = new Date(b.kickoff || 0).getTime()
      return timeA - timeB
    })
  }, [matches, selectedLeagueId])

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
    const amount = 320
    const isRtl = locale === 'ar'
    // Normalize scroll direction across RTL / LTR
    const mult = dir === 'left' ? (isRtl ? 1 : -1) : (isRtl ? -1 : 1)
    scrollRef.current.scrollBy({ left: mult * amount, behavior: 'smooth' })
  }

  const selectedLeagueName = useMemo(() => {
    if (selectedLeagueId === 'all') {
      return locale === 'ar' ? 'أفضل المباريات' : locale === 'fr' ? 'Meilleurs matchs' : 'Top Matches'
    }
    const found = uniqueLeagues.find((l) => l.id === selectedLeagueId)
    return found ? found.name : (locale === 'ar' ? 'أفضل المباريات' : 'Top Matches')
  }, [selectedLeagueId, uniqueLeagues, locale])

  // Is today active?
  const isTodayActive = isToday(selectedDate)
  const isYesterdayActive =
    selectedDate.getDate() === yesterday.getDate() &&
    selectedDate.getMonth() === yesterday.getMonth() &&
    selectedDate.getFullYear() === yesterday.getFullYear()
  const isTomorrowActive =
    selectedDate.getDate() === tomorrow.getDate() &&
    selectedDate.getMonth() === tomorrow.getMonth() &&
    selectedDate.getFullYear() === tomorrow.getFullYear()

  // Format date for the hidden input
  const dateInputValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`

  return (
    <section
      aria-label="Matches Top Bar"
      className="w-full bg-[#0a0d14] border-y border-[#1a202c]/80 select-none py-2.5 shadow-sm"
    >
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 space-y-2.5">
        {/* Header Row: Navigation Chevrons on left, Competitions & Date Tabs on right (Matching Uploaded Image) */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
          {/* Left: Scroll Chevrons < > */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll matches left"
              className="w-7 h-7 rounded bg-[#141a27] border border-slate-800 hover:bg-[#1d2638] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll matches right"
              className="w-7 h-7 rounded bg-[#141a27] border border-slate-800 hover:bg-[#1d2638] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Right: Competitions Dropdown + Date Quick Filters (Matching Screenshot) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end text-xs">
            {/* All Matches Jump Link */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('matches')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-slate-400 hover:text-white transition-colors font-medium flex items-center gap-1 shrink-0 cursor-pointer text-[12px]"
            >
              <span>{locale === 'ar' ? 'جميع المباريات' : locale === 'fr' ? 'Tous les matchs' : 'All Matches'}</span>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
            </button>

            {/* Calendar Icon Button with hidden native date input */}
            <div className="relative shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.()
                  } catch {
                    dateInputRef.current?.click()
                  }
                }}
                title={locale === 'ar' ? 'اختر تاريخاً' : 'Choose date'}
                aria-label="Choose date"
                className="w-7 h-7 rounded bg-[#141a27] border border-slate-800 hover:border-amber-500/70 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={dateInputValue}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number)
                    onSelectDate(new Date(y, m - 1, d))
                  }
                }}
                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
              />
            </div>

            {/* Tomorrow Button */}
            <button
              type="button"
              onClick={() => onSelectDate(tomorrow)}
              className={`font-semibold transition-colors cursor-pointer px-1 py-0.5 ${
                isTomorrowActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {locale === 'ar' ? 'غداً' : locale === 'fr' ? 'Demain' : 'Tomorrow'}
            </button>

            {/* Today Button (Active Highlight in Amber as in screenshot) */}
            <button
              type="button"
              onClick={() => onSelectDate(today)}
              className={`font-bold transition-colors cursor-pointer px-1 py-0.5 ${
                isTodayActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {locale === 'ar' ? 'اليوم' : locale === 'fr' ? "Aujourd'hui" : 'Today'}
            </button>

            {/* Yesterday Button */}
            <button
              type="button"
              onClick={() => onSelectDate(yesterday)}
              className={`font-semibold transition-colors cursor-pointer px-1 py-0.5 ${
                isYesterdayActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {locale === 'ar' ? 'أمس' : locale === 'fr' ? 'Hier' : 'Yesterday'}
            </button>

            {/* All Competitions Dropdown Selector (Matching Image top right) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141a27] border border-slate-800 hover:border-amber-500/60 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <span className="truncate max-w-[130px] sm:max-w-[170px]">{selectedLeagueName}</span>
                <span
                  className={`material-symbols-outlined text-base transition-transform duration-200 text-slate-400 ${
                    isDropdownOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute end-0 top-full mt-1.5 w-60 max-h-72 overflow-y-auto bg-[#141a27] border border-slate-700 rounded-lg shadow-2xl py-1 z-30 animate-fade-in text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeagueId('all')
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full text-start px-3 py-2 flex items-center justify-between hover:bg-[#1f283a] transition-colors cursor-pointer ${
                      selectedLeagueId === 'all' ? 'text-amber-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    <span>{locale === 'ar' ? 'أفضل المباريات (الكل)' : 'All Top Matches'}</span>
                    {selectedLeagueId === 'all' && (
                      <span className="material-symbols-outlined text-sm text-amber-400">check</span>
                    )}
                  </button>

                  {uniqueLeagues.map((league) => (
                    <button
                      key={league.id}
                      type="button"
                      onClick={() => {
                        setSelectedLeagueId(league.id)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full text-start px-3 py-2 flex items-center justify-between hover:bg-[#1f283a] transition-colors cursor-pointer truncate ${
                        selectedLeagueId === league.id ? 'text-amber-400 font-bold' : 'text-slate-200'
                      }`}
                    >
                      <span className="truncate">{league.name}</span>
                      {selectedLeagueId === league.id && (
                        <span className="material-symbols-outlined text-sm text-amber-400">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards Track: Clean, Horizontal Scrolling (Matching Uploaded Image) */}
        <div className="relative flex items-center">
          <div
            ref={scrollRef}
            className="flex-1 flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              // Skeleton cards
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[190px] sm:w-[210px] h-[82px] rounded-lg bg-[#111724] animate-pulse border border-slate-800 p-2.5"
                />
              ))
            ) : displayMatches.length === 0 ? (
              <div className="w-full py-4 text-center text-xs text-slate-400 font-medium">
                {locale === 'ar' ? 'لا توجد مباريات مجدولة لهذا اليوم' : 'No matches scheduled for this date'}
              </div>
            ) : (
              displayMatches.map((match) => {
                const live = isLiveStatus(match.status)
                const isFinished = match.status === 'full_time' || match.status === 'penalties'
                const isScheduled = match.status === 'scheduled'
                const matchHref = buildMatchUrl(match)

                // Status / Time text
                let statusLabel = ''
                if (isFinished) {
                  statusLabel = locale === 'ar' ? 'انتهت' : locale === 'fr' ? 'Terminé' : 'FT'
                } else if (live) {
                  statusLabel = match.minute ? `${match.minute}'` : (locale === 'ar' ? 'مباشر' : 'LIVE')
                } else if (isScheduled) {
                  statusLabel = formatMatchTime(match.kickoff, activeTimezone, locale)
                } else {
                  statusLabel = match.status
                }

                const leagueTitle =
                  getCleanLeagueDisplayName(match.league, locale) || match.league?.name || 'Football'

                return (
                  <Link
                    key={match.id}
                    href={matchHref}
                    prefetch={false}
                    className="shrink-0 w-[190px] sm:w-[210px] h-[82px] p-2.5 rounded-lg bg-[#0e131d] border border-[#1b2334] hover:border-amber-500/60 hover:bg-[#131a29] transition-all flex flex-col justify-between cursor-pointer group shadow-sm"
                  >
                    {/* Top Row: Kickoff Time on Left, League Name in Amber on Right */}
                    <div className="flex items-center justify-between text-[11px] leading-tight gap-1">
                      {/* Kickoff / Status (Left in RTL) */}
                      <span
                        className={`font-semibold shrink-0 ${
                          live
                            ? 'text-red-400 flex items-center gap-1 font-bold'
                            : isFinished
                            ? 'text-slate-400 font-medium'
                            : 'text-slate-200 font-bold'
                        }`}
                      >
                        {live && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {statusLabel}
                      </span>

                      {/* League Name (Amber in Screenshot) */}
                      <span className="text-amber-400 font-bold truncate max-w-[130px] text-end">
                        {leagueTitle}
                      </span>
                    </div>

                    {/* Team 1 Row: Score on Left, Team Name + Logo on Right (in RTL) */}
                    <div className="flex items-center justify-between gap-1 leading-none">
                      {locale === 'ar' ? (
                        <>
                          <span className="text-xs font-bold text-slate-300 tabular-nums shrink-0">
                            {isScheduled ? '-' : (match.score?.home ?? 0)}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0 justify-end flex-1">
                            <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                              {match.homeTeam?.name || 'Home'}
                            </span>
                            <TeamLogo
                              logo={match.homeTeam?.logo}
                              name={match.homeTeam?.name || 'Home'}
                              size="xs"
                            />
                          </div>
                        </>
                      ) : (
                        <>
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
                          <span className="text-xs font-bold text-slate-300 tabular-nums shrink-0">
                            {isScheduled ? '-' : (match.score?.home ?? 0)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Team 2 Row: Score on Left, Team Name + Logo on Right (in RTL) */}
                    <div className="flex items-center justify-between gap-1 leading-none">
                      {locale === 'ar' ? (
                        <>
                          <span className="text-xs font-bold text-slate-300 tabular-nums shrink-0">
                            {isScheduled ? '-' : (match.score?.away ?? 0)}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0 justify-end flex-1">
                            <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                              {match.awayTeam?.name || 'Away'}
                            </span>
                            <TeamLogo
                              logo={match.awayTeam?.logo}
                              name={match.awayTeam?.name || 'Away'}
                              size="xs"
                            />
                          </div>
                        </>
                      ) : (
                        <>
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
                          <span className="text-xs font-bold text-slate-300 tabular-nums shrink-0">
                            {isScheduled ? '-' : (match.score?.away ?? 0)}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
