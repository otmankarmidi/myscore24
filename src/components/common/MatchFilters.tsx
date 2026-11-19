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
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Status tabs — Apple Segmented Control */}
      <div className="flex items-center gap-0.5 apple-segmented-track p-1 rounded-full max-w-full overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const isLive = tab.key === 'live'

          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3.5 sm:px-4 h-8 rounded-full font-geist text-[13px] font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? isLive
                    ? 'bg-[#FF3B30] text-white shadow-[0_4px_12px_-2px_rgba(255,59,48,0.55)] font-bold'
                    : 'apple-segmented-active font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-pressed={isActive}
            >
              {isLive && (
                <span className="inline-flex relative">
                  <span
                    className={`absolute inline-flex h-1.5 w-1.5 rounded-full opacity-75 animate-ping ${isActive ? "bg-white" : "bg-[#FF3B30]"}`}
                  />
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isActive ? "bg-white" : "bg-[#FF3B30]"}`} />
                </span>
              )}
              <span>{tab.label}</span>
              <span className={`text-[11px] font-semibold tabular-nums ${
                isActive
                  ? isLive
                    ? 'text-white/90'
                    : 'text-brand-600 dark:text-brand-300'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Quick toggles — Apple Glass Pill buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleOdds}
          className={`h-9 px-3.5 rounded-full font-geist text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
            oddsOn
              ? 'apple-glass-card border-brand-500/40 text-brand-700 dark:text-brand-300 shadow-[0_0_15px_rgba(10,108,255,0.15)] font-bold'
              : 'apple-glass text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined text-[15px]">percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className={oddsOn ? 'apple-gradient-text' : 'text-slate-900 dark:text-slate-200'}>{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-9 px-3.5 rounded-full font-geist text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
            soundOn
              ? 'apple-glass-card border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold'
              : 'apple-glass text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-pressed={soundOn}
        >
          <span className="material-symbols-outlined text-[15px]">
            {soundOn ? 'volume_up' : 'volume_off'}
          </span>
          <span>{t('common.sound', 'Sound')}: <strong className={soundOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}>{soundOn ? onText : offText}</strong></span>
        </button>
      </div>
    </div>
  )
}
