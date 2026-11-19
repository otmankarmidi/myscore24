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

type Tab = 'details' | 'stats' | 'lineups'

export default function MatchPanel({ match }: { match: Match | null }) {
  const { locale } = useLanguage()
  const { activeTimezone } = useTimezone()
  const ar = locale === 'ar'
  const [tab, setTab] = useState<Tab>('details')

  if (!match) {
    return (
      <div className="gl-panel rounded-3xl p-8 text-center text-white/50 text-[14px]">
        <span className="material-symbols-outlined text-[40px] text-white/25">sports_soccer</span>
        <p className="mt-2">{ar ? 'اختر مباراة لعرض التفاصيل' : 'Select a match to see the details'}</p>
      </div>
    )
  }

  const live = isLive(match)
  const finished = isFinished(match)
  const scheduled = match.status === 'scheduled'
  const leagueName = getCleanLeagueDisplayName(match.league, locale) || match.league?.name || 'Football'
  const href = match.id ? buildMatchUrl(match) : '#'
  const hasStats = Boolean(match.statistics)
  const lineup = match.lineup
  const hasLineups = Boolean(lineup?.home && (lineup.home.startingXI?.length || lineup.home.starters?.length))
  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: 'details', label: ar ? 'التفاصيل' : 'Details', show: true },
    { key: 'stats', label: ar ? 'الإحصائيات' : 'Statistics', show: hasStats },
    { key: 'lineups', label: ar ? 'التشكيلات' : 'Lineups', show: hasLineups },
  ]
  const activeTab = tabs.find((t) => t.key === tab && t.show) ? tab : 'details'

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
    <div className="gl-panel rounded-3xl overflow-hidden animate-fade-in" key={match.id}>
      {/* ── Scoreboard header ── */}
      <div className="relative p-5 pb-6 overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-90 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(85,98,240,0.45),transparent_60%),radial-gradient(100%_100%_at_100%_100%,rgba(176,114,255,0.35),transparent_60%)]" aria-hidden="true" />
        <div className="relative flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
            <CompetitionLogo logo={match.league?.logo} name={leagueName} country={match.league?.country} countryFlag={match.league?.countryFlag} providerId={match.league?.id} slug={match.league?.slug} size={18} showBackground={false} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{leagueName}</p>
            <p className="text-[11.5px] text-white/50 truncate leading-tight">{[match.round, dateStr].filter(Boolean).join(' · ')}</p>
          </div>
          <Link href={href} prefetch={false} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center text-white" aria-label="Open match page">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          </Link>
        </div>

        <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {(['home', 'away'] as const).map((side, idx) => {
            const t = side === 'home' ? match.homeTeam : match.awayTeam
            return (
              <Link
                key={side}
                href={`/team/${t?.slug || t?.id}`}
                prefetch={false}
                className={`flex flex-col items-center text-center gap-2 min-w-0 group ${idx === 1 ? 'order-3' : ''}`}
              >
                <span className="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform group-hover:scale-105">
                  <TeamLogo name={t?.name || ''} abbreviation={t?.abbreviation} logo={t?.logo} size="lg" />
                </span>
                <span className="text-[13.5px] font-semibold text-white leading-tight line-clamp-2">{t?.name}</span>
              </Link>
            )
          })}
          <div className="order-2 flex flex-col items-center gap-1.5">
            {scheduled ? (
              <>
                <span className="gl-score text-[34px] text-white">{formatMatchTime(match.kickoff, activeTimezone, locale)}</span>
                <span className="text-[11px] text-white/50">{dateStr}</span>
              </>
            ) : (
              <>
                <span className={`gl-score text-[42px] leading-none ${live ? 'gl-grad-text' : 'text-white'}`}>
                  {match.score?.home ?? 0} - {match.score?.away ?? 0}
                </span>
                {live ? (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-live text-white text-[11.5px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {match.status === 'half_time' ? 'HT' : `${match.minute ?? ''}'`}
                  </span>
                ) : (
                  <span className="text-[11.5px] font-semibold text-white/55">{finished ? (ar ? 'انتهت' : 'Full-time') : String(match.status).replace('_', ' ')}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-y gl-hairline bg-white/[0.03]" role="tablist">
        {tabs
          .filter((t) => t.show)
          .map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 h-11 text-[13px] font-semibold transition-colors ${activeTab === t.key ? 'text-white' : 'text-white/50 hover:text-white'}`}
            >
              {t.label}
              {activeTab === t.key && <span className="absolute inset-x-6 bottom-0 h-[3px] rounded-t-full gl-grad-bg" />}
            </button>
          ))}
      </div>

      <div className="p-4">
        {activeTab === 'details' && <Details match={match} />}
        {activeTab === 'stats' && <Stats match={match} />}
        {activeTab === 'lineups' && <Lineups match={match} />}
      </div>

      <div className="px-4 pb-4">
        <Link href={href} prefetch={false} className="gl-btn h-11 rounded-full flex items-center justify-center gap-1.5 text-[14px] font-semibold">
          {ar ? 'صفحة المباراة الكاملة' : 'Full match centre'}
          <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>
    </div>
  )
}

/* ─────────────────────────── Details tab ─────────────────────────── */

function EventIcon({ e }: { e: MatchEvent }) {
  if (e.type === 'yellow_card') return <span className="w-[10px] h-[14px] rounded-[2px] bg-[#FFD60A]" aria-label="Yellow card" />
  if (e.type === 'red_card') return <span className="w-[10px] h-[14px] rounded-[2px] bg-live" aria-label="Red card" />
  if (e.type === 'second_yellow')
    return (
      <span className="relative w-[12px] h-[14px]" aria-label="Second yellow">
        <span className="absolute left-0 top-0 w-[10px] h-[14px] rounded-[2px] bg-[#FFD60A]" />
        <span className="absolute left-[3px] top-[2px] w-[10px] h-[14px] rounded-[2px] bg-live" />
      </span>
    )
  const icon = e.type === 'substitution' ? 'sync' : e.type === 'var' ? 'live_tv' : e.type === 'penalty_missed' ? 'clear' : 'sports_soccer'
  const color = e.type === 'substitution' ? 'text-win' : e.type === 'penalty_missed' ? 'text-live' : 'text-white'
  return <span className={`material-symbols-outlined text-[17px] ${color}`}>{icon}</span>
}

function Details({ match }: { match: Match }) {
  const { locale } = useLanguage()
  const ar = locale === 'ar'
  const events = useMemo(() => [...(match.events || [])].filter(Boolean).sort((a, b) => a.minute - b.minute), [match.events])
  const ht = match.score?.halftime
  const finished = isFinished(match)

  const divider = (label: string) => (
    <li className="flex items-center gap-3 py-2">
      <span className="flex-1 h-px bg-white/10" />
      <span className="text-[11px] font-bold tracking-wider text-white/55 px-2.5 h-6 inline-flex items-center rounded-full bg-white/[0.07]">{label}</span>
      <span className="flex-1 h-px bg-white/10" />
    </li>
  )

  const rows: React.ReactNode[] = []
  let htShown = false
  events.forEach((e) => {
    if (!htShown && e.minute > 45 && ht && ht.home !== null) {
      rows.push(<div key="ht">{divider(`HT ${ht.home} - ${ht.away}`)}</div>)
      htShown = true
    }
    const home = e.team === 'home'
    const isGoal = e.type === 'goal' || e.type === 'penalty_scored'
    rows.push(
      <li key={e.id} className={`flex items-center gap-3 py-1.5 ${home ? '' : 'flex-row-reverse text-end'}`}>
        <span className={`w-10 shrink-0 text-[12px] font-bold tabular-nums ${isGoal ? 'text-accent-cyan' : 'text-white/55'} ${home ? 'text-start' : 'text-end'}`}>
          {e.minute}
          {e.extraMinute ? `+${e.extraMinute}` : ''}&apos;
        </span>
        <span className="w-6 shrink-0 flex justify-center"><EventIcon e={e} /></span>
        <span className="min-w-0">
          <span className={`block truncate text-[13.5px] ${isGoal ? 'font-semibold text-white' : 'text-white/85'}`}>{e.playerName}</span>
          {(e.playerNameSecondary || e.detail) && (
            <span className="block truncate text-[11.5px] text-white/45">
              {e.type === 'substitution' && e.playerNameSecondary ? `↔ ${e.playerNameSecondary}` : e.detail}
            </span>
          )}
        </span>
      </li>
    )
  })
  if (!htShown && events.length && ht && ht.home !== null && (finished || (match.minute ?? 0) > 45)) {
    rows.push(<div key="ht-end">{divider(`HT ${ht.home} - ${ht.away}`)}</div>)
  }
  if (finished) rows.push(<div key="ft">{divider(`FT ${match.score?.home ?? 0} - ${match.score?.away ?? 0}`)}</div>)

  const info = [
    { icon: 'stadium', label: ar ? 'الملعب' : 'Venue', value: match.venue },
    { icon: 'sports', label: ar ? 'الحكم' : 'Referee', value: match.referee },
    { icon: 'emoji_events', label: ar ? 'الجولة' : 'Round', value: match.round },
  ].filter((i) => i.value)

  return (
    <div className="space-y-4">
      {events.length > 0 ? (
        <ul className="space-y-0.5">{rows}</ul>
      ) : (
        <p className="py-6 text-center text-[13px] text-white/45">
          {match.status === 'scheduled' ? (ar ? 'لم تبدأ المباراة بعد' : 'Kick-off hasn’t happened yet.') : ar ? 'لا توجد أحداث' : 'No incidents yet.'}
        </p>
      )}
      {info.length > 0 && (
        <dl className="rounded-2xl bg-white/[0.04] border gl-hairline divide-y divide-white/[0.06]">
          {info.map((i) => (
            <div key={i.label} className="flex items-center gap-3 px-3.5 h-11">
              <span className="material-symbols-outlined text-[18px] text-white/45">{i.icon}</span>
              <dt className="text-[12.5px] text-white/50">{i.label}</dt>
              <dd className="ms-auto text-[13px] font-medium text-white truncate">{i.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/* ─────────────────────────── Stats tab ─────────────────────────── */

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
    <div className="space-y-4">
      {s.possession && (
        <div>
          <p className="text-center text-[12px] font-semibold text-white/60 mb-2">{ar ? 'الاستحواذ' : 'Ball possession'}</p>
          <div className="flex h-8 rounded-full overflow-hidden text-[12.5px] font-bold">
            <span className="stat-bar-home flex items-center ps-3 text-white" style={{ width: `${s.possession.home}%` }}>{s.possession.home}%</span>
            <span className="stat-bar-away flex items-center justify-end pe-3 text-white" style={{ width: `${s.possession.away}%` }}>{s.possession.away}%</span>
          </div>
        </div>
      )}
      <ul className="space-y-3.5">
        {rows.map((r) => {
          const total = r.v.home + r.v.away || 1
          const homeLeads = r.v.home > r.v.away
          const awayLeads = r.v.away > r.v.home
          return (
            <li key={r.label}>
              <div className="flex items-center justify-between text-[13px] mb-1.5">
                <span className={`tabular-nums font-bold px-2 rounded-full ${homeLeads ? 'bg-accent-cyan/20 text-white' : 'text-white/70'}`}>{fmt(r.v.home, r)}</span>
                <span className="text-white/55 text-[12.5px]">{r.label}</span>
                <span className={`tabular-nums font-bold px-2 rounded-full ${awayLeads ? 'bg-accent-violet/25 text-white' : 'text-white/70'}`}>{fmt(r.v.away, r)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden flex justify-end">
                  <span className="stat-bar-home h-full rounded-full" style={{ width: `${(r.v.home / total) * 100}%` }} />
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                  <span className="stat-bar-away block h-full rounded-full" style={{ width: `${(r.v.away / total) * 100}%` }} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ─────────────────────────── Lineups tab ─────────────────────────── */

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

  // Home attacks upward from the bottom half; away mirrored in the top half
  const dot = (p: LineupPlayer, side: 'home' | 'away') => {
    const x = side === 'home' ? p.positionX : 100 - p.positionX
    const y = side === 'home' ? 50 + (p.positionY / 100) * 48 : 50 - (p.positionY / 100) * 48
    return (
      <span key={`${side}-${p.id}`} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 w-16" style={{ left: `${x}%`, top: `${y}%` }}>
        <span
          className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white border border-white/40 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.6)] ${
            side === 'home' ? 'bg-gradient-to-br from-[#38E1FF] to-[#5562F0]' : 'bg-gradient-to-br from-[#B072FF] to-[#FF4DA0]'
          }`}
        >
          {p.number}
          {typeof p.rating === 'number' && (
            <span className={`absolute -top-1.5 -end-3 px-1 rounded text-[9px] font-bold text-white ${p.rating >= 7.5 ? 'bg-win' : p.rating >= 6.5 ? 'bg-[#F59E0B]' : 'bg-live'}`}>
              {p.rating.toFixed(1)}
            </span>
          )}
        </span>
        <span className="text-[10px] font-semibold text-white leading-none truncate max-w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{shortName(p.name)}</span>
      </span>
    )
  }

  const bench = (xs: LineupPlayer[] | undefined) =>
    (xs || []).slice(0, 7).map((p) => (
      <li key={p.id} className="flex items-center gap-2 h-7 text-[12.5px] text-white/80">
        <span className="w-5 text-end tabular-nums text-white/45">{p.number}</span>
        <span className="truncate">{p.name}</span>
      </li>
    ))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[12.5px] font-semibold">
        <span className="text-white">{match.homeTeam?.name} <span className="text-white/50">{home.formation}</span></span>
        <span className="text-white">{away.formation && <span className="text-white/50">{away.formation} </span>}{match.awayTeam?.name}</span>
      </div>
      <div className="gl-pitch relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
        {awayXI.map((p) => dot(p, 'away'))}
        {homeXI.map((p) => dot(p, 'home'))}
      </div>
      {(home.substitutes?.length || away.substitutes?.length) ? (
        <div>
          <p className="gl-eyebrow mb-2">{ar ? 'البدلاء' : 'Substitutes'}</p>
          <div className="grid grid-cols-2 gap-4">
            <ul>{bench(home.substitutes || home.bench)}</ul>
            <ul>{bench(away.substitutes || away.bench)}</ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
