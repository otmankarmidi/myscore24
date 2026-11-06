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
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Status tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-[#080C14] p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const isLive = tab.key === 'live'

          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg font-geist text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? isLive
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40'
                    : 'bg-purple-600 text-white shadow-xs dark:bg-purple-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/60'
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
                    : 'text-purple-100 dark:text-purple-200'
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                ({counts[tab.key]})
              </span>
            </button>
          )
        })}
      </div>

      {/* Quick toggles */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleOdds}
          className={`h-8 px-3 rounded-xl font-geist text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
            oddsOn
              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800'
          }`}
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined text-[15px]">percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className={oddsOn ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-slate-200'}>{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-8 px-3 rounded-xl font-geist text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
            soundOn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800'
          }`}
          aria-pressed={soundOn}
        >
          <span className="material-symbols-outlined text-[15px]">
            {soundOn ? 'volume_up' : 'volume_off'}
          </span>
          <span>{t('common.sound', 'Sound')}: <strong className={soundOn ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-200'}>{soundOn ? onText : offText}</strong></span>
        </button>
      </div>
    </div>
  )
}
