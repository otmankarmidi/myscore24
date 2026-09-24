'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Locale } from '@/types/common'
import {
  dictionaries,
  t as resolveT,
  localeDirections,
  localeLabels,
  localeShortLabels,
  Dictionary,
} from '@/lib/i18n/dictionaries'
import { trackLanguageChange } from '@/lib/analytics'

const STORAGE_KEY = 'myscore24_locale'

interface LanguageContextType {
  locale: Locale
  direction: 'ltr' | 'rtl'
  isRTL: boolean
  label: string
  fullLabel: string
  changeLocale: (l: Locale) => void
  t: (key: string, fallback?: string) => string
  formatDate: (dateInput?: string | Date, formatPattern?: string, timeZone?: string) => string
  formatTime: (kickoff: string, timeZone?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored && (stored === 'en' || stored === 'fr' || stored === 'ar')) {
        setLocale(stored)
        applyDocumentLocale(stored)
      } else {
        applyDocumentLocale('en')
      }
    } catch {
      applyDocumentLocale('en')
    }
    setMounted(true)
  }, [])

  function applyDocumentLocale(l: Locale) {
    if (typeof document !== 'undefined') {
      const targetDir = localeDirections[l]
      if (document.documentElement.lang !== l) {
        document.documentElement.lang = l
      }
      if (document.documentElement.dir !== targetDir) {
        document.documentElement.dir = targetDir
      }
    }
  }

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {}
    applyDocumentLocale(newLocale)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('myscore24_locale_changed', { detail: newLocale }))
    }
    trackLanguageChange(newLocale)
  }, [])

  const currentDict = useMemo<Dictionary>(() => {
    return dictionaries[locale] || dictionaries.en
  }, [locale])

  const t = useCallback(
    (key: string, fallback = ''): string => {
      return resolveT(currentDict, key, fallback)
    },
    [currentDict]
  )

  const formatDateLocale = useCallback(
    (dateInput?: string | Date, formatPattern?: string, timeZone?: string): string => {
      if (!dateInput) return ''
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
      if (isNaN(date.getTime())) return ''

      const intlLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-GB'

      try {
        if (formatPattern === 'HH:mm') {
          return date.toLocaleTimeString(intlLocale, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: timeZone || undefined,
          })
        }

        if (formatPattern === 'EEEE, d MMMM yyyy HH:mm') {
          return date.toLocaleDateString(intlLocale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: timeZone || undefined,
          })
        }

        if (formatPattern === 'date-short') {
          return date.toLocaleDateString(intlLocale, {
            day: '2-digit',
            month: 'short',
            timeZone: timeZone || undefined,
          })
        }

        return date.toLocaleDateString(intlLocale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: timeZone || undefined,
        })
      } catch {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    },
    [locale]
  )

  const formatTime = useCallback(
    (kickoff: string, timeZone?: string): string => {
      return formatDateLocale(kickoff, 'HH:mm', timeZone)
    },
    [formatDateLocale]
  )

  const value = useMemo<LanguageContextType>(
    () => ({
      locale,
      direction: localeDirections[locale],
      isRTL: localeDirections[locale] === 'rtl',
      label: localeShortLabels[locale],
      fullLabel: localeLabels[locale],
      changeLocale,
      t,
      formatDate: formatDateLocale,
      formatTime,
    }),
    [locale, changeLocale, t, formatDateLocale, formatTime]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      locale: 'en' as Locale,
      direction: 'ltr' as const,
      isRTL: false,
      label: 'EN',
      fullLabel: 'English',
      changeLocale: () => {},
      t: (key: string, fallback = '') => fallback || key,
      formatDate: (d?: string | Date) => (d ? String(d) : ''),
      formatTime: (k: string) => k,
    }
  }
  return context
}
