'use client'
import Link from 'next/link'
import { Match } from '@/types/match'
import { League } from '@/types/league'
import MatchRow from './MatchRow'
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

  const isFavorited = isFavoriteLeague(league.slug) || isFavoriteLeague(league.id)
  const localizedCountry = league.country && league.country !== 'Europe' && league.country !== 'Africa' && league.country !== 'World'
    ? t(`countries.${league.country}`, league.country)
    : ''

  return (
    <div className="bg-surface-container-low rounded overflow-hidden shadow-sm animate-fade-in">
      {/* Competition header */}
      <div className="h-8 bg-surface-container px-3 flex items-center justify-between text-on-surface-variant">
        <div className="flex items-center gap-2 min-w-0">
          {league.countryFlag && (
            <span className="text-[14px] leading-none shrink-0" aria-hidden="true">{league.countryFlag}</span>
          )}
          <span className="font-geist text-[10px] uppercase font-bold text-on-surface tracking-wider truncate">
            {localizedCountry ? `${localizedCountry}: ` : ''}
            {league.name}
          </span>
          {league.currentRound && (
            <span className="font-geist text-[10px] text-outline font-semibold shrink-0">{league.currentRound}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              toggleLeague(league.slug)
              if (league.id && league.id !== league.slug) toggleLeague(league.id)
            }}
            className="text-outline hover:text-primary-container transition-colors"
            title={isFavorited ? t('common.unpinLeague', 'Unpin League') : t('common.pinLeague', 'Pin League')}
            aria-label={`${isFavorited ? 'Unpin' : 'Pin'} ${league.name}`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 16,
                fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
                color: isFavorited ? 'var(--color-primary-container)' : undefined,
              }}
            >
              star
            </span>
          </button>
          <Link
            href={`/league/${league.slug}`}
            className="font-geist text-[10px] uppercase font-bold text-primary-container hover:underline flex items-center gap-0.5"
            aria-label={`${t('common.viewStandings', 'View')} ${league.name} ${t('common.standings', 'standings')}`}
          >
            <span>{t('common.standings', 'Standings')}</span>
            <span className="material-symbols-outlined rtl:rotate-180" style={{ fontSize: 12 }}>chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-surface-bright/20">
        {matches.map(match => (
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
