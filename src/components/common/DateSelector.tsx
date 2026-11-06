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
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0">
        {/* Previous day arrow */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Previous day"
          aria-label="Previous day"
        >
          <span className="material-symbols-outlined text-[19px] rtl:rotate-180">chevron_left</span>
        </button>

        {dates.map((date, i) => {
          const today = isToday(date)
          const selected = date.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={i}
              onClick={() => handleSelect(date)}
              className={`px-3 py-1.5 rounded-xl flex flex-col items-center leading-tight transition-all duration-200 shrink-0 cursor-pointer ${
                selected
                  ? 'bg-purple-600 text-white shadow-xs font-bold scale-[1.02]'
                  : today
                  ? 'border border-purple-300/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label={`Select ${formatDayDate(date, locale)}${today ? ` (${todayLabel})` : ''}`}
              aria-pressed={selected}
            >
              {today && !selected && (
                <span className="text-[10px] font-geist font-extrabold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                  {todayLabel}
                </span>
              )}
              {today && selected && (
                <span className="text-[10px] font-geist font-extrabold tracking-wider text-purple-100 uppercase">
                  {todayLabel}
                </span>
              )}
              {!today && (
                <span className="font-geist font-bold text-[10px] uppercase tracking-wider">
                  {formatDayName(date, locale)}
                </span>
              )}
              <span className={`font-geist font-bold text-xs sm:text-[13px] tabular-nums mt-0.5 ${
                selected ? 'text-white' : 'text-slate-900 dark:text-slate-200'
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
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Next day"
          aria-label="Next day"
        >
          <span className="material-symbols-outlined text-[19px] rtl:rotate-180">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-2 pl-2 rtl:pl-0 rtl:pr-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-geist text-xs text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800" title={t('common.displayTimezone', 'Active Timezone')}>
          <span className="material-symbols-outlined text-[14px] text-purple-600 dark:text-purple-400">schedule</span>
          <span className="font-bold truncate max-w-[100px]">
            {selectedTimezone === 'auto' ? t('common.timezoneAuto', 'Local') : activeTimezone.split('/')[1] || activeTimezone}
          </span>
        </div>
        <button
          className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800 cursor-pointer"
          title="Open calendar"
          aria-label="Open date picker"
        >
          <span className="material-symbols-outlined text-[17px]">calendar_today</span>
        </button>
      </div>
    </div>
  )
}
