'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import TeamLogo from '@/components/common/TeamLogo'
import PlayerImage from '@/components/common/PlayerImage'
import { Player } from '@/types/player'
import { trackPlayerOpen } from '@/lib/analytics'

interface PlayerClientProps {
  player: Player
}

export default function PlayerClient({ player }: PlayerClientProps) {
  const [selectedCompId, setSelectedCompId] = useState<string | number | 'all'>(
    player.defaultCompetitionId || (player.competitions?.[0]?.leagueId ?? 'all')
  )

  useEffect(() => {
    if (player) {
      trackPlayerOpen({
        playerId: player.id,
        playerName: player.name,
        teamName: player.teamName || player.team?.name,
        position: player.position,
      })
    }
  }, [player])

  // Resolve currently active statistics based on competition selection
  const competitions = player.competitions || []
  const activeComp = competitions.find(
    (c) => String(c.leagueId) === String(selectedCompId)
  )

  // Determine season label (e.g. "2026/27" for European leagues, "2026" for calendar-year leagues)
  const isCalendar = activeComp ? activeComp.isCalendarYear : (player.competitions?.[0]?.isCalendarYear ?? false)
  const seasonLabel = isCalendar ? '2026' : '2026/27'

  // Format stats: If null -> display "-", if 0 -> display "0"
  const formatStat = (val?: number | null): string => {
    if (val === null || val === undefined) return '-'
    return String(val)
  }

  const activeStats = activeComp
    ? {
        appearances: activeComp.appearances,
        goals: activeComp.goals,
        assists: activeComp.assists,
        rating: activeComp.rating,
        minutes: activeComp.minutes,
        yellowCards: activeComp.yellowCards,
        redCards: activeComp.redCards,
      }
    : {
        appearances: player.stats?.appearances,
        goals: player.stats?.goals,
        assists: player.stats?.assists,
        rating: player.stats?.rating,
        minutes: player.stats?.minutesPlayed,
        yellowCards: player.stats?.yellowCards,
        redCards: player.stats?.redCards,
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
              photo={player.photo || undefined}
              image={player.image || player.imagePath || undefined}
              name={player.name}
              teamName={player.teamName || player.team?.name || undefined}
              squadNumber={player.squadNumber || player.number || undefined}
              slug={player.slug}
              size="xl"
              priority
              className="w-28 h-28 md:w-36 md:h-36 border-4 border-primary/20 shrink-0 shadow-lg"
            />

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {(player.number || player.squadNumber) && (
                  <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-bold text-xs">
                    #{player.number || player.squadNumber}
                  </span>
                )}
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

              {/* Current Club Header (Authoritative) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Link
                  href={`/team/${player.teamSlug || player.team?.slug || 'team'}`}
                  className="inline-flex items-center gap-2 text-body-sm font-semibold text-primary hover:underline bg-surface-container-high px-3 py-1.5 rounded-lg border border-surface-bright"
                >
                  <TeamLogo
                    name={player.teamName || player.team?.name || 'Current Club'}
                    abbreviation={(player.teamName || player.team?.name || 'Club').slice(0, 3)}
                    logo={player.teamLogo || player.team?.logo}
                    size="xs"
                  />
                  <span>{player.teamName || player.team?.name || 'Current Club'}</span>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-on-surface-variant pt-2 border-t border-surface-bright/50">
                {player.age > 0 && (
                  <span>
                    Age: <strong className="text-on-surface">{player.age}</strong>
                  </span>
                )}
                {player.height && (
                  <span>
                    Height: <strong className="text-on-surface">{player.height}</strong>
                  </span>
                )}
                {player.weight && (
                  <span>
                    Weight: <strong className="text-on-surface">{player.weight}</strong>
                  </span>
                )}
                {player.preferredFoot && (
                  <span>
                    Foot: <strong className="text-on-surface uppercase">{player.preferredFoot}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Season Selector Bar */}
          <div className="bg-surface-container rounded-xl border border-surface-bright p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">
                sports_soccer
              </span>
              <span className="font-bold text-sm text-on-surface">
                Season {seasonLabel} Statistics
              </span>
            </div>

            {/* Competition Selector (0 server calls on change) */}
            {competitions.length > 1 && (
              <div className="flex items-center gap-2">
                <label htmlFor="comp-select" className="text-xs text-on-surface-variant font-medium">
                  Competition:
                </label>
                <select
                  id="comp-select"
                  value={String(selectedCompId)}
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  className="bg-surface-container-high text-on-surface border border-surface-bright text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary font-medium cursor-pointer"
                >
                  {competitions.map((c, idx) => (
                    <option key={idx} value={String(c.leagueId)}>
                      {c.teamName} — {c.leagueName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Season Performance Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Appearances</span>
              <div className="text-headline-xl font-extrabold text-on-surface tabular-nums">
                {formatStat(activeStats.appearances)}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Goals</span>
              <div className="text-headline-xl font-extrabold text-emerald-400 tabular-nums">
                {formatStat(activeStats.goals)}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Assists</span>
              <div className="text-headline-xl font-extrabold text-primary tabular-nums">
                {formatStat(activeStats.assists)}
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-surface-bright text-center space-y-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Rating</span>
              <div className="text-headline-xl font-extrabold text-amber-400 font-mono">
                {activeStats.rating !== null && activeStats.rating !== undefined ? Number(activeStats.rating).toFixed(2) : '-'}
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
                    {activeStats.minutes !== null && activeStats.minutes !== undefined ? activeStats.minutes.toLocaleString() : '-'}
                  </span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                  <span className="block text-[11px] text-on-surface-variant font-sans">YELLOWS</span>
                  <span className="text-headline-sm font-extrabold text-amber-400">
                    {formatStat(activeStats.yellowCards)}
                  </span>
                </div>
                <div className="bg-surface-container-high p-3 rounded-lg border border-surface-bright">
                  <span className="block text-[11px] text-on-surface-variant font-sans">REDS</span>
                  <span className="text-headline-sm font-extrabold text-rose-500">
                    {formatStat(activeStats.redCards)}
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

          {/* Competitions Breakdown (Current Season 2026) */}
          {competitions.length > 0 && (
            <div className="bg-surface-container p-5 rounded-xl border border-surface-bright space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-body-md font-bold text-on-surface">Season {seasonLabel} Competition Breakdown</h2>
                <span className="text-xs text-on-surface-variant font-medium">Official Season Stats</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-surface-bright text-on-surface-variant font-semibold">
                      <th className="py-2 px-3">Tournament</th>
                      <th className="py-2 px-3">Team</th>
                      <th className="py-2 px-3 text-center">Apps</th>
                      <th className="py-2 px-3 text-center">Mins</th>
                      <th className="py-2 px-3 text-center">Goals</th>
                      <th className="py-2 px-3 text-center">Assists</th>
                      <th className="py-2 px-3 text-center">Cards</th>
                      <th className="py-2 px-3 text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-bright/50">
                    {competitions.map((comp, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedCompId(comp.leagueId || 'all')}
                        className={`hover:bg-surface-container-high/60 cursor-pointer transition-colors ${
                          String(selectedCompId) === String(comp.leagueId) ? 'bg-surface-container-high/80' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-medium text-on-surface">
                          <div className="flex items-center gap-2">
                            {comp.leagueLogo && (
                              <img src={comp.leagueLogo} alt="" className="w-4 h-4 object-contain inline-block shrink-0" loading="lazy" />
                            )}
                            <span className="font-semibold">{comp.leagueName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-on-surface-variant">
                          <div className="flex items-center gap-1.5">
                            {comp.teamLogo && (
                              <img src={comp.teamLogo} alt="" className="w-4 h-4 object-contain inline-block shrink-0" loading="lazy" />
                            )}
                            <span>{comp.teamName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-on-surface">
                          {formatStat(comp.appearances)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-on-surface-variant">
                          {comp.minutes !== null && comp.minutes !== undefined ? comp.minutes.toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                          {formatStat(comp.goals)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-primary">
                          {formatStat(comp.assists)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-amber-400 font-bold">{formatStat(comp.yellowCards)}</span>
                          {(comp.redCards ?? 0) > 0 && <span className="text-rose-500 font-bold ml-1.5">/ {comp.redCards}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                          {comp.rating !== null && comp.rating !== undefined ? Number(comp.rating).toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
