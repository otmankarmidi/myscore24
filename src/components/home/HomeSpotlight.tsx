'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone } from '@/context/TimezoneContext'
import { formatMatchTime, isLiveStatus } from '@/lib/utils'
import { buildMatchUrl } from '@/lib/football/matchUrl'
import { getCompetitionPriority, getCleanLeagueDisplayName } from '@/config/competitions'

interface HomeSpotlightProps {
  matches: Match[]
  selectedDate: Date
  isLoading?: boolean
}

const isFinishedStatus = (s: Match['status']) => s === 'full_time' || s === 'penalties'

/**
 * Apple Sports–style spotlight: one featured match on a dark "stadium glass" card,
 * plus an at-a-glance strip of today's numbers.
 */
export default function HomeSpotlight({ matches, selectedDate, isLoading = false }: HomeSpotlightProps) {
  const { locale } = useLanguage()
  const { activeTimezone } = useTimezone()
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'

  const featured = useMemo(() => {
    if (!matches.length) return null
    const byPriority = (a: Match, b: Match) => {
      const p = getCompetitionPriority(a.league) - getCompetitionPriority(b.league)
      if (p !== 0) return p
      return new Date(a.kickoff || 0).getTime() - new Date(b.kickoff || 0).getTime()
    }
    const live = matches.filter((m) => isLiveStatus(m.status)).sort(byPriority)
    if (live.length) return live[0]
    const upcoming = matches.filter((m) => m.status === 'scheduled').sort(byPriority)
    if (upcoming.length) return upcoming[0]
    const finished = matches.filter((m) => isFinishedStatus(m.status)).sort(byPriority)
    return finished[0] || matches[0]
  }, [matches])

  const stats = useMemo(() => {
    const live = matches.filter((m) => isLiveStatus(m.status)).length
    const finished = matches.filter((m) => isFinishedStatus(m.status))
    const goals = matches.reduce((sum, m) => {
      if (m.status === 'scheduled') return sum
      return sum + (m.score?.home ?? 0) + (m.score?.away ?? 0)
    }, 0)
    const competitions = new Set(matches.map((m) => m.league?.id || m.league?.slug)).size
    return { live, total: matches.length, finished: finished.length, goals, competitions }
  }, [matches])

  const dateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(isAr ? 'ar' : isFr ? 'fr-FR' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(selectedDate)
    } catch {
      return selectedDate.toDateString()
    }
  }, [selectedDate, isAr, isFr])

  if (isLoading && !matches.length) {
    return (
      <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 pt-5" aria-hidden="true">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
          <div className="h-[260px] rounded-[28px] skeleton" />
          <div className="h-[260px] rounded-[28px] skeleton hidden lg:block" />
        </div>
      </section>
    )
  }

  if (!featured) return null

  const live = isLiveStatus(featured.status)
  const isHT = featured.status === 'half_time'
  const finished = isFinishedStatus(featured.status)
  const scheduled = featured.status === 'scheduled'
  const leagueName = getCleanLeagueDisplayName(featured.league, locale) || featured.league?.name || 'Football'
  const kickoff = formatMatchTime(featured.kickoff, activeTimezone, locale)
  const href = featured.id ? buildMatchUrl(featured) : '#'

  const scorers = (side: 'home' | 'away') =>
    (featured.events || [])
      .filter((e) => e && e.type === 'goal' && e.team === side)
      .slice(0, 3)
      .map((e) => `${e.playerName} ${e.minute}'`)

  const statusChip = live ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF3B30] text-white text-[11px] font-bold tracking-wide shadow-[0_6px_20px_-4px_rgba(255,59,48,0.7)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      {isHT ? (isAr ? 'استراحة' : 'HT') : `LIVE${featured.minute ? ` · ${featured.minute}'` : ''}`}
    </span>
  ) : finished ? (
    <span className="px-2.5 py-1 rounded-full glass-chip text-[11px] font-bold tracking-wide text-white/90">
      {isAr ? 'انتهت' : isFr ? 'Terminé' : 'Full time'}
    </span>
  ) : (
    <span className="px-2.5 py-1 rounded-full glass-chip text-[11px] font-bold tracking-wide text-white/90">
      {isAr ? 'المباراة القادمة' : isFr ? 'À suivre' : 'Up next'}
    </span>
  )

  const tiles = [
    {
      label: isAr ? 'مباشر الآن' : isFr ? 'En direct' : 'Live now',
      value: stats.live,
      accent: 'text-[#FF3B30]',
      dot: stats.live > 0,
    },
    { label: isAr ? 'مباريات' : isFr ? 'Matchs' : 'Matches', value: stats.total, accent: 'text-slate-900 dark:text-white' },
    { label: isAr ? 'أهداف' : isFr ? 'Buts' : 'Goals', value: stats.goals, accent: 'apple-gradient-text' },
    { label: isAr ? 'بطولات' : isFr ? 'Compétitions' : 'Competitions', value: stats.competitions, accent: 'text-slate-900 dark:text-white' },
  ]

  return (
    <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 pt-5 sm:pt-7" aria-label="Spotlight">
      {/* Large title, iOS style */}
      <div className="flex items-end justify-between gap-4 mb-4 px-1">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h2 className="font-geist text-[30px] sm:text-[40px] leading-[1.05] font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white mt-1">
            {isAr ? 'يوم المباريات' : isFr ? 'Jour de match' : 'Matchday'}
            <span className="apple-gradient-text">.</span>
          </h2>
        </div>
        <Link
          href="/live"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full apple-glass text-[13px] font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
          {isAr ? 'كل المباريات المباشرة' : isFr ? 'Tous les directs' : 'All live games'}
          <span className="material-symbols-outlined text-[16px] rtl:rotate-180">chevron_right</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-4">
        {/* Featured match */}
        <Link
          href={href}
          prefetch={false}
          className="stadium-glass rounded-[28px] p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 group transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5"
          aria-label={`${featured.homeTeam?.name} vs ${featured.awayTeam?.name}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <CompetitionLogo
                  logo={featured.league?.logo}
                  name={leagueName}
                  country={featured.league?.country}
                  countryFlag={featured.league?.countryFlag}
                  providerId={featured.league?.id}
                  slug={featured.league?.slug}
                  size={20}
                  showBackground={false}
                />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{leagueName}</p>
                {featured.round && <p className="text-[11px] text-white/55 truncate">{featured.round}</p>}
              </div>
            </div>
            {statusChip}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            {/* Home */}
            <div className="flex flex-col items-center text-center gap-2.5 min-w-0">
              <span className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full glass-chip flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <TeamLogo name={featured.homeTeam?.name || 'Home'} abbreviation={featured.homeTeam?.abbreviation} logo={featured.homeTeam?.logo} size="xl" />
              </span>
              <span className="text-[14px] sm:text-[17px] font-bold tracking-tight leading-tight line-clamp-2">
                {featured.homeTeam?.name}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-1.5">
              {scheduled ? (
                <>
                  <span className="font-geist text-[40px] sm:text-[56px] font-extrabold tabular-nums leading-none tracking-[-0.04em]">
                    {kickoff}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                    {isAr ? 'انطلاق' : 'Kick-off'}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-geist text-[48px] sm:text-[68px] font-extrabold tabular-nums leading-none tracking-[-0.04em] flex items-center gap-3 sm:gap-4">
                    <span className={finished && (featured.score?.home ?? 0) < (featured.score?.away ?? 0) ? 'text-white/45' : ''}>
                      {featured.score?.home ?? 0}
                    </span>
                    <span className="text-white/30 text-[32px] sm:text-[44px] font-light">–</span>
                    <span className={finished && (featured.score?.away ?? 0) < (featured.score?.home ?? 0) ? 'text-white/45' : ''}>
                      {featured.score?.away ?? 0}
                    </span>
                  </span>
                  {featured.score?.halftime && (
                    <span className="text-[11px] font-medium text-white/50 tabular-nums">
                      HT {featured.score.halftime.home}–{featured.score.halftime.away}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Away */}
            <div className="flex flex-col items-center text-center gap-2.5 min-w-0">
              <span className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full glass-chip flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <TeamLogo name={featured.awayTeam?.name || 'Away'} abbreviation={featured.awayTeam?.abbreviation} logo={featured.awayTeam?.logo} size="xl" />
              </span>
              <span className="text-[14px] sm:text-[17px] font-bold tracking-tight leading-tight line-clamp-2">
                {featured.awayTeam?.name}
              </span>
            </div>
          </div>

          {/* Scorers */}
          {!scheduled && (scorers('home').length > 0 || scorers('away').length > 0) && (
            <div className="grid grid-cols-2 gap-4 text-[11.5px] text-white/65 font-medium">
              <ul className="space-y-0.5 text-center">
                {scorers('home').map((s) => <li key={s} className="truncate">{s}</li>)}
              </ul>
              <ul className="space-y-0.5 text-center">
                {scorers('away').map((s) => <li key={s} className="truncate">{s}</li>)}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
            <span className="text-[12px] text-white/50 truncate">{featured.venue || ''}</span>
            <span className="inline-flex items-center gap-1 h-9 px-4 rounded-full bg-white text-slate-900 text-[13px] font-semibold shrink-0 transition-transform duration-300 group-hover:scale-[1.03]">
              {isAr ? 'مركز المباراة' : isFr ? 'Centre du match' : 'Match centre'}
              <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
            </span>
          </div>
        </Link>

        {/* At a glance */}
        <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="apple-glass rounded-[20px] lg:rounded-[24px] p-3 sm:p-4 lg:p-5 flex flex-col justify-between gap-2 min-h-[84px] sm:min-h-[104px] lg:min-h-0 min-w-0">
              <span className="eyebrow !text-[9px] sm:!text-[11px] !tracking-[0.08em] sm:!tracking-[0.12em] flex items-center gap-1 sm:gap-1.5 truncate">
                {tile.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />}
                {tile.label}
              </span>
              <span className={`font-geist text-[26px] sm:text-[36px] lg:text-[44px] font-extrabold tabular-nums leading-none tracking-[-0.04em] ${tile.accent}`}>
                {tile.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
