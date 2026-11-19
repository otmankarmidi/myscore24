'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { League } from '@/types/league'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { useFavorites } from '@/hooks/useFavorites'
import { useTimezone } from '@/context/TimezoneContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatMatchTime } from '@/lib/utils'
import { buildMatchUrl } from '@/lib/football/matchUrl'
import { getCleanLeagueDisplayName } from '@/config/competitions'
import { isFinished, isLive, redCards } from './matchUtils'
import { useSlidingIndicator } from './useSlidingIndicator'

export type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished'

const DESKTOP_QUERY = '(min-width: 1024px)'
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/* ───────────────────────────── Date bar ───────────────────────────── */

interface DateBarProps {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  counts: Record<StatusFilter, number>
}

export function DateBar({ selectedDate, onSelectDate, status, onStatusChange, counts }: DateBarProps) {
  const { locale, t } = useLanguage()
  const ar = locale === 'ar'
  const intl = ar ? 'ar' : locale === 'fr' ? 'fr-FR' : 'en-GB'

  // A stable week window: the pill glides inside it, and the window only re-centres
  // when the selection reaches an edge (indexes 0/6 are hidden on phones).
  const noon = (d: Date) => {
    const x = new Date(d)
    x.setHours(12, 0, 0, 0)
    return x
  }
  const [anchor, setAnchor] = useState(() => {
    const a = noon(selectedDate)
    a.setDate(a.getDate() - 3)
    return a
  })
  const offset = Math.round((noon(selectedDate).getTime() - anchor.getTime()) / 86400000)
  if (offset < 1 || offset > 5) {
    const a = noon(selectedDate)
    a.setDate(a.getDate() - 3)
    setAnchor(a)
  }

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(anchor)
        d.setDate(anchor.getDate() + i)
        return d
      }),
    [anchor]
  )

  const { ref: dayRef, style: dayPill } = useSlidingIndicator<HTMLDivElement>(`${selectedDate.toDateString()}|${anchor.toDateString()}`)

  const shift = (n: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + n)
    onSelectDate(d)
  }

  const statuses: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('filters.all', 'All') },
    { key: 'live', label: t('filters.live', 'Live') },
    { key: 'upcoming', label: t('filters.upcoming', 'Upcoming') },
    { key: 'finished', label: t('filters.finished', 'Finished') },
  ]
  const { ref: segRef, style: pill } = useSlidingIndicator<HTMLDivElement>(status)

  const arrow = 'ui-press w-9 h-12 rounded-lg hover:bg-hover text-ink-2 inline-flex items-center justify-center shrink-0'

  return (
    <div className="ui-card rounded-2xl p-2 space-y-2">
      <div className="flex items-center gap-1">
        <button onClick={() => shift(-1)} className={arrow} aria-label="Previous day">
          <span className="material-symbols-outlined text-[20px] rtl:rotate-180">chevron_left</span>
        </button>
        <div ref={dayRef} className="relative flex-1 grid grid-cols-5 sm:grid-cols-7 gap-1">
          <span className="absolute top-0 left-0 h-12 rounded-lg bg-brand pointer-events-none" style={dayPill} aria-hidden="true" />
          {days.map((d, i) => {
            const active = sameDay(d, selectedDate)
            const today = sameDay(d, new Date())
            return (
              <button
                key={d.toISOString()}
                data-active={active}
                onClick={() => onSelectDate(new Date(d))}
                className={`ui-press relative z-10 h-12 rounded-lg flex flex-col items-center justify-center leading-tight ${i === 0 || i === 6 ? 'hidden sm:flex' : ''} ${
                  active ? 'text-white' : 'text-ink hover:bg-hover'
                }`}
                aria-pressed={active}
              >
                <span className={`text-[10.5px] font-bold uppercase tracking-wider transition-colors ${active ? 'text-white/80' : today ? 'text-brand' : 'text-ink-3'}`}>
                  {today ? (ar ? 'اليوم' : locale === 'fr' ? 'Auj.' : 'Today') : new Intl.DateTimeFormat(intl, { weekday: 'short' }).format(d)}
                </span>
                <span className="text-[13.5px] font-bold tabular-nums">{new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'short' }).format(d)}</span>
              </button>
            )
          })}
        </div>
        <button onClick={() => shift(1)} className={arrow} aria-label="Next day">
          <span className="material-symbols-outlined text-[20px] rtl:rotate-180">chevron_right</span>
        </button>
      </div>

      <div ref={segRef} className="relative flex items-center gap-1 p-1 rounded-xl bg-canvas overflow-x-auto scrollbar-none">
        <span
          className={`absolute top-1 left-0 h-8 rounded-lg pointer-events-none ${status === 'live' ? 'bg-live' : 'bg-ink'}`}
          style={pill}
          aria-hidden="true"
        />
        {statuses.map((s) => {
          const active = status === s.key
          return (
            <button
              key={s.key}
              data-active={active}
              onClick={() => onStatusChange(s.key)}
              className={`ui-press relative z-10 flex-1 shrink-0 h-8 px-3 rounded-lg inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                active ? 'text-white' : 'text-ink-2 hover:text-ink'
              }`}
              aria-pressed={active}
            >
              {s.key === 'live' && !active && <span className="ui-live-dot !w-1.5 !h-1.5" />}
              {s.label}
              <span className={`text-[11px] font-bold tabular-nums transition-colors ${active ? 'text-white/70' : 'text-ink-3'}`}>{counts[s.key]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────── Match row ──────────────────────────── */

/** Remembers the previous value and reports when it increases (a goal). */
function useGoalPulse(value: number | null) {
  const prev = useRef(value)
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (prev.current !== null && value !== null && value > prev.current) setPulse((p) => p + 1)
    prev.current = value
  }, [value])
  return pulse
}

interface RowProps {
  match: Match
  selected: boolean
  onSelect: (m: Match) => void
}

const MatchRow = memo(function MatchRow({ match, selected, onSelect }: RowProps) {
  const { activeTimezone } = useTimezone()
  const { locale } = useLanguage()
  const { isFavoriteMatch, toggleMatch } = useFavorites()
  const live = isLive(match)
  const finished = isFinished(match)
  const scheduled = match.status === 'scheduled'
  const hs = match.score?.home ?? null
  const as = match.score?.away ?? null
  const fav = isFavoriteMatch(match.id)
  const [popKey, setPopKey] = useState(0)
  const homePulse = useGoalPulse(hs)
  const awayPulse = useGoalPulse(as)
  const goalPulse = homePulse + awayPulse

  const kickoff = formatMatchTime(match.kickoff, activeTimezone, locale)
  const minute = live ? (match.status === 'half_time' ? null : match.minute ?? null) : null

  const team = (side: 'home' | 'away') => {
    const t = side === 'home' ? match.homeTeam : match.awayTeam
    const mine = side === 'home' ? hs : as
    const theirs = side === 'home' ? as : hs
    const lost = finished && mine !== null && theirs !== null && mine < theirs
    const won = finished && mine !== null && theirs !== null && mine > theirs
    return (
      <div className="flex items-center gap-2.5 min-w-0 h-6">
        <TeamLogo name={t?.name || ''} abbreviation={t?.abbreviation} logo={t?.logo} size="xs" />
        <span className={`truncate text-[14px] ${lost ? 'text-ink-3' : 'text-ink'} ${won ? 'font-bold' : 'font-medium'}`}>{t?.name}</span>
        {redCards(match, side) > 0 && <span className="w-[7px] h-[10px] rounded-[1.5px] bg-live shrink-0" aria-label="Red card" />}
      </div>
    )
  }

  const score = (side: 'home' | 'away', pulse: number) => {
    const mine = side === 'home' ? hs : as
    const theirs = side === 'home' ? as : hs
    const lost = finished && mine !== null && theirs !== null && mine < theirs
    return (
      <span className={`h-6 flex items-center justify-end ui-score text-[15px] ${live ? 'text-live' : lost ? 'text-ink-3' : 'text-ink'}`}>
        {!scheduled && (
          <span key={pulse} className={pulse ? 'ui-bump' : ''}>
            {mine ?? 0}
          </span>
        )}
      </span>
    )
  }

  return (
    <div
      key={goalPulse}
      className={`group relative flex items-stretch transition-colors duration-150 hover:bg-hover ${selected ? 'lg:bg-brand-soft lg:hover:bg-brand-soft' : ''} ${goalPulse ? 'ui-flash' : ''}`}
    >
      {/* Edge marker: red for live; brand for the match open in the desktop side panel */}
      <span
        className={`absolute start-0 top-0 bottom-0 w-[3px] transition-transform duration-300 ${
          live ? `bg-live scale-y-100 ${selected ? 'lg:bg-brand' : ''}` : selected ? 'bg-brand scale-y-0 lg:scale-y-100' : 'scale-y-0'
        }`}
        aria-hidden="true"
      />
      <Link
        href={match.id ? buildMatchUrl(match) : '#'}
        prefetch={false}
        onClick={(e) => {
          if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches) {
            e.preventDefault()
            onSelect(match)
          }
        }}
        className="flex-1 min-w-0 flex items-center gap-3 ps-3 sm:ps-4 py-2.5"
        aria-label={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
        aria-current={selected ? 'true' : undefined}
      >
        <span className="w-12 shrink-0 flex flex-col items-center justify-center text-center leading-tight">
          <span className={`text-[12px] tabular-nums ${scheduled ? 'text-ink font-semibold' : 'text-ink-3'}`}>{kickoff}</span>
          {live && (
            <span className="text-[12px] font-bold tabular-nums mt-0.5 text-live">
              {minute === null ? 'HT' : (
                <>
                  {minute}
                  <span className="ui-blink">&apos;</span>
                </>
              )}
            </span>
          )}
          {finished && <span className="text-[11px] font-bold mt-0.5 text-ink-3">FT</span>}
          {!live && !finished && !scheduled && (
            <span className="text-[10.5px] font-bold mt-0.5 text-ink-3 uppercase">{String(match.status).slice(0, 4)}</span>
          )}
        </span>
        <span className="w-px self-stretch bg-line my-0.5" aria-hidden="true" />
        <span className="flex-1 min-w-0 flex flex-col gap-1">
          {team('home')}
          {team('away')}
        </span>
        <span className="w-6 shrink-0 flex flex-col gap-1">
          {score('home', homePulse)}
          {score('away', awayPulse)}
        </span>
      </Link>
      <button
        onClick={() => {
          toggleMatch(match.id)
          setPopKey((k) => k + 1)
        }}
        className="w-11 shrink-0 inline-flex items-center justify-center text-ink-3 hover:text-gold transition-colors"
        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={fav}
      >
        <span
          key={popKey}
          className={`material-symbols-outlined text-[19px] ${fav ? 'text-gold' : ''} ${popKey ? 'ui-pop' : ''}`}
          style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      </button>
    </div>
  )
})

/* ────────────────────────── Tournament group ────────────────────────── */

interface GroupProps {
  league: League
  matches: Match[]
  selectedId: string | null
  onSelect: (m: Match) => void
  index?: number
}

export function TournamentGroup({ league, matches, selectedId, onSelect, index = 0 }: GroupProps) {
  const { locale } = useLanguage()
  const { isFavoriteLeague, toggleLeague } = useFavorites()
  const [popKey, setPopKey] = useState(0)
  const name = getCleanLeagueDisplayName(league, locale) || league.name || 'Competition'
  const href = `/league/${league.id || league.slug || '39'}`
  const pinned = Boolean((league.slug && isFavoriteLeague(league.slug)) || (league.id && isFavoriteLeague(String(league.id))))
  const liveCount = matches.filter(isLive).length

  return (
    <section className="ui-card rounded-2xl overflow-hidden ui-enter" style={{ '--i': Math.min(index, 8) } as React.CSSProperties} aria-label={name}>
      <header className="h-12 flex items-center gap-3 ps-3 sm:ps-4 pe-1 border-b border-line">
        <span className="w-7 h-7 rounded-md bg-white border border-line flex items-center justify-center shrink-0">
          <CompetitionLogo logo={league.logo} name={name} country={league.country} countryFlag={league.countryFlag} providerId={league.id} slug={league.slug} size={18} showBackground={false} />
        </span>
        <Link href={href} prefetch={false} className="min-w-0 flex-1 group/title">
          <span className="block text-[10.5px] font-bold uppercase tracking-wider text-ink-3 truncate leading-tight">{league.country || 'International'}</span>
          <span className="block text-[14px] font-bold text-ink truncate leading-tight group-hover/title:text-brand transition-colors">{name}</span>
        </Link>
        {liveCount > 0 && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-live-soft text-live text-[11px] font-bold">
            <span className="ui-live-dot !w-1.5 !h-1.5" />
            {liveCount} LIVE
          </span>
        )}
        <button
          onClick={() => {
            if (league.slug) toggleLeague(league.slug)
            if (league.id && String(league.id) !== league.slug) toggleLeague(String(league.id))
            setPopKey((k) => k + 1)
          }}
          className="ui-press w-9 h-9 rounded-lg inline-flex items-center justify-center text-ink-3 hover:text-gold hover:bg-hover"
          aria-label={pinned ? 'Unpin league' : 'Pin league'}
          aria-pressed={pinned}
        >
          <span
            key={popKey}
            className={`material-symbols-outlined text-[19px] ${pinned ? 'text-gold' : ''} ${popKey ? 'ui-pop' : ''}`}
            style={{ fontVariationSettings: pinned ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        </button>
        <Link href={href} prefetch={false} className="ui-press group/go w-9 h-9 rounded-lg inline-flex items-center justify-center text-ink-3 hover:text-brand hover:bg-hover" aria-label={`${name} standings`}>
          <span className="material-symbols-outlined text-[20px] rtl:rotate-180 transition-transform duration-200 group-hover/go:translate-x-0.5 rtl:group-hover/go:-translate-x-0.5">chevron_right</span>
        </Link>
      </header>
      <div className="divide-y divide-line">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} selected={selectedId === m.id} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}
