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
    <div className="competition-group-container apple-glass rounded-3xl border border-white/60 dark:border-white/10 overflow-hidden shadow-[0_10px_35px_-5px_rgba(31,38,135,0.06)] dark:shadow-[0_12px_40px_-5px_rgba(0,0,0,0.5)] animate-fade-in transition-all duration-300">
      {/* Competition header */}
      <div className="h-13 bg-white/40 dark:bg-white/5 backdrop-blur-xl px-4 sm:px-5 flex items-center justify-between text-slate-900 dark:text-slate-100 border-b border-white/50 dark:border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Clickable Competition Logo */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="flex items-center shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200"
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
            className="font-geist text-[13.5px] uppercase font-bold tracking-wide truncate text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
          >
            {safeName}
          </Link>

          {league.currentRound && (
            <span className="font-geist text-xs text-slate-400 dark:text-slate-400 font-medium shrink-0">
              • {league.currentRound}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (league.slug) toggleLeague(league.slug)
              if (league.id && league.id !== league.slug) toggleLeague(league.id)
            }}
            className="w-8 h-8 rounded-full apple-segmented-track flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all cursor-pointer hover:scale-105 active:scale-95"
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
            className="px-3 py-1.5 rounded-full font-geist text-xs font-bold apple-glass border border-white/60 dark:border-white/10 text-purple-700 dark:text-purple-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 group/std shadow-2xs"
            aria-label={`${t('common.viewStandings', 'View')} ${safeName} ${t('common.standings', 'standings')}`}
          >
            <span className="material-symbols-outlined text-[14px] group-hover/std:scale-110 transition-transform">leaderboard</span>
            <span className="tracking-wide uppercase text-[10.5px] font-black">{t('common.standings', 'STANDINGS')}</span>
            <span className="material-symbols-outlined rtl:rotate-180 text-[14px] group-hover/std:translate-x-0.5 rtl:group-hover/std:-translate-x-0.5 transition-transform">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-white/40 dark:divide-white/5">
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
