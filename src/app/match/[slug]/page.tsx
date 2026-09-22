'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import MatchStatusBadge from '@/components/common/MatchStatusBadge'
import TeamLogo from '@/components/common/TeamLogo'
import FavoriteButton from '@/components/common/FavoriteButton'
import MatchTimeline from '@/components/match/MatchTimeline'
import MatchStatistics from '@/components/match/MatchStatistics'
import LineupPitch from '@/components/match/LineupPitch'
import MatchH2H from '@/components/match/MatchH2H'
import MatchCommentary from '@/components/match/MatchCommentary'
import StandingsTable from '@/components/standings/StandingsTable'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'
import { sportsService } from '@/services/sports/sportsService'
import { useFavorites } from '@/hooks/useFavorites'
import { useTimezone } from '@/context/TimezoneContext'
import { useLanguage } from '@/context/LanguageContext'
import PlayerImage from '@/components/common/PlayerImage'
import { Match } from '@/types/match'
import { LeagueStanding } from '@/types/standing'
import { formatDate } from '@/lib/utils'

type MatchTab = 'summary' | 'lineups' | 'h2h' | 'commentary' | 'standings'

export default function MatchDetailPage() {
  const { activeTimezone } = useTimezone()
  const { t, locale } = useLanguage()
  const params = useParams()
  const slug = params?.slug as string

  const [match, setMatch] = useState<Match | null>(null)
  const [h2hHistory, setH2hHistory] = useState<Match[]>([])
  const [standings, setStandings] = useState<LeagueStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<MatchTab>('summary')

  const { isMatchFavorite, toggleFavoriteMatch } = useFavorites()

  const fetchMatchDetails = useCallback(async (isInitial = false) => {
    if (!slug) return
    if (isInitial) setIsLoading(true)
    setError(false)

    try {
      const res = await sportsService.getMatchBySlug(slug)
      if (!res.match) {
        if (isInitial) setError(true)
        return
      }

      setMatch(res.match)
      if (res.h2h && res.h2h.length > 0) {
        setH2hHistory(res.h2h)
      }

      if (isInitial) {
        const stand = await sportsService.getStandingsByLeague(res.match.league.id)
        setStandings(stand)
      }
    } catch (err) {
      console.error('Failed to load match detail:', err)
      if (isInitial) setError(true)
    } finally {
      if (isInitial) setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchMatchDetails(true)
  }, [fetchMatchDetails])

  // Real-time live polling auto-refresh every 30 seconds for live matches
  useEffect(() => {
    if (!match || (match.status !== 'live' && match.status !== 'half_time' && match.status !== 'extra_time')) {
      return
    }

    const interval = setInterval(() => {
      fetchMatchDetails(false)
    }, 30000)

    return () => clearInterval(interval)
  }, [match, fetchMatchDetails])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sports_soccer</span>
            <p className="text-body-sm text-on-surface-variant font-medium">{t('common.matchCenter', 'Loading match center...')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8">
          <ErrorState title={t('common.noSearchResults', 'Match not found')} description={t('common.errorLiveDesc', 'The requested match details could not be loaded.')} />
        </div>
      </div>
    )
  }

  const isFavorited = isMatchFavorite(match.id)

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          {/* Match Hero Header */}
          <div className="relative bg-surface-container rounded-xl border border-surface-bright overflow-hidden p-4 md:p-6 space-y-4">
            {/* Top Bar: League Info & Favorite */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-bright/60">
              <Link
                href={`/league/${match.league.slug}`}
                className="flex items-center gap-2 text-body-sm font-semibold text-on-surface hover:text-primary transition-colors"
              >
                {match.league.countryFlag && <span>{match.league.countryFlag}</span>}
                <span>{match.league.country ? t(`countries.${match.league.country}`, match.league.country) : ''}</span>
                <span className="text-on-surface-variant">•</span>
                <span>{match.league.name}</span>
                {match.league.currentRound && (
                  <span className="text-xs font-normal text-on-surface-variant">({match.league.currentRound})</span>
                )}
              </Link>

              <FavoriteButton
                isFavorited={isFavorited}
                onToggle={() => toggleFavoriteMatch(match.id)}
                size="md"
              />
            </div>

            {/* Scoreboard Hero */}
            <div className="grid grid-cols-3 items-center py-4">
              {/* Home Team */}
              <Link href={`/team/${match.homeTeam.id || match.homeTeam.slug}`} className="flex flex-col items-center text-center gap-2 group">
                <TeamLogo name={match.homeTeam.name} abbreviation={match.homeTeam.abbreviation} logo={match.homeTeam.logo} size="lg" />
                <span className="font-bold text-headline-md text-on-surface group-hover:text-primary transition-colors">
                  {match.homeTeam.name}
                </span>
              </Link>

              {/* Score / Time Status */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <MatchStatusBadge status={match.status} minute={match.minute} size="md" />

                <div className="font-geist font-extrabold text-headline-xl md:text-headline-xl text-on-surface tracking-wider tabular-nums">
                  {match.score.home !== null && match.score.away !== null ? (
                    <div className="flex items-center gap-3">
                      <span className={match.score.home > match.score.away ? 'text-primary' : ''}>{match.score.home}</span>
                      <span className="text-on-surface-variant font-light">:</span>
                      <span className={match.score.away > match.score.home ? 'text-secondary' : ''}>{match.score.away}</span>
                    </div>
                  ) : (
                    <span className="text-primary text-headline-lg">{formatDate(match.kickoff, 'HH:mm', activeTimezone, locale)}</span>
                  )}
                </div>

                {match.score.halftime && (
                  <span className="text-[11px] font-mono text-on-surface-variant">
                    {t('match.status.half_time', 'HT')}: {match.score.halftime.home} - {match.score.halftime.away}
                  </span>
                )}
              </div>

              {/* Away Team */}
              <Link href={`/team/${match.awayTeam.id || match.awayTeam.slug}`} className="flex flex-col items-center text-center gap-2 group">
                <TeamLogo name={match.awayTeam.name} abbreviation={match.awayTeam.abbreviation} logo={match.awayTeam.logo} size="lg" />
                <span className="font-bold text-headline-md text-on-surface group-hover:text-primary transition-colors">
                  {match.awayTeam.name}
                </span>
              </Link>
            </div>

            {/* Match Meta: Date, Venue, Referee (Hidden cleanly if missing) */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-on-surface-variant pt-3 border-t border-surface-bright/60">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>{formatDate(match.kickoff, 'EEEE, d MMMM yyyy HH:mm', activeTimezone, locale)}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">stadium</span>
                  <span>{match.venue}</span>
                </div>
              )}
              {match.referee && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  <span>{t('common.referee', 'Ref')}: {match.referee}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-surface-bright overflow-x-auto">
            {(['summary', 'lineups', 'h2h', 'commentary', 'standings'] as MatchTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[90px] py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all text-center ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {t(`match.tabs.${tab}`, tab)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {match.highestRatedPlayer && (
                <div className="bg-surface-container rounded-xl p-4 border border-surface-bright flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <PlayerImage
                      playerId={match.highestRatedPlayer.id}
                      photo={match.highestRatedPlayer.photo}
                      name={match.highestRatedPlayer.name}
                      size="lg"
                      className="border border-surface-bright"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                        HIGHEST RATED PLAYER
                      </span>
                      <h4 className="font-bold text-body-lg text-on-surface leading-tight">
                        {match.highestRatedPlayer.name}
                      </h4>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {match.highestRatedPlayer.teamName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg font-bold text-base shadow-sm">
                      <span>{match.highestRatedPlayer.rating.toFixed(1)}</span>
                      {match.highestRatedPlayer.isLive && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse ml-0.5" title="Live rating" />
                      )}
                    </div>
                    {match.highestRatedPlayer.isLive ? (
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> LIVE RATING
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-on-surface-variant uppercase tracking-wider">
                        FINAL RATING
                      </span>
                    )}
                  </div>
                </div>
              )}

              <MatchTimeline events={match.events || []} homeTeamName={match.homeTeam.name} awayTeamName={match.awayTeam.name} />
              {match.statistics ? (
                <MatchStatistics stats={match.statistics} homeTeamName={match.homeTeam.name} awayTeamName={match.awayTeam.name} />
              ) : (
                <EmptyState title="Statistics unavailable" description="Detailed match statistics have not been published for this fixture yet." />
              )}
            </div>
          )}

          {activeTab === 'lineups' && (
            <div>
              {match.lineups || match.lineup ? (
                <LineupPitch
                  lineups={(match.lineups || match.lineup)!}
                  homeTeamName={match.homeTeam.name}
                  awayTeamName={match.awayTeam.name}
                  homeTeamLogo={match.homeTeam.logo}
                  awayTeamLogo={match.awayTeam.logo}
                />
              ) : (
                <EmptyState title="Lineups not available yet" description="Official starting XI lineups are typically announced 1 hour before kickoff." />
              )}
            </div>
          )}

          {activeTab === 'h2h' && (
            <MatchH2H
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
              homeTeamLogo={match.homeTeam.logo}
              awayTeamLogo={match.awayTeam.logo}
              history={h2hHistory}
            />
          )}

          {activeTab === 'commentary' && (
            <MatchCommentary commentary={match.commentary || []} />
          )}

          {activeTab === 'standings' && (
            <StandingsTable standings={standings} currentTeamId={match.homeTeam.id} />
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
