'use client'
import { generateDateRange, formatDayName, formatDayDate, isToday } from '@/lib/utils'
import { useTimezone } from '@/context/TimezoneContext'
import { useLanguage } from '@/context/LanguageContext'

interface DateSelectorProps {
  selectedDate: Date
  onDateChange?: (date: Date) => void
  onSelectDate?: (date: Date) => void
}

export default function DateSelector({ selectedDate, onDateChange, onSelectDate }: DateSelectorProps) {
  const { selectedTimezone, activeTimezone } = useTimezone()
  const { locale, t } = useLanguage()

  const handleSelect = (d: Date) => {
    onDateChange?.(d)
    onSelectDate?.(d)
  }

  const dates = generateDateRange(selectedDate, 3, 3)
  const todayLabel = t('common.today', 'TODAY')

  return (
    <div className="bg-surface-container-low rounded p-1.5 flex items-center justify-between gap-1 shadow-sm">
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0">
        {dates.map((date, i) => {
          const today = isToday(date)
          const selected = date.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={i}
              onClick={() => handleSelect(date)}
              className={`px-2.5 py-1 rounded flex flex-col items-center leading-none transition-colors shrink-0 ${
                selected
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'hover:bg-surface-container text-on-surface-variant'
              }`}
              aria-label={`Select ${formatDayDate(date, locale)}${today ? ` (${todayLabel})` : ''}`}
              aria-pressed={selected}
            >
              {today && !selected && (
                <span className="text-[9px] font-geist font-bold tracking-widest text-primary-container/80 uppercase">
                  {todayLabel}
                </span>
              )}
              {today && selected && (
                <span className="text-[9px] font-geist font-bold tracking-widest text-on-primary-container/80 uppercase">
                  {todayLabel}
                </span>
              )}
              {!today && (
                <span className="font-geist font-bold text-[10px] uppercase tracking-wider">
                  {formatDayName(date, locale)}
                </span>
              )}
              <span className={`font-geist font-bold text-[13px] tabular-nums mt-0.5 ${
                selected ? 'text-on-primary-container' : 'text-outline'
              }`}>
                {formatDayDate(date, locale)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 pl-2 rtl:pl-0 rtl:pr-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-surface-container font-geist text-[10px] text-on-surface-variant border border-surface-bright/40" title={t('common.displayTimezone', 'Active Timezone')}>
          <span className="material-symbols-outlined text-[13px] text-primary-container">schedule</span>
          <span className="font-bold truncate max-w-[90px]">
            {selectedTimezone === 'auto' ? t('common.timezoneAuto', 'Local') : activeTimezone.split('/')[1] || activeTimezone}
          </span>
        </div>
        <button
          className="w-7 h-7 rounded bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          title="Open calendar"
          aria-label="Open date picker"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
        </button>
      </div>
    </div>
  )
}
