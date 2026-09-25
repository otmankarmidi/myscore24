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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function syncWebPushSubscription(matchId: string, action: 'subscribe' | 'unsubscribe') {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return
  }

  try {
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()

    if (action === 'subscribe') {
      if (!sub) {
        // Fetch public VAPID key from API
        const keyRes = await fetch('/api/notifications/subscribe')
        if (!keyRes.ok) return
        const { publicKey } = await keyRes.json()
        if (!publicKey) return

        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
        })
      }

      if (sub) {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            matchId,
            action: 'subscribe',
          }),
        })
      }
    } else {
      if (sub) {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            matchId,
            action: 'unsubscribe',
          }),
        })
      }
    }
  } catch (err) {
    console.warn('[WebPush] Error synchronizing background push subscription:', err)
  }
}

export function useMatchNotifications() {
  const [notifiedMatches, setNotifiedMatches] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [pushSupported, setPushSupported] = useState<boolean>(false)

  useEffect(() => {
    setNotifiedMatches(loadNotifiedMatches())

    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermission(Notification.permission)
      } else {
        setPermission('unsupported')
      }

      const hasPush = 'serviceWorker' in navigator && 'PushManager' in window
      setPushSupported(hasPush)

      // Register background Service Worker for mobile & desktop Web Push
      if (hasPush) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('[ServiceWorker] Registration failed:', err)
        })
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
        if (typeof window !== 'undefined' && 'Notification' in window) {
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

        // Asynchronously sync background Web Push so alerts work when browser is closed / user is in another app
        syncWebPushSubscription(idStr, 'subscribe').catch(() => {})

        return true
      } else {
        // Turning OFF notification
        const next = current.filter((id) => id !== idStr)
        saveNotifiedMatches(next)
        setNotifiedMatches(next)

        // Asynchronously unregister from Web Push
        syncWebPushSubscription(idStr, 'unsubscribe').catch(() => {})

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
    pushSupported,
    requestPermission,
  }
}
