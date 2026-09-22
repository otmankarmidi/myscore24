'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface TimezoneOption {
  value: string
  label: string
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'auto', label: 'Automatic (Browser)' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (GMT+1)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1/GMT+2)' },
  { value: 'America/New_York', label: 'America/New_York (EDT/EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PDT/PST)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
]

const STORAGE_KEY = 'myscore24_timezone_preference'

interface TimezoneContextType {
  selectedTimezone: string // 'auto' or explicit IANA string
  activeTimezone: string   // resolved IANA string (e.g. 'Africa/Casablanca')
  setTimezonePreference: (tz: string) => void
  isHydrated: boolean
}

const TimezoneContext = createContext<TimezoneContextType>({
  selectedTimezone: 'auto',
  activeTimezone: 'UTC',
  setTimezonePreference: () => {},
  isHydrated: false,
})

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [selectedTimezone, setSelectedTimezone] = useState<string>('auto')
  const [activeTimezone, setActiveTimezone] = useState<string>('UTC')
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  const resolveTimezone = useCallback((setting: string): string => {
    if (setting !== 'auto') return setting
    try {
      if (typeof window !== 'undefined' && typeof Intl !== 'undefined') {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      }
    } catch {}
    return 'UTC'
  }, [])

  useEffect(() => {
    let pref = 'auto'
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) pref = stored
    } catch {}

    setSelectedTimezone(pref)
    setActiveTimezone(resolveTimezone(pref))
    setIsHydrated(true)
  }, [resolveTimezone])

  const setTimezonePreference = useCallback((tz: string) => {
    setSelectedTimezone(tz)
    setActiveTimezone(resolveTimezone(tz))
    try {
      localStorage.setItem(STORAGE_KEY, tz)
    } catch {}
  }, [resolveTimezone])

  return (
    <TimezoneContext.Provider
      value={{
        selectedTimezone,
        activeTimezone,
        setTimezonePreference,
        isHydrated,
      }}
    >
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  return useContext(TimezoneContext)
}
