'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import MatchStatusBadge from '@/components/common/MatchStatusBadge'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import FavoriteButton from '@/components/common/FavoriteButton'
import { MatchNotificationButton } from '@/components/common/MatchNotificationButton'
import MatchTimeline from '@/components/match/MatchTimeline'
import MatchStatistics from '@/components/match/MatchStatistics'
import LineupPitch from '@/components/match/LineupPitch'
import MatchH2H from '@/components/match/MatchH2H'
import MatchCommentary from '@/components/match/MatchCommentary'
import StandingsTable from '@/components/standings/StandingsTable'
import { sportsService } from '@/services/sports/sportsService'
import { useFavorites } from '@/hooks/useFavorites'
import { useTimezone } from '@/context/TimezoneContext'
import { useLanguage } from '@/context/LanguageContext'
import PlayerImage from '@/components/common/PlayerImage'
import { Match } from '@/types/match'
import { LeagueStanding } from '@/types/standing'
import { trackMatchOpen } from '@/lib/analytics'
import { formatDate } from '@/lib/utils'

type MatchTab = 'summary' | 'lineups' | 'h2h' | 'commentary' | 'standings'

interface MatchDetailClientProps {
  slug: string
  initialMatch?: Match | null
}

export default function MatchDetailClient({ slug, initialMatch }: MatchDetailClientProps) {
  const { activeTimezone } = useTimezone()
  const { t, locale } = useLanguage()

  const [match, setMatch] = useState<Match | null>(initialMatch || null)
  const [h2hHistory, setH2hHistory] = useState<Match[]>([])
  const [standings, setStandings] = useState<LeagueStanding[]>([])
  const [isLoading, setIsLoading] = useState(!initialMatch)
  const [errorInfo, setErrorInfo] = useState<{ message: string; code?: string } | null>(null)
  const [activeTab, setActiveTab] = useState<MatchTab>('summary')
  const [isGoalCelebrating, setIsGoalCelebrating] = useState(false)

  const { isMatchFavorite, toggleFavoriteMatch } = useFavorites()

  const fetchMatchDetails = useCallback(
    async (isInitial = false) => {
      if (!slug) return
      if (isInitial && !initialMatch) setIsLoading(true)
      setErrorInfo(null)

      try {
        const res = await sportsService.getMatchBySlug(slug)
        if (!res.match) {
          if (isInitial && !initialMatch) {
            setErrorInfo({
              message: res.error || t('match.errorDesc', 'This match data could not be loaded.'),
              code: res.errorCode || 'MATCH_NOT_FOUND',
            })
          }
          return
        }

        setMatch(res.match)
        trackMatchOpen({
          matchId: res.match.id,
          homeTeam: res.match.homeTeam?.name || 'Home',
          awayTeam: res.match.awayTeam?.name || 'Away',
          competition: res.match.league?.name,
          status: res.match.status,
        })
        if (res.h2h && res.h2h.length > 0) {
          setH2hHistory(res.h2h)
        }

        if (res.match.league?.id) {
          try {
            const stand = await sportsService.getStandingsByLeague(res.match.league.id)
            setStandings(stand)
          } catch {}
        }
      } catch (err: any) {
        console.error('Failed to load match detail:', err)
        if (isInitial && !initialMatch) {
          setErrorInfo({
            message: err?.message || t('match.errorDesc', 'This match data could not be loaded.'),
            code: 'PROVIDER_ERROR',
          })
        }
      } finally {
        if (isInitial) setIsLoading(false)
      }
    },
    [slug, t, initialMatch]
  )

  useEffect(() => {
    fetchMatchDetails(!initialMatch)
  }, [fetchMatchDetails, initialMatch])

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

  // Listen to goal celebration event
  useEffect(() => {
    const handleGoalEvent = (e: Event) => {
      const ce = e as CustomEvent<{ matchId: string }>
      if (
        ce.detail &&
        match &&
        (String(ce.detail.matchId) === String(match.id) || String(ce.detail.matchId) === String(slug))
      ) {
        setIsGoalCelebrating(true)
        fetchMatchDetails(false)
        setTimeout(() => setIsGoalCelebrating(false), 8000)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('myscore24_goal_scored', handleGoalEvent)
      return () => window.removeEventListener('myscore24_goal_scored', handleGoalEvent)
    }
  }, [match, slug, fetchMatchDetails])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin" aria-hidden="true">
              sports_soccer
            </span>
            <p className="text-body-sm text-on-surface-variant font-medium">
              {t('common.matchCenter', 'Loading match center...')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (errorInfo || !match) {
    const errorCode = errorInfo?.code || 'MATCH_NOT_FOUND'
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-8 bg-surface-container rounded-xl border border-surface-bright max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-error" style={{ fontSize: 32 }} aria-hidden="true">
                signal_disconnected
              </span>
            </div>
            <h2 className="font-geist font-bold text-headline-md text-on-surface mb-2">
              {t('match.unavailable', 'Match unavailable')}
            </h2>
            <p className="font-inter text-body-sm text-on-surface-variant mb-4">
              {errorInfo?.message || t('match.errorDesc', 'This match data could not be loaded.')}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest border border-surface-bright text-[11px] font-mono text-on-surface-variant mb-6">
              <span>Code:</span>
              <span className="font-bold text-error">{errorCode}</span>
            </div>
            <div className="flex items-center gap-3 w-full justify-center">
              <button
                onClick={() => fetchMatchDetails(true)}
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-geist text-[13px] font-bold tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
                {t('common.retry', 'Retry')}
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-lg bg-surface-container-high border border-surface-bright text-on-surface font-geist text-[13px] font-medium hover:bg-surface-bright transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
                {t('common.backToMatches', 'Back to Matches')}
              </Link>
            </div>
          </div>
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
          <div
            className={`relative bg-surface-container rounded-xl border overflow-hidden p-4 md:p-6 space-y-4 transition-all duration-500 ${
              isGoalCelebrating
                ? 'border-primary shadow-[0_0_40px_rgba(204,255,128,0.45)] animate-goal-glow'
                : 'border-surface-bright'
            }`}
          >
            {/* Primary Semantic H1 for SEO & Accessibility */}
            <h1 className="sr-only">
              {match.homeTeam.name} vs {match.awayTeam.name} - {match.league.name}
            </h1>

            {/* Top Bar: League Info & Favorite */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-bright/60">
              <Link
                href={`/competition/${match.league.id || match.league.slug}`}
                prefetch={false}
                className="flex items-center gap-2 text-body-sm font-semibold text-on-surface hover:text-primary transition-colors"
              >
                <CompetitionLogo
                  logo={match.league.logo}
                  name={match.league.name}
                  countryFlag={match.league.countryFlag}
                  providerId={match.league.id}
                  slug={match.league.slug}
                  size={20}
                />
                <span>{match.league.country ? t(`countries.${match.league.country}`, match.league.country) : ''}</span>
                <span className="text-on-surface-variant">•</span>
                <span>{match.league.name}</span>
                {match.league.currentRound && (
                  <span className="text-xs font-normal text-on-surface-variant">({match.league.currentRound})</span>
                )}
              </Link>

              <div className="flex items-center gap-2">
                <MatchNotificationButton
                  matchId={match.id}
                  matchLabel={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                  size="md"
                />
                <FavoriteButton
                  isFavorited={isFavorited}
                  onToggle={() => toggleFavoriteMatch(match.id)}
                  size="md"
                />
              </div>
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
                {isGoalCelebrating && (
                  <div className="flex items-center justify-center animate-bounce">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary text-black shadow-lg">
                      ⚽ GOAL! ⚽
                    </span>
                  </div>
                )}
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

                <div className="text-xs text-on-surface-variant font-medium">
                  {formatDate(match.kickoff, 'dd MMM yyyy', activeTimezone, locale)}
                </div>
              </div>

              {/* Away Team */}
              <Link href={`/team/${match.awayTeam.id || match.awayTeam.slug}`} className="flex flex-col items-center text-center gap-2 group">
                <TeamLogo name={match.awayTeam.name} abbreviation={match.awayTeam.abbreviation} logo={match.awayTeam.logo} size="lg" />
                <span className="font-bold text-headline-md text-on-surface group-hover:text-primary transition-colors">
                  {match.awayTeam.name}
                </span>
              </Link>
            </div>

            {/* Match Metadata Pill */}
            {(match.venue || match.referee) && (
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-surface-bright/60 text-xs text-on-surface-variant">
                {match.venue && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">stadium</span>
                    {match.venue}
                  </span>
                )}
                {match.referee && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">sports</span>
                    {match.referee}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Player of the Match Spotlight */}
          {match.highestRatedPlayer && (
            <div className="bg-gradient-to-r from-surface-container to-surface-container-high rounded-xl border border-surface-bright p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/40 bg-surface-container-lowest">
                  <PlayerImage name={match.highestRatedPlayer.name} photo={match.highestRatedPlayer.photo} size="md" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                    {t('match.topPerformer', 'Top Performer')}
                  </span>
                  <Link href={`/player/${match.highestRatedPlayer.id}`} className="font-bold text-body-md text-on-surface hover:text-primary transition-colors">
                    {match.highestRatedPlayer.name}
                  </Link>
                  <span className="text-xs text-on-surface-variant block">{match.highestRatedPlayer.teamName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-bold text-on-surface block tabular-nums">
                    {match.highestRatedPlayer.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant uppercase">{t('match.rating', 'Rating')}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
                  ★
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-surface-bright overflow-x-auto">
            {(['summary', 'lineups', 'h2h', 'commentary', 'standings'] as MatchTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {t(`match.tabs.${tab}`, tab)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <MatchTimeline
                  events={match.events || []}
                  homeTeamName={match.homeTeam.name}
                  awayTeamName={match.awayTeam.name}
                />
                {match.statistics && (
                  <MatchStatistics
                    stats={match.statistics}
                    homeTeamName={match.homeTeam.name}
                    awayTeamName={match.awayTeam.name}
                  />
                )}
              </div>
            )}

            {activeTab === 'lineups' && match.lineups && (
              <LineupPitch
                lineups={match.lineups}
                homeTeamName={match.homeTeam.name}
                awayTeamName={match.awayTeam.name}
                homeTeamLogo={match.homeTeam.logo}
                awayTeamLogo={match.awayTeam.logo}
              />
            )}

            {activeTab === 'h2h' && (
              <MatchH2H
                history={h2hHistory}
                homeTeamName={match.homeTeam.name}
                awayTeamName={match.awayTeam.name}
                homeTeamLogo={match.homeTeam.logo}
                awayTeamLogo={match.awayTeam.logo}
              />
            )}

            {activeTab === 'commentary' && (
              <MatchCommentary commentary={(match.commentary as any) || []} />
            )}

            {activeTab === 'standings' && (
              <div className="bg-surface-container rounded-xl border border-surface-bright p-4">
                <StandingsTable standings={standings} />
              </div>
            )}
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
