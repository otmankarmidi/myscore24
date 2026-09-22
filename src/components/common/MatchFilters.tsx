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
    <div className="bg-surface-container-low rounded px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
      {/* Status tabs */}
      <div className="flex items-center gap-0.5 bg-surface-container-lowest p-0.5 rounded">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`filter-tab ${activeFilter === tab.key ? 'filter-tab-active' : ''}`}
            aria-pressed={activeFilter === tab.key}
          >
            {tab.key === 'live' && (
              <span className="inline-flex relative mr-1.5 rtl:mr-0 rtl:ml-1.5">
                <span className="live-pulse-ring absolute inline-flex h-2 w-2 rounded-full bg-error opacity-75" style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
              </span>
            )}
            {tab.label}
            {' '}
            <span className="font-geist text-[10px] font-semibold tabular-nums opacity-70">
              ({counts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Quick toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleOdds}
          className="h-6 px-2 rounded bg-surface-container hover:bg-surface-container-high font-geist text-[10px] font-bold uppercase text-outline flex items-center gap-1 transition-colors"
          aria-pressed={oddsOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>percent</span>
          <span>{t('common.odds', 'Odds')}: <strong className="text-on-surface">{oddsOn ? onText : offText}</strong></span>
        </button>
        <button
          onClick={onToggleSound}
          className={`h-6 px-2 rounded hover:bg-surface-container-high font-geist text-[10px] font-bold uppercase flex items-center gap-1 transition-colors ${soundOn ? 'bg-surface-container text-primary-container' : 'bg-surface-container text-outline'}`}
          aria-pressed={soundOn}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
            {soundOn ? 'volume_up' : 'volume_off'}
          </span>
          <span>{t('common.sound', 'Sound')}: <strong className={soundOn ? 'text-on-surface' : 'text-outline'}>{soundOn ? onText : offText}</strong></span>
        </button>
      </div>
    </div>
  )
}
