'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TeamLogo from '@/components/common/TeamLogo'
import AdvertisementPlaceholder from '@/components/common/AdvertisementPlaceholder'
import { Match } from '@/types/match'

const QUICK_LINKS = [
  { name: 'Premier League', href: '/league/premier-league', icon: '/leagues/premier-league.png' },
  { name: 'LaLiga', href: '/league/la-liga', icon: '/leagues/laliga.png' },
  { name: 'Bundesliga', href: '/league/bundesliga', icon: '/leagues/bundesliga.png' },
  { name: 'Serie A', href: '/league/serie-a', icon: '/leagues/serie-a.png' },
  { name: 'Ligue 1', href: '/league/ligue-1', icon: '/leagues/ligue-1.png' },
  { name: 'Champions League', href: '/league/champions-league', icon: '/leagues/champions-league.png' },
  { name: 'Botola Pro', href: '/league/botola-pro', icon: '/leagues/botola-pro.png' },
  { name: 'Saudi Pro League', href: '/league/saudi-pro-league', icon: '/leagues/saudi-pro-league.svg' },
]

const TOP_LEAGUE_KEYWORDS = [
  'premier league',
  'laliga',
  'la liga',
  'bundesliga',
  'serie a',
  'ligue 1',
  'champions league',
  'botola',
  'saudi pro league',
]

function filterTopMatches(allMatches: Match[]): Match[] {
  if (!allMatches || !Array.isArray(allMatches) || allMatches.length === 0) return []

  const isTopLeague = (m: Match) => {
    const name = (m.league?.name || '').toLowerCase()
    return TOP_LEAGUE_KEYWORDS.some((k) => name.includes(k))
  }

  // Prioritize top leagues if available, otherwise use all available real matches
  let eligible = allMatches.filter(isTopLeague)
  if (eligible.length === 0) {
    eligible = [...allMatches]
  }

  // Priority order: 1. Live, 2. Today's important / Upcoming, 3. Finished
  const statusPriority = (status: string) => {
    if (status === 'live' || status === 'half_time' || status === 'extra_time' || status === 'penalties') return 1
    if (status === 'scheduled') return 2
    if (status === 'full_time') return 3
    return 4
  }

  eligible.sort((a, b) => {
    const pA = statusPriority(a.status)
    const pB = statusPriority(b.status)
    if (pA !== pB) return pA - pB
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  })

  return eligible.slice(0, 6)
}

function renderStatusBadge(match: Match) {
  if (match.status === 'live') {
    return (
      <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono text-[11px] font-bold animate-pulse flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
        {match.minute ? `${match.minute}'` : 'LIVE'}
      </span>
    )
  }
  if (match.status === 'half_time') {
    return (
      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold shrink-0">
        HT
      </span>
    )
  }
  if (match.status === 'full_time') {
    return (
      <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono text-[11px] font-semibold shrink-0">
        FT
      </span>
    )
  }
  if (match.status === 'extra_time') {
    return (
      <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono text-[11px] font-bold shrink-0">
        ET
      </span>
    )
  }
  if (match.status === 'penalties') {
    return (
      <span className="px-1.5 py-0.5 rounded bg-error/20 text-error font-mono text-[11px] font-bold shrink-0">
        PEN
      </span>
    )
  }

  // Scheduled / Upcoming: Display kickoff time
  const timeStr = match.kickoffTime || (match.kickoff ? new Date(match.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '19:00')
  return (
    <span className="font-mono text-body-sm text-on-surface-variant font-medium shrink-0">
      {timeStr}
    </span>
  )
}

export default function RightSidebar() {
  const [topMatches, setTopMatches] = useState<Match[]>([])

  useEffect(() => {
    async function fetchSidebar() {
      try {
        // Fetch matches from cached backend route (0ms hit via CacheEngine)
        const res = await fetch('/api/matches/today', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const rawMatches: Match[] = json.data || []
        const filtered = filterTopMatches(rawMatches)
        setTopMatches(filtered)
      } catch {
        setTopMatches([])
      }
    }

    fetchSidebar()
  }, [])

  return (
    <aside className="hidden lg:flex w-80 shrink-0 flex-col gap-4">
      {/* Top Matches Widget */}
      <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden shadow-sm">
        <div className="px-3.5 py-2.5 bg-surface-container-high border-b border-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">local_fire_department</span>
            <span>Top Matches</span>
          </div>
          <Link href="/live" className="text-[11px] text-primary hover:underline font-medium">
            View All
          </Link>
        </div>

        <div className="divide-y divide-surface-bright/40">
          {topMatches.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant font-medium">
              No top matches available
            </div>
          ) : (
            topMatches.map((match) => {
              const isScheduled = match.status === 'scheduled'
              return (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="p-3 flex items-center justify-between hover:bg-surface-container-high/60 transition-colors group"
                >
                  {/* Teams & Scores Column */}
                  <div className="flex-1 min-w-0 space-y-1.5 pr-2">
                    {/* Home Team Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamLogo
                          name={match.homeTeam.name}
                          abbreviation={match.homeTeam.abbreviation}
                          logo={match.homeTeam.logo}
                          size="xs"
                        />
                        <span className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[110px] sm:max-w-[150px] lg:max-w-[110px]">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      {!isScheduled && (
                        <span className="font-mono font-bold text-body-sm text-on-surface tabular-nums">
                          {match.score.home ?? 0}
                        </span>
                      )}
                    </div>

                    {/* Away Team Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamLogo
                          name={match.awayTeam.name}
                          abbreviation={match.awayTeam.abbreviation}
                          logo={match.awayTeam.logo}
                          size="xs"
                        />
                        <span className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[110px] sm:max-w-[150px] lg:max-w-[110px]">
                          {match.awayTeam.name}
                        </span>
                      </div>
                      {!isScheduled && (
                        <span className="font-mono font-bold text-body-sm text-on-surface tabular-nums">
                          {match.score.away ?? 0}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status / Kickoff Column */}
                  <div className="shrink-0 pl-2.5 border-l border-surface-bright/40 flex items-center justify-end">
                    {renderStatusBadge(match)}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* Advertisement Banner */}
      <AdvertisementPlaceholder variant="sidebar" />

      {/* Quick Links Widget */}
      <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden shadow-sm">
        <div className="px-3.5 py-2.5 bg-surface-container-high border-b border-surface-bright flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">link</span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Quick Links</span>
        </div>
        <div className="p-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2.5 transition-colors group"
            >
              <img
                src={link.icon}
                alt={link.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.visibility = 'hidden'
                }}
              />
              <span className="truncate group-hover:text-primary transition-colors">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
