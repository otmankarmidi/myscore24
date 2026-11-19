'use client'

import Link from 'next/link'
import { Match } from '@/types/match'
import { League } from '@/types/league'
import MatchRow from './MatchRow'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/context/LanguageContext'
import { getCleanLeagueDisplayName } from '@/config/competitions'

interface CompetitionGroupProps {
  league: League
  matches: Match[]
  defaultExpanded?: boolean
}

export default function CompetitionGroup({ league, matches, defaultExpanded = true }: CompetitionGroupProps) {
  const { isFavoriteMatch, toggleMatch, isFavoriteLeague, toggleLeague } = useFavorites()
  const { t, locale } = useLanguage()

  if (!league) return null

  const providerCompetitionId = league.id || league.slug || '39'
  const competitionHref = `/league/${providerCompetitionId}`
  const safeName = getCleanLeagueDisplayName(league, locale) || league.name || 'Competition'
  const isFavorited =
    (league.slug && isFavoriteLeague(league.slug)) ||
    (league.id && isFavoriteLeague(league.id))

  const safeMatches = (matches || []).filter(Boolean)

  return (
    <div className="competition-group-container apple-glass rounded-[24px] overflow-hidden animate-fade-in">
      {/* Competition header */}
      <div className="h-14 px-4 sm:px-5 flex items-center justify-between text-slate-900 dark:text-slate-100 border-b border-slate-900/[0.06] dark:border-white/[0.07]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Clickable Competition Logo */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="w-8 h-8 rounded-full bg-white dark:bg-white/90 shadow-[0_0_0_0.5px_rgba(15,23,42,0.08),0_2px_6px_-2px_rgba(15,23,42,0.15)] flex items-center justify-center shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200"
            aria-label={`${safeName} details`}
          >
            <CompetitionLogo
              logo={league.logo}
              name={safeName}
              country={league.country}
              countryFlag={league.countryFlag}
              providerId={league.id}
              slug={league.slug}
              size={20}
              showBackground={false}
            />
          </Link>

          {/* Clickable Competition Title */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-[15px] font-bold tracking-[-0.01em] truncate text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
          >
            {safeName}
          </Link>

          {league.currentRound && (
            <span className="hidden sm:inline font-geist text-[12px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
              {league.currentRound}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (league.slug) toggleLeague(league.slug)
              if (league.id && league.id !== league.slug) toggleLeague(league.id)
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-slate-900/5 dark:hover:bg-white/10 transition-all cursor-pointer active:scale-90"
            title={isFavorited ? t('common.unpinLeague', 'Unpin League') : t('common.pinLeague', 'Pin League')}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${safeName}`}
          >
            <span
              className="material-symbols-outlined text-[17px] transition-transform duration-200"
              style={{
                fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
                color: isFavorited ? '#F59E0B' : undefined,
              }}
            >
              star
            </span>
          </button>

          <Link
            href={competitionHref}
            prefetch={false}
            className="h-8 ps-3 pe-2 rounded-full font-geist text-[12px] font-semibold text-brand-600 dark:text-brand-300 bg-brand-500/10 hover:bg-brand-500/15 active:scale-95 transition-all flex items-center gap-0.5 group/std"
            aria-label={`${t('common.viewStandings', 'View')} ${safeName} ${t('common.standings', 'standings')}`}
          >
            <span className="capitalize">{t('common.standings', 'Standings').toLowerCase()}</span>
            <span className="material-symbols-outlined rtl:rotate-180 text-[16px] group-hover/std:translate-x-0.5 rtl:group-hover/std:-translate-x-0.5 transition-transform">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-slate-900/[0.05] dark:divide-white/[0.06]">
        {safeMatches.map((match) => (
          <MatchRow
            key={match.id}
            match={match}
            isFavorited={isFavoriteMatch(match.id)}
            onToggleFavorite={() => toggleMatch(match.id)}
          />
        ))}
      </div>
    </div>
  )
}
