'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { Locale } from '@/types/common'
import SearchPalette from './SearchPalette'

const MobileDrawer = dynamic(() => import('@/components/common/MobileDrawer'), { ssr: false })
const NotificationModal = dynamic(() => import('@/components/common/NotificationModal'), { ssr: false })

const LOCALES: { code: Locale; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
]

interface TopBarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

/** Gradient-glass app bar: brand + search on top, section tabs below. */
export default function TopBar({ searchQuery = '', onSearchChange }: TopBarProps) {
  const pathname = usePathname()
  const { locale, label, changeLocale, t } = useLanguage()
  const [searchOpen, setSearchOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const ar = locale === 'ar'
  const fr = locale === 'fr'

  const tabs = [
    { href: '/', label: ar ? 'كرة القدم' : fr ? 'Football' : 'Football', icon: 'sports_soccer' },
    { href: '/live', label: ar ? 'مباشر' : fr ? 'En direct' : 'Live', icon: 'live_tv', live: true },
    { href: '/fixtures', label: ar ? 'المباريات' : fr ? 'Calendrier' : 'Fixtures', icon: 'calendar_month' },
    { href: '/competitions', label: ar ? 'البطولات' : fr ? 'Compétitions' : 'Leagues', icon: 'trophy' },
    { href: '/news', label: ar ? 'الأخبار' : fr ? 'Actualités' : 'News', icon: 'newspaper' },
    { href: '/favorites', label: t('nav.favorites', 'Favorites'), icon: 'star' },
  ]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href))

  return (
    <>
      <header className="sticky top-0 z-40 gl-topbar pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5">
          {/* Row 1 — brand, search, utilities */}
          <div className="h-14 sm:h-16 flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="MyScore24 home">
              <span className="w-9 h-9 rounded-xl bg-white/95 flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(56,225,255,0.8)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.png" alt="" width={24} height={24} className="w-6 h-6 object-contain brightness-0" />
              </span>
              <span className="font-geist text-[18px] font-extrabold tracking-[-0.03em] text-white">
                MyScore<span className="gl-grad-text">24</span>
              </span>
            </Link>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex-1 max-w-[560px] mx-auto h-10 rounded-full bg-white/[0.12] hover:bg-white/[0.17] border border-white/15 ps-4 pe-2 hidden md:flex items-center gap-3 text-white/60 transition-colors"
              aria-label={t('common.search_placeholder', 'Search')}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span className="flex-1 text-start text-[14px]">{t('common.search_placeholder', 'Search teams, players, leagues...')}</span>
              <kbd className="h-6 px-2 inline-flex items-center rounded-full bg-white/15 text-[11px] font-semibold text-white/70">⌘K</kbd>
            </button>

            <div className="ms-auto md:ms-0 flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden w-10 h-10 rounded-full bg-white/[0.12] text-white inline-flex items-center justify-center"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button
                onClick={() => setAlertsOpen(true)}
                className="w-10 h-10 rounded-full bg-white/[0.12] hover:bg-white/[0.18] text-white inline-flex items-center justify-center transition-colors"
                aria-label="Match alerts"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                  className="h-10 px-3.5 rounded-full bg-white/[0.12] hover:bg-white/[0.18] text-[12px] font-bold tracking-wide text-white transition-colors"
                  aria-label="Select language"
                  aria-expanded={langOpen}
                >
                  {label}
                </button>
                {langOpen && (
                  <div className="absolute end-0 top-12 w-40 p-1.5 rounded-2xl gl-panel-strong animate-scale-spring">
                    {LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => {
                          changeLocale(loc.code)
                          setLangOpen(false)
                        }}
                        className={`w-full h-9 px-3 rounded-xl flex items-center justify-between text-[13px] ${
                          locale === loc.code ? 'bg-white/10 text-white font-semibold' : 'text-white/70 hover:bg-white/[0.06]'
                        }`}
                      >
                        {loc.name}
                        {locale === loc.code && <span className="material-symbols-outlined text-[16px] text-accent-cyan">check</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-full bg-white/[0.12] hover:bg-white/[0.18] text-white inline-flex items-center justify-center transition-colors"
                aria-label="Open menu"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </div>
          </div>

          {/* Row 2 — section tabs */}
          <nav className="h-11 flex items-stretch gap-1 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0" aria-label="Sections">
            {tabs.map((tab) => {
              const active = isActive(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative shrink-0 px-3 sm:px-4 inline-flex items-center gap-2 text-[13.5px] font-semibold transition-colors ${
                    active ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="relative">
                    <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                      {tab.icon}
                    </span>
                    {tab.live && <span className="absolute -top-0.5 -end-1 gl-live-dot !w-1.5 !h-1.5" />}
                  </span>
                  {tab.label}
                  {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full gl-grad-bg shadow-[0_0_12px_rgba(56,225,255,0.8)]" />}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchQuery} onQueryChange={onSearchChange} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenNotifications={() => setAlertsOpen(true)} />
      <NotificationModal isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </>
  )
}
