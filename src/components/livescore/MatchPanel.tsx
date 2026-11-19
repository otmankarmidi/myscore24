'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Match, MatchEvent, LineupPlayer } from '@/types/match'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone } from '@/context/TimezoneContext'
import { formatMatchTime } from '@/lib/utils'
import { buildMatchUrl } from '@/lib/football/matchUrl'
import { getCleanLeagueDisplayName } from '@/config/competitions'
import { isFinished, isLive } from './matchUtils'
import { useSlidingIndicator } from './useSlidingIndicator'

type Tab = 'details' | 'stats' | 'lineups'

export default function MatchPanel({ match }: { match: Match | null }) {
  const { locale } = useLanguage()
  const { activeTimezone } = useTimezone()
  const ar = locale === 'ar'
  const [tab, setTab] = useState<Tab>('details')
  const { ref: tabsRef, style: indicator } = useSlidingIndicator<HTMLDivElement>(`${tab}|${match?.id}`)

  if (!match) {
    return (
      <div className="ui-card rounded-2xl p-8 text-center text-ink-3 text-[14px]">
        <span className="material-symbols-outlined text-[40px] text-line-strong">sports_soccer</span>
        <p className="mt-2">{ar ? 'اختر مباراة لعرض التفاصيل' : 'Select a match to see the details'}</p>
      </div>
    )
  }

  const live = isLive(match)
  const finished = isFinished(match)
  const scheduled = match.status === 'scheduled'
  const leagueName = getCleanLeagueDisplayName(match.league, locale) || match.league?.name || 'Football'
  const href = match.id ? buildMatchUrl(match) : '#'
  const lineup = match.lineup
  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'details', label: ar ? 'التفاصيل' : 'Details', show: true },
    { key: 'stats', label: ar ? 'الإحصائيات' : 'Statistics', show: Boolean(match.statistics) },
    { key: 'lineups', label: ar ? 'التشكيلات' : 'Lineups', show: Boolean(lineup?.home && (lineup.home.startingXI?.length || lineup.home.starters?.length)) },
  ]
  const activeTab: Tab = tabs.find((t) => t.key === tab && t.show) ? tab : 'details'

  const dateStr = (() => {
    try {
      return new Intl.DateTimeFormat(ar ? 'ar' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: activeTimezone,
      }).format(new Date(match.kickoff))
    } catch {
      return ''
    }
  })()

  return (
    <div className="ui-card rounded-2xl overflow-hidden">
      {/* Scoreboard — solid brand block; re-keyed so switching matches cross-fades */}
      <div key={match.id} className="bg-brand text-white p-5 pb-6 ui-fade">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0">
            <CompetitionLogo logo={match.league?.logo} name={leagueName} country={match.league?.country} countryFlag={match.league?.countryFlag} providerId={match.league?.id} slug={match.league?.slug} size={18} showBackground={false} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold truncate leading-tight">{leagueName}</p>
            <p className="text-[11.5px] text-white/70 truncate leading-tight">{[match.round, dateStr].filter(Boolean).join(' · ')}</p>
          </div>
          <Link href={href} prefetch={false} className="ui-press w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 inline-flex items-center justify-center" aria-label="Open match page">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {(['home', 'away'] as const).map((side, idx) => {
            const t = side === 'home' ? match.homeTeam : match.awayTeam
            return (
              <Link key={side} href={`/team/${t?.slug || t?.id}`} prefetch={false} className={`ui-press flex flex-col items-center text-center gap-2 min-w-0 group ${idx === 1 ? 'order-3' : ''}`}>
                <span className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                  <TeamLogo name={t?.name || ''} abbreviation={t?.abbreviation} logo={t?.logo} size="lg" />
                </span>
                <span className="text-[13.5px] font-semibold leading-tight line-clamp-2">{t?.name}</span>
              </Link>
            )
          })}
          <div className="order-2 flex flex-col items-center gap-2">
            {scheduled ? (
              <>
                <span className="ui-score text-[34px]">{formatMatchTime(match.kickoff, activeTimezone, locale)}</span>
                <span className="text-[11px] text-white/70">{dateStr}</span>
              </>
            ) : (
              <>
                <span className="ui-score text-[44px] leading-none">
                  {match.score?.home ?? 0}
                  <span className="mx-2 text-white/50">-</span>
                  {match.score?.away ?? 0}
                </span>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-live text-white text-[11.5px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
                    {match.status === 'half_time' ? 'HT' : (
                      <>
                        {match.minute ?? ''}
                        <span className="ui-blink">&apos;</span>
                      </>
                    )}
                  </span>
                ) : (
                  <span className="h-6 px-2.5 rounded-md bg-white/15 inline-flex items-center text-[11.5px] font-semibold">
                    {finished ? (ar ? 'انتهت' : 'Full-time') : String(match.status).replace('_', ' ')}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs with a gliding underline */}
      <div ref={tabsRef} className="relative flex border-b border-line" role="tablist">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.key}
              role="tab"
              data-active={activeTab === t.key}
              aria-selected={activeTab === t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 h-11 text-[13px] font-semibold transition-colors ${activeTab === t.key ? 'text-brand' : 'text-ink-3 hover:text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        <span className="absolute bottom-0 left-0 h-[3px] rounded-t-full bg-brand pointer-events-none" style={indicator} aria-hidden="true" />
      </div>

      <div key={`${match.id}-${activeTab}`} className="p-4 ui-swap">
        {activeTab === 'details' && <Details match={match} />}
        {activeTab === 'stats' && <Stats match={match} />}
        {activeTab === 'lineups' && <Lineups match={match} />}
      </div>

      <div className="px-4 pb-4">
        <Link href={href} prefetch={false} className="ui-press group h-11 rounded-xl bg-ink hover:bg-brand text-white flex items-center justify-center gap-1.5 text-[14px] font-semibold">
          {ar ? 'صفحة المباراة الكاملة' : 'Full match centre'}
          <span className="material-symbols-outlined text-[18px] rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">arrow_forward</span>
        </Link>
      </div>
    </div>
  )
}

/* ─────────────────────────── Details ─────────────────────────── */

function EventIcon({ e }: { e: MatchEvent }) {
  if (e.type === 'yellow_card') return <span className="w-[10px] h-[14px] rounded-[2px] bg-[#FFC400]" aria-label="Yellow card" />
  if (e.type === 'red_card') return <span className="w-[10px] h-[14px] rounded-[2px] bg-live" aria-label="Red card" />
  if (e.type === 'second_yellow')
    return (
      <span className="relative w-[13px] h-[16px]" aria-label="Second yellow">
        <span className="absolute left-0 top-0 w-[10px] h-[14px] rounded-[2px] bg-[#FFC400]" />
        <span className="absolute left-[3px] top-[2px] w-[10px] h-[14px] rounded-[2px] bg-live" />
      </span>
    )
  const icon = e.type === 'substitution' ? 'sync' : e.type === 'var' ? 'live_tv' : e.type === 'penalty_missed' ? 'clear' : 'sports_soccer'
  const color = e.type === 'substitution' ? 'text-win' : e.type === 'penalty_missed' ? 'text-live' : 'text-ink'
  return <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
}

function Details({ match }: { match: Match }) {
  const { locale } = useLanguage()
  const ar = locale === 'ar'
  const events = useMemo(() => [...(match.events || [])].filter(Boolean).sort((a, b) => a.minute - b.minute), [match.events])
  const ht = match.score?.halftime
  const finished = isFinished(match)

  const divider = (key: string, label: string) => (
    <li key={key} className="flex items-center gap-3 py-2">
      <span className="flex-1 h-px bg-line" />
      <span className="text-[11px] font-bold tracking-wider text-ink-2 px-2.5 h-6 inline-flex items-center rounded-md bg-canvas">{label}</span>
      <span className="flex-1 h-px bg-line" />
    </li>
  )

  const rows: React.ReactNode[] = []
  let htShown = false
  events.forEach((e, i) => {
    if (!htShown && e.minute > 45 && ht && ht.home !== null) {
      rows.push(divider('ht', `HT ${ht.home} - ${ht.away}`))
      htShown = true
    }
    const home = e.team === 'home'
    const isGoal = e.type === 'goal' || e.type === 'penalty_scored'
    rows.push(
      <li
        key={e.id}
        className={`ui-enter flex items-center gap-3 py-1.5 px-2 rounded-lg ${home ? '' : 'flex-row-reverse text-end'} ${isGoal ? 'bg-brand-soft' : ''}`}
        style={{ '--i': i } as React.CSSProperties}
      >
        <span className={`w-9 shrink-0 text-[12px] font-bold tabular-nums ${isGoal ? 'text-brand' : 'text-ink-3'} ${home ? 'text-start' : 'text-end'}`}>
          {e.minute}
          {e.extraMinute ? `+${e.extraMinute}` : ''}&apos;
        </span>
        <span className="w-6 shrink-0 flex justify-center"><EventIcon e={e} /></span>
        <span className="min-w-0">
          <span className={`block truncate text-[13.5px] ${isGoal ? 'font-bold text-ink' : 'text-ink'}`}>{e.playerName}</span>
          {(e.playerNameSecondary || e.detail) && (
            <span className="block truncate text-[11.5px] text-ink-3">
              {e.type === 'substitution' && e.playerNameSecondary ? `↔ ${e.playerNameSecondary}` : e.detail}
            </span>
          )}
        </span>
      </li>
    )
  })
  if (!htShown && events.length && ht && ht.home !== null && (finished || (match.minute ?? 0) > 45)) rows.push(divider('ht-end', `HT ${ht.home} - ${ht.away}`))
  if (finished) rows.push(divider('ft', `FT ${match.score?.home ?? 0} - ${match.score?.away ?? 0}`))

  const info = [
    { icon: 'stadium', label: ar ? 'الملعب' : 'Venue', value: match.venue },
    { icon: 'sports', label: ar ? 'الحكم' : 'Referee', value: match.referee },
    { icon: 'emoji_events', label: ar ? 'الجولة' : 'Round', value: match.round },
  ].filter((i) => i.value)

  return (
    <div className="space-y-4">
      {events.length > 0 ? (
        <ul className="space-y-1">{rows}</ul>
      ) : (
        <p className="py-6 text-center text-[13px] text-ink-3">
          {match.status === 'scheduled' ? (ar ? 'لم تبدأ المباراة بعد' : 'Kick-off hasn’t happened yet.') : ar ? 'لا توجد أحداث' : 'No incidents yet.'}
        </p>
      )}
      {info.length > 0 && (
        <dl className="rounded-xl bg-canvas divide-y divide-line">
          {info.map((i) => (
            <div key={i.label} className="flex items-center gap-3 px-3.5 h-11">
              <span className="material-symbols-outlined text-[18px] text-ink-3">{i.icon}</span>
              <dt className="text-[12.5px] text-ink-3">{i.label}</dt>
              <dd className="ms-auto text-[13px] font-semibold text-ink truncate">{i.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/* ─────────────────────────── Statistics ─────────────────────────── */

function Stats({ match }: { match: Match }) {
  const { locale } = useLanguage()
  const ar = locale === 'ar'
  const s = match.statistics
  if (!s) return null
  const rows = [
    { label: ar ? 'الأهداف المتوقعة' : 'Expected goals (xG)', v: s.xG, dec: true },
    { label: ar ? 'التسديدات' : 'Total shots', v: s.shots },
    { label: ar ? 'على المرمى' : 'Shots on target', v: s.shotsOnTarget },
    { label: ar ? 'الركنيات' : 'Corner kicks', v: s.corners },
    { label: ar ? 'التمريرات' : 'Passes', v: s.passes },
    { label: ar ? 'دقة التمرير' : 'Pass accuracy', v: s.passAccuracy, pct: true },
    { label: ar ? 'الأخطاء' : 'Fouls', v: s.fouls },
    { label: ar ? 'التسلل' : 'Offsides', v: s.offsides },
    { label: ar ? 'البطاقات الصفراء' : 'Yellow cards', v: s.yellowCards },
  ].filter((r) => r.v) as { label: string; v: { home: number; away: number }; dec?: boolean; pct?: boolean }[]
  const fmt = (n: number, r: { dec?: boolean; pct?: boolean }) => (r.dec ? n.toFixed(2) : `${n}${r.pct ? '%' : ''}`)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-[11.5px] font-semibold">
        <span className="inline-flex items-center gap-1.5 text-ink-2"><span className="w-2.5 h-2.5 rounded-sm bg-brand" />{match.homeTeam?.name}</span>
        <span className="inline-flex items-center gap-1.5 text-ink-2">{match.awayTeam?.name}<span className="w-2.5 h-2.5 rounded-sm bg-away" /></span>
      </div>
      {s.possession && (
        <div>
          <p className="text-center text-[12px] font-semibold text-ink-2 mb-2">{ar ? 'الاستحواذ' : 'Ball possession'}</p>
          <div className="flex h-8 rounded-lg overflow-hidden text-[12.5px] font-bold text-white gap-0.5">
            <span className="bg-brand flex items-center ps-3 ui-grow" style={{ width: `${s.possession.home}%` }}>{s.possession.home}%</span>
            <span className="bg-away flex items-center justify-end pe-3 ui-grow-end" style={{ width: `${s.possession.away}%` }}>{s.possession.away}%</span>
          </div>
        </div>
      )}
      <ul className="space-y-4">
        {rows.map((r, i) => {
          const total = r.v.home + r.v.away || 1
          const homeLeads = r.v.home > r.v.away
          const awayLeads = r.v.away > r.v.home
          return (
            <li key={r.label}>
              <div className="flex items-center justify-between text-[13px] mb-1.5">
                <span className={`min-w-9 h-6 px-1.5 rounded-md inline-flex items-center justify-center tabular-nums font-bold ${homeLeads ? 'bg-brand text-white' : 'text-ink-2'}`}>{fmt(r.v.home, r)}</span>
                <span className="text-ink-2 text-[12.5px]">{r.label}</span>
                <span className={`min-w-9 h-6 px-1.5 rounded-md inline-flex items-center justify-center tabular-nums font-bold ${awayLeads ? 'bg-away text-white' : 'text-ink-2'}`}>{fmt(r.v.away, r)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-1.5 rounded-full bg-canvas overflow-hidden flex justify-end">
                  <span className="h-full rounded-full bg-brand ui-grow-end" style={{ width: `${(r.v.home / total) * 100}%`, '--i': i } as React.CSSProperties} />
                </div>
                <div className="h-1.5 rounded-full bg-canvas overflow-hidden">
                  <span className="block h-full rounded-full bg-away ui-grow" style={{ width: `${(r.v.away / total) * 100}%`, '--i': i } as React.CSSProperties} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ─────────────────────────── Lineups ─────────────────────────── */

function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter((p) => !/^(jr\.?|sr\.?|junior)$/i.test(p))
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] || name
}

function Lineups({ match }: { match: Match }) {
  const { locale } = useLanguage()
  const ar = locale === 'ar'
  const home = match.lineup?.home
  const away = match.lineup?.away
  if (!home || !away) return null
  const homeXI: LineupPlayer[] = home.startingXI || home.starters || []
  const awayXI: LineupPlayer[] = away.startingXI || away.starters || []

  // Home attacks upwards in the bottom half; away is mirrored in the top half
  const dot = (p: LineupPlayer, side: 'home' | 'away', i: number) => {
    const x = side === 'home' ? p.positionX : 100 - p.positionX
    const y = side === 'home' ? 50 + (p.positionY / 100) * 47 : 50 - (p.positionY / 100) * 47
    return (
      <span
        key={`${side}-${p.id}`}
        className="absolute ui-dot-in flex flex-col items-center gap-0.5 w-16"
        style={{ left: `${x}%`, top: `${y}%`, '--i': i } as React.CSSProperties}
      >
        <span className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-white ${side === 'home' ? 'bg-brand' : 'bg-away'}`}>
          {p.number}
          {typeof p.rating === 'number' && (
            <span className={`absolute -top-2 -end-4 px-1 rounded text-[9px] font-bold text-white ${p.rating >= 7.5 ? 'bg-win' : p.rating >= 6.5 ? 'bg-[#E89A00]' : 'bg-live'}`}>
              {p.rating.toFixed(1)}
            </span>
          )}
        </span>
        <span className="px-1 rounded bg-ink/55 text-[10px] font-semibold text-white leading-[14px] truncate max-w-full">{shortName(p.name)}</span>
      </span>
    )
  }

  const bench = (xs: LineupPlayer[] | undefined) =>
    (xs || []).slice(0, 7).map((p) => (
      <li key={p.id} className="flex items-center gap-2 h-7 text-[12.5px] text-ink">
        <span className="w-5 text-end tabular-nums text-ink-3">{p.number}</span>
        <span className="truncate">{p.name}</span>
      </li>
    ))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[12.5px] font-semibold">
        <span className="inline-flex items-center gap-1.5 text-ink"><span className="w-2.5 h-2.5 rounded-full bg-brand" />{home.formation}</span>
        <span className="inline-flex items-center gap-1.5 text-ink">{away.formation}<span className="w-2.5 h-2.5 rounded-full bg-away" /></span>
      </div>
      <div className="ui-pitch relative w-full aspect-[3/4] rounded-xl overflow-hidden" dir="ltr">
        {awayXI.map((p, i) => dot(p, 'away', i))}
        {homeXI.map((p, i) => dot(p, 'home', i + awayXI.length))}
      </div>
      {home.substitutes?.length || away.substitutes?.length ? (
        <div>
          <p className="ui-eyebrow mb-2">{ar ? 'البدلاء' : 'Substitutes'}</p>
          <div className="grid grid-cols-2 gap-4">
            <ul>{bench(home.substitutes || home.bench)}</ul>
            <ul>{bench(away.substitutes || away.bench)}</ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
