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
import { isApprovedCompetition, getCompetitionPriority } from '@/config/competitions'

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

  // Load data for the selected date (uses client-side memory cache for returning visits)
  useEffect(() => {
    let isCancelled = false

    async function loadData() {
      setIsLoading(true)
      setHasError(false)
      setApiErrorMessage(null)

      try {
        const result = await sportsService.getMatchesByDateWithSource(selectedDate)
        if (isCancelled) return

        setMatches(result.matches || [])
        if (result.error) {
          setApiErrorMessage(result.error)
        }
      } catch (err: any) {
        if (isCancelled) return
        console.error('Failed to load home matches:', err)
        setHasError(true)
        setApiErrorMessage(err?.message || 'Failed to fetch match data')
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    // Setup auto-polling every 20 seconds for today's view to keep live scores & elapsed minutes up to date
    const todayStr = new Date().toISOString().split('T')[0]
    const selStr = selectedDate.toISOString().split('T')[0]
    let pollInterval: NodeJS.Timeout | null = null

    if (selStr === todayStr) {
      pollInterval = setInterval(async () => {
        if (isCancelled) return
        try {
          const fresh = await sportsService.getMatchesByDateWithSource(selectedDate, true)
          if (!isCancelled && fresh.matches) {
            setMatches(fresh.matches)
          }
        } catch {
          // Silent background poll error
        }
      }, 20000)
    }

    return () => {
      isCancelled = true
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [selectedDate])

  // 1. Filter dataset BEFORE rendering: Only approved competitions (Big 5, Europe, International)
  const approvedMatches = useMemo(() => {
    return matches.filter((m) => isApprovedCompetition(m.league))
  }, [matches])

  // 2. Filter matches based on active tab & search query on the already-loaded data (0 extra requests)
  const filteredMatches = useMemo(() => {
    return approvedMatches.filter((m) => {
      // Status Filter
      if (activeFilter === 'live') {
        const isLive = m.status === 'live' || m.status === 'half_time' || m.status === 'extra_time'
        if (!isLive) return false
      } else if (activeFilter === 'upcoming') {
        if (m.status !== 'scheduled') return false
      } else if (activeFilter === 'finished') {
        const isFinished = m.status === 'full_time' || m.status === 'penalties'
        if (!isFinished) return false
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchHome = m.homeTeam?.name?.toLowerCase().includes(q)
        const matchAway = m.awayTeam?.name?.toLowerCase().includes(q)
        const matchLeague = m.league?.name?.toLowerCase().includes(q)
        if (!matchHome && !matchAway && !matchLeague) return false
      }

      return true
    })
  }, [approvedMatches, activeFilter, searchQuery])

  // 3. Group filtered matches by League & Sort by Priority (Big 5 highest, then Europe, then International)
  const groupedByLeague = useMemo(() => {
    const map = new Map<string, { league: League; matches: Match[] }>()

    filteredMatches.forEach((match) => {
      const leagueKey = String(match.league?.id || match.league?.slug || 'misc')
      if (!map.has(leagueKey)) {
        map.set(leagueKey, {
          league: match.league,
          matches: [],
        })
      }
      map.get(leagueKey)!.matches.push(match)
    })

    const groups = Array.from(map.values())

    // Prioritize Big 5 (1-5), Europe (10-12), International (20-27)
    groups.sort((a, b) => {
      const pA = getCompetitionPriority(a.league)
      const pB = getCompetitionPriority(b.league)
      if (pA !== pB) return pA - pB
      return (a.league.name || '').localeCompare(b.league.name || '')
    })

    return groups
  }, [filteredMatches])

  // Progressive rendering for long lists: first 8 groups mount immediately, rest mount after first paint
  const [renderLimit, setRenderLimit] = useState<number>(8)

  useEffect(() => {
    if (groupedByLeague.length > 8) {
      const timer = setTimeout(() => {
        setRenderLimit(groupedByLeague.length)
      }, 120)
      return () => clearTimeout(timer)
    } else {
      setRenderLimit(8)
    }
  }, [groupedByLeague.length])

  const visibleGroups = useMemo(() => {
    return groupedByLeague.slice(0, renderLimit)
  }, [groupedByLeague, renderLimit])

  // 4. Counts for filter badges calculated strictly on approved matches
  const counts = useMemo(() => {
    return {
      all: approvedMatches.length,
      live: approvedMatches.filter((m) => m.status === 'live' || m.status === 'half_time' || m.status === 'extra_time').length,
      upcoming: approvedMatches.filter((m) => m.status === 'scheduled').length,
      finished: approvedMatches.filter((m) => m.status === 'full_time' || m.status === 'penalties').length,
    }
  }, [approvedMatches])

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
              {visibleGroups.map(({ league, matches }) => (
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
