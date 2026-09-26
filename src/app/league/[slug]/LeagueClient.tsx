'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import CompetitionGroup from '@/components/match/CompetitionGroup'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import CountryFlag from '@/components/common/CountryFlag'
import StandingsTable from '@/components/standings/StandingsTable'
import TopScorersTable from '@/components/league/TopScorersTable'
import NewsCard from '@/components/news/NewsCard'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import FavoriteButton from '@/components/common/FavoriteButton'
import { sportsService } from '@/services/sports/sportsService'
import { useFavorites } from '@/hooks/useFavorites'
import { League } from '@/types/league'
import { Match } from '@/types/match'
import { LeagueStanding, TopScorer, GroupedStanding, Standing } from '@/types/standing'
import { NewsArticle } from '@/types/news'
import { trackCompetitionOpen } from '@/lib/analytics'

type LeagueTab = 'overview' | 'matches' | 'standings' | 'top_scorers' | 'news'

interface LeagueClientProps {
  slug: string
}

export default function LeagueClient({ slug }: LeagueClientProps) {
  const [league, setLeague] = useState<League | any>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<LeagueStanding[]>([])
  const [topScorers, setTopScorers] = useState<TopScorer[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string | number | undefined>(undefined)
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [errorType, setErrorType] = useState<'notFound' | 'unavailable' | null>(null)
  const [activeTab, setActiveTab] = useState<LeagueTab>('overview')
  const [logoError, setLogoError] = useState(false)

  const { isLeagueFavorite, toggleFavoriteLeague } = useFavorites()

  // Derive all groups either from league.groups or by grouping standings by s.group
  const allGroups = useMemo<GroupedStanding[]>(() => {
    if (league?.groups && league.groups.length > 0) {
      return league.groups
    }
    if (standings && standings.length > 0) {
      const groupsMap = new Map<string, Standing[]>()
      let hasGroup = false
      for (const s of standings) {
        if (s.group) {
          hasGroup = true
          if (!groupsMap.has(s.group)) groupsMap.set(s.group, [])
          groupsMap.get(s.group)!.push(s)
        }
      }
      if (hasGroup && groupsMap.size > 1) {
        return Array.from(groupsMap.entries()).map(([groupName, groupStandings]) => ({
          groupName,
          standings: groupStandings,
        }))
      }
    }
    return []
  }, [league?.groups, standings])

  const loadLeagueData = useCallback(
    async (seasonParam?: string | number) => {
      if (!slug) return
      setIsLoading(true)
      setErrorType(null)

      try {
        const fullData = await sportsService.getLeagueFullData(slug, seasonParam)
        if (!fullData.league) {
          setErrorType(fullData.errorType || 'notFound')
          return
        }

        setLeague(fullData.league)
        trackCompetitionOpen({
          competitionId: fullData.league.id,
          competitionName: fullData.league.name,
          country: fullData.league.country,
        })
        setMatches(fullData.fixtures)
        setStandings(fullData.standings)
        setTopScorers(fullData.topScorers)
        setSelectedSeason(fullData.league.selectedSeason || fullData.league.currentSeason)

        const newsList = await sportsService.getNewsByLeague(fullData.league.id)
        setNews(newsList)
      } catch (err) {
        console.error('Failed to load league details:', err)
        setErrorType('unavailable')
      } finally {
        setIsLoading(false)
      }
    },
    [slug]
  )

  useEffect(() => {
    loadLeagueData(selectedSeason)
  }, [loadLeagueData])

  const handleSeasonChange = (newSeason: string) => {
    setSelectedSeason(newSeason)
    loadLeagueData(newSeason)
  }

  if (isLoading && !league) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
          <DesktopSidebar />
          <main className="flex-1 min-w-0 space-y-4">
            <div className="bg-surface-container rounded-xl border border-surface-bright p-6 animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface-container-high rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-surface-container-high rounded w-1/4" />
                  <div className="h-7 bg-surface-container-high rounded w-1/2" />
                </div>
              </div>
            </div>
            <div className="h-10 bg-surface-container rounded-lg border border-surface-bright animate-pulse" />
            <div className="h-64 bg-surface-container rounded-lg border border-surface-bright animate-pulse" />
          </main>
          <RightSidebar />
        </div>
      </div>
    )
  }

  if (errorType || !league) {
    const isNotFound = errorType === 'notFound'
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8">
          <ErrorState
            title={isNotFound ? 'League not found' : 'League data is temporarily unavailable.'}
            description={
              isNotFound
                ? 'The requested league ID or competition could not be found.'
                : 'Live football league data is temporarily unavailable. Please check back shortly.'
            }
          />
        </div>
      </div>
    )
  }

  const isFavorited = isLeagueFavorite(league.id)
  const isCurrentSeason = String(selectedSeason) === String(league.currentSeason)

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          {/* League Hero Banner */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 bg-surface-container-high rounded-lg p-2 flex items-center justify-center border border-surface-bright shrink-0">
                <CompetitionLogo
                  logo={league.logo}
                  name={league.name}
                  country={league.country}
                  countryFlag={league.countryFlag}
                  providerId={league.id}
                  slug={league.slug}
                  size={56}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <CountryFlag
                    country={league.country}
                    flagUrl={league.countryFlag}
                    width={18}
                    height={13}
                  />
                  <span>{league.country}</span>
                  <span>•</span>
                  <span>Season {league.season}</span>
                </div>
                <h1 className="text-headline-xl text-on-surface font-extrabold">{league.name}</h1>
                <p className="text-xs text-on-surface-variant">
                  Current Round: {league.currentRound || 'Regular Season'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Season Selector Dropdown */}
              {league.seasons && league.seasons.length > 0 && (
                <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg border border-surface-bright">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">calendar_month</span>
                  <select
                    value={selectedSeason || league.selectedSeason || league.currentSeason}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
                  >
                    {league.seasons.map((s: any) => (
                      <option key={s.year} value={s.year} className="bg-surface-container text-on-surface">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <FavoriteButton
                isFavorited={isFavorited}
                onToggle={() => toggleFavoriteLeague(league.id)}
                label="Favorite Competition"
                size="md"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-surface-bright overflow-x-auto">
            {(['overview', 'matches', 'standings', 'top_scorers', 'news'] as LeagueTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-center ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Fixtures Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-body-md font-bold text-on-surface">Fixtures & Results ({league.season})</h2>
                  {matches.length > 5 && (
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View All ({matches.length})
                    </button>
                  )}
                </div>
                {matches.length === 0 ? (
                  <EmptyState title="No fixtures found" description="There are currently no scheduled matches for this competition season." />
                ) : (
                  <CompetitionGroup league={league} matches={matches.slice(0, 5)} />
                )}
              </div>

              {/* Standings Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-body-md font-bold text-on-surface">Standings Table ({league.season})</h2>
                  {(standings.length > 0 || allGroups.length > 0) && (
                    <button
                      onClick={() => setActiveTab('standings')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Full Standings
                    </button>
                  )}
                </div>

                {allGroups.length > 0 ? (
                  <div className="space-y-3">
                    {/* Horizontal scrollable group pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <button
                        onClick={() => setSelectedGroup('ALL')}
                        className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedGroup === 'ALL'
                            ? 'bg-primary text-black'
                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        All Groups ({allGroups.length})
                      </button>
                      {allGroups.map((group) => (
                        <button
                          key={group.groupName}
                          onClick={() => setSelectedGroup(group.groupName)}
                          className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                            selectedGroup === group.groupName
                              ? 'bg-primary text-black'
                              : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {group.groupName}
                        </button>
                      ))}
                    </div>

                    {/* Display groups */}
                    <div className="space-y-4">
                      {(selectedGroup === 'ALL'
                        ? allGroups
                        : allGroups.filter((g) => g.groupName === selectedGroup)
                      ).map((group) => (
                        <div key={group.groupName} className="space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                              {group.groupName}
                            </h3>
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              {group.standings.length} Teams
                            </span>
                          </div>
                          <StandingsTable standings={group.standings} showFullTable={false} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : standings.length > 0 ? (
                  <StandingsTable standings={standings} showFullTable={false} />
                ) : (
                  <EmptyState
                    title={
                      !league.standingsSupported || league.id === 'fifa.friendly'
                        ? 'Standings are not available for International Friendlies.'
                        : isCurrentSeason
                        ? 'Current season standings are not available yet.'
                        : 'Standings are not available for the selected season.'
                    }
                    description={
                      !league.standingsSupported || league.id === 'fifa.friendly'
                        ? 'Friendly matches do not feature an official league table or group standings.'
                        : isCurrentSeason
                        ? 'Official standings will update automatically once matches are played for this season.'
                        : 'No standings data was recorded for this season.'
                    }
                  />
                )}
              </div>

              {/* Top Scorers Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-body-md font-bold text-on-surface">Top Scorers ({league.season})</h2>
                  {topScorers.length > 0 && (
                    <button
                      onClick={() => setActiveTab('top_scorers')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View Rankings
                    </button>
                  )}
                </div>
                {topScorers.length > 0 ? (
                  <TopScorersTable scorers={topScorers.slice(0, 5)} />
                ) : (
                  <EmptyState
                    title={
                      !league.topScorersSupported
                        ? 'Top scorers are not available for this competition.'
                        : isCurrentSeason
                        ? 'Current season top scorers are not available yet.'
                        : 'Top scorers are not available for the selected season.'
                    }
                    description="Individual player scoring rankings will update after matches are played."
                  />
                )}
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (() => {
            const availableRounds = Array.from(
              new Set(matches.map((m) => m.round).filter(Boolean))
            ) as string[]

            return (
              <div className="space-y-4">
                {availableRounds.length > 1 && (
                  <div className="flex items-center justify-between bg-surface-container p-3 rounded-lg border border-surface-bright">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Filter by Round / Matchday
                    </span>
                    <select
                      onChange={(e) => {
                        const roundVal = e.target.value
                        if (!roundVal) {
                          setMatches(matches)
                        }
                      }}
                      className="bg-surface-container-high border border-surface-bright text-xs font-bold text-on-surface rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="">All Rounds ({matches.length} matches)</option>
                      {availableRounds.map((rnd) => (
                        <option key={rnd} value={rnd}>
                          {rnd}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {matches.length === 0 ? (
                  <EmptyState title="No fixtures found" description="There are currently no scheduled matches for this competition season." />
                ) : (
                  <CompetitionGroup league={league} matches={matches} />
                )}
              </div>
            )
          })()}

          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              {allGroups.length > 0 ? (
                <div className="space-y-4">
                  {/* Group Filter Header & Dropdown */}
                  <div className="flex items-center justify-between bg-surface-container p-3 rounded-lg border border-surface-bright flex-wrap gap-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Competition Groups ({allGroups.length} Groups)
                    </span>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="bg-surface-container-high border border-surface-bright text-xs font-bold text-on-surface rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="ALL">Show All Groups ({allGroups.length})</option>
                      {allGroups.map((g) => (
                        <option key={g.groupName} value={g.groupName}>
                          {g.groupName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Horizontal pill navigation */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSelectedGroup('ALL')}
                      className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                        selectedGroup === 'ALL'
                          ? 'bg-primary text-black'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      All Groups
                    </button>
                    {allGroups.map((g) => (
                      <button
                        key={g.groupName}
                        onClick={() => setSelectedGroup(g.groupName)}
                        className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedGroup === g.groupName
                            ? 'bg-primary text-black'
                            : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {g.groupName}
                      </button>
                    ))}
                  </div>

                  {/* Render All or Filtered Groups */}
                  <div className="space-y-6">
                    {(selectedGroup === 'ALL'
                      ? allGroups
                      : allGroups.filter((g) => g.groupName === selectedGroup)
                    ).map((group) => (
                      <div key={group.groupName} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                            {group.groupName}
                          </h3>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {group.standings.length} Teams
                          </span>
                        </div>
                        <StandingsTable standings={group.standings} showFullTable={true} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : standings.length === 0 ? (
                <EmptyState
                  title={
                    !league.standingsSupported || league.id === 'fifa.friendly'
                      ? 'Standings are not available for International Friendlies.'
                      : isCurrentSeason
                      ? 'Current season standings are not available yet.'
                      : 'Standings are not available for the selected season.'
                  }
                  description={
                    !league.standingsSupported || league.id === 'fifa.friendly'
                      ? 'Friendly matches do not feature an official league table or group standings.'
                      : isCurrentSeason
                      ? 'Official standings will update automatically once matches are played for this season.'
                      : 'No standings data was recorded for this season.'
                  }
                />
              ) : (
                <StandingsTable standings={standings} showFullTable={true} />
              )}
            </div>
          )}

          {/* Top Scorers Tab */}
          {activeTab === 'top_scorers' && (
            <div>
              {topScorers.length === 0 ? (
                <EmptyState
                  title={
                    !league.topScorersSupported
                      ? 'Top scorers are not available for this competition.'
                      : isCurrentSeason
                      ? 'Current season top scorers are not available yet.'
                      : 'Top scorers are not available for the selected season.'
                  }
                  description="Individual player scoring rankings will update after goals are scored."
                />
              ) : (
                <TopScorersTable scorers={topScorers} />
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState title="No news stories" description="Check back later for recent news articles for this league." />
                </div>
              ) : (
                news.map((art) => <NewsCard key={art.id} article={art} />)
              )}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
