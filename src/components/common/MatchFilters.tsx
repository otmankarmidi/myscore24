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
    <div className="bg-white dark:bg-[#0c121e] rounded-xl border border-[#E5E5E5] dark:border-[#182335] px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#080d16] p-1 rounded-lg border border-[#E5E5E5] dark:border-[#182335]">
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
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40'
                    : 'bg-[#6425A6] text-white shadow-xs dark:bg-[#152033] dark:border dark:border-[#273852]'
                  : 'text-[#6B7280] dark:text-slate-400 hover:text-[#6425A6] dark:hover:text-white hover:bg-[#F3ECFA] dark:hover:bg-[#101826]'
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
              <span className={`text-[11px] font-bold tabular-nums ${
                isActive
                  ? isLive
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-purple-200 dark:text-amber-400'
                  : 'text-[#9CA3AF] dark:text-slate-500'
              }`}>
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
              ? 'bg-[#F3ECFA] text-[#6425A6] border-[#6425A6]/30 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/30'
              : 'bg-[#F9FAFB] dark:bg-[#101826] text-[#6B7280] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white border-[#E5E5E5] dark:border-[#182335]'
          }`}
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className={oddsOn ? 'text-[#6425A6] dark:text-amber-400' : 'text-[#171717] dark:text-slate-200'}>{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-7 px-2.5 rounded-lg font-geist text-[11px] font-bold uppercase flex items-center gap-1.5 transition-all border ${
            soundOn
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
              : 'bg-[#F9FAFB] dark:bg-[#101826] text-[#6B7280] dark:text-slate-400 hover:text-[#171717] dark:hover:text-white border-[#E5E5E5] dark:border-[#182335]'
          }`}
          aria-pressed={soundOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {soundOn ? 'volume_up' : 'volume_off'}
          </span>
          <span>{t('common.sound', 'Sound')}: <strong className={soundOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#171717] dark:text-slate-300'}>{soundOn ? onText : offText}</strong></span>
        </button>
      </div>
    </div>
  )
}
