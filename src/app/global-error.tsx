'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0c1321] text-[#dce2f6] flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-[#19202e] border border-[#323949] rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#ccff80]/10 border border-[#ccff80]/20 flex items-center justify-center text-[#ccff80] text-2xl">
            ⚠️
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#dce2f6]">
              Unable to load MyScore24
            </h2>
            <p className="text-xs text-[#c2cab0]">
              A temporary issue occurred while loading the application.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-lg bg-[#ccff80] text-[#213600] text-xs font-bold hover:brightness-110 transition-all shadow-md cursor-pointer"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-lg bg-[#232a39] text-[#dce2f6] hover:bg-[#323949] text-xs font-semibold transition-colors cursor-pointer"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
