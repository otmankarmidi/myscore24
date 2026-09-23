'use client'

import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import TeamLogo from '@/components/common/TeamLogo'
import PlayerImage from '@/components/common/PlayerImage'
import { Player } from '@/types/player'

interface PlayerClientProps {
  player: Player
}

export default function PlayerClient({ player }: PlayerClientProps) {
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
                {player.countryFlag && (
                  player.countryFlag.startsWith('http') || player.countryFlag.endsWith('.svg') || player.countryFlag.endsWith('.png') ? (
                    <img src={player.countryFlag} alt="" className="w-4 h-4 object-contain inline-block shrink-0" loading="lazy" />
                  ) : (
                    <span className="text-base">{player.countryFlag}</span>
                  )
                )}
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
                <span>
                  Age: <strong className="text-on-surface">{player.age}</strong>
                </span>
                {player.height && (
                  <span>
                    Height: <strong className="text-on-surface">{player.height} cm</strong>
                  </span>
                )}
                {player.preferredFoot && (
                  <span>
                    Foot: <strong className="text-on-surface uppercase">{player.preferredFoot}</strong>
                  </span>
                )}
                {player.marketValue && (
                  <span>
                    Market Value: <strong className="text-primary font-mono">{player.marketValue}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Season Performance Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Appearances</span>
              <div className="text-headline-xl font-extrabold text-on-surface tabular-nums">
                {player.stats?.appearances || 0}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Goals</span>
              <div className="text-headline-xl font-extrabold text-emerald-400 tabular-nums">
                {player.stats?.goals || 0}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Assists</span>
              <div className="text-headline-xl font-extrabold text-primary tabular-nums">
                {player.stats?.assists || 0}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rating</span>
              <div className="text-headline-xl font-extrabold text-amber-400 font-mono">
                {player.stats?.rating ? player.stats.rating.toFixed(1) : '-'}
              </div>
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-4">
              <h2 className="text-body-md font-bold text-on-surface">Discipline & Minutes</h2>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                  <span className="block text-[11px] text-on-surface-variant font-sans">MINUTES</span>
                  <span className="text-headline-sm font-extrabold text-on-surface">
                    {player.stats?.minutesPlayed ? player.stats.minutesPlayed.toLocaleString() : 0}
                  </span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                  <span className="block text-[11px] text-on-surface-variant font-sans">YELLOWS</span>
                  <span className="text-headline-sm font-extrabold text-amber-400">
                    {player.stats?.yellowCards || 0}
                  </span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                  <span className="block text-[11px] text-on-surface-variant font-sans">REDS</span>
                  <span className="text-headline-sm font-extrabold text-rose-500">
                    {player.stats?.redCards || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-4">
              <h2 className="text-body-md font-bold text-on-surface">Player Info</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-surface-bright">
                  <span className="text-on-surface-variant">Full Name</span>
                  <span className="font-semibold text-on-surface">{player.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-bright">
                  <span className="text-on-surface-variant">Nationality</span>
                  <span className="font-semibold text-on-surface">{player.nationality || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-bright">
                  <span className="text-on-surface-variant">Primary Position</span>
                  <span className="font-semibold text-on-surface">{player.position}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
