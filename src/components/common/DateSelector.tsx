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

  const handlePrevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    handleSelect(prev)
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    handleSelect(next)
  }

  const dates = generateDateRange(selectedDate, 3, 3)
  const todayLabel = t('common.today', 'TODAY')

  return (
    <div className="bg-surface-container-low rounded-lg border border-surface-bright/70 p-1.5 flex items-center justify-between gap-1 shadow-xs">
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0">
        {/* Previous day arrow */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="w-7 h-7 rounded-md flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors shrink-0"
          title="Previous day"
          aria-label="Previous day"
        >
          <span className="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_left</span>
        </button>

        {dates.map((date, i) => {
          const today = isToday(date)
          const selected = date.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={i}
              onClick={() => handleSelect(date)}
              className={`px-2.5 py-1 rounded-md flex flex-col items-center leading-none transition-colors shrink-0 ${
                selected
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                  : 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
              aria-label={`Select ${formatDayDate(date, locale)}${today ? ` (${todayLabel})` : ''}`}
              aria-pressed={selected}
            >
              {today && !selected && (
                <span className="text-[9px] font-geist font-bold tracking-widest text-primary uppercase">
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
                selected ? 'text-on-primary-container' : 'text-on-surface'
              }`}>
                {formatDayDate(date, locale)}
              </span>
            </button>
          )
        })}

        {/* Next day arrow */}
        <button
          type="button"
          onClick={handleNextDay}
          className="w-7 h-7 rounded-md flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors shrink-0"
          title="Next day"
          aria-label="Next day"
        >
          <span className="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 pl-2 rtl:pl-0 rtl:pr-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-surface-container-high font-geist text-[10px] text-on-surface-variant border border-surface-bright/50" title={t('common.displayTimezone', 'Active Timezone')}>
          <span className="material-symbols-outlined text-[13px] text-primary">schedule</span>
          <span className="font-bold truncate max-w-[90px]">
            {selectedTimezone === 'auto' ? t('common.timezoneAuto', 'Local') : activeTimezone.split('/')[1] || activeTimezone}
          </span>
        </div>
        <button
          className="w-7 h-7 rounded-md bg-surface-container-high flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors border border-surface-bright/40"
          title="Open calendar"
          aria-label="Open date picker"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
        </button>
      </div>
    </div>
  )
}
