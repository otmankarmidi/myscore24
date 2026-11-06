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
    <div className="apple-glass rounded-3xl px-4 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-[0_10px_35px_-5px_rgba(31,38,135,0.05)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)]">
      {/* Status tabs — Apple Segmented Control */}
      <div className="flex items-center gap-1 apple-segmented-track p-1.5 rounded-full">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const isLive = tab.key === 'live'

          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-4 py-1.5 rounded-full font-geist text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? isLive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_2px_12px_rgba(244,63,94,0.4)] scale-[1.03] font-bold'
                    : 'apple-segmented-active font-bold scale-[1.03]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
              }`}
              aria-pressed={isActive}
            >
              {isLive && (
                <span className="inline-flex relative">
                  <span
                    className="absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75 animate-ping"
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
              )}
              <span>{tab.label}</span>
              <span className={`text-[11px] font-bold tabular-nums ${
                isActive
                  ? isLive
                    ? 'text-white/90'
                    : 'text-purple-600 dark:text-purple-300'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                ({counts[tab.key]})
              </span>
            </button>
          )
        })}
      </div>

      {/* Quick toggles — Apple Glass Pill buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleOdds}
          className={`h-8 px-3.5 rounded-full font-geist text-xs font-semibold flex items-center gap-2 transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 ${
            oddsOn
              ? 'apple-glass-card border-purple-500/40 text-purple-700 dark:text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] font-bold'
              : 'apple-segmented-track text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined text-[15px]">percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className={oddsOn ? 'apple-gradient-text' : 'text-slate-900 dark:text-slate-200'}>{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-8 px-3.5 rounded-full font-geist text-xs font-semibold flex items-center gap-2 transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 ${
            soundOn
              ? 'apple-glass-card border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold'
              : 'apple-segmented-track text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
