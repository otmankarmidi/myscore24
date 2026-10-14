'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminFantasyPage() {
  const [gameweeks, setGameweeks] = useState<any[]>([])
  const [selectedGw, setSelectedGw] = useState<number>(7)
  const [loading, setLoading] = useState(true)
  const [operating, setOperating] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchGameweeks = () => {
    fetch('/api/fantasy/gameweeks')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.gameweeks) {
          setGameweeks(data.gameweeks)
          if (data.currentGameweek) {
            setSelectedGw(data.currentGameweek.gameweekNumber)
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGameweeks()
  }, [])

  const executeAction = async (action: string) => {
    setOperating(true)
    setResultMessage(null)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/admin/fantasy/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, gameweekNumber: selectedGw }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error || 'Operation failed.')
      } else {
        setResultMessage(data.message)
        fetchGameweeks()
      }
    } catch {
      setErrorMessage('Network or server error.')
    } finally {
      setOperating(false)
    }
  }

  const activeGwObj = gameweeks.find((g) => g.gameweekNumber === selectedGw)

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs text-slate-400 hover:text-white">
                Admin
              </Link>
              <span className="text-xs text-slate-600">/</span>
              <span className="text-xs text-emerald-400 font-bold">Fantasy Management</span>
            </div>
            <h1 className="text-xl font-black text-white mt-1">Fantasy Premier League Admin</h1>
          </div>

          <Link
            href="/fantasy"
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Open Fantasy Portal</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>

        {/* Feedback Messages */}
        {resultMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            {resultMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Gameweek to Manage
              </label>
              <select
                value={selectedGw}
                onChange={(e) => setSelectedGw(parseInt(e.target.value, 10))}
                className="bg-[#1b253b] border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none"
              >
                {gameweeks.map((gw) => (
                  <option key={gw.id} value={gw.gameweekNumber}>
                    {gw.name} ({gw.status}) {gw.isCurrent ? '★ CURRENT' : ''}
                  </option>
                ))}
              </select>
            </div>

            {activeGwObj && (
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Status</span>
                <span className="text-sm font-black text-emerald-400 uppercase">
                  {activeGwObj.status} {activeGwObj.isCurrent ? '• Active' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <button
              onClick={() => executeAction('LOCK_GAMEWEEK')}
              disabled={operating}
              className="p-4 rounded-xl bg-[#151d2e] border border-white/10 hover:border-amber-400/50 hover:bg-[#1a253a] disabled:opacity-40 text-left transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-amber-400 text-xl block mb-2 group-hover:scale-110 transition-transform">
                lock
              </span>
              <span className="font-bold text-white text-xs block mb-1">1. Lock Gameweek</span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Locks team changes and captures frozen squad snapshots.
              </span>
            </button>

            <button
              onClick={() => executeAction('CALCULATE_POINTS')}
              disabled={operating}
              className="p-4 rounded-xl bg-[#151d2e] border border-white/10 hover:border-emerald-400/50 hover:bg-[#1a253a] disabled:opacity-40 text-left transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-emerald-400 text-xl block mb-2 group-hover:scale-110 transition-transform">
                calculate
              </span>
              <span className="font-bold text-white text-xs block mb-1">2. Calculate Points</span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Computes match and fantasy points for all player performances.
              </span>
            </button>

            <button
              onClick={() => executeAction('FINALIZE_GAMEWEEK')}
              disabled={operating}
              className="p-4 rounded-xl bg-[#151d2e] border border-white/10 hover:border-purple-400/50 hover:bg-[#1a253a] disabled:opacity-40 text-left transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-purple-400 text-xl block mb-2 group-hover:scale-110 transition-transform">
                task_alt
              </span>
              <span className="font-bold text-white text-xs block mb-1">3. Finalize Gameweek</span>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Finalizes ranks, rolls over free transfers, and advances gameweek.
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
