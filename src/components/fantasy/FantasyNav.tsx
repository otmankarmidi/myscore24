'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

interface UserState {
  id: string
  email: string
  managerName: string
  teamName: string
  role?: string
  hasSquad: boolean
  squad?: {
    totalPoints: number
    bank: number
    squadValue?: number
    freeTransfers: number
  }
}

export default function FantasyNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLanguage()
  const [user, setUser] = useState<UserState | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  // Auth form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [managerName, setManagerName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [authError, setAuthError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchUser = () => {
    fetch('/api/fantasy/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUser()
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/fantasy/auth/logout', { method: 'POST' })
      setUser(null)
      router.refresh()
    } catch (e) {
      console.error('Logout error:', e)
    }
  }

  const handleAuthSubmit = async (e?: React.FormEvent, customCredentials?: { login: string; pass: string }) => {
    if (e) e.preventDefault()
    setAuthError('')
    setSubmitting(true)

    try {
      const endpoint = isRegisterMode
        ? '/api/fantasy/auth/register'
        : '/api/fantasy/auth/login'

      const body = customCredentials
        ? { login: customCredentials.login, password: customCredentials.pass }
        : isRegisterMode
        ? { email, password, managerName, teamName }
        : { login: email, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed. Please verify credentials.')
      } else {
        setUser(data.user)
        setAuthModalOpen(false)
        router.refresh()
      }
    } catch {
      setAuthError('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAdminLogin = () => {
    setEmail('admin@myscore24.com')
    setPassword('AdminPassword2026!')
    setIsRegisterMode(false)
    handleAuthSubmit(undefined, {
      login: 'admin@myscore24.com',
      pass: 'AdminPassword2026!',
    })
  }

  const navLinks = [
    { href: '/fantasy', label: locale === 'ar' ? 'الرئيسية' : 'Hub', icon: 'dashboard' },
    { href: '/fantasy/my-team', label: locale === 'ar' ? 'تشكيلتي' : 'Pick Team', icon: 'sports_soccer' },
    { href: '/fantasy/transfers', label: locale === 'ar' ? 'الانتقالات' : 'Transfers', icon: 'swap_horiz' },
    { href: '/fantasy/points', label: locale === 'ar' ? 'النقاط' : 'Points', icon: 'scoreboard' },
    { href: '/fantasy/leagues', label: locale === 'ar' ? 'الدوريات' : 'Leagues', icon: 'leaderboard' },
    { href: '/fantasy/fixtures', label: locale === 'ar' ? 'المباريات' : 'Fixtures', icon: 'calendar_month' },
    { href: '/fantasy/rules', label: locale === 'ar' ? 'القوانين' : 'Rules', icon: 'help' },
  ]

  return (
    <>
      {/* Signature FPL Deep Plum Header */}
      <div className="bg-[#37003c] border-b-2 border-[#00ff87]/30 text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Title / Official FPL Badge */}
            <div className="flex items-center gap-3">
              <Link href="/fantasy" className="flex items-center gap-2 group">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00ff87] to-[#029b48] flex items-center justify-center font-black text-[#37003c] text-sm shadow-md group-hover:scale-105 transition-transform">
                  FPL
                </span>
                <div>
                  <div className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                    <span>Fantasy</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00ff87] text-[#37003c] font-black">
                      PL 2026/27
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#00ff87] text-[#37003c] shadow-md font-black'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/fantasy"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    pathname === '/admin/fantasy'
                      ? 'bg-[#e90052] text-white shadow-md'
                      : 'text-[#e90052] hover:bg-[#e90052]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* User Profile / Login Controls */}
            <div className="flex items-center gap-2.5">
              {!loading && user ? (
                <div className="flex items-center gap-2.5 bg-[#25012a] border border-white/15 px-3 py-1 rounded-xl shadow-inner">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-[#00ff87] leading-tight flex items-center gap-1 justify-end">
                      <span>{user.teamName}</span>
                      {user.role === 'ADMIN' && (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-[#e90052] text-white uppercase font-black">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      {user.squad?.totalPoints ?? 0} pts • £{user.squad?.bank?.toFixed(1) || '0.0'}m ITB
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg bg-black/40 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span className="hidden lg:inline text-[10px]">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsRegisterMode(false)
                      setAuthModalOpen(true)
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-[#37003c] font-black text-xs transition-transform hover:scale-105 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">login</span>
                    <span>{locale === 'ar' ? 'دخول / تسجيل' : 'Sign In'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tab Scroll */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar gap-1 py-1.5 border-t border-white/10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#00ff87] text-[#37003c] font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Official FPL Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#240028] border-2 border-[#37003c] rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Header with FPL Branding */}
            <div className="text-center mb-5">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00ff87] to-[#029b48] inline-flex items-center justify-center font-black text-[#37003c] text-xl shadow-lg mb-2">
                FPL
              </span>
              <h2 className="text-xl font-black text-white">
                {isRegisterMode ? 'Create Your FPL Squad' : 'Sign In to Fantasy Football'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {isRegisterMode
                  ? 'Compete for the 2026/27 Premier League title with £100.0M'
                  : 'Manage your starting XI, transfer Haaland & Salah, track live ranks'}
              </p>
            </div>

            {/* Quick 1-Click Admin Access Banner */}
            {!isRegisterMode && (
              <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-[#37003c] to-[#4d0054] border-2 border-[#00ff87]/50 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-[#00ff87] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      <span>Admin Demo Account</span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      <span className="font-semibold text-white">admin@myscore24.com</span> • Squad pre-configured
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAdminLogin}
                    disabled={submitting}
                    className="px-3 py-1.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] text-[#37003c] font-black text-xs transition-all shadow-md hover:scale-105 shrink-0 cursor-pointer"
                  >
                    1-Click Login
                  </button>
                </div>
              </div>
            )}

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs text-center font-bold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Manager Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140017] border border-white/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00ff87]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Fantasy Team Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Invincibles 2026"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140017] border border-white/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00ff87]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isRegisterMode ? 'Email Address' : 'Email Address'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRegisterMode ? 'manager@example.com' : 'admin@myscore24.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140017] border border-white/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00ff87]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#140017] border border-white/20 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#00ff87]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#00ff87] hover:bg-[#00e57a] disabled:opacity-50 text-[#37003c] font-black text-xs transition-colors mt-2 cursor-pointer shadow-lg"
              >
                {submitting
                  ? 'Please wait...'
                  : isRegisterMode
                  ? 'Create Team & Pick Squad'
                  : 'Sign In to My Team'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode)
                  setAuthError('')
                }}
                className="text-xs text-[#00ff87] hover:underline font-bold"
              >
                {isRegisterMode
                  ? 'Already have a squad? Sign In'
                  : "Don't have a team yet? Register Free Squad"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
