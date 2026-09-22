'use client'

import { useState, useMemo, useEffect } from 'react'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import DateSelector from '@/components/common/DateSelector'
import MatchFilters from '@/components/common/MatchFilters'
import CompetitionGroup from '@/components/match/CompetitionGroup'
import SkeletonMatchRow from '@/components/common/SkeletonLoader'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import AdvertisementPlaceholder from '@/components/common/AdvertisementPlaceholder'
import { sportsService } from '@/services/sports/sportsService'
import { useLanguage } from '@/context/LanguageContext'
import { Match } from '@/types/match'
import { League } from '@/types/league'

export default function HomePage() {
  const { t } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all')
  const [soundOn, setSoundOn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [leagues, setLeagues] = useState<League[]>([])

  // Diagnostic states
  const [dataSource, setDataSource] = useState<string>('LIVE API')
  const [apiCount, setApiCount] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setHasError(false)
      setApiErrorMessage(null)

      try {
        const [result, leagueData] = await Promise.all([
          sportsService.getMatchesByDateWithSource(selectedDate),
          sportsService.getTopLeagues(),
        ])

        setMatches(result.matches)
        setDataSource(result.source || 'LIVE API')
        setApiCount(result.count || result.matches.length)
        setLastUpdated(new Date(result.lastUpdated || Date.now()).toLocaleTimeString())
        setLeagues(leagueData)

        if (result.error) {
          setApiErrorMessage(result.error)
          if (result.matches.length === 0) {
            setHasError(true)
          }
        }
      } catch (err: any) {
        console.error('Failed to load home page data:', err)
        setHasError(true)
        setApiErrorMessage(err.message || 'Failed to fetch live matches.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedDate])

  // Filter matches based on tab & search query
  const filteredMatches = useMemo(() => {
    return (matches || []).filter((match) => {
      if (!match) return false
      // Status filter
      if (activeFilter === 'live' && match.status !== 'live' && match.status !== 'half_time') return false
      if (activeFilter === 'upcoming' && match.status !== 'scheduled') return false
      if (activeFilter === 'finished' && match.status !== 'full_time' && match.status !== 'extra_time' && match.status !== 'penalties') return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const homeMatch = (match.homeTeam?.name || '').toLowerCase().includes(q)
        const awayMatch = (match.awayTeam?.name || '').toLowerCase().includes(q)
        const leagueMatch = (match.league?.name || '').toLowerCase().includes(q)
        if (!homeMatch && !awayMatch && !leagueMatch) return false
      }

      return true
    })
  }, [matches, activeFilter, searchQuery])

  // Group matches by league
  const groupedByLeague = useMemo(() => {
    const map = new Map<string, { league: League; matches: Match[] }>()

    filteredMatches.forEach((match) => {
      if (!match?.league) return
      const leagueId = match.league.id || match.league.slug || 'league'
      if (!map.has(leagueId)) {
        map.set(leagueId, { league: match.league, matches: [] })
      }
      map.get(leagueId)!.matches.push(match)
    })

    return Array.from(map.values())
  }, [filteredMatches])

  // Status counts for tabs badge
  const counts = useMemo(() => {
    const list = matches || []
    return {
      all: list.length,
      live: list.filter((m) => m && (m.status === 'live' || m.status === 'half_time')).length,
      upcoming: list.filter((m) => m && m.status === 'scheduled').length,
      finished: list.filter((m) => m && (m.status === 'full_time' || m.status === 'extra_time' || m.status === 'penalties')).length,
    }
  }, [matches])

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-surface text-on-surface pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-6">
      {/* Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Layout Grid */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-4 py-3 md:py-4 flex gap-4">
        {/* Left Navigation Sidebar */}
        <DesktopSidebar />

        {/* Center Main Content Stream */}
        <main className="flex-1 min-w-0 w-full space-y-3">
          {/* Banner Ad */}
          <AdvertisementPlaceholder variant="banner" />

          {/* Calendar Strip */}
          <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {/* Filter Bar */}
          <MatchFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn(!soundOn)}
          />

          {/* Content States */}
          {isLoading ? (
            <div className="space-y-3 bg-surface-container rounded-lg p-3">
              <SkeletonMatchRow />
              <SkeletonMatchRow />
              <SkeletonMatchRow />
              <SkeletonMatchRow />
            </div>
          ) : hasError ? (
            <ErrorState
              title={t('common.errorLive', 'Live football data is temporarily unavailable.')}
              description={apiErrorMessage || t('common.errorLiveDesc', 'Please try selecting a different date or click retry.')}
              onRetry={() => setSelectedDate(new Date(selectedDate))}
            />
          ) : groupedByLeague.length === 0 ? (
            <EmptyState
              title={
                searchQuery
                  ? t('common.noSearchResults', 'No search results')
                  : activeFilter === 'live'
                  ? t('common.noLiveMatches', 'No live matches right now')
                  : t('common.noMatchesScheduled', 'No matches scheduled for this date')
              }
              description={
                searchQuery
                  ? `${t('common.noSearchResults', 'No matches matching')} "${searchQuery}".`
                  : activeFilter === 'live'
                  ? t('common.noLiveMatches', 'There are no matches currently in play.')
                  : t('common.noMatchesScheduled', 'Check other dates or filters for upcoming matches.')
              }
            />
          ) : (
            <div className="space-y-3">
              {groupedByLeague.map(({ league, matches: leagueMatches }) => (
                <CompetitionGroup key={league.id} league={league} matches={leagueMatches} />
              ))}
            </div>
          )}
        </main>

        {/* Right Sidebar Widgets */}
        <RightSidebar />
      </div>

      {/* Mobile Navigation Bar */}
      <MobileBottomNavigation />
    </div>
  )
}
