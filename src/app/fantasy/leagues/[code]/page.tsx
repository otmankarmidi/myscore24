'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import FantasyNav from '@/components/fantasy/FantasyNav'

export default function LeagueDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const resolvedParams = use(params)
  const code = resolvedParams.code

  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/fantasy/leagues/${code}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [code])

  const handleCopyCode = () => {
    if (!data?.league?.code) return
    navigator.clipboard.writeText(data.league.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Top Banner */}
      <div className="bg-[#0f172a] border-b border-white/10 py-5 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/fantasy/leagues"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">
                {data?.league?.name || 'League Standings'}
              </h1>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{data?.league?.totalMembers || 0} Members</span>
                <span>•</span>
                <span className="font-mono text-emerald-400 font-bold uppercase">
                  Code: {data?.league?.code}
                </span>
              </div>
            </div>
          </div>

          {data?.league?.code && data.league.code !== 'GLOBAL' && (
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied Code!' : 'Copy Invite Code'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Standings Table */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              League Standings
            </h2>
            <span className="text-xs text-slate-400">Premier League 2026/27</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151d2e] text-[10px] uppercase font-bold text-slate-400 border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-4 w-14 text-center">Rank</th>
                  <th className="py-2.5 px-4">Team &amp; Manager</th>
                  <th className="py-2.5 px-4 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      Loading standings...
                    </td>
                  </tr>
                ) : !data?.standings || data.standings.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No teams in this league yet.
                    </td>
                  </tr>
                ) : (
                  data.standings.map((entry: any) => (
                    <tr key={entry.memberId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-center font-black">
                        {entry.rank === 1 ? (
                          <span className="text-yellow-400">🥇 1</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-300">🥈 2</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-600">🥉 3</span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{entry.teamName}</div>
                        <div className="text-[11px] text-slate-400">{entry.managerName}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">
                        {entry.totalPoints}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
