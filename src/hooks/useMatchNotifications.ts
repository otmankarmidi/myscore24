'use client'

import { useState, useEffect, useCallback } from 'react'
import { soundAlerts } from '@/lib/soundAlerts'

const STORAGE_KEY = 'myscore24_notified_matches'
const EVENT_KEY = 'myscore24_notifications_changed'
const SOUND_KEY = 'myscore24_sound_alerts_enabled'

function loadNotifiedMatches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(String) : []
    }
  } catch {
    // ignore parsing errors
  }
  return []
}

function saveNotifiedMatches(matches: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: matches }))
    }
  } catch {
    // ignore
  }
}

export function useMatchNotifications() {
  const [notifiedMatches, setNotifiedMatches] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    setNotifiedMatches(loadNotifiedMatches())

    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermission(Notification.permission)
      } else {
        setPermission('unsupported')
      }

      const savedSound = localStorage.getItem(SOUND_KEY)
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true')
      }
    }

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setNotifiedMatches(customEvent.detail)
      } else {
        setNotifiedMatches(loadNotifiedMatches())
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setNotifiedMatches(loadNotifiedMatches())
      }
    }

    window.addEventListener(EVENT_KEY, handleCustomEvent)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(EVENT_KEY, handleCustomEvent)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported'
    }
    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      return res
    } catch {
      return 'denied'
    }
  }, [])

  const toggleMatchNotification = useCallback(
    async (matchId: string | number): Promise<boolean> => {
      const idStr = String(matchId)
      const current = loadNotifiedMatches()
      const isAlreadyNotified = current.includes(idStr)

      if (!isAlreadyNotified) {
        // Turning ON notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          try {
            const res = await Notification.requestPermission()
            setPermission(res)
          } catch {
            // ignore
          }
        }

        // Play feedback tone
        if (soundEnabled) {
          soundAlerts.playToggleSound()
        }

        const next = [...current, idStr]
        saveNotifiedMatches(next)
        setNotifiedMatches(next)
        return true
      } else {
        // Turning OFF notification
        const next = current.filter((id) => id !== idStr)
        saveNotifiedMatches(next)
        setNotifiedMatches(next)
        return false
      }
    },
    [soundEnabled]
  )

  const isMatchNotified = useCallback(
    (matchId: string | number | undefined): boolean => {
      if (!matchId) return false
      return notifiedMatches.includes(String(matchId))
    },
    [notifiedMatches]
  )

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(SOUND_KEY, String(next))
      }
      return next
    })
  }, [])

  return {
    notifiedMatches,
    isMatchNotified,
    toggleMatchNotification,
    soundEnabled,
    toggleSound,
    permission,
    requestPermission,
  }
}
