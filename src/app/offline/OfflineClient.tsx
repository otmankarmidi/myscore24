'use client'

import Link from 'next/link'

export default function OfflineClient() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container border border-surface-bright/70 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container-high border border-surface-bright flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary">wifi_off</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-headline-lg font-geist font-extrabold text-on-surface">
            You&apos;re Offline
          </h1>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Live football scores, match events, and real-time updates require an active internet connection.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-bright/50 text-xs text-on-surface-variant flex items-center gap-2 justify-center">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Showing offline mode. Reconnecting automatically...</span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-geist font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>Retry Connection</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-geist font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
