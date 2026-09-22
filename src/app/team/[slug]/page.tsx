'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import TeamLogo from '@/components/common/TeamLogo'
import FavoriteButton from '@/components/common/FavoriteButton'
import MatchRow from '@/components/match/MatchRow'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { sportsService } from '@/services/sports/sportsService'
import { useFavorites } from '@/hooks/useFavorites'
import { Match } from '@/types/match'
import { Player } from '@/types/player'
import PlayerImage from '@/components/common/PlayerImage'

type TeamTab = 'overview' | 'fixtures' | 'results' | 'squad' | 'stats'

function FormDot({ result }: { result: string }) {
  let bgClass = 'bg-surface-bright text-on-surface-variant'
  if (result === 'W') bgClass = 'bg-emerald-500 text-slate-950 font-bold'
  if (result === 'L') bgClass = 'bg-rose-500 text-white font-bold'
  if (result === 'D') bgClass = 'bg-slate-500 text-white font-bold'

  return (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${bgClass}`}>
      {result}
    </span>
  )
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-container-high/60 rounded-lg border border-surface-bright hover:border-primary/50 transition-all group">
      <PlayerImage
        playerId={player.id}
        photo={player.photo}
        name={player.name}
        size="lg"
        className="w-11 h-11 min-w-[44px] border border-surface-bright shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-body-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
            {player.name}
          </h4>
          {player.number && (
            <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              #{player.number}
            </span>
          )}
        </div>
        <p className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
          <span>{player.position}</span>
          {player.age > 0 && <span>• {player.age} yrs</span>}
        </p>
      </div>
    </div>
  )
}

export default function TeamDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [teamData, setTeamData] = useState<any>(null)
  const [selectedSeason, setSelectedSeason] = useState<string | number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [errorType, setErrorType] = useState<'notFound' | 'unavailable' | null>(null)
  const [activeTab, setActiveTab] = useState<TeamTab>('overview')

  const { isTeamFavorite, toggleFavoriteTeam } = useFavorites()

  const loadTeamData = useCallback(
    async (seasonParam?: string | number) => {
      if (!slug) return
      setIsLoading(true)
      setErrorType(null)

      try {
        const fullData = await sportsService.getTeamFullData(slug, seasonParam)
        if (!fullData.team) {
          setErrorType(fullData.errorType || 'notFound')
          return
        }

        setTeamData(fullData)
        setSelectedSeason(fullData.team.selectedSeason || fullData.team.currentSeason)
      } catch (err) {
        console.error('Failed to load team details:', err)
        setErrorType('unavailable')
      } finally {
        setIsLoading(false)
      }
    },
    [slug]
  )

  useEffect(() => {
    loadTeamData(selectedSeason)
  }, [loadTeamData])

  const handleSeasonChange = (newSeason: string) => {
    setSelectedSeason(newSeason)
    loadTeamData(newSeason)
  }

  if (isLoading && !teamData) {
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

  if (errorType || !teamData || !teamData.team) {
    const isNotFound = errorType === 'notFound'
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8">
          <ErrorState
            title={isNotFound ? 'Team not found' : 'Team data is temporarily unavailable.'}
            description={
              isNotFound
                ? 'The requested team ID or club profile could not be found.'
                : 'Live football team data is temporarily unavailable. Please check back shortly.'
            }
          />
        </div>
      </div>
    )
  }

  const team = teamData.team
  const standingPosition = teamData.standingPosition
  const nextMatch = teamData.nextMatch
  const lastMatch = teamData.lastMatch
  const recentForm = teamData.recentForm || []
  const fixtures: Match[] = teamData.fixtures || []
  const results: Match[] = teamData.results || []
  const stats = teamData.stats
  const squad = teamData.squad || { goalkeepers: [], defenders: [], midfielders: [], forwards: [], all: [] }

  const isFavorited = isTeamFavorite(team.id)

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          {/* Team Hero Header */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <TeamLogo name={team.name} abbreviation={team.abbreviation} logo={team.logo} size="lg" />

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  {team.country && <span>{team.country}</span>}
                  {team.founded && (
                    <>
                      <span>•</span>
                      <span>Founded {team.founded}</span>
                    </>
                  )}
                  {team.currentSeason && (
                    <>
                      <span>•</span>
                      <span>Season {team.currentSeason}</span>
                    </>
                  )}
                </div>
                <h1 className="text-headline-xl text-on-surface font-extrabold">{team.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant mt-1">
                  {team.stadium && (
                    <span>
                      Stadium: {team.stadium}{' '}
                      {team.stadiumCapacity ? `(${team.stadiumCapacity.toLocaleString()} seats)` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Season Selector */}
              {team.seasons && team.seasons.length > 0 && (
                <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-lg border border-surface-bright">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_month</span>
                  <select
                    value={selectedSeason || team.selectedSeason || team.currentSeason}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
                  >
                    {team.seasons.map((year: number) => (
                      <option key={year} value={year} className="bg-surface-container text-on-surface">
                        Season {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <FavoriteButton
                isFavorited={isFavorited}
                onToggle={() => toggleFavoriteTeam(team.id)}
                label="Favorite Team"
                size="md"
              />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-surface-bright overflow-x-auto">
            {(['overview', 'fixtures', 'results', 'squad', 'stats'] as TeamTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-center ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Status Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* League Rank Banner */}
                {standingPosition ? (
                  <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                      <span>League Rank</span>
                      <span>{standingPosition.leagueName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center font-extrabold text-2xl text-primary font-mono">
                        #{standingPosition.rank}
                      </div>
                      <div>
                        <p className="text-body-md font-bold text-on-surface">{standingPosition.points} Points</p>
                        <p className="text-xs text-on-surface-variant font-mono">
                          {standingPosition.played} Games ({standingPosition.won}W - {standingPosition.drawn}D - {standingPosition.lost}L)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container p-4 rounded-xl border border-surface-bright flex items-center justify-center text-xs text-on-surface-variant">
                    League standing unavailable
                  </div>
                )}

                {/* Recent Form */}
                <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-2">
                  <span className="text-xs font-semibold text-on-surface-variant block">Recent Form</span>
                  <div className="flex items-center gap-2 py-1">
                    {recentForm.length > 0 ? (
                      recentForm.map((res: string, idx: number) => <FormDot key={idx} result={res} />)
                    ) : (
                      <span className="text-xs text-on-surface-variant">No recent match results</span>
                    )}
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Last 5 matches (oldest ➔ newest)</p>
                </div>

                {/* Win / Draw / Loss Overview */}
                {stats ? (
                  <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-2">
                    <span className="text-xs font-semibold text-on-surface-variant block">Season Record</span>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="bg-surface-container-high p-1.5 rounded border border-surface-bright">
                        <span className="block text-[10px] text-on-surface-variant">WINS</span>
                        <span className="font-extrabold text-body-md text-emerald-400">{stats.fixtures.wins}</span>
                      </div>
                      <div className="bg-surface-container-high p-1.5 rounded border border-surface-bright">
                        <span className="block text-[10px] text-on-surface-variant">DRAWS</span>
                        <span className="font-extrabold text-body-md text-slate-300">{stats.fixtures.draws}</span>
                      </div>
                      <div className="bg-surface-container-high p-1.5 rounded border border-surface-bright">
                        <span className="block text-[10px] text-on-surface-variant">LOSSES</span>
                        <span className="font-extrabold text-body-md text-rose-400">{stats.fixtures.loses}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container p-4 rounded-xl border border-surface-bright flex items-center justify-center text-xs text-on-surface-variant">
                    Season record unavailable
                  </div>
                )}
              </div>

              {/* Next Match & Last Match */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Next Match */}
                <div className="bg-surface-container rounded-xl border border-surface-bright overflow-hidden">
                  <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                    Next Scheduled Match
                  </div>
                  {nextMatch ? (
                    <MatchRow match={nextMatch} />
                  ) : (
                    <div className="p-4 text-center text-xs text-on-surface-variant">
                      No upcoming fixture scheduled for this season.
                    </div>
                  )}
                </div>

                {/* Last Match */}
                <div className="bg-surface-container rounded-xl border border-surface-bright overflow-hidden">
                  <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                    Latest Result
                  </div>
                  {lastMatch ? (
                    <MatchRow match={lastMatch} />
                  ) : (
                    <div className="p-4 text-center text-xs text-on-surface-variant">
                      No previous result recorded for this season.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Results Preview */}
              <div className="bg-surface-container rounded-xl border border-surface-bright overflow-hidden">
                <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright flex items-center justify-between font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                  <span>Recent Matches</span>
                  {results.length > 5 && (
                    <button onClick={() => setActiveTab('results')} className="text-primary hover:underline text-xs">
                      View All ({results.length})
                    </button>
                  )}
                </div>
                <div className="divide-y divide-surface-bright">
                  {results.length === 0 ? (
                    <EmptyState title="No recent matches" description="There are no completed match results recorded." />
                  ) : (
                    results.slice(0, 5).map((match) => <MatchRow key={match.id} match={match} />)
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Fixtures */}
          {activeTab === 'fixtures' && (
            <div className="bg-surface-container rounded-xl border border-surface-bright overflow-hidden">
              <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                Upcoming Fixtures ({fixtures.length})
              </div>
              <div className="divide-y divide-surface-bright">
                {fixtures.length === 0 ? (
                  <EmptyState title="No upcoming fixtures" description="There are currently no scheduled matches for this team." />
                ) : (
                  fixtures.map((match) => <MatchRow key={match.id} match={match} />)
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Results */}
          {activeTab === 'results' && (
            <div className="bg-surface-container rounded-xl border border-surface-bright overflow-hidden">
              <div className="px-4 py-3 bg-surface-container-high border-b border-surface-bright font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                Completed Match Results ({results.length})
              </div>
              <div className="divide-y divide-surface-bright">
                {results.length === 0 ? (
                  <EmptyState title="No match results" description="There are no completed match results for this team." />
                ) : (
                  results.map((match) => <MatchRow key={match.id} match={match} />)
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Squad */}
          {activeTab === 'squad' && (
            <div className="space-y-6">
              {squad.all.length === 0 ? (
                <EmptyState
                  title="Squad information is currently unavailable."
                  description="Official player roster details could not be loaded for this team."
                />
              ) : (
                <>
                  {/* Goalkeepers */}
                  {squad.goalkeepers.length > 0 && (
                    <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                        Goalkeepers ({squad.goalkeepers.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {squad.goalkeepers.map((p: Player) => (
                          <PlayerCard key={p.id} player={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Defenders */}
                  {squad.defenders.length > 0 && (
                    <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                        Defenders ({squad.defenders.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {squad.defenders.map((p: Player) => (
                          <PlayerCard key={p.id} player={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Midfielders */}
                  {squad.midfielders.length > 0 && (
                    <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                        Midfielders ({squad.midfielders.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {squad.midfielders.map((p: Player) => (
                          <PlayerCard key={p.id} player={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Forwards */}
                  {squad.forwards.length > 0 && (
                    <div className="bg-surface-container p-4 rounded-xl border border-surface-bright space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                        Forwards ({squad.forwards.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {squad.forwards.map((p: Player) => (
                          <PlayerCard key={p.id} player={p} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab 5: Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {!stats ? (
                <EmptyState
                  title="Team statistics are currently unavailable."
                  description="Detailed performance data for this competition season is not available."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Overview Card */}
                  <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-4">
                    <h3 className="font-bold text-body-md text-on-surface">Matches & Record</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">PLAYED</span>
                        <span className="text-headline-sm font-extrabold text-on-surface">{stats.fixtures.played}</span>
                      </div>
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">WINS</span>
                        <span className="text-headline-sm font-extrabold text-emerald-400">{stats.fixtures.wins}</span>
                      </div>
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">DRAWS</span>
                        <span className="text-headline-sm font-extrabold text-slate-300">{stats.fixtures.draws}</span>
                      </div>
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">LOSSES</span>
                        <span className="text-headline-sm font-extrabold text-rose-400">{stats.fixtures.loses}</span>
                      </div>
                    </div>
                  </div>

                  {/* Goal Stats */}
                  <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-4">
                    <h3 className="font-bold text-body-md text-on-surface">Goals & Defense</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">GOALS FOR</span>
                        <span className="text-headline-sm font-extrabold text-primary">{stats.goals.for}</span>
                      </div>
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">GOALS AGAINST</span>
                        <span className="text-headline-sm font-extrabold text-rose-400">{stats.goals.against}</span>
                      </div>
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">CLEAN SHEETS</span>
                        <span className="text-headline-sm font-extrabold text-emerald-400">{stats.cleanSheets}</span>
                      </div>
                      <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                        <span className="block text-[11px] text-on-surface-variant font-sans">FAILED TO SCORE</span>
                        <span className="text-headline-sm font-extrabold text-slate-400">{stats.failedToScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-3 col-span-full">
                    <h3 className="font-bold text-body-md text-on-surface">Notable Highlights</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {stats.biggestWin && (
                        <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                          <span className="text-on-surface-variant block">Biggest Win</span>
                          <span className="font-bold text-on-surface">{stats.biggestWin}</span>
                        </div>
                      )}
                      {stats.biggestLoss && (
                        <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                          <span className="text-on-surface-variant block">Biggest Loss</span>
                          <span className="font-bold text-on-surface">{stats.biggestLoss}</span>
                        </div>
                      )}
                      {stats.penalty && (
                        <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                          <span className="text-on-surface-variant block">Penalties Scored / Total</span>
                          <span className="font-bold text-on-surface font-mono">
                            {stats.penalty.scored} / {stats.penalty.total}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
