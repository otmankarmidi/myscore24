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
          className={`ui-press relative w-full h-10 px-3 rounded-lg flex items-center gap-3 text-start ${active ? 'bg-brand-soft text-brand-ink' : 'hover:bg-hover text-ink'}`}
          aria-pressed={active}
        >
          <span className={`absolute start-0 top-2 bottom-2 w-[3px] rounded-full bg-brand transition-transform duration-300 ${active ? 'scale-y-100' : 'scale-y-0'}`} aria-hidden="true" />
          <span className="w-6 h-6 rounded-md bg-white border border-line flex items-center justify-center shrink-0">
            <CompetitionLogo logo={l.logo} name={l.name} size={16} showBackground={false} />
          </span>
          <span className="flex-1 min-w-0">
            <span className={`block truncate text-[13.5px] ${active ? 'font-semibold' : 'font-medium'}`}>{l.name}</span>
          </span>
          {count > 0 && <span className={`min-w-6 h-5 px-1.5 rounded-md text-[11px] font-bold tabular-nums inline-flex items-center justify-center ${active ? 'bg-brand text-white' : 'bg-canvas text-ink-2'}`}>{count}</span>}
        </button>
      </li>
    )
  }

  return (
    <aside className="space-y-3" aria-label="Leagues">
      {pinned.length > 0 && (
        <section className="ui-card rounded-2xl p-2">
          <p className="ui-eyebrow px-3 pt-2 pb-1.5">{ar ? 'المثبتة' : 'Pinned'}</p>
          <ul>{pinned.map(leagueRow)}</ul>
        </section>
      )}

      <section className="ui-card rounded-2xl p-2">
        <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
          <p className="ui-eyebrow">{ar ? 'أهم البطولات' : 'Top leagues'}</p>
          <Link href="/competitions" className="text-[12px] font-semibold text-brand hover:underline">
            {ar ? 'الكل' : 'All'}
          </Link>
        </div>
        <ul>{TOP_LEAGUES.map(leagueRow)}</ul>
      </section>

      {countries.length > 0 && (
        <section className="ui-card rounded-2xl p-2">
          <p className="ui-eyebrow px-3 pt-2 pb-1.5">{ar ? 'الدول اليوم' : "Today's countries"}</p>
          <ul>
            {(showAllCountries ? countries : countries.slice(0, 8)).map((c) => {
              const league = todaysLeagues.find((t) => (t.league.country || 'World') === c.country)?.league
              const key = league ? String(league.id || league.slug) : null
              return (
                <li key={c.country}>
                  <button
                    onClick={() => key && onLeagueChange(activeLeague === key ? null : key)}
                    className={`ui-press w-full h-10 px-3 rounded-lg flex items-center gap-3 text-start ${key && activeLeague === key ? 'bg-brand-soft text-brand-ink' : 'hover:bg-hover text-ink'}`}
                  >
                    <span className="w-6 h-6 rounded-md overflow-hidden bg-canvas flex items-center justify-center shrink-0">
                      <CountryFlag country={c.country} flagUrl={c.flag} width={24} height={24} className="w-6 h-6 object-cover" />
                    </span>
                    <span className="flex-1 truncate text-[13.5px] font-medium">{c.country}</span>
                    <span className="min-w-6 h-5 px-1.5 rounded-md bg-canvas text-[11px] font-bold tabular-nums text-ink-2 inline-flex items-center justify-center">{c.count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {countries.length > 8 && (
            <button onClick={() => setShowAllCountries((v) => !v)} className="ui-press w-full h-9 rounded-lg text-[12px] font-semibold text-ink-2 hover:text-brand hover:bg-hover">
              {showAllCountries ? (ar ? 'أقل' : 'Show less') : ar ? 'المزيد' : `Show all (${countries.length})`}
            </button>
          )}
        </section>
      )}

      {todaysLeagues.length > 0 && (
        <p className="px-3 text-[11.5px] text-ink-3 leading-relaxed">
          {ar ? 'اضغط على بطولة لتصفية المباريات.' : 'Tap a league to filter the match list.'}{' '}
          {todaysLeagues.map(({ league }) => getCleanLeagueDisplayName(league, locale) || league.name).length} {ar ? 'بطولة اليوم' : 'competitions today'}
        </p>
      )}
    </aside>
  )
}
