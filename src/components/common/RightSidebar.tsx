'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MatchStatusBadge from '@/components/common/MatchStatusBadge'
import TeamLogo from '@/components/common/TeamLogo'
import AdvertisementPlaceholder from '@/components/common/AdvertisementPlaceholder'
import { Match } from '@/types/match'

export default function RightSidebar() {
  const [topMatches, setTopMatches] = useState<Match[]>([])

  useEffect(() => {
    async function fetchSidebar() {
      try {
        // Try live matches first, fallback to today's
        const liveRes = await fetch('/api/matches/live', { cache: 'no-store' })
        const liveJson = await liveRes.json()
        let data: Match[] = liveJson.data || []

        if (data.length === 0) {
          const todayRes = await fetch(`/api/matches/today?date=${localDateStr()}`, { cache: 'no-store' })
          const todayJson = await todayRes.json()
          data = todayJson.data || []
        }

        setTopMatches(data.slice(0, 4))
      } catch {
        setTopMatches([])
      }
    }

    fetchSidebar()
    const id = setInterval(fetchSidebar, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside className="w-80 shrink-0 hidden lg:flex flex-col gap-4">
      {/* Top Matches Widget */}
      <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden">
        <div className="px-3.5 py-2.5 bg-surface-container-high border-b border-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">local_fire_department</span>
            <span>Top Matches</span>
          </div>
          <Link href="/live" className="text-[11px] text-primary hover:underline font-medium">
            View All
          </Link>
        </div>

        <div className="divide-y divide-surface-bright">
          {topMatches.length === 0 ? (
            <div className="p-4 text-center text-xs text-on-surface-variant">
              No featured matches right now
            </div>
          ) : (
            topMatches.map((match) => (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="p-3 flex items-center justify-between hover:bg-surface-container-high/50 transition-colors group"
              >
                <div className="flex-1 space-y-1.5 pr-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo name={match.homeTeam.name} abbreviation={match.homeTeam.abbreviation} logo={match.homeTeam.logo} size="xs" />
                      <span className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px]">
                        {match.homeTeam.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-body-sm text-on-surface tabular-nums">
                      {match.status === 'scheduled' ? '-' : (match.score.home ?? '-')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo name={match.awayTeam.name} abbreviation={match.awayTeam.abbreviation} logo={match.awayTeam.logo} size="xs" />
                      <span className="text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px]">
                        {match.awayTeam.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-body-sm text-on-surface tabular-nums">
                      {match.status === 'scheduled' ? '-' : (match.score.away ?? '-')}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-2 border-l border-surface-bright">
                  <MatchStatusBadge status={match.status} minute={match.minute} size="sm" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Advertisement Banner */}
      <AdvertisementPlaceholder variant="sidebar" />

      {/* Quick Links Widget */}
      <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden">
        <div className="px-3.5 py-2.5 bg-surface-container-high border-b border-surface-bright flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">link</span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface">Quick Links</span>
        </div>
        <div className="p-2 flex flex-col gap-1">
          {[
            { href: '/league/eng.1', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
            { href: '/league/esp.1', label: '🇪🇸 LaLiga' },
            { href: '/league/ger.1', label: '🇩🇪 Bundesliga' },
            { href: '/league/ita.1', label: '🇮🇹 Serie A' },
            { href: '/league/fra.1', label: '🇫🇷 Ligue 1' },
            { href: '/league/uefa.champions', label: '🏆 Champions League' },
            { href: '/league/mar.1', label: '🇲🇦 Botola Pro' },
            { href: '/league/ksa.1', label: '🇸🇦 Saudi Pro League' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

function localDateStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
