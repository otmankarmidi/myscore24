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
    <div className="competition-group-container bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs animate-fade-in transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Competition header */}
      <div className="h-12 bg-slate-50/80 dark:bg-[#131E33] px-4 flex items-center justify-between text-slate-900 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          {/* Clickable Competition Logo */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="flex items-center shrink-0 hover:scale-105 transition-transform duration-200"
            aria-label={`${safeName} details`}
          >
            <CompetitionLogo
              logo={league.logo}
              name={safeName}
              country={league.country}
              countryFlag={league.countryFlag}
              providerId={league.id}
              slug={league.slug}
              size={24}
            />
          </Link>

          {/* Clickable Competition Title */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-[13px] uppercase font-bold tracking-wide truncate text-slate-900 dark:text-slate-100 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
          >
            {safeName}
          </Link>

          {league.currentRound && (
            <span className="font-geist text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
              • {league.currentRound}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              if (league.slug) toggleLeague(league.slug)
              if (league.id && league.id !== league.slug) toggleLeague(league.id)
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={isFavorited ? t('common.unpinLeague', 'Unpin League') : t('common.pinLeague', 'Pin League')}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${safeName}`}
          >
            <span
              className="material-symbols-outlined transition-transform duration-200 hover:scale-110"
              style={{
                fontSize: 19,
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
            className="px-2.5 py-1 rounded-lg font-geist text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all flex items-center gap-1.5 group/std"
            aria-label={`${t('common.viewStandings', 'View')} ${safeName} ${t('common.standings', 'standings')}`}
          >
            <span className="material-symbols-outlined text-[14px] group-hover/std:scale-110 transition-transform">leaderboard</span>
            <span className="tracking-wide uppercase text-[11px] font-bold">{t('common.standings', 'STANDINGS')}</span>
            <span className="material-symbols-outlined rtl:rotate-180 text-[14px] group-hover/std:translate-x-0.5 rtl:group-hover/std:-translate-x-0.5 transition-transform">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
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
