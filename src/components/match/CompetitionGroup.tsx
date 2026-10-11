'use client'

import Link from 'next/link'
import { Match } from '@/types/match'
import { League } from '@/types/league'
import MatchRow from './MatchRow'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/context/LanguageContext'

interface CompetitionGroupProps {
  league: League
  matches: Match[]
  defaultExpanded?: boolean
}

export default function CompetitionGroup({ league, matches, defaultExpanded = true }: CompetitionGroupProps) {
  const { isFavoriteMatch, toggleMatch, isFavoriteLeague, toggleLeague } = useFavorites()
  const { t } = useLanguage()

  if (!league) return null

  const providerCompetitionId = league.id || league.slug || '39'
  const competitionHref = `/competition/${providerCompetitionId}`
  const safeName = league.name || 'Competition'
  const isFavorited =
    (league.slug && isFavoriteLeague(league.slug)) ||
    (league.id && isFavoriteLeague(league.id))

  const safeMatches = (matches || []).filter(Boolean)

  // Color per league based on Image 3
  const getLeagueTitleColor = (id?: string, slug?: string) => {
    const s = `${id || ''} ${slug || ''}`.toLowerCase()
    if (s.includes('epl') || s.includes('premier') || s.includes('39')) return 'text-amber-400'
    if (s.includes('laliga') || s.includes('la-liga') || s.includes('140')) return 'text-[#f87171]'
    if (s.includes('serie') || s.includes('135')) return 'text-[#38bdf8]'
    if (s.includes('botola') || s.includes('200')) return 'text-[#34d399]'
    if (s.includes('ligue') || s.includes('61')) return 'text-[#a78bfa]'
    if (s.includes('bundes') || s.includes('78')) return 'text-[#fb923c]'
    return 'text-amber-400'
  }

  const titleColor = getLeagueTitleColor(league.id, league.slug)

  return (
    <div className="competition-group-container bg-[#080e1a] rounded-xl border border-[#162236] overflow-hidden shadow-md animate-fade-in divide-y divide-[#141e30]">
      {/* Competition header (Matching Image 3) */}
      <div className="h-10 bg-[#0c1322] px-3.5 flex items-center justify-between text-slate-300 border-b border-[#18263d]">
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
            className={`font-geist text-xs uppercase font-extrabold tracking-wider truncate hover:brightness-125 transition-all ${titleColor}`}
          >
            {safeName}
          </Link>

          {league.currentRound && (
            <span className="font-geist text-[11px] text-slate-400 font-medium shrink-0">
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
            className="text-slate-500 hover:text-amber-400 transition-colors"
            title={isFavorited ? t('common.unpinLeague', 'Unpin League') : t('common.pinLeague', 'Pin League')}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${safeName}`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
                color: isFavorited ? '#fbbf24' : undefined,
              }}
            >
              star
            </span>
          </button>

          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-[11px] uppercase font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 group/std"
            aria-label={`${t('common.viewStandings', 'View')} ${safeName} ${t('common.standings', 'standings')}`}
          >
            <span className="material-symbols-outlined text-xs group-hover/std:scale-110 transition-transform">star</span>
            <span>{t('common.standings', 'STANDINGS')}</span>
            <span className="material-symbols-outlined rtl:rotate-180 text-xs">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-[#141e30]">
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
