'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone } from '@/context/TimezoneContext'
import { formatMatchTime, isLiveStatus, isToday } from '@/lib/utils'
import { buildMatchUrl } from '@/lib/football/matchUrl'

interface TopMatchesBarProps {
  matches: Match[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  isLoading?: boolean
}

/**
 * Generate 7 days around the active date: -2, -1 (Yesterday), 0 (Today), +1 (Tomorrow), +2, +3
 */
function getSurroundingDates(centerDate: Date): Date[] {
  const result: Date[] = []
  for (let i = -2; i <= 3; i++) {
    const d = new Date(centerDate)
    d.setDate(centerDate.getDate() + i)
    result.push(d)
  }
  return result
}

function getDateLabel(date: Date, locale: string): string {
  const today = new Date()
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (isToday(date) || diffDays === 0) {
    return locale === 'ar' ? 'اليوم' : locale === 'fr' ? "Aujourd'hui" : 'Today'
  }
  if (diffDays === -1) {
    return locale === 'ar' ? 'أمس' : locale === 'fr' ? 'Hier' : 'Yesterday'
  }
  if (diffDays === 1) {
    return locale === 'ar' ? 'غداً' : locale === 'fr' ? 'Demain' : 'Tomorrow'
  }

  // Formatting for other days: "الأربعاء، 14 أكتوبر" or "Wed, 14 Oct"
  try {
    const bcp = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-GB'
    return date.toLocaleDateString(bcp, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }
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
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Collect unique leagues for the "All Competitions" dropdown
  const uniqueLeagues = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>()
    matches.forEach((m) => {
      const key = String(m.league?.id || m.league?.slug || '')
      if (key && !map.has(key)) {
        map.set(key, { id: key, name: m.league?.name || 'Competition' })
      }
    })
    return Array.from(map.values())
  }, [matches])

  // Filter matches by selected competition
  const displayMatches = useMemo(() => {
    if (selectedLeagueId === 'all') return matches
    return matches.filter(
      (m) => String(m.league?.id || m.league?.slug || '') === selectedLeagueId
    )
  }, [matches, selectedLeagueId])

  const dateItems = useMemo(() => {
    return getSurroundingDates(selectedDate)
  }, [selectedDate])

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    // Handle RTL vs LTR scroll coordinates
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
    const amount = 340
    const mult = dir === 'left' ? -1 : 1
    scrollRef.current.scrollBy({ left: mult * amount, behavior: 'smooth' })
  }

  const selectedLeagueName = useMemo(() => {
    if (selectedLeagueId === 'all') {
      return locale === 'ar' ? 'جميع المسابقات' : locale === 'fr' ? 'Toutes compétitions' : 'All Competitions'
    }
    const found = uniqueLeagues.find((l) => l.id === selectedLeagueId)
    return found ? found.name : (locale === 'ar' ? 'جميع المسابقات' : 'All Competitions')
  }, [selectedLeagueId, uniqueLeagues, locale])

  return (
    <section
      aria-label="Matches Top Bar"
      className="w-full bg-[#0d131f] border-y border-surface-bright/50 select-none shadow-sm"
    >
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 py-2 space-y-2">
        {/* Row 1: Date Navigation Tabs + "All Competitions" Dropdown (Matching Image 3) */}
        <div className="flex items-center justify-between gap-2 border-b border-surface-bright/40 pb-2">
          {/* Date Selector Navigation Strip */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {/* Prev Day Chevron */}
            <button
              type="button"
              onClick={() => {
                const prev = new Date(selectedDate)
                prev.setDate(prev.getDate() - 1)
                onSelectDate(prev)
              }}
              title="Previous day"
              aria-label="Previous day"
              className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] rtl:rotate-180">
                chevron_left
              </span>
            </button>

            {/* Date Pills */}
            {dateItems.map((d, idx) => {
              const active = d.toDateString() === selectedDate.toDateString()
              const label = getDateLabel(d, locale)

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectDate(d)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-black text-white border border-surface-bright/70 shadow-inner'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {label}
                </button>
              )
            })}

            {/* Next Day Chevron */}
            <button
              type="button"
              onClick={() => {
                const next = new Date(selectedDate)
                next.setDate(next.getDate() + 1)
                onSelectDate(next)
              }}
              title="Next day"
              aria-label="Next day"
              className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] rtl:rotate-180">
                chevron_right
              </span>
            </button>
          </div>

          {/* All Competitions Dropdown Selector (Matching Image 3 top right) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-container border border-surface-bright/60 hover:border-primary/60 text-xs font-semibold text-on-surface transition-all cursor-pointer"
            >
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedLeagueName}</span>
              <span
                className={`material-symbols-outlined text-base transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'
                }`}
              >
                keyboard_arrow_down
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute end-0 top-full mt-1.5 w-56 max-h-64 overflow-y-auto bg-surface-container-high border border-surface-bright rounded-lg shadow-xl py-1 z-30 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeagueId('all')
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-start px-3 py-2 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer ${
                    selectedLeagueId === 'all' ? 'text-primary font-bold' : 'text-on-surface'
                  }`}
                >
                  <span>{locale === 'ar' ? 'جميع المسابقات' : 'All Competitions'}</span>
                  {selectedLeagueId === 'all' && (
                    <span className="material-symbols-outlined text-sm text-primary">check</span>
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
                    className={`w-full text-start px-3 py-2 flex items-center justify-between hover:bg-surface-bright transition-colors cursor-pointer truncate ${
                      selectedLeagueId === league.id ? 'text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    <span className="truncate">{league.name}</span>
                    {selectedLeagueId === league.id && (
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Horizontal Scrolling Match Cards Track (Matching Image 3) */}
        <div className="relative flex items-center group">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll matches left"
            className="absolute start-0 z-20 w-7 h-14 rounded-e-md bg-surface-container/95 border-y border-e border-surface-bright/70 flex items-center justify-center text-on-surface hover:text-primary transition-all disabled:opacity-0 disabled:pointer-events-none shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg rtl:rotate-180">chevron_left</span>
          </button>

          {/* Cards Track */}
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
                  className="shrink-0 w-[190px] sm:w-[215px] h-[78px] rounded-lg bg-surface-container animate-pulse border border-surface-bright/40 p-2.5"
                />
              ))
            ) : displayMatches.length === 0 ? (
              <div className="w-full py-4 text-center text-xs text-on-surface-variant font-medium">
                {locale === 'ar' ? 'لا توجد مباريات مجدولة لهذا اليوم' : 'No matches scheduled for this date'}
              </div>
            ) : (
              displayMatches.map((match) => {
                const live = isLiveStatus(match.status)
                const isFinished = match.status === 'full_time' || match.status === 'penalties'
                const isScheduled = match.status === 'scheduled'
                const matchHref = buildMatchUrl(match)

                // Status text formatted like Image 3
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

                return (
                  <Link
                    key={match.id}
                    href={matchHref}
                    prefetch={false}
                    className="shrink-0 w-[190px] sm:w-[215px] h-[78px] p-2 rounded-lg bg-[#151c2a] border border-[#273043] hover:border-primary/60 hover:bg-[#1a2335] transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    {/* Top Row: League name + Status badge */}
                    <div className="flex items-center justify-between text-[11px] leading-tight gap-1">
                      <span className="text-slate-400 font-medium truncate max-w-[130px]">
                        {match.league?.name || 'Football'}
                      </span>
                      <span
                        className={`font-semibold shrink-0 ${
                          live
                            ? 'text-red-400 flex items-center gap-1'
                            : 'text-slate-400 text-[10px]'
                        }`}
                      >
                        {live && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {statusLabel}
                      </span>
                    </div>

                    {/* Team 1 Row: Logo, Name, Score */}
                    <div className="flex items-center justify-between gap-1 leading-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamLogo
                          logo={match.homeTeam?.logo}
                          name={match.homeTeam?.name || 'Home'}
                          size="xs"
                        />
                        <span className="text-xs font-semibold text-white group-hover:text-primary transition-colors truncate max-w-[135px]">
                          {match.homeTeam?.name || 'Home'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white tabular-nums shrink-0">
                        {match.score?.home ?? (isScheduled ? '-' : 0)}
                      </span>
                    </div>

                    {/* Team 2 Row: Logo, Name, Score */}
                    <div className="flex items-center justify-between gap-1 leading-none">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamLogo
                          logo={match.awayTeam?.logo}
                          name={match.awayTeam?.name || 'Away'}
                          size="xs"
                        />
                        <span className="text-xs font-semibold text-white group-hover:text-primary transition-colors truncate max-w-[135px]">
                          {match.awayTeam?.name || 'Away'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white tabular-nums shrink-0">
                        {match.score?.away ?? (isScheduled ? '-' : 0)}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll matches right"
            className="absolute end-0 z-20 w-7 h-14 rounded-s-md bg-surface-container/95 border-y border-s border-surface-bright/70 flex items-center justify-center text-on-surface hover:text-primary transition-all disabled:opacity-0 disabled:pointer-events-none shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg rtl:rotate-180">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  )
}
