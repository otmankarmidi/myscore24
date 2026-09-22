'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Standing } from '@/types/standing'
import TeamLogo from '@/components/common/TeamLogo'
import { useLanguage } from '@/context/LanguageContext'

interface StandingsTableProps {
  standings: Standing[]
  currentTeamId?: string
  showFullTable?: boolean
}

type StandingsView = 'all' | 'home' | 'away'

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  let bgClass = 'bg-surface-bright text-on-surface-variant'
  if (result === 'W') bgClass = 'bg-emerald-500 text-slate-950 font-bold'
  if (result === 'L') bgClass = 'bg-rose-500 text-white font-bold'
  if (result === 'D') bgClass = 'bg-slate-500 text-white font-bold'

  return (
    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${bgClass}`}>
      {result}
    </span>
  )
}

function getZoneColor(rank: number, total: number) {
  if (rank <= 4) return 'bg-emerald-500'
  if (rank === 5) return 'bg-sky-500'
  if (rank === 6) return 'bg-amber-500'
  if (rank > total - 3) return 'bg-rose-500'
  return 'bg-transparent'
}

export default function StandingsTable({ standings, currentTeamId, showFullTable = true }: StandingsTableProps) {
  const { t } = useLanguage()
  const [viewMode, setViewMode] = useState<StandingsView>('all')

  const baseItems = showFullTable ? standings : standings.slice(0, 5)

  // Sort/transform items based on view mode (Overall, Home, Away)
  const displayItems = [...baseItems].map((item) => {
    if (viewMode === 'home' && item.home) {
      return {
        ...item,
        played: item.home.played ?? item.played,
        won: item.home.won ?? item.won,
        drawn: item.home.drawn ?? item.drawn,
        lost: item.home.lost ?? item.lost,
        goalsFor: item.home.goalsFor ?? item.goalsFor,
        goalsAgainst: item.home.goalsAgainst ?? item.goalsAgainst,
        goalDifference: (item.home.goalsFor ?? item.goalsFor) - (item.home.goalsAgainst ?? item.goalsAgainst),
        points: item.home.points ?? item.won * 3 + item.drawn,
      }
    }
    if (viewMode === 'away' && item.away) {
      return {
        ...item,
        played: item.away.played ?? item.played,
        won: item.away.won ?? item.won,
        drawn: item.away.drawn ?? item.drawn,
        lost: item.away.lost ?? item.lost,
        goalsFor: item.away.goalsFor ?? item.goalsFor,
        goalsAgainst: item.away.goalsAgainst ?? item.goalsAgainst,
        goalDifference: (item.away.goalsFor ?? item.goalsFor) - (item.away.goalsAgainst ?? item.goalsAgainst),
        points: item.away.points ?? item.won * 3 + item.drawn,
      }
    }
    return item
  })

  if (viewMode !== 'all') {
    displayItems.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
  }

  return (
    <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden">
      {/* Sub-Header Tabs for Overall / Home / Away */}
      {showFullTable && (
        <div className="flex items-center gap-1 p-2 bg-surface-container-high/60 border-b border-surface-bright">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              viewMode === 'all'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setViewMode('home')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              viewMode === 'home'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setViewMode('away')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              viewMode === 'away'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            Away
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-b border-surface-bright text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="py-2.5 px-3 text-center w-10">{t('standings.columns.position', '#')}</th>
              <th className="py-2.5 px-3">{t('standings.columns.team', 'Team')}</th>
              <th className="py-2.5 px-2 text-center">{t('standings.columns.played', 'MP')}</th>
              <th className="py-2.5 px-2 text-center">{t('standings.columns.won', 'W')}</th>
              <th className="py-2.5 px-2 text-center">{t('standings.columns.drawn', 'D')}</th>
              <th className="py-2.5 px-2 text-center">{t('standings.columns.lost', 'L')}</th>
              <th className="py-2.5 px-2 text-center hidden md:table-cell">{t('standings.columns.goalsFor', 'GF')}</th>
              <th className="py-2.5 px-2 text-center hidden md:table-cell">{t('standings.columns.goalsAgainst', 'GA')}</th>
              <th className="py-2.5 px-2 text-center">{t('standings.columns.goalDifference', 'GD')}</th>
              <th className="py-2.5 px-3 text-center font-extrabold text-on-surface">{t('standings.columns.points', 'Pts')}</th>
              <th className="py-2.5 px-3 text-center hidden lg:table-cell">{t('standings.columns.form', 'Form')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-bright/60 text-body-sm font-geist">
            {displayItems.map((item, index) => {
              const rank = item.rank ?? item.position ?? index + 1
              const teamId = item.teamId || item.team?.id || `team-${index}`
              const teamName = item.teamName || item.team?.name || 'Team'
              const teamSlug = item.teamId || item.team?.id || item.teamSlug || item.team?.slug || 'team'
              const teamLogo = item.teamLogo || item.team?.logo
              const isCurrent = currentTeamId === teamId
              const zoneBg = getZoneColor(rank, standings.length)
              const formList = item.form || ['W', 'D', 'W', 'W', 'D']

              return (
                <tr
                  key={teamId}
                  className={`hover:bg-surface-container-high/40 transition-colors ${
                    isCurrent ? 'bg-primary/10 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center relative font-mono text-xs text-on-surface-variant">
                    <span className={`absolute left-0 rtl:left-auto rtl:right-0 top-1 bottom-1 w-1 rounded-r rtl:rounded-l ${zoneBg}`} />
                    {rank}
                  </td>

                  <td className="py-2.5 px-3">
                    <Link href={`/team/${teamSlug}`} className="flex items-center gap-2.5 hover:underline group">
                      <TeamLogo name={teamName} abbreviation={teamName.slice(0, 3)} logo={teamLogo} size="xs" />
                      <span className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {teamName}
                      </span>
                    </Link>
                  </td>

                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface">{item.played}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant">{item.won}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant">{item.drawn}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant">{item.lost}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant hidden md:table-cell">{item.goalsFor}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant hidden md:table-cell">{item.goalsAgainst}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-xs tabular-nums text-on-surface-variant">
                    {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-sm text-primary tabular-nums">
                    {item.points}
                  </td>

                  <td className="py-2.5 px-3 hidden lg:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {formList.map((res, i) => (
                        <FormDot key={i} result={(res.toUpperCase() as 'W' | 'D' | 'L') || 'D'} />
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showFullTable && (
        <div className="p-3 bg-surface-container-high/40 border-t border-surface-bright flex flex-wrap gap-4 text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Champions League (1 - 4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
            <span>Europa League (5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span>Conference League (6)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span>Relegation Zone</span>
          </div>
        </div>
      )}
    </div>
  )
}

