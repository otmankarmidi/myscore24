'use client'

import { useEffect, useState } from 'react'

export default function PwaManager() {
  const [isOffline, setIsOffline] = useState(false)
  const [showOnlineToast, setShowOnlineToast] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    // 1. Initial online status
    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setShowOnlineToast(true)
      const t = setTimeout(() => setShowOnlineToast(false), 3500)
      return () => clearTimeout(t)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowOnlineToast(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 2. Service Worker Registration & Update Lifecycle
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      let refreshing = false

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // If a waiting worker is already present
          if (registration.waiting) {
            setWaitingWorker(registration.waiting)
            setUpdateAvailable(true)
          }

          // Listen for new workers entering installed (waiting) state
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setWaitingWorker(newWorker)
                setUpdateAvailable(true)
              }
            })
          })
        })
        .catch((err) => {
          console.warn('[SW Registration Error]:', err)
        })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  return (
    <>
      {/* A. Offline Warning Banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 text-slate-950 px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-sm shadow-md"
        >
          <span className="material-symbols-outlined text-sm">wifi_off</span>
          <span>You&apos;re offline — Showing previously loaded information.</span>
        </div>
      )}

      {/* B. Back Online Subtle Toast */}
      {showOnlineToast && !isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-secondary-container text-on-secondary px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Back online</span>
        </div>
      )}

      {/* C. Service Worker Update Banner */}
      {updateAvailable && (
        <div
          role="alert"
          className="fixed bottom-16 md:bottom-5 right-3 left-3 sm:left-auto sm:right-5 sm:max-w-sm z-50 bg-surface-container-highest/95 border border-primary/40 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-on-surface animate-fade-in"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary text-lg shrink-0">
              system_update
            </span>
            <div className="text-xs min-w-0 truncate">
              <p className="font-bold">Update available</p>
              <p className="text-[11px] text-on-surface-variant truncate">
                A new version of MyScore24 is ready.
              </p>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-geist font-bold text-xs hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            Update
          </button>
        </div>
      )}
    </>
  )
}
