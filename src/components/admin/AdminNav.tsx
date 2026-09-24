'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: 'dashboard' },
    { label: 'Articles', href: '/admin/articles', icon: 'article' },
    { label: 'New Article', href: '/admin/articles/new', icon: 'add_circle' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#0c1321]/95 backdrop-blur-md border-b border-[#232a39]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & CMS badge */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#dce2f6]">
                MyScore<span className="text-[#ccff80]">24</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#232a39] text-[#ccff80] rounded border border-[#323949]">
                CMS
              </span>
            </Link>

            {/* Desktop Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#232a39] text-[#ccff80] shadow-sm'
                        : 'text-[#8c947c] hover:text-[#dce2f6] hover:bg-[#19202e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/news"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#c2cab0] bg-[#19202e] hover:bg-[#232a39] hover:text-[#dce2f6] border border-[#232a39] transition-all"
            >
              <span className="material-symbols-outlined text-sm text-[#ccff80]">open_in_new</span>
              <span>View News</span>
            </Link>

            <div className="h-4 w-px bg-[#232a39] hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-[#8c947c]">
              <span className="w-2 h-2 rounded-full bg-[#4ae176]" />
              <span className="font-medium text-[#dce2f6]">Admin</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ffb4ab] bg-[#93000a]/10 hover:bg-[#93000a]/20 border border-[#ffb4ab]/20 transition-all"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">{loggingOut ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#232a39]/60">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${
                  isActive ? 'text-[#ccff80]' : 'text-[#8c947c]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}
