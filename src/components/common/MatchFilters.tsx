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
    <div className="bg-surface-container-low rounded-lg border border-surface-bright/70 px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-xs">
      {/* Status tabs */}
      <div className="flex items-center gap-0.5 bg-surface-container-lowest p-0.5 rounded-md">
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key
          const isLive = tab.key === 'live'

          const activeClasses = isLive
            ? 'bg-error-container text-on-error-container font-bold shadow-xs'
            : 'filter-tab-active shadow-xs'

          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`filter-tab ${isActive ? activeClasses : ''}`}
              aria-pressed={isActive}
            >
              {isLive && (
                <span className="inline-flex relative mr-1.5 rtl:mr-0 rtl:ml-1.5">
                  <span
                    className="live-pulse-ring absolute inline-flex h-2 w-2 rounded-full bg-error opacity-75"
                    style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
                </span>
              )}
              {tab.label}{' '}
              <span className="font-geist text-[10px] font-semibold tabular-nums opacity-75">
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
          className="h-6 px-2 rounded-md bg-surface-container-high hover:bg-surface-container font-geist text-[10px] font-bold uppercase text-outline hover:text-on-surface flex items-center gap-1 transition-colors border border-surface-bright/40"
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className="text-on-surface">{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-6 px-2 rounded-md hover:bg-surface-container font-geist text-[10px] font-bold uppercase flex items-center gap-1 transition-colors border border-surface-bright/40 ${soundOn ? 'bg-surface-container-high text-primary' : 'bg-surface-container-high text-outline hover:text-on-surface'}`}
          aria-pressed={soundOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
            {soundOn ? 'volume_up' : 'volume_off'}
          </span>
          <span>{t('common.sound', 'Sound')}: <strong className={soundOn ? 'text-primary' : 'text-outline'}>{soundOn ? onText : offText}</strong></span>
        </button>
      </div>
    </div>
  )
}
