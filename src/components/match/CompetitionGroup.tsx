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

  return (
    <div className="competition-group-container bg-surface-container-low rounded-lg border border-surface-bright/70 overflow-hidden shadow-xs animate-fade-in">
      {/* Competition header */}
      <div className="competition-header h-9 bg-surface-container px-3 flex items-center justify-between text-on-surface-variant border-b border-surface-bright/50">
        <div className="flex items-center gap-2 min-w-0">
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
              size={20}
            />
          </Link>

          {/* Clickable Competition Title */}
          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-[11px] uppercase font-bold text-on-surface hover:text-primary transition-colors tracking-wider truncate"
          >
            {safeName}
          </Link>

          {league.currentRound && (
            <span className="font-geist text-[10px] text-on-surface-variant font-medium shrink-0">
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
            className="text-outline hover:text-primary transition-colors"
            title={isFavorited ? t('common.unpinLeague', 'Unpin League') : t('common.pinLeague', 'Pin League')}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${safeName}`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 16,
                fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
                color: isFavorited ? 'var(--color-primary)' : undefined,
              }}
            >
              star
            </span>
          </button>

          <Link
            href={competitionHref}
            prefetch={false}
            className="font-geist text-[10px] uppercase font-bold text-primary hover:underline flex items-center gap-0.5"
            aria-label={`${t('common.viewStandings', 'View')} ${safeName} ${t('common.standings', 'standings')}`}
          >
            <span>{t('common.standings', 'Standings')}</span>
            <span className="material-symbols-outlined rtl:rotate-180" style={{ fontSize: 12 }}>
              chevron_right
            </span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-surface-bright/30">
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
