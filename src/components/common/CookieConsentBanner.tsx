'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CONSENT_STORAGE_KEY, COOKIE_SETTINGS_EVENT, updateAnalyticsConsent } from '@/lib/analytics'
import { useLanguage } from '@/context/LanguageContext'

export default function CookieConsentBanner() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const existing = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (!existing) {
        // Show banner after brief delay so it does not interfere with initial load
        const timer = setTimeout(() => setIsVisible(true), 1500)
        return () => clearTimeout(timer)
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Listen for manual trigger from Footer or Cookie Policy page
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsVisible(true)
    }
    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings)
  }, [])

  if (!isVisible) return null

  const handleAcceptAll = () => {
    updateAnalyticsConsent(true)
    setIsVisible(false)
  }

  const handleRejectOptional = () => {
    updateAnalyticsConsent(false)
    setIsVisible(false)
  }

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-surface-container-high/95 backdrop-blur-md border-t border-surface-bright shadow-2xl animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="text-xs text-on-surface-variant leading-relaxed text-center sm:text-left">
          <span className="font-semibold text-on-surface">
            {t('cookie.title', 'Cookie & Privacy Preferences:')}
          </span>{' '}
          {t(
            'cookie.description',
            'We use essential cookies for core functionality and optional Google Analytics to measure performance and improve your experience. You can choose whether to enable optional performance analytics.'
          )}{' '}
          <Link
            href="/cookie-policy"
            className="text-primary underline hover:text-primary-container transition-colors ml-1"
          >
            {t('cookie.cookiePolicy', 'Cookie Policy')}
          </Link>
          {' · '}
          <Link
            href="/privacy-policy"
            className="text-primary underline hover:text-primary-container transition-colors"
          >
            {t('cookie.privacyPolicy', 'Privacy Policy')}
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRejectOptional}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container border border-surface-bright text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            {t('cookie.essentialOnly', 'Essential Only')}
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t('cookie.acceptAll', 'Accept Analytics')}
          </button>
        </div>
      </div>
    </aside>
  )
}
