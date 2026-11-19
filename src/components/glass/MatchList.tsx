'use client'

import { memo, useMemo } from 'react'
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

export type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished'

const DESKTOP_QUERY = '(min-width: 1024px)'

/* ───────────────────────────── Date bar ───────────────────────────── */

interface DateBarProps {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  counts: Record<StatusFilter, number>
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export function DateBar({ selectedDate, onSelectDate, status, onStatusChange, counts }: DateBarProps) {
  const { locale, t } = useLanguage()
  const ar = locale === 'ar'
  const intl = ar ? 'ar' : locale === 'fr' ? 'fr-FR' : 'en-GB'

  const days = useMemo(() => {
    const base = new Date(selectedDate)
    base.setHours(12, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i - 3)
      return d
    })
  }, [selectedDate])

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

  return (
    <div className="gl-panel rounded-2xl p-2 space-y-2">
      <div className="flex items-center gap-1">
        <button onClick={() => shift(-1)} className="w-9 h-12 rounded-xl gl-row text-white/70 inline-flex items-center justify-center shrink-0" aria-label="Previous day">
          <span className="material-symbols-outlined text-[20px] rtl:rotate-180">chevron_left</span>
        </button>
        <div className="flex-1 grid grid-cols-5 sm:grid-cols-7 gap-1">
          {days.map((d, i) => {
            const active = sameDay(d, selectedDate)
            const today = sameDay(d, new Date())
            return (
              <button
                key={d.toISOString()}
                onClick={() => onSelectDate(new Date(d))}
                className={`h-12 rounded-xl flex flex-col items-center justify-center leading-tight transition-all ${i === 0 || i === 6 ? 'hidden sm:flex' : ''} ${
                  active ? 'gl-chip-active' : 'gl-row text-white/70'
                }`}
                aria-pressed={active}
              >
                <span className={`text-[10.5px] font-semibold uppercase tracking-wider ${active ? 'text-white/85' : today ? 'text-accent-cyan' : 'text-white/45'}`}>
                  {today ? (ar ? 'اليوم' : locale === 'fr' ? 'Auj.' : 'Today') : new Intl.DateTimeFormat(intl, { weekday: 'short' }).format(d)}
                </span>
                <span className="text-[13.5px] font-bold tabular-nums">
                  {new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'short' }).format(d)}
                </span>
              </button>
            )
          })}
        </div>
        <button onClick={() => shift(1)} className="w-9 h-12 rounded-xl gl-row text-white/70 inline-flex items-center justify-center shrink-0" aria-label="Next day">
          <span className="material-symbols-outlined text-[20px] rtl:rotate-180">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1 pb-1">
        {statuses.map((s) => {
          const active = status === s.key
          const liveTab = s.key === 'live'
          return (
            <button
              key={s.key}
              onClick={() => onStatusChange(s.key)}
              className={`shrink-0 h-8 px-3.5 rounded-full inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-all ${
                active ? (liveTab ? 'bg-live text-white shadow-[0_6px_18px_-6px_rgba(255,77,109,0.9)]' : 'gl-chip-active') : 'gl-chip'
              }`}
              aria-pressed={active}
            >
              {liveTab && !active && <span className="gl-live-dot !w-1.5 !h-1.5" />}
              {s.label}
              <span className={`text-[11px] tabular-nums ${active ? 'text-white/75' : 'text-white/40'}`}>{counts[s.key]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ──────────────────────────── Match row ──────────────────────────── */

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
  const kickoff = formatMatchTime(match.kickoff, activeTimezone, locale)

  const statusLine = live
    ? match.status === 'half_time'
      ? 'HT'
      : `${match.minute ?? ''}'`
    : finished
    ? 'FT'
    : scheduled
    ? ''
    : String(match.status).slice(0, 4).toUpperCase()

  const team = (side: 'home' | 'away') => {
    const t = side === 'home' ? match.homeTeam : match.awayTeam
    const mine = side === 'home' ? hs : as
    const theirs = side === 'home' ? as : hs
    const lost = finished && mine !== null && theirs !== null && mine < theirs
    return (
      <div className="flex items-center gap-2.5 min-w-0 h-6">
        <TeamLogo name={t?.name || ''} abbreviation={t?.abbreviation} logo={t?.logo} size="xs" />
        <span className={`truncate text-[14px] ${lost ? 'text-white/45' : 'text-white'} ${finished && !lost ? 'font-semibold' : 'font-medium'}`}>{t?.name}</span>
        {redCards(match, side) > 0 && <span className="w-[7px] h-[10px] rounded-[1.5px] bg-live shrink-0" aria-label="Red card" />}
      </div>
    )
  }

  const score = (side: 'home' | 'away') => {
    const mine = side === 'home' ? hs : as
    const theirs = side === 'home' ? as : hs
    const lost = finished && mine !== null && theirs !== null && mine < theirs
    return (
      <span className={`h-6 flex items-center justify-end gl-score text-[15px] ${live ? 'text-live' : lost ? 'text-white/45' : 'text-white'}`}>
        {scheduled ? '' : mine ?? 0}
      </span>
    )
  }

  return (
    <div className={`gl-row group relative flex items-stretch ${selected ? 'gl-row-active' : ''}`}>
      <Link
        href={match.id ? buildMatchUrl(match) : '#'}
        prefetch={false}
        onClick={(e) => {
          if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches) {
            e.preventDefault()
            onSelect(match)
          }
        }}
        className="flex-1 min-w-0 flex items-center gap-3 ps-3 sm:ps-4 py-2"
        aria-label={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
      >
        <span className="w-12 shrink-0 flex flex-col items-center justify-center text-center leading-tight">
          <span className={`text-[12px] tabular-nums ${scheduled ? 'text-white font-semibold' : 'text-white/45'}`}>{kickoff}</span>
          {statusLine && <span className={`text-[11.5px] font-bold tabular-nums mt-0.5 ${live ? 'text-live' : 'text-white/45'}`}>{statusLine}</span>}
        </span>
        <span className="w-px self-stretch bg-white/[0.08] my-1" aria-hidden="true" />
        <span className="flex-1 min-w-0 flex flex-col gap-1">
          {team('home')}
          {team('away')}
        </span>
        <span className="w-6 shrink-0 flex flex-col gap-1">
          {score('home')}
          {score('away')}
        </span>
      </Link>
      <button
        onClick={() => toggleMatch(match.id)}
        className="w-11 shrink-0 inline-flex items-center justify-center text-white/30 hover:text-tertiary transition-colors"
        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={fav}
      >
        <span className={`material-symbols-outlined text-[18px] ${fav ? 'text-tertiary' : ''}`} style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}>
          star
        </span>
      </button>
      {live && <span className="absolute start-0 inset-y-2 w-[3px] rounded-full bg-live" aria-hidden="true" />}
    </div>
  )
})

/* ────────────────────────── Tournament group ────────────────────────── */

interface GroupProps {
  league: League
  matches: Match[]
  selectedId: string | null
  onSelect: (m: Match) => void
}

export function TournamentGroup({ league, matches, selectedId, onSelect }: GroupProps) {
  const { locale } = useLanguage()
  const { isFavoriteLeague, toggleLeague } = useFavorites()
  const name = getCleanLeagueDisplayName(league, locale) || league.name || 'Competition'
  const href = `/league/${league.id || league.slug || '39'}`
  const pinned = Boolean((league.slug && isFavoriteLeague(league.slug)) || (league.id && isFavoriteLeague(String(league.id))))
  const liveCount = matches.filter(isLive).length

  return (
    <section className="gl-panel rounded-2xl overflow-hidden" aria-label={name}>
      <header className="h-12 flex items-center gap-3 ps-3 sm:ps-4 pe-1 border-b gl-hairline bg-white/[0.03]">
        <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
          <CompetitionLogo logo={league.logo} name={name} country={league.country} countryFlag={league.countryFlag} providerId={league.id} slug={league.slug} size={18} showBackground={false} />
        </span>
        <Link href={href} prefetch={false} className="min-w-0 flex-1 group">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/45 truncate leading-tight">{league.country || 'International'}</span>
          <span className="block text-[14px] font-bold text-white truncate leading-tight group-hover:text-accent-cyan transition-colors">{name}</span>
        </Link>
        {liveCount > 0 && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-live/15 text-live text-[11px] font-bold">
            <span className="gl-live-dot !w-1.5 !h-1.5" />
            {liveCount}
          </span>
        )}
        <button
          onClick={() => {
            if (league.slug) toggleLeague(league.slug)
            if (league.id && String(league.id) !== league.slug) toggleLeague(String(league.id))
          }}
          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-white/40 hover:text-tertiary hover:bg-white/[0.06]"
          aria-label={pinned ? 'Unpin league' : 'Pin league'}
          aria-pressed={pinned}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: pinned ? "'FILL' 1" : "'FILL' 0", color: pinned ? 'var(--color-tertiary)' : undefined }}>
            star
          </span>
        </button>
        <Link href={href} prefetch={false} className="w-9 h-9 rounded-full inline-flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06]" aria-label={`${name} standings`}>
          <span className="material-symbols-outlined text-[20px] rtl:rotate-180">chevron_right</span>
        </Link>
      </header>
      <div className="divide-y divide-white/[0.06]">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} selected={selectedId === m.id} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}
