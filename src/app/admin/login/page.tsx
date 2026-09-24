'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please try again.')
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[#070e1c]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ccff80]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl font-black tracking-tight text-[#dce2f6]">
              MyScore<span className="text-[#ccff80]">24</span>
            </span>
          </Link>
          <div className="inline-block px-2.5 py-0.5 ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#232a39] text-[#ccff80] rounded border border-[#323949]">
            CMS Portal
          </div>
          <p className="text-xs text-[#8c947c] mt-2">
            Secure football content publishing & news management
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#151b2a] border border-[#232a39] rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
          <h1 className="text-lg font-bold text-[#dce2f6] mb-1">Sign In to Dashboard</h1>
          <p className="text-xs text-[#8c947c] mb-6">Enter your administrative credentials to continue</p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#c2cab0] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-sm text-[#dce2f6] placeholder-[#424936] focus:outline-none focus:border-[#ccff80] focus:ring-1 focus:ring-[#ccff80] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c2cab0] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1321] border border-[#232a39] text-sm text-[#dce2f6] placeholder-[#424936] focus:outline-none focus:border-[#ccff80] focus:ring-1 focus:ring-[#ccff80] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#ccff80] hover:bg-[#b2f746] text-[#213600] font-bold text-sm tracking-wide transition-all shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#213600] border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access CMS</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#8c947c] hover:text-[#dce2f6] transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Return to public website</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
