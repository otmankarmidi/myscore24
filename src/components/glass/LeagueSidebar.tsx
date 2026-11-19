'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { League } from '@/types/league'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import CountryFlag from '@/components/common/CountryFlag'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/context/LanguageContext'
import { getCleanLeagueDisplayName } from '@/config/competitions'

const TOP_LEAGUES = [
  { id: '2', name: 'Champions League', country: 'Europe', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { id: '39', name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: '140', name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: '135', name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { id: '78', name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: '61', name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png' },
  { id: '200', name: 'Botola Pro', country: 'Morocco', logo: 'https://media.api-sports.io/football/leagues/200.png' },
  { id: '3', name: 'Europa League', country: 'Europe', logo: 'https://media.api-sports.io/football/leagues/3.png' },
]

interface LeagueSidebarProps {
  /** Leagues playing on the selected day, with match counts. */
  todaysLeagues: { league: League; count: number }[]
  activeLeague: string | null
  onLeagueChange: (key: string | null) => void
}

export default function LeagueSidebar({ todaysLeagues, activeLeague, onLeagueChange }: LeagueSidebarProps) {
  const { locale } = useLanguage()
  const { isFavoriteLeague } = useFavorites()
  const [showAllCountries, setShowAllCountries] = useState(false)
  const ar = locale === 'ar'

  const countByLeagueId = useMemo(() => {
    const m = new Map<string, number>()
    todaysLeagues.forEach(({ league, count }) => m.set(String(league.id), count))
    return m
  }, [todaysLeagues])

  const pinned = TOP_LEAGUES.filter((l) => isFavoriteLeague(l.id))

  const countries = useMemo(() => {
    const map = new Map<string, { country: string; flag?: string; count: number }>()
    todaysLeagues.forEach(({ league, count }) => {
      const c = league.country || 'World'
      const entry = map.get(c)
      if (entry) entry.count += count
      else map.set(c, { country: c, flag: league.countryFlag || undefined, count })
    })
    return [...map.values()].sort((a, b) => a.country.localeCompare(b.country))
  }, [todaysLeagues])

  const leagueRow = (l: (typeof TOP_LEAGUES)[number]) => {
    const count = countByLeagueId.get(l.id) || 0
    const active = activeLeague === l.id
    return (
      <li key={l.id}>
        <button
          onClick={() => onLeagueChange(active ? null : l.id)}
          className={`gl-row w-full h-10 px-3 rounded-xl flex items-center gap-3 text-start ${active ? 'gl-row-active' : ''}`}
          aria-pressed={active}
        >
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
            <CompetitionLogo logo={l.logo} name={l.name} size={16} showBackground={false} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block truncate text-[13.5px] font-medium text-white/90">{l.name}</span>
          </span>
          {count > 0 && <span className="text-[11px] font-semibold tabular-nums text-white/45">{count}</span>}
        </button>
      </li>
    )
  }

  return (
    <aside className="space-y-3" aria-label="Leagues">
      {pinned.length > 0 && (
        <section className="gl-panel rounded-2xl p-2">
          <p className="gl-eyebrow px-3 pt-2 pb-1.5">{ar ? 'المثبتة' : 'Pinned'}</p>
          <ul>{pinned.map(leagueRow)}</ul>
        </section>
      )}

      <section className="gl-panel rounded-2xl p-2">
        <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
          <p className="gl-eyebrow">{ar ? 'أهم البطولات' : 'Top leagues'}</p>
          <Link href="/competitions" className="text-[11.5px] font-semibold text-accent-cyan hover:underline">
            {ar ? 'الكل' : 'All'}
          </Link>
        </div>
        <ul>{TOP_LEAGUES.map(leagueRow)}</ul>
      </section>

      {countries.length > 0 && (
        <section className="gl-panel rounded-2xl p-2">
          <p className="gl-eyebrow px-3 pt-2 pb-1.5">{ar ? 'الدول اليوم' : "Today's countries"}</p>
          <ul>
            {(showAllCountries ? countries : countries.slice(0, 8)).map((c) => {
              const league = todaysLeagues.find((t) => (t.league.country || 'World') === c.country)?.league
              const key = league ? String(league.id || league.slug) : null
              return (
                <li key={c.country}>
                  <button
                    onClick={() => key && onLeagueChange(activeLeague === key ? null : key)}
                    className={`gl-row w-full h-10 px-3 rounded-xl flex items-center gap-3 text-start ${key && activeLeague === key ? 'gl-row-active' : ''}`}
                  >
                    <span className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                      <CountryFlag country={c.country} flagUrl={c.flag} width={24} height={24} className="w-6 h-6 object-cover" />
                    </span>
                    <span className="flex-1 truncate text-[13.5px] font-medium text-white/85">{c.country}</span>
                    <span className="text-[11px] font-semibold tabular-nums text-white/45">{c.count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {countries.length > 8 && (
            <button onClick={() => setShowAllCountries((v) => !v)} className="w-full h-9 text-[12px] font-semibold text-white/60 hover:text-white">
              {showAllCountries ? (ar ? 'أقل' : 'Show less') : ar ? 'المزيد' : `Show all (${countries.length})`}
            </button>
          )}
        </section>
      )}

      {todaysLeagues.length > 0 && (
        <p className="px-3 text-[11.5px] text-white/35 leading-relaxed">
          {ar ? 'اضغط على بطولة لتصفية المباريات.' : 'Tap a league to filter the match list.'}{' '}
          {todaysLeagues.map(({ league }) => getCleanLeagueDisplayName(league, locale) || league.name).length} {ar ? 'بطولة اليوم' : 'competitions today'}
        </p>
      )}
    </aside>
  )
}
