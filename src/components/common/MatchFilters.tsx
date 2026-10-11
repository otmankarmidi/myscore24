'use client'

import { useLanguage } from '@/context/LanguageContext'

type Filter = 'all' | 'live' | 'upcoming' | 'finished'

interface MatchFiltersProps {
  activeFilter: Filter
  onFilterChange: (f: Filter) => void
  counts: { all: number; live: number; upcoming: number; finished: number }
  soundOn: boolean
  oddsOn?: boolean
  onToggleSound: () => void
  onToggleOdds?: () => void
}

export default function MatchFilters({
  activeFilter,
  onFilterChange,
  counts,
  soundOn,
  oddsOn = false,
  onToggleSound,
  onToggleOdds,
}: MatchFiltersProps) {
  const { t } = useLanguage()

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all',      label: t('filters.all', 'All') },
    { key: 'live',     label: t('filters.live', 'Live') },
    { key: 'upcoming', label: t('filters.upcoming', 'Upcoming') },
    { key: 'finished', label: t('filters.finished', 'Finished') },
  ]

  const onText = t('common.on', 'ON')
  const offText = t('common.off', 'OFF')

  return (
    <div className="bg-[#0a101d] rounded-xl border border-[#162236] px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-md">
      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-[#060b14] p-1 rounded-lg border border-[#141e30]">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const isLive = tab.key === 'live'

          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3 py-1.5 rounded-md font-geist text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? isLive
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                    : 'bg-[#152033] text-white border border-[#273852] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1726]/60'
              }`}
              aria-pressed={isActive}
            >
              {isLive && (
                <span className="inline-flex relative">
                  <span
                    className="absolute inline-flex h-2 w-2 rounded-full bg-rose-500 opacity-75 animate-ping"
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
              <span>{tab.label}</span>
              <span className={`text-[11px] font-bold tabular-nums ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                ({counts[tab.key]})
              </span>
            </button>
          )
        })}
      </div>

      {/* Quick toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleOdds}
          className={`h-7 px-2.5 rounded-lg font-geist text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all border ${
            oddsOn
              ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
              : 'bg-[#0e1626] text-slate-400 hover:text-slate-200 border-[#1c2940]'
          }`}
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className={oddsOn ? 'text-amber-400' : 'text-slate-300'}>{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-7 px-2.5 rounded-lg font-geist text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all border ${
            soundOn
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-[#0e1626] text-slate-400 hover:text-slate-200 border-[#1c2940]'
          }`}
          aria-pressed={soundOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {soundOn ? 'volume_up' : 'volume_off'}
          </span>
          <span>{t('common.sound', 'Sound')}: <strong className={soundOn ? 'text-emerald-400' : 'text-slate-300'}>{soundOn ? onText : offText}</strong></span>
        </button>
      </div>
    </div>
  )
}
