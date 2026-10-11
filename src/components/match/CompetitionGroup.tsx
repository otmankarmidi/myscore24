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
    <div className="competition-group-container bg-white dark:bg-[#0c121e] rounded-xl border border-[#E5E5E5] dark:border-[#182335] overflow-hidden shadow-xs animate-fade-in divide-y divide-[#E5E5E5] dark:divide-[#182335]">
      {/* Competition header */}
      <div className="h-10 bg-[#FAFAFA] dark:bg-[#101826] px-3.5 flex items-center justify-between text-[#171717] dark:text-slate-200 border-b border-[#E5E5E5] dark:border-[#182335]">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Clickable Competition Logo with fallback chain */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
            aria-label={`${safeName} details`}
          >
            <CompetitionLogo
              logo={league.logo}
              name={safeName}
              country={league.country}
              countryFlag={league.countryFlag}
              providerId={league.id}
              slug={league.slug}
              size={22}
            />
          </Link>

          {/* Clickable Competition Title */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-xs uppercase font-extrabold tracking-wider truncate text-[#6425A6] dark:text-primary hover:opacity-80 transition-all"
          >
            {safeName}
          </Link>

          {league.currentRound && (
            <span className="font-geist text-[11px] text-[#6B7280] dark:text-slate-400 font-medium shrink-0">
              • {league.currentRound}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (league.slug) toggleLeague(league.slug)
              if (league.id && league.id !== league.slug) toggleLeague(league.id)
            }}
            className="text-[#9CA3AF] dark:text-slate-500 hover:text-[#6425A6] dark:hover:text-amber-400 transition-colors"
            title={isFavorited ? t('common.unpinLeague', 'Unpin League') : t('common.pinLeague', 'Pin League')}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${safeName}`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
                color: isFavorited ? '#6425A6' : undefined,
              }}
            >
              star
            </span>
          </button>

          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-[11px] uppercase font-bold text-[#6425A6] dark:text-amber-400 hover:opacity-80 transition-colors flex items-center gap-1 group/std"
            aria-label={`${t('common.viewStandings', 'View')} ${safeName} ${t('common.standings', 'standings')}`}
          >
            <span className="material-symbols-outlined text-xs group-hover/std:scale-110 transition-transform">star</span>
            <span>{t('common.standings', 'STANDINGS')}</span>
            <span className="material-symbols-outlined rtl:rotate-180 text-xs">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-[#F5F5F5] dark:divide-[#141e30]">
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
