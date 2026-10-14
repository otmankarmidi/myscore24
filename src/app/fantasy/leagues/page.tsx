'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FantasyNav from '@/components/fantasy/FantasyNav'

interface LeagueItem {
  id: string
  name: string
  code: string
  type: string
  isPublic: boolean
  membersCount: number
  currentRank?: number
}

interface LeaderboardEntry {
  rank: number
  managerName: string
  teamName: string
  totalPoints: number
}

export default function LeaguesPage() {
  const [userLeagues, setUserLeagues] = useState<LeagueItem[]>([])
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [leagueNameInput, setLeagueNameInput] = useState('')
  const [inviteCodeInput, setInviteCodeInput] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalSuccess, setModalSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchLeagues = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/fantasy/leagues').then((r) => r.json()),
      fetch('/api/fantasy/leagues/GLOBAL').then((r) => r.json()),
    ])
      .then(([userRes, globalRes]) => {
        if (userRes.success && userRes.leagues) {
          setUserLeagues(userRes.leagues)
        }
        if (globalRes.success && globalRes.standings) {
          setGlobalLeaderboard(globalRes.standings)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLeagues()
  }, [])

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/fantasy/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leagueNameInput }),
      })
      const data = await res.json()
      if (!res.ok) {
        setModalError(data.error || 'Failed to create league.')
      } else {
        setModalSuccess(`League "${data.league.name}" created! Code: ${data.league.code}`)
        setLeagueNameInput('')
        fetchLeagues()
        setTimeout(() => {
          setCreateModalOpen(false)
          setModalSuccess(null)
        }, 2000)
      }
    } catch {
      setModalError('Connection error.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/fantasy/leagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCodeInput }),
      })
      const data = await res.json()
      if (!res.ok) {
        setModalError(data.error || 'Failed to join league.')
      } else {
        setModalSuccess(data.message)
        setInviteCodeInput('')
        fetchLeagues()
        setTimeout(() => {
          setJoinModalOpen(false)
          setModalSuccess(null)
        }, 2000)
      }
    } catch {
      setModalError('Connection error.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Top Banner */}
      <div className="bg-[#0f172a] border-b border-white/10 py-5 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">Leagues &amp; Leaderboards</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Compete against managers worldwide and in private invitation-only leagues.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setModalError(null)
                setModalSuccess(null)
                setJoinModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">group_add</span>
              <span>Join a League</span>
            </button>

            <button
              onClick={() => {
                setModalError(null)
                setModalSuccess(null)
                setCreateModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create a League</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: My Leagues List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            My Mini-Leagues
          </h2>

          <div className="space-y-2">
            {userLeagues.length === 0 ? (
              <div className="bg-[#0f172a] border border-white/5 rounded-xl p-6 text-center text-xs text-slate-400">
                You are not in any leagues yet. Create one or enter an invite code!
              </div>
            ) : (
              userLeagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/fantasy/leagues/${league.code}`}
                  className="bg-[#0f172a] border border-white/10 hover:border-emerald-500/50 rounded-xl p-4 flex items-center justify-between transition-colors group block"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {league.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                      <span>{league.membersCount} Managers</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400 uppercase">Code: {league.code}</span>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">
                    chevron_right
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Section: Overall Leaderboard */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Overall Premier League Leaderboard
              </h2>
              <span className="text-[11px] text-slate-400">Global Standings</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">2026/27 Season</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151d2e] text-[10px] uppercase font-bold text-slate-400 border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-4">Team &amp; Manager</th>
                  <th className="py-2.5 px-4 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {globalLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No managers in the leaderboard yet.
                    </td>
                  </tr>
                ) : (
                  globalLeaderboard.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
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

      {/* Create League Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#151c2e] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create Private Mini-League</h3>
            <p className="text-xs text-slate-400 mb-4">
              A unique 6-character code will be generated to invite your friends.
            </p>

            {modalError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleCreateLeague} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  League Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Champions Circle"
                  value={leagueNameInput}
                  onChange={(e) => setLeagueNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Create League'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join League Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#151c2e] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setJoinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <h3 className="text-base font-bold text-white mb-1">Join a Mini-League</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the 6-character code provided by your league admin.
            </p>

            {modalError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleJoinLeague} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  6-Character Invite Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. ABC123"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e1422] border border-white/10 text-white font-mono text-center tracking-widest text-base placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || inviteCodeInput.length < 4}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                {submitting ? 'Joining...' : 'Join League'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
