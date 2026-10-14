'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone, TIMEZONE_OPTIONS } from '@/context/TimezoneContext'
import { usePwaInstall } from '@/hooks/usePwaInstall'
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
  const { isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions, triggerInstall } = usePwaInstall()
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setShowIOSInstructions(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, setShowIOSInstructions])

  if (!isOpen) return null

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      await triggerInstall()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c121e] border-t sm:border border-[#E5E5E5] dark:border-[#182335] rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto space-y-4 text-[#171717] dark:text-slate-100 z-10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {/* Header Drag Bar / Close */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6425A6]">tune</span>
            <h3 className="font-bold text-sm font-geist text-[#171717] dark:text-white">{t('common.more', 'Settings & Options')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-slate-800 hover:bg-[#F3ECFA] text-[#171717] dark:text-slate-200 flex items-center justify-center active:scale-95 transition-colors min-w-[36px] min-h-[36px] border border-[#E5E5E5] dark:border-slate-700"
            aria-label={t('common.close', 'Close settings')}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* PWA Install Button (Hidden if already installed in standalone mode) */}
        {!isInstalled && (
          <div className="p-3 rounded-xl bg-[#F9FAFB] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0c121e] border border-[#E5E5E5] dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  <img src="/icons/icon-192x192.png" alt="MyScore24" className="w-7 h-7 object-contain" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#171717] dark:text-white truncate">MyScore24 App</h4>
                  <p className="text-[11px] text-[#6B7280] dark:text-slate-400 truncate">
                    Install for fast, fullscreen scores
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="py-2 px-3.5 rounded-lg bg-[#6425A6] text-white font-geist font-bold text-xs hover:bg-[#521c85] active:scale-95 transition-all shadow-md shrink-0 flex items-center gap-1.5 min-h-[36px]"
              >
                <span className="material-symbols-outlined text-sm">
                  {isIOS ? 'add_box' : 'download'}
                </span>
                <span>Install</span>
              </button>
            </div>

            {/* iOS Safari Instructions Accordion/Card */}
            {showIOSInstructions && isIOS && (
              <div className="p-3 rounded-lg bg-white dark:bg-[#0c121e] border border-[#E5E5E5] dark:border-slate-800 text-xs space-y-2 animate-fade-in text-[#6B7280] dark:text-slate-400">
                <p className="font-bold text-[#6425A6] text-[11px] uppercase tracking-wider">
                  How to install on iPhone &amp; iPad:
                </p>
                <ol className="space-y-1.5 pl-4 list-decimal text-[11px]">
                  <li>
                    Tap the <strong>Share</strong> button <span className="font-mono text-[#6425A6]">[↑]</span> at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong> <span className="material-symbols-outlined text-xs align-middle">add_box</span>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top-right corner.
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* 1. Language Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6425A6] block">
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
                    ? 'bg-[#F3ECFA] text-[#6425A6] border-[#6425A6] font-bold shadow-xs'
                    : 'bg-[#F5F5F5] dark:bg-[#121a29] border-[#E5E5E5] dark:border-[#1b263b] text-[#171717] dark:text-slate-200 hover:text-[#6425A6]'
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
          <label className="text-xs font-bold uppercase tracking-wider text-[#6425A6] block">
            {t('common.displayTimezone', 'Timezone Preference')}
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setTimezonePreference(e.target.value)}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F5] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] text-[#171717] dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-[#6425A6] min-h-[44px]"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.value === 'auto' ? `Auto (${t('common.timezoneAuto', 'Browser Default')})` : tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Actions: Notifications */}
        <div className="pt-2 border-t border-[#E5E5E5] dark:border-slate-800">
          <button
            onClick={() => {
              onClose()
              onOpenNotifications()
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F5] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] text-[#171717] dark:text-white hover:bg-[#F3ECFA] flex items-center justify-center gap-2 text-xs font-semibold min-h-[44px] touch-manipulation"
          >
            <span className="material-symbols-outlined text-[18px] text-[#6425A6]">notifications</span>
            <span>{t('common.notifications', 'Match Alerts')}</span>
          </button>
        </div>

        {/* Quick Links / Extras */}
        <div className="pt-2 border-t border-[#E5E5E5] dark:border-slate-800 space-y-1">
          <Link
            href="/fantasy"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] hover:bg-[#F3ECFA] flex items-center justify-between text-xs font-bold text-[#171717] dark:text-white min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-500">sports_soccer</span>
              <span>{locale === 'ar' ? 'فانتازي بريميرليغ' : 'Fantasy Football (PL)'}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">100M</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#6B7280]">chevron_right</span>
          </Link>

          <Link
            href="/news"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] hover:bg-[#F3ECFA] flex items-center justify-between text-xs font-medium text-[#171717] dark:text-slate-200 min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6425A6]">newspaper</span>
              <span>{t('nav.news', 'Football News')}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#6B7280]">chevron_right</span>
          </Link>

          <Link
            href="/privacy-policy"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-[#F5F5F5] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] hover:bg-[#F3ECFA] flex items-center justify-between text-xs font-medium text-[#171717] dark:text-slate-200 min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6B7280]">shield</span>
              <span>{t('nav.privacy', 'Privacy & Terms')}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#6B7280]">chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
