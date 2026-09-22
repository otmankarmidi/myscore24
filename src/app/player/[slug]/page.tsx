'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import TeamLogo from '@/components/common/TeamLogo'
import ErrorState from '@/components/common/ErrorState'
import PlayerImage from '@/components/common/PlayerImage'
import { sportsService } from '@/services/sports/sportsService'
import { Player } from '@/types/player'

export default function PlayerDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [player, setPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadPlayerData() {
      if (!slug) return
      setIsLoading(true)
      setError(false)

      try {
        const playerData = await sportsService.getPlayerBySlug(slug)
        if (!playerData) {
          setError(true)
          return
        }

        setPlayer(playerData)
      } catch (err) {
        console.error('Failed to load player details:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlayerData()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sports_soccer</span>
            <p className="text-body-sm text-on-surface-variant font-medium">Loading player profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <Header />
        <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-8">
          <ErrorState title="Player not found" description="The requested player profile could not be found." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          {/* Player Hero Card */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
            {/* Player Photo */}
            <PlayerImage
              playerId={player.id}
              photo={player.photo}
              image={player.image || player.imagePath}
              name={player.name}
              teamName={player.teamName || player.team?.name}
              squadNumber={player.squadNumber || player.number}
              slug={player.slug}
              size="xl"
              priority
              className="w-28 h-28 md:w-36 md:h-36 border-4 border-primary/20 shrink-0 shadow-lg"
            />

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-bold text-xs">
                  #{player.number}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium text-xs uppercase">
                  {player.position}
                </span>
                {player.countryFlag && <span className="text-base">{player.countryFlag}</span>}
                <span className="text-xs text-on-surface-variant font-medium">{player.nationality}</span>
              </div>

              <h1 className="text-headline-xl text-on-surface font-extrabold">{player.name}</h1>

              <Link
                href={`/team/${player.teamSlug || player.team?.slug || 'team'}`}
                className="inline-flex items-center gap-2 text-body-sm font-semibold text-primary hover:underline"
              >
                <TeamLogo
                  name={player.teamName || player.team?.name || 'Team'}
                  abbreviation={(player.teamName || player.team?.name || 'Team').slice(0, 3)}
                  logo={player.teamLogo || player.team?.logo}
                  size="xs"
                />
                <span>{player.teamName || player.team?.name || 'Team'}</span>
              </Link>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-on-surface-variant pt-2 border-t border-surface-bright/50">
                <span>Age: <strong className="text-on-surface">{player.age}</strong></span>
                {player.height && <span>Height: <strong className="text-on-surface">{player.height} cm</strong></span>}
                {player.preferredFoot && <span>Foot: <strong className="text-on-surface uppercase">{player.preferredFoot}</strong></span>}
                {player.marketValue && <span>Market Value: <strong className="text-primary font-mono">{player.marketValue}</strong></span>}
              </div>
            </div>
          </div>

          {/* Season Performance Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Appearances</span>
              <div className="text-headline-xl font-extrabold text-on-surface tabular-nums">
                {player.stats?.appearances ?? player.stats?.matches ?? 0}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Goals</span>
              <div className="text-headline-xl font-extrabold text-primary tabular-nums">
                {player.stats?.goals ?? 0}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Assists</span>
              <div className="text-headline-xl font-extrabold text-secondary tabular-nums">
                {player.stats?.assists ?? 0}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Rating</span>
              <div className="text-headline-xl font-extrabold text-emerald-400 tabular-nums">
                {player.stats?.rating ? player.stats.rating.toFixed(1) : '-'}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-surface-container rounded-lg border border-surface-bright p-4 space-y-3">
            <h3 className="font-bold text-body-md text-on-surface uppercase tracking-wider">Detailed Season Breakdown</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
              <div className="p-3 bg-surface-container-high/50 rounded-lg">
                <span className="text-xs text-on-surface-variant">Minutes Played</span>
                <p className="font-bold font-mono text-base text-on-surface">
                  {(player.stats?.minutesPlayed ?? player.stats?.minutes ?? 0).toLocaleString()}&apos;
                </p>
              </div>
              <div className="p-3 bg-surface-container-high/50 rounded-lg">
                <span className="text-xs text-on-surface-variant">Yellow Cards</span>
                <p className="font-bold font-mono text-base text-amber-400">{player.stats?.yellowCards ?? 0}</p>
              </div>
              <div className="p-3 bg-surface-container-high/50 rounded-lg">
                <span className="text-xs text-on-surface-variant">Red Cards</span>
                <p className="font-bold font-mono text-base text-rose-500">{player.stats?.redCards ?? 0}</p>
              </div>
              <div className="p-3 bg-surface-container-high/50 rounded-lg">
                <span className="text-xs text-on-surface-variant">Shots On Target</span>
                <p className="font-bold font-mono text-base text-on-surface">
                  {player.stats?.shotsOnTarget ?? '-'} / {player.stats?.shotsTotal ?? '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Matches Section */}
          {player.recentMatches && player.recentMatches.length > 0 && (
            <div className="bg-surface-container rounded-lg border border-surface-bright p-4 space-y-3">
              <h3 className="font-bold text-body-md text-on-surface uppercase tracking-wider">Recent Matches</h3>
              <div className="divide-y divide-surface-bright">
                {player.recentMatches.map((m) => (
                  <Link
                    key={m.matchId}
                    href={`/match/${m.matchSlug || m.matchId}`}
                    className="py-2.5 flex items-center justify-between text-body-sm hover:bg-surface-container-high px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-on-surface-variant font-mono">{m.date}</span>
                      <span className="text-xs font-semibold text-on-surface">
                        {m.isHome ? 'vs' : '@'} {m.opponentName}
                      </span>
                      {m.score && <span className="text-xs font-bold text-primary">{m.score}</span>}
                    </div>

                    <div className="flex items-center gap-1">
                      {m.rating !== undefined ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          m.rating >= 8.0 ? 'bg-emerald-500 text-slate-950' :
                          m.rating >= 7.0 ? 'bg-lime-500 text-slate-950' :
                          m.rating >= 6.0 ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'
                        }`}>
                          {m.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant font-mono">-</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
