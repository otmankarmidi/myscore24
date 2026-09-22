'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container border border-surface-bright rounded-2xl p-6 text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[28px]">warning</span>
        </div>

        <div className="space-y-1">
          <h2 className="font-geist text-lg font-bold text-on-surface">
            Something went wrong
          </h2>
          <p className="font-inter text-xs text-on-surface-variant">
            We encountered a temporary problem loading match data.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-geist text-xs font-bold hover:brightness-110 transition-all shadow-md"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-geist text-xs font-semibold transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
