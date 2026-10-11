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
import TopMatchesBar from '@/components/home/TopMatchesBar'
import HomeNewsMagazine from '@/components/home/HomeNewsMagazine'
import TopLeaguesStandingsWidget from '@/components/home/TopLeaguesStandingsWidget'
import LeagueVideoNewsGrid from '@/components/home/LeagueVideoNewsGrid'
import LeagueBannersShowcase from '@/components/home/LeagueBannersShowcase'
import { sportsService } from '@/services/sports/sportsService'
import { useLanguage } from '@/context/LanguageContext'
import { Match } from '@/types/match'
import { League } from '@/types/league'
import { NewsArticle } from '@/types/news'
import { isApprovedCompetition, getCompetitionPriority } from '@/config/competitions'
import { isToday } from '@/lib/utils'

interface HomeClientProps {
  initialTrendingMatches?: Match[]
  latestArticles?: NewsArticle[]
  latestArticlesAr?: NewsArticle[]
}

export default function HomeClient({
  initialTrendingMatches = [],
  latestArticles = [],
  latestArticlesAr = [],
}: HomeClientProps) {
  const { t, locale } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [articlesEn, setArticlesEn] = useState<NewsArticle[]>(latestArticles)
  const [articlesAr, setArticlesAr] = useState<NewsArticle[]>(latestArticlesAr)

  useEffect(() => {
    if (latestArticles && latestArticles.length > 0) {
      setArticlesEn(latestArticles)
    }
  }, [latestArticles])

  useEffect(() => {
    if (latestArticlesAr && latestArticlesAr.length > 0) {
      setArticlesAr(latestArticlesAr)
    }
  }, [latestArticlesAr])

  // Client-side refresh for news to catch newly published stories without full page reload
  useEffect(() => {
    let isCancelled = false

    async function refreshLatestNews() {
      try {
        const [resEn, resAr] = await Promise.all([
          fetch('/api/news?language=en&limit=16').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/news?language=ar&limit=16').then((r) => (r.ok ? r.json() : null)),
        ])
        if (isCancelled) return
        if (resEn?.articles && resEn.articles.length > 0) {
          setArticlesEn(resEn.articles)
        }
        if (resAr?.articles && resAr.articles.length > 0) {
          setArticlesAr(resAr.articles)
        }
      } catch {
        // Silent background fallback
      }
    }

    refreshLatestNews()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !isCancelled) {
        refreshLatestNews()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      isCancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Select news matching active locale, falling back to English if Arabic articles not available
  const currentArticles =
    locale === 'ar' && articlesAr.length > 0 ? articlesAr : articlesEn
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

    // Setup auto-polling every 15 seconds for today's view to keep live scores & elapsed minutes up to date
    let pollInterval: NodeJS.Timeout | null = null

    if (isToday(selectedDate)) {
      pollInterval = setInterval(async () => {
        if (isCancelled) return
        try {
          const fresh = await sportsService.getMatchesByDateWithSource(selectedDate, true)
          if (!isCancelled && fresh.matches && fresh.matches.length > 0) {
            setMatches(fresh.matches)
          }
        } catch {
          // Silent background poll error
        }
      }, 15000)

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && !isCancelled) {
          sportsService
            .getMatchesByDateWithSource(selectedDate, true)
            .then((fresh) => {
              if (!isCancelled && fresh.matches && fresh.matches.length > 0) {
                setMatches(fresh.matches)
              }
            })
            .catch(() => {})
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        isCancelled = true
        if (pollInterval) clearInterval(pollInterval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
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

      {/* Top Matches Carousel Bar (Matching Image Style) */}
      <TopMatchesBar
        matches={approvedMatches.length > 0 ? approvedMatches : matches}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        isLoading={isLoading}
      />

      {/* Editorial News Magazine Portal (Full Showcase matching reference screenshot) */}
      <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 pt-3 pb-2 space-y-6">
        <HomeNewsMagazine articles={currentArticles} />
      </div>

      {/* Main Page Layout Container (Match Center + Sidebars) */}
      <div id="matches" className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        {/* Left Navigation Sidebar */}
        <DesktopSidebar />

        {/* Center Main Content Stream */}
        <main className="flex-1 min-w-0 w-full space-y-8">
          {/* Main Meaningful H1 for Google SEO & Accessibility */}
          <h1 className="sr-only">
            {locale === 'ar'
              ? 'موقع MyScore24 - نتائج المباريات المباشرة وأحدث أخبار كرة القدم العالمية'
              : 'MyScore24 - Live Football Scores, Results & Latest Football News'}
          </h1>

          {/* Section matching Image 1: Top Leagues Full-Width Banners (only if articles linked) */}
          <LeagueBannersShowcase articles={currentArticles} />

          {/* Section: دوريات وبطولات (League Video & News Grids) */}
          <LeagueVideoNewsGrid articles={currentArticles} />

          {/* Section matching Image 2: ترتيب أحسن 5 دوريات (Top 5 Leagues Standings) — Moved below articles */}
          <TopLeaguesStandingsWidget />

          {/* Section: Live Scores & Match Center (Matching Image 3) */}
          <section className="space-y-3 pt-2" aria-label="Match Center">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-amber-400 shadow-sm" />
                <h2 className="text-base sm:text-lg font-extrabold font-geist text-white tracking-tight">
                  {activeFilter === 'live'
                    ? t('filters.liveScores', 'Live Football Scores')
                    : activeFilter === 'finished'
                    ? t('filters.finishedMatches', 'Finished Football Results')
                    : activeFilter === 'upcoming'
                    ? t('filters.upcomingFixtures', 'Upcoming Football Fixtures')
                    : (locale === 'ar' ? 'مركز المباريات والنتائج المباشرة' : "Today's Match Center & Live Scores")}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-[#0a101d] border border-[#162236]">
                {counts.all} {locale === 'ar' ? 'مباراة' : 'matches'}
              </span>
            </div>

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
          </section>
        </main>

        {/* Right Info Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNavigation />
    </div>
  )
}
