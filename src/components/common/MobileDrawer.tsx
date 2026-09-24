'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone, TIMEZONE_OPTIONS } from '@/context/TimezoneContext'
import { useTheme } from '@/hooks/useTheme'
import { Locale } from '@/types/common'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOpenNotifications: () => void
}

const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
]

export default function MobileDrawer({ isOpen, onClose, onOpenNotifications }: MobileDrawerProps) {
  const { locale, changeLocale, t } = useLanguage()
  const { selectedTimezone, setTimezonePreference } = useTimezone()
  const { isDark, toggle } = useTheme()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg bg-surface-container border-t sm:border border-surface-bright/50 rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto space-y-4 text-on-surface z-10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {/* Header Drag Bar / Close */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-bright/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span>
            <h3 className="font-bold text-body-md font-geist">{t('common.more', 'Settings & Options')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center active:scale-95 transition-colors min-w-[36px] min-h-[36px]"
            aria-label={t('common.close', 'Close settings')}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 1. Language Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-outline block">
            {t('common.language', 'Language')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  changeLocale(l.code)
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all min-h-[44px] touch-manipulation ${
                  locale === l.code
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-surface-container-low border-surface-bright/50 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Timezone Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-outline block">
            {t('common.displayTimezone', 'Timezone Preference')}
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setTimezonePreference(e.target.value)}
            className="w-full py-2.5 px-3 rounded-lg bg-surface-container-low border border-surface-bright/50 text-on-surface text-xs font-medium focus:outline-none focus:border-primary min-h-[44px]"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.value === 'auto' ? `Auto (${t('common.timezoneAuto', 'Browser Default')})` : tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Actions Grid: Theme, Notifications, News */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-bright/40">
          <button
            onClick={toggle}
            className="py-2.5 px-3 rounded-lg bg-surface-container-low border border-surface-bright/50 text-on-surface hover:bg-surface-container-high flex items-center gap-2 text-xs font-semibold min-h-[44px] touch-manipulation"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{isDark ? t('common.lightMode', 'Light Mode') : t('common.darkMode', 'Dark Mode')}</span>
          </button>

          <button
            onClick={() => {
              onClose()
              onOpenNotifications()
            }}
            className="py-2.5 px-3 rounded-lg bg-surface-container-low border border-surface-bright/50 text-on-surface hover:bg-surface-container-high flex items-center gap-2 text-xs font-semibold min-h-[44px] touch-manipulation"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">notifications</span>
            <span>{t('common.notifications', 'Match Alerts')}</span>
          </button>
        </div>

        {/* Quick Links / Extras */}
        <div className="pt-2 border-t border-surface-bright/40 space-y-1">
          <Link
            href="/news"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-between text-xs font-medium text-on-surface min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">newspaper</span>
              <span>{t('nav.news', 'Football News')}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          </Link>

          <Link
            href="/privacy-policy"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high flex items-center justify-between text-xs font-medium text-on-surface min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-outline">shield</span>
              <span>{t('nav.privacy', 'Privacy & Terms')}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
