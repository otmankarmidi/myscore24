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

export default function HomeClient() {
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
        setDataSource(result.source)
        setApiCount(result.count)
        setLastUpdated(result.lastUpdated)
        if (result.error) {
          setApiErrorMessage(result.error)
        }
        setLeagues(leagueData)
      } catch (err: any) {
        console.error('Failed to load home matches:', err)
        setHasError(true)
        setApiErrorMessage(err?.message || 'Failed to fetch match data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedDate])

  // Filter matches based on tab & search query
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // 1. Status Filter
      if (activeFilter === 'live') {
        const isLive = m.status === 'live' || m.status === 'half_time' || m.status === 'extra_time'
        if (!isLive) return false
      } else if (activeFilter === 'upcoming') {
        if (m.status !== 'scheduled') return false
      } else if (activeFilter === 'finished') {
        const isFinished = m.status === 'full_time' || m.status === 'penalties'
        if (!isFinished) return false
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchHome = m.homeTeam?.name?.toLowerCase().includes(q)
        const matchAway = m.awayTeam?.name?.toLowerCase().includes(q)
        const matchLeague = m.league?.name?.toLowerCase().includes(q)
        if (!matchHome && !matchAway && !matchLeague) return false
      }

      return true
    })
  }, [matches, activeFilter, searchQuery])

  // Group filtered matches by League
  const groupedByLeague = useMemo(() => {
    const map = new Map<string, { league: League; matches: Match[] }>()

    filteredMatches.forEach((match) => {
      const leagueId = match.league?.id || 'misc'
      if (!map.has(leagueId)) {
        map.set(leagueId, {
          league: match.league,
          matches: [],
        })
      }
      map.get(leagueId)!.matches.push(match)
    })

    return Array.from(map.values())
  }, [filteredMatches])

  // Counts for filter badges
  const counts = useMemo(() => {
    return {
      all: matches.length,
      live: matches.filter((m) => m.status === 'live' || m.status === 'half_time' || m.status === 'extra_time').length,
      upcoming: matches.filter((m) => m.status === 'scheduled').length,
      finished: matches.filter((m) => m.status === 'full_time' || m.status === 'penalties').length,
    }
  }, [matches])

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      {/* Top Application Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Page Layout Container */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        {/* Left Navigation Sidebar */}
        <DesktopSidebar />

        {/* Center Main Content Stream */}
        <main className="flex-1 min-w-0 w-full space-y-3">
          {/* Main Meaningful H1 Heading for SEO & Accessibility */}
          <div className="flex items-center justify-between px-1">
            <h1 className="text-lg md:text-xl font-bold font-geist text-on-surface">
              {activeFilter === 'live'
                ? t('filters.liveScores', 'Live Football Scores')
                : activeFilter === 'finished'
                ? t('filters.finishedMatches', 'Finished Football Results')
                : activeFilter === 'upcoming'
                ? t('filters.upcomingFixtures', 'Upcoming Football Fixtures')
                : t('common.todaysMatches', "Today's Football Matches")}
            </h1>
            <span className="text-xs text-on-surface-variant font-medium">
              {counts.all} matches
            </span>
          </div>

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
                  : activeFilter === 'upcoming'
                  ? t('common.noUpcomingMatches', 'No upcoming matches scheduled')
                  : t('common.noMatchesFound', 'No matches found for this date')
              }
              description={
                searchQuery
                  ? t('common.tryDifferentSearch', 'Try searching for a different team or competition.')
                  : activeFilter === 'live'
                  ? t('common.checkUpcoming', 'Check the upcoming tab to see scheduled kickoff times.')
                  : t('common.selectAnotherDate', 'Select another date on the calendar above.')
              }
            />
          ) : (
            <div className="space-y-4">
              {groupedByLeague.map(({ league, matches }) => (
                <CompetitionGroup
                  key={league.id || league.slug}
                  league={league}
                  matches={matches}
                />
              ))}
            </div>
          )}
        </main>

        {/* Right Info Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNavigation />
    </div>
  )
}
