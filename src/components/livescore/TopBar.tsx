'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { Locale } from '@/types/common'
import SearchPalette from './SearchPalette'
import { useSlidingIndicator } from './useSlidingIndicator'

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

/** Solid brand app bar: identity + search on top, section tabs with a gliding indicator below. */
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
    { href: '/', label: ar ? 'كرة القدم' : 'Football', icon: 'sports_soccer' },
    { href: '/live', label: ar ? 'مباشر' : fr ? 'En direct' : 'Live', icon: 'live_tv', live: true },
    { href: '/fixtures', label: ar ? 'المباريات' : fr ? 'Calendrier' : 'Fixtures', icon: 'calendar_month' },
    { href: '/competitions', label: ar ? 'البطولات' : fr ? 'Compétitions' : 'Leagues', icon: 'trophy' },
    { href: '/news', label: ar ? 'الأخبار' : fr ? 'Actualités' : 'News', icon: 'newspaper' },
    { href: '/favorites', label: t('nav.favorites', 'Favorites'), icon: 'star' },
  ]
  const isActive = (href: string) => (href === '/' ? pathname === '/' : Boolean(pathname?.startsWith(href)))
  const { ref: tabsRef, style: indicator } = useSlidingIndicator<HTMLElement>(pathname)

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

  const iconBtn = 'ui-press w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white inline-flex items-center justify-center'

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand text-white pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5">
          <div className="h-14 sm:h-16 flex items-center gap-3 sm:gap-6">
            <Link href="/" className="ui-press flex items-center gap-2.5 shrink-0 group" aria-label="MyScore24 home">
              <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center transition-transform duration-300 group-hover:-rotate-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.png" alt="" width={24} height={24} className="w-6 h-6 object-contain brightness-0" />
              </span>
              <span className="font-geist text-[18px] font-extrabold tracking-[-0.03em]">
                MyScore<span className="text-[#C9FF3D]">24</span>
              </span>
            </Link>

            <button
              onClick={() => setSearchOpen(true)}
              className="ui-press flex-1 max-w-[560px] mx-auto h-10 rounded-xl bg-white/15 hover:bg-white/25 ps-3.5 pe-2 hidden md:flex items-center gap-3 text-white/80"
              aria-label={t('common.search_placeholder', 'Search')}
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span className="flex-1 text-start text-[14px]">{t('common.search_placeholder', 'Search teams, players, leagues...')}</span>
              <kbd className="h-6 px-2 inline-flex items-center rounded-md bg-white/20 text-[11px] font-semibold">⌘K</kbd>
            </button>

            <div className="ms-auto md:ms-0 flex items-center gap-1.5 shrink-0">
              <button onClick={() => setSearchOpen(true)} className={`md:hidden ${iconBtn}`} aria-label="Search">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>
              <button onClick={() => setAlertsOpen(true)} className={iconBtn} aria-label="Match alerts">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                  className="ui-press h-10 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-[12px] font-bold tracking-wide"
                  aria-label="Select language"
                  aria-expanded={langOpen}
                >
                  {label}
                </button>
                {langOpen && (
                  <div className="absolute end-0 top-12 w-40 p-1.5 rounded-xl ui-popover ui-sheet text-ink">
                    {LOCALES.map((loc) => (
                      <button
                        key={loc.code}
                        onClick={() => {
                          changeLocale(loc.code)
                          setLangOpen(false)
                        }}
                        className={`w-full h-9 px-3 rounded-lg flex items-center justify-between text-[13px] transition-colors ${
                          locale === loc.code ? 'bg-brand-soft text-brand-ink font-semibold' : 'hover:bg-hover'
                        }`}
                      >
                        {loc.name}
                        {locale === loc.code && <span className="material-symbols-outlined text-[16px]">check</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setDrawerOpen(true)} className={iconBtn} aria-label="Open menu">
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </div>
          </div>

          <nav ref={tabsRef} className="relative h-11 flex items-stretch overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0" aria-label="Sections">
            {tabs.map((tab) => {
              const active = isActive(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  data-active={active}
                  aria-current={active ? 'page' : undefined}
                  className={`relative shrink-0 px-3 sm:px-4 inline-flex items-center gap-2 text-[13.5px] font-semibold transition-colors ${
                    active ? 'text-white' : 'text-white/65 hover:text-white'
                  }`}
                >
                  <span className="relative">
                    <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                      {tab.icon}
                    </span>
                    {tab.live && <span className="absolute -top-0.5 -end-1 w-2 h-2 rounded-full bg-[#FF5A66] border-2 border-brand" />}
                  </span>
                  {tab.label}
                </Link>
              )
            })}
            <span className="absolute bottom-0 left-0 h-[3px] rounded-t-full bg-white pointer-events-none" style={indicator} aria-hidden="true" />
          </nav>
        </div>
      </header>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchQuery} onQueryChange={onSearchChange} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenNotifications={() => setAlertsOpen(true)} />
      <NotificationModal isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </>
  )
}
