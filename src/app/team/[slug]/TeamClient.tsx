'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { trackTeamOpen } from '@/lib/analytics'

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

function PlayerCard({ player, teamName }: { player: Player; teamName?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-surface-container-high/60 rounded-lg border border-surface-bright hover:border-primary/50 transition-all group">
      <PlayerImage
        playerId={player.id}
        photo={player.photo}
        image={player.image || player.imagePath}
        name={player.name}
        teamName={teamName || player.teamName || player.team?.name}
        squadNumber={player.squadNumber || player.number}
        slug={player.slug}
        size="lg"
        className="w-11 h-11 min-w-[44px] border border-surface-bright shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-body-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
            {player.name}
          </h4>
          {(player.squadNumber || player.number) && (
            <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              #{player.squadNumber || player.number}
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

interface TeamClientProps {
  slug: string
}

export default function TeamClient({ slug }: TeamClientProps) {
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
        trackTeamOpen({
          teamId: fullData.team.id,
          teamName: fullData.team.name,
          country: fullData.team.country,
        })
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

  if (errorType || !teamData) {
    const isNotFound = errorType === 'notFound'
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8">
          <ErrorState
            title={isNotFound ? 'Team not found' : 'Team data is temporarily unavailable.'}
            description={
              isNotFound
                ? 'The requested team ID or club could not be found.'
                : 'Live football club data is temporarily unavailable. Please check back shortly.'
            }
          />
        </div>
      </div>
    )
  }

  const { team, fixtures = [], results = [], squad = [], stats } = teamData
  const isFavorited = isTeamFavorite(team.id)

  const defenders = squad.filter((p: Player) => p.position === 'Defender')
  const midfielders = squad.filter((p: Player) => p.position === 'Midfielder')
  const attackers = squad.filter((p: Player) => p.position === 'Attacker')
  const goalkeepers = squad.filter((p: Player) => p.position === 'Goalkeeper')

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          {/* Team Hero Header */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container-high rounded-lg p-2 flex items-center justify-center border border-surface-bright shrink-0">
                <TeamLogo logo={team.logo} name={team.name} abbreviation={team.code || team.name.slice(0, 3).toUpperCase()} size="lg" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <span>{team.country}</span>
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
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">calendar_month</span>
                  <select
                    value={selectedSeason || team.selectedSeason || team.currentSeason}
                    onChange={(e) => handleSeasonChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer"
                  >
                    {team.seasons.map((s: any) => (
                      <option key={s.year} value={s.year} className="bg-surface-container text-on-surface">
                        {s.label}
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
                className={`flex-1 min-w-[80px] py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-center ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Form Guide Banner if stats exist */}
              {stats?.form && (
                <div className="bg-surface-container p-4 rounded-xl border border-surface-bright flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Recent Form
                  </span>
                  <div className="flex items-center gap-1.5">
                    {stats.form.split('').map((res: string, i: number) => (
                      <FormDot key={i} result={res} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Matches Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-body-md font-bold text-on-surface">Upcoming Matches</h2>
                  {fixtures.length > 3 && (
                    <button
                      onClick={() => setActiveTab('fixtures')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View All ({fixtures.length})
                    </button>
                  )}
                </div>
                {fixtures.length === 0 ? (
                  <EmptyState title="No upcoming fixtures" description="There are no scheduled fixtures for this team." />
                ) : (
                  <div className="bg-surface-container rounded-xl border border-surface-bright divide-y divide-surface-bright/50">
                    {fixtures.slice(0, 3).map((match: Match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Results Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-body-md font-bold text-on-surface">Recent Results</h2>
                  {results.length > 3 && (
                    <button
                      onClick={() => setActiveTab('results')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View All ({results.length})
                    </button>
                  )}
                </div>
                {results.length === 0 ? (
                  <EmptyState title="No past results" description="No match results found for this season." />
                ) : (
                  <div className="bg-surface-container rounded-xl border border-surface-bright divide-y divide-surface-bright/50">
                    {results.slice(0, 3).map((match: Match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                )}
              </div>

              {/* Squad Preview */}
              {squad.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-body-md font-bold text-on-surface">Squad Preview</h2>
                    <button
                      onClick={() => setActiveTab('squad')}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Full Squad ({squad.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {squad.slice(0, 6).map((player: Player) => (
                      <PlayerCard key={player.id} player={player} teamName={team.name} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: FIXTURES */}
          {activeTab === 'fixtures' && (
            <div className="space-y-4">
              {fixtures.length === 0 ? (
                <EmptyState title="No upcoming fixtures" description="There are no scheduled fixtures for this team." />
              ) : (
                <div className="bg-surface-container rounded-xl border border-surface-bright divide-y divide-surface-bright/50">
                  {fixtures.map((match: Match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <EmptyState title="No past results" description="No match results found for this season." />
              ) : (
                <div className="bg-surface-container rounded-xl border border-surface-bright divide-y divide-surface-bright/50">
                  {results.map((match: Match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: SQUAD */}
          {activeTab === 'squad' && (
            <div className="space-y-6">
              {squad.length === 0 ? (
                <EmptyState
                  title={
                    team.squadSupported === false
                      ? 'Squad roster is not available for this team or season.'
                      : 'Squad data is currently unavailable.'
                  }
                  description={
                    team.squadSupported === false
                      ? 'Player squad rosters are only provided for club teams and major tournaments.'
                      : 'No active players found for the selected team.'
                  }
                />
              ) : (
                <>
                  {goalkeepers.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Goalkeepers</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {goalkeepers.map((player: Player) => (
                          <PlayerCard key={player.id} player={player} teamName={team.name} />
                        ))}
                      </div>
                    </div>
                  )}

                  {defenders.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Defenders</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {defenders.map((player: Player) => (
                          <PlayerCard key={player.id} player={player} teamName={team.name} />
                        ))}
                      </div>
                    </div>
                  )}

                  {midfielders.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Midfielders</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {midfielders.map((player: Player) => (
                          <PlayerCard key={player.id} player={player} teamName={team.name} />
                        ))}
                      </div>
                    </div>
                  )}

                  {attackers.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary">Attackers</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {attackers.map((player: Player) => (
                          <PlayerCard key={player.id} player={player} teamName={team.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tab Content: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {!stats ? (
                <EmptyState
                  title={
                    team.statsSupported === false
                      ? 'Team statistics are not available for this team or season.'
                      : 'Season statistics are currently unavailable.'
                  }
                  description="Detailed performance statistics will appear after matches are played."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Overall Form & Record */}
                  <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-4">
                    <h3 className="font-bold text-body-md text-on-surface">Matches & Record</h3>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
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
