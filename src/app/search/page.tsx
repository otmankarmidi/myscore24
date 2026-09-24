'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import PlayerImage from '@/components/common/PlayerImage'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import EmptyState from '@/components/common/EmptyState'
import { useLanguage } from '@/context/LanguageContext'
import { trackSearch } from '@/lib/analytics'

interface SearchPlayer {
  id: string
  slug: string
  name: string
  position: string
  number?: number
  teamName: string
  teamLogo?: string
  photo?: string
}

interface SearchTeam {
  id: string
  slug: string
  name: string
  abbreviation: string
  logo?: string
  country: string
}

interface SearchLeague {
  id: string
  slug: string
  name: string
  logo?: string
  countryFlag?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const { t } = useLanguage()

  const [players, setPlayers] = useState<SearchPlayer[]>([])
  const [teams, setTeams] = useState<SearchTeam[]>([])
  const [leagues, setLeagues] = useState<SearchLeague[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!q || q.trim().length < 2) {
      setPlayers([])
      setTeams([])
      setLeagues([])
      return
    }

    let isMounted = true
    setIsLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        setPlayers(data.players || [])
        setTeams(data.teams || [])
        setLeagues(data.leagues || [])
        const totalCount = (data.players?.length || 0) + (data.teams?.length || 0) + (data.leagues?.length || 0)
        trackSearch(q, totalCount)
      })
      .catch(err => {
        console.error('Search error:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [q])

  const hasResults = players.length > 0 || teams.length > 0 || leagues.length > 0

  return (
    <main className="flex-1 min-w-0 space-y-6">
      {/* Header Banner */}
      <div className="bg-surface-container rounded-xl border border-surface-bright p-5">
        <h1 className="text-headline-md font-bold text-on-surface">
          {t('common.searchResults', 'Search Results')}
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          {q ? `${t('common.showingResultsFor', 'Showing results for')} "${q}"` : t('common.typeToSearch', 'Type a player, team or competition to search')}
        </p>
      </div>

      {isLoading && (
        <div className="bg-surface-container rounded-xl border border-surface-bright p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">sports_soccer</span>
            <span className="text-body-sm text-on-surface-variant font-medium">{t('common.searching', 'Searching...')}</span>
          </div>
        </div>
      )}

      {!isLoading && !hasResults && q.length >= 2 && (
        <EmptyState
          title={t('common.noSearchResults', 'No results found')}
          description={`We couldn't find any players, teams or competitions matching "${q}".`}
        />
      )}

      {/* Players Results */}
      {!isLoading && players.length > 0 && (
        <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">person</span>
            {t('common.players', 'Players')} ({players.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {players.map(player => (
              <Link
                key={player.id}
                href={`/player/${player.slug || player.id}`}
                className="flex items-center gap-3 p-3 bg-surface-container-high/60 rounded-lg border border-surface-bright hover:border-primary/50 transition-all group"
              >
                <PlayerImage
                  playerId={player.id}
                  photo={player.photo}
                  name={player.name}
                  size="md"
                  className="w-10 h-10 min-w-[40px] border border-surface-bright shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-body-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {player.name}
                    </span>
                    {player.number && (
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                        #{player.number}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-on-surface-variant truncate block mt-0.5">
                    {player.position} • {player.teamName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Teams Results */}
      {!isLoading && teams.length > 0 && (
        <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">shield</span>
            {t('common.teams', 'Teams')} ({teams.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {teams.map(team => (
              <Link
                key={team.id}
                href={`/team/${team.slug || team.id}`}
                className="flex items-center gap-3 p-3 bg-surface-container-high/60 rounded-lg border border-surface-bright hover:border-primary/50 transition-all group"
              >
                <TeamLogo name={team.name} abbreviation={team.abbreviation} logo={team.logo} size="md" />
                <div className="flex-1 min-w-0">
                  <span className="text-body-sm font-bold text-on-surface truncate block group-hover:text-primary transition-colors">
                    {team.name}
                  </span>
                  <span className="text-[11px] text-on-surface-variant truncate block">
                    {team.country}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Competitions Results */}
      {!isLoading && leagues.length > 0 && (
        <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">emoji_events</span>
            {t('common.competitions', 'Competitions')} ({leagues.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {leagues.map(league => (
              <Link
                key={league.id}
                href={`/competition/${league.id || league.slug}`}
                prefetch={false}
                className="flex items-center gap-3 p-3 bg-surface-container-high/60 rounded-lg border border-surface-bright hover:border-primary/50 transition-all group"
              >
                <CompetitionLogo
                  logo={league.logo}
                  name={league.name}
                  countryFlag={league.countryFlag}
                  providerId={league.id}
                  size={24}
                />
                <span className="text-body-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {league.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />
        <Suspense fallback={<div className="flex-1 p-8 text-center text-on-surface-variant">Loading search...</div>}>
          <SearchContent />
        </Suspense>
        <RightSidebar />
      </div>
      <MobileBottomNavigation />
    </div>
  )
}
