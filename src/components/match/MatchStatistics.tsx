'use client'

import { MatchStatistics as Stats } from '@/types/match'
import { useLanguage } from '@/context/LanguageContext'

interface MatchStatisticsProps {
  stats: Stats
  homeTeamName: string
  awayTeamName: string
}

interface StatRowProps {
  label: string
  home: number
  away: number
  isPercent?: boolean
}

function StatRow({ label, home, away, isPercent }: StatRowProps) {
  const total = home + away || 1
  const homeWidth = Math.round((home / total) * 100)
  const awayWidth = 100 - homeWidth
  const homeLeads = home >= away

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between font-geist text-[11px]">
        <span className={`font-bold tabular-nums ${homeLeads ? 'text-primary-container' : 'text-on-surface-variant'}`}>
          {home}{isPercent ? '%' : ''}
        </span>
        <span className="text-outline text-[10px] uppercase tracking-wider font-semibold">{label}</span>
        <span className={`font-bold tabular-nums ${!homeLeads ? 'text-primary-container' : 'text-on-surface-variant'}`}>
          {away}{isPercent ? '%' : ''}
        </span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden gap-0.5">
        <div
          className="stat-bar-home rounded-full transition-all duration-700"
          style={{ width: `${homeWidth}%`, backgroundColor: homeLeads ? 'var(--color-primary-container)' : 'var(--color-surface-bright)' }}
        />
        <div
          className="stat-bar-away rounded-full transition-all duration-700"
          style={{ width: `${awayWidth}%`, backgroundColor: !homeLeads ? 'var(--color-primary-container)' : 'var(--color-surface-bright)' }}
        />
      </div>
    </div>
  )
}

export default function MatchStatistics({ stats, homeTeamName, awayTeamName }: MatchStatisticsProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-surface-container-low rounded p-4">
      <div className="flex items-center justify-between mb-4 font-geist text-[11px] font-bold uppercase tracking-wider text-outline">
        <span className="text-on-surface truncate">{homeTeamName}</span>
        <span>{t('match.stats.matchStats', 'Match Stats')}</span>
        <span className="text-on-surface truncate text-right rtl:text-left">{awayTeamName}</span>
      </div>
      <div className="flex flex-col gap-3">
        <StatRow label={t('match.stats.possession', 'Possession')} home={stats.possession.home} away={stats.possession.away} isPercent />
        <StatRow label={t('match.stats.shots', 'Shots')} home={stats.shots.home} away={stats.shots.away} />
        <StatRow label={t('match.stats.shotsOnTarget', 'On Target')} home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
        <StatRow label={t('match.stats.corners', 'Corners')} home={stats.corners.home} away={stats.corners.away} />
        <StatRow label={t('match.stats.fouls', 'Fouls')} home={stats.fouls.home} away={stats.fouls.away} />
        <StatRow label={t('match.stats.yellowCards', 'Yellow Cards')} home={stats.yellowCards.home} away={stats.yellowCards.away} />
        <StatRow label={t('match.stats.redCards', 'Red Cards')} home={stats.redCards.home} away={stats.redCards.away} />
        <StatRow label={t('match.stats.offsides', 'Offsides')} home={stats.offsides.home} away={stats.offsides.away} />
        {stats.xG && <StatRow label={t('match.stats.xG', 'xG')} home={stats.xG.home} away={stats.xG.away} />}
        {stats.passes && <StatRow label={t('match.stats.passes', 'Passes')} home={stats.passes.home} away={stats.passes.away} />}
        {stats.passAccuracy && <StatRow label={t('match.stats.passAccuracy', 'Pass Acc.')} home={stats.passAccuracy.home} away={stats.passAccuracy.away} isPercent />}
      </div>
    </div>
  )
}
