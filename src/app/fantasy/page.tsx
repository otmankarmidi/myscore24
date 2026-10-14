'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FantasyNav from '@/components/fantasy/FantasyNav'
import { useLanguage } from '@/context/LanguageContext'

interface GameweekInfo {
  id: string
  gameweekNumber: number
  name: string
  deadline: string
  status: string
  isCurrent: boolean
}

interface UserSummary {
  id: string
  email: string
  managerName: string
  teamName: string
  role?: string
  hasSquad: boolean
  squad?: {
    id: string
    totalPoints: number
    bank: number
    squadValue?: number
    freeTransfers: number
    overallRank?: number
  }
}

export default function FantasyHubPage() {
  const router = useRouter()
  const { locale } = useLanguage()
  const [currentGw, setCurrentGw] = useState<GameweekInfo | null>(null)
  const [user, setUser] = useState<UserSummary | null>(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [adminLoggingIn, setAdminLoggingIn] = useState(false)

  const fetchStatus = () => {
    // Fetch current gameweek
    fetch('/api/fantasy/gameweeks')
      .then((res) => res.json())
      .then((data) => {
        if (data.currentGameweek) {
          setCurrentGw(data.currentGameweek)
        }
      })
      .catch(() => {})

    // Fetch user status
    fetch('/api/fantasy/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})

    // Fetch top players
    fetch('/api/fantasy/players?sortBy=price&sortOrder=desc')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.players) {
          setTopPlayers(data.players.slice(0, 6))
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  // Countdown timer to deadline
  useEffect(() => {
    if (!currentGw?.deadline) return

    const deadlineTime = new Date(currentGw.deadline).getTime()

    const updateTimer = () => {
      const now = Date.now()
      const diff = Math.max(0, deadlineTime - now)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [currentGw?.deadline])

  const handleAdmin1ClickLogin = async () => {
    setAdminLoggingIn(true)
    try {
      const res = await fetch('/api/fantasy/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: 'admin@myscore24.com',
          password: 'AdminPassword2026!',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAdminLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#110114] text-slate-100 flex flex-col">
      <FantasyNav />

      {/* Hero Banner with Official FPL Plum Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#37003c] via-[#240028] to-[#110114] border-b border-[#00ff87]/20 py-12 px-4 sm:px-6 lg:px-8">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#00ff87]/20 via-[#e90052]/20 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00ff87]/15 border border-[#00ff87]/40 text-[#00ff87] text-xs font-black mb-4 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff87] animate-pulse"></span>
            <span>English Premier League 2026/27 Official Fantasy</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Fantasy Premier League
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-2xl mx-auto font-medium">
            Manage your authentic 15-man Premier League squad with £100.0M virtual budget. Compete with global managers and challenge friends in private mini-leagues.
          </p>

          {/* Gameweek Deadline & User Status Card */}
          <div className="mt-8 max-w-xl mx-auto bg-[#25012a]/90 border-2 border-[#37003c] rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <span className="text-xs font-black text-[#00ff87] uppercase tracking-wider">
                {currentGw?.name || 'Gameweek 1'} Deadline
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">
                Season 2026/27
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center my-4">
              <div className="bg-[#140017] p-3 rounded-2xl border border-white/10 shadow-inner">
                <span className="text-2xl sm:text-3xl font-black text-white block">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Days</span>
              </div>
              <div className="bg-[#140017] p-3 rounded-2xl border border-white/10 shadow-inner">
                <span className="text-2xl sm:text-3xl font-black text-white block">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Hours</span>
              </div>
              <div className="bg-[#140017] p-3 rounded-2xl border border-white/10 shadow-inner">
                <span className="text-2xl sm:text-3xl font-black text-white block">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Mins</span>
              </div>
              <div className="bg-[#140017] p-3 rounded-2xl border border-white/10 shadow-inner">
                <span className="text-2xl sm:text-3xl font-black text-[#00ff87] block">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Secs</span>
              </div>
            </div>

            {/* User State & Actions */}
            {user ? (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-3 text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Your Squad</span>
                    <h3 className="text-sm font-black text-white">{user.teamName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Points</span>
                    <div className="text-sm font-black text-[#00ff87]">
                      {user.squad?.totalPoints ?? 0} pts (Rank #{user.squad?.overallRank ?? 1})
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/fantasy/my-team"
                    className="py-2.5 px-4 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-[#37003c] font-black text-xs transition-transform hover:scale-102 flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">sports_soccer</span>
                    <span>Pick Starting XI</span>
                  </Link>
                  <Link
                    href="/fantasy/transfers"
                    className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/20 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/20"
                  >
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                    <span>Transfers ({user.squad?.freeTransfers ?? 1} Free)</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {/* 1-Click Admin Demo Button */}
                <button
                  onClick={handleAdmin1ClickLogin}
                  disabled={adminLoggingIn}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00ff87] to-[#00d46f] hover:brightness-105 text-[#37003c] font-black text-xs transition-all shadow-xl hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>
                    {adminLoggingIn
                      ? 'Logging in as Admin...'
                      : '1-Click Login as Admin (MyScore24 All-Stars)'}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                  <span>New Manager?</span>
                  <Link
                    href="/fantasy/create"
                    className="text-[#00ff87] hover:underline font-bold"
                  >
                    Register & Pick 15-Man Squad Free
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 15-Player Squad */}
          <div className="bg-[#1e0125] border-2 border-[#37003c] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#00ff87]/50 transition-colors">
            <span className="material-symbols-outlined text-3xl text-[#00ff87] mb-3 block">
              group
            </span>
            <h3 className="text-base font-black text-white mb-1.5">Official Premier League Rules</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              15 players per squad: 2 Goalkeepers, 5 Defenders, 5 Midfielders, and 3 Forwards. Select 11 starters and 4 substitutes with max 3 players per Premier League club.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Virtual Budget</span>
              <span className="font-black text-[#00ff87]">£100.0M</span>
            </div>
          </div>

          {/* Card 2: Strategic Chips */}
          <div className="bg-[#1e0125] border-2 border-[#37003c] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#00ff87]/50 transition-colors">
            <span className="material-symbols-outlined text-3xl text-[#e90052] mb-3 block">
              electric_bolt
            </span>
            <h3 className="text-base font-black text-white mb-1.5">Authentic FPL Power Chips</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Activate game-changing chips: Triple Captain (3x points for your captain), Bench Boost (all 15 players score), Free Hit (1-gameweek overhaul), and Wildcard (unlimited transfers).
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Chips Included</span>
              <span className="font-black text-[#00ff87]">4 Chips Active</span>
            </div>
          </div>

          {/* Card 3: Mini-Leagues */}
          <div className="bg-[#1e0125] border-2 border-[#37003c] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#00ff87]/50 transition-colors">
            <span className="material-symbols-outlined text-3xl text-purple-400 mb-3 block">
              emoji_events
            </span>
            <h3 className="text-base font-black text-white mb-1.5">Private & Global Mini-Leagues</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Join the official Premier League 2026/27 Global League or create private classic and head-to-head mini-leagues with unique 6-character codes for your friends.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Global League</span>
              <span className="font-black text-[#00ff87]">Automatic Entry</span>
            </div>
          </div>
        </div>

        {/* Featured Premier League Stars */}
        {topPlayers.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Official 2026/27 Premier League Stars</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff87] text-[#37003c] font-black">
                    20 Clubs
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real, active Premier League player catalogue
                </p>
              </div>
              <Link
                href="/fantasy/transfers"
                className="text-xs font-black text-[#00ff87] hover:underline flex items-center gap-1"
              >
                <span>Full Player Catalogue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-[#1e0125] border-2 border-[#37003c] rounded-2xl p-3 flex flex-col items-center text-center hover:border-[#00ff87] transition-all group shadow-lg"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#240028] border-2 border-white/20 group-hover:border-[#00ff87] transition-colors mb-2 shadow-inner">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.webName}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                        {player.position}
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-black text-white truncate max-w-full">
                    {player.webName}
                  </span>
                  <span className="text-[10px] text-[#00ff87] font-bold">
                    {player.teamShortName} • {player.position}
                  </span>
                  <span className="mt-2 text-xs font-black text-white px-2 py-0.5 rounded bg-[#37003c] border border-white/10">
                    £{player.price.toFixed(1)}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
