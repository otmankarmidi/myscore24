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
    <div className="apple-glass rounded-3xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-[0_10px_35px_-5px_rgba(31,38,135,0.05)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0">
        {/* Previous day arrow */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="w-8 h-8 rounded-full apple-segmented-track flex items-center justify-center text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95"
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
              className={`px-3.5 py-1.5 rounded-2xl flex flex-col items-center leading-tight transition-all duration-300 shrink-0 cursor-pointer ${
                selected
                  ? 'apple-segmented-active font-bold scale-[1.05]'
                  : today
                  ? 'apple-glass border-purple-500/40 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'hover:bg-white/50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label={`Select ${formatDayDate(date, locale)}${today ? ` (${todayLabel})` : ''}`}
              aria-pressed={selected}
            >
              {today && !selected && (
                <span className="text-[10px] font-geist font-black tracking-wider apple-gradient-text uppercase">
                  {todayLabel}
                </span>
              )}
              {today && selected && (
                <span className="text-[10px] font-geist font-black tracking-wider text-purple-600 dark:text-purple-300 uppercase">
                  {todayLabel}
                </span>
              )}
              {!today && (
                <span className="font-geist font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  {formatDayName(date, locale)}
                </span>
              )}
              <span className={`font-geist font-bold text-xs sm:text-[13px] tabular-nums mt-0.5 ${
                selected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'
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
          className="w-8 h-8 rounded-full apple-segmented-track flex items-center justify-center text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all shrink-0 cursor-pointer hover:scale-105 active:scale-95"
          title="Next day"
          aria-label="Next day"
        >
          <span className="material-symbols-outlined text-[19px] rtl:rotate-180">chevron_right</span>
        </button>
      </div>

      <div className="flex items-center gap-2 pl-2 rtl:pl-0 rtl:pr-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full apple-segmented-track font-geist text-xs text-slate-600 dark:text-slate-300" title={t('common.displayTimezone', 'Active Timezone')}>
          <span className="material-symbols-outlined text-[14px] text-purple-600 dark:text-purple-400">schedule</span>
          <span className="font-bold truncate max-w-[100px]">
            {selectedTimezone === 'auto' ? t('common.timezoneAuto', 'Local') : activeTimezone.split('/')[1] || activeTimezone}
          </span>
        </div>
        <button
          className="w-8 h-8 rounded-full apple-segmented-track flex items-center justify-center text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Open calendar"
          aria-label="Open date picker"
        >
          <span className="material-symbols-outlined text-[17px]">calendar_today</span>
        </button>
      </div>
    </div>
  )
}
