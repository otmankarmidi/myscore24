'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import TeamLogo from '@/components/common/TeamLogo'
import AdvertisementPlaceholder from '@/components/common/AdvertisementPlaceholder'
import { Match } from '@/types/match'

const QUICK_LINKS = [
  { name: 'Premier League', href: '/competition/39', icon: '/leagues/premier-league.png' },
  { name: 'LaLiga', href: '/competition/140', icon: '/leagues/laliga.png' },
  { name: 'Bundesliga', href: '/competition/78', icon: '/leagues/bundesliga.png' },
  { name: 'Serie A', href: '/competition/135', icon: '/leagues/serie-a.png' },
  { name: 'Ligue 1', href: '/competition/61', icon: '/leagues/ligue-1.png' },
  { name: 'Champions League', href: '/competition/2', icon: '/leagues/champions-league.png' },
]

const LEAGUE_PRESTIGE_WEIGHTS: Record<string, number> = {
  'champions league': 100,
  'ucl': 100,
  'world cup': 98,
  'euro': 95,
  'nations league': 92,
  'afcon': 90,
  'africa cup of nations': 90,
  'copa america': 90,
  'premier league': 88,
  'la liga': 86,
  'laliga': 86,
  'serie a': 82,
  'bundesliga': 80,
  'botola': 78,
  'saudi pro league': 75,
  'roshn': 75,
  'ligue 1': 74,
  'europa league': 70,
  'fa cup': 68,
  'copa del rey': 65,
  'conference league': 60,
}

const ELITE_TEAMS = [
  'real madrid', 'barcelona', 'manchester city', 'liverpool', 'arsenal',
  'bayern munich', 'bayern', 'paris saint germain', 'psg', 'inter', 'inter milan',
  'juventus', 'chelsea', 'manchester united', 'atletico madrid', 'atletico',
  'borussia dortmund', 'dortmund', 'bayer leverkusen', 'tottenham',
  'wydad', 'raja', 'as far', 'rs berkane', 'al hilal', 'al nassr', 'al ittihad',
  'al ahly', 'zamalek',
  'morocco', 'المغرب', 'spain', 'إسبانيا', 'france', 'فرنسا', 'argentina', 'الأرجنتين',
  'england', 'إنجلترا', 'brazil', 'البرازيل', 'portugal', 'البرتغال', 'germany', 'ألمانيا',
  'netherlands', 'هولندا', 'italy', 'إيطاليا', 'croatia', 'كرواتيا', 'senegal', 'السنغال',
  'egypt', 'مصر', 'algeria', 'الجزائر', 'belgium', 'بلجيكا',
]

function getMatchPrestigeScore(m: Match): number {
  let score = 0
  const leagueName = (m.league?.name || '').toLowerCase()
  const home = (m.homeTeam?.name || '').toLowerCase()
  const away = (m.awayTeam?.name || '').toLowerCase()

  // 1. Base Tournament Prestige
  for (const [key, weight] of Object.entries(LEAGUE_PRESTIGE_WEIGHTS)) {
    if (leagueName.includes(key)) {
      score = Math.max(score, weight)
    }
  }
  if (score === 0) score = 40

  // 2. Elite Teams / Marquee Clash Bonus
  const isHomeElite = ELITE_TEAMS.some((t) => home.includes(t))
  const isAwayElite = ELITE_TEAMS.some((t) => away.includes(t))

  if (isHomeElite && isAwayElite) {
    score += 50 // Mega derby / clash (e.g. Real vs Barca, Arsenal vs Chelsea)
  } else if (isHomeElite || isAwayElite) {
    score += 25
  }

  // 3. Status Urgency Bonus (Live matches are prioritized)
  if (m.status === 'live' || m.status === 'half_time' || m.status === 'extra_time' || m.status === 'penalties') {
    score += 30
  } else if (m.status === 'scheduled') {
    score += 15
  }

  return score
}

function filterTopMatches(allMatches: Match[]): Match[] {
  if (!allMatches || !Array.isArray(allMatches) || allMatches.length === 0) return []

  const scored = allMatches.map((m) => ({
    match: m,
    score: getMatchPrestigeScore(m),
  }))

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(a.match.kickoff).getTime() - new Date(b.match.kickoff).getTime()
  })

  // Return strictly the top 3 best games of the day
  return scored.slice(0, 3).map((s) => s.match)
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
    // Avoid fetching if sidebar is hidden on mobile screens
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return
    }

    let isMounted = true

    async function fetchSidebar() {
      try {
        const res = await fetch('/api/matches/today', { cache: 'no-store' })
        if (!res.ok || !isMounted) return
        const json = await res.json()
        const rawMatches: Match[] = json.data || []
        const filtered = filterTopMatches(rawMatches)
        if (isMounted) setTopMatches(filtered)
      } catch {
        if (isMounted) setTopMatches([])
      }
    }

    fetchSidebar()

    // Real-time update every 30 seconds to keep live scores up-to-date
    const interval = setInterval(fetchSidebar, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <aside className="hidden lg:flex w-80 shrink-0 flex-col gap-4">
      {/* Top Matches Widget */}
      <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden shadow-sm">
        <div className="px-3.5 py-2.5 bg-surface-container-high border-b border-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">local_fire_department</span>
            <span>Top Matches</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 text-[10px] font-mono font-bold leading-none">
              TOP 3
            </span>
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
              const hasValidId = Boolean(match.id && String(match.id).trim() !== '' && String(match.id) !== 'undefined')
              const matchHref = hasValidId ? `/match/${match.id}` : '#'

              return (
                <Link
                  key={match.id}
                  href={matchHref}
                  prefetch={false}
                  onClick={(e) => {
                    if (!hasValidId) e.preventDefault()
                  }}
                  className="p-3 flex items-center justify-between hover:bg-surface-container-high/60 transition-colors group"
                >
                  {/* Teams & Scores Column */}
                  <div className="flex-1 min-w-0 space-y-1.5 pr-2">
                    {/* Small League Tag */}
                    {match.league?.name && (
                      <div className="text-[10px] text-on-surface-variant/80 font-medium truncate mb-1">
                        {match.league.name}
                      </div>
                    )}

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
              prefetch={false}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high flex items-center gap-2.5 transition-colors group"
            >
              <img
                src={link.icon}
                alt={link.name}
                width={20}
                height={20}
                loading="lazy"
                decoding="async"
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
