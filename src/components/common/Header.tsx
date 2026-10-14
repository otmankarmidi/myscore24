'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/hooks/useFavorites'
import { useTimezone, TIMEZONE_OPTIONS } from '@/context/TimezoneContext'
import dynamic from 'next/dynamic'
import PlayerImage from '@/components/common/PlayerImage'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { trackSearch } from '@/lib/analytics'
import { Locale } from '@/types/common'
import { MatchAlert } from '@/types/alerts'

const MobileDrawer = dynamic(() => import('@/components/common/MobileDrawer'), {
  ssr: false,
})

const NotificationModal = dynamic(() => import('@/components/common/NotificationModal'), {
  ssr: false,
})

const LOCALES: { code: Locale; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
]

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function Header({ searchQuery = '', onSearchChange }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { label, changeLocale, locale, t } = useLanguage()
  const { totalFavorites } = useFavorites()
  const { selectedTimezone, setTimezonePreference } = useTimezone()

  const [internalQuery, setInternalQuery] = useState(searchQuery)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    players: Array<{ id: string; slug: string; name: string; position: string; number?: number; teamName: string; photo?: string }>
    teams: Array<{ id: string; slug: string; name: string; abbreviation: string; logo?: string; country: string }>
    leagues: Array<{ id: string; slug: string; name: string; logo?: string; country?: string; countryFlag?: string }>
  }>({ players: [], teams: [], leagues: [] })

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInternalQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (!internalQuery || internalQuery.trim().length < 2) {
      setSearchResults({ players: [], teams: [], leagues: [] })
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(internalQuery.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults({
            players: data.players || [],
            teams: data.teams || [],
            leagues: data.leagues || [],
          })
          setIsOpen(true)
        }
      } catch (e) {
        console.error('Search error:', e)
      } finally {
        setIsSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [internalQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (val: string) => {
    setInternalQuery(val)
    onSearchChange?.(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && internalQuery.trim()) {
      setIsOpen(false)
      setIsMobileSearchOpen(false)
      router.push(`/search?q=${encodeURIComponent(internalQuery.trim())}`)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#182335] pt-[env(safe-area-inset-top,0px)] shadow-xs">
        <div className="max-w-[1480px] mx-auto h-16 sm:h-[70px] px-3 sm:px-5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <picture className="shrink-0">
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="MyScore24 Logo"
                  width={42}
                  height={42}
                  fetchPriority="high"
                  decoding="async"
                  className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 filter brightness-0 dark:filter-none"
                />
              </picture>
              <div className="flex flex-col leading-none">
                <span className="font-geist font-extrabold text-[17px] sm:text-[19px] tracking-tight text-[#171717] dark:text-[#dce2f6]">
                  MyScore<span className="text-[#6425A6] dark:text-primary">24</span>
                </span>
                <span className="font-geist font-bold text-[9px] sm:text-[10px] tracking-widest text-[#6B7280] dark:text-on-surface-variant uppercase mt-1">
                  Scores. Stats. Live.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 mx-2 shrink-0" aria-label="Main navigation">
            <Link
              href="/"
              className={`text-sm font-bold transition-all py-2 px-1 relative ${
                pathname === '/'
                  ? 'text-[#6425A6] dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#6425A6] dark:after:bg-primary after:rounded-full'
                  : 'text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white'
              }`}
            >
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/#matches"
              className="text-sm font-semibold text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white transition-colors py-2 px-1"
            >
              {locale === 'ar' ? 'المباريات' : 'Matches'}
            </Link>
            <Link
              href="/competitions"
              className="text-sm font-semibold text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white transition-colors py-2 px-1"
            >
              {locale === 'ar' ? 'الدوريات' : 'Leagues'}
            </Link>
            <Link
              href="/news"
              className="text-sm font-semibold text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white transition-colors py-2 px-1"
            >
              {locale === 'ar' ? 'الأخبار' : 'News'}
            </Link>
            <Link
              href="/fantasy"
              className={`text-sm font-semibold transition-colors py-2 px-1 flex items-center gap-1.5 ${
                pathname?.startsWith('/fantasy')
                  ? 'text-[#6425A6] dark:text-emerald-400 font-bold'
                  : 'text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base text-emerald-500">sports_soccer</span>
              <span>{locale === 'ar' ? 'الفانتازي' : 'Fantasy'}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/30">
                PL
              </span>
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="text-sm font-semibold text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-2 px-1"
              >
                <span>{locale === 'ar' ? 'المزيد' : 'More'}</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute top-9 right-0 rtl:right-auto rtl:left-0 hidden group-hover:flex flex-col bg-white dark:bg-[#0f1728] border border-[#E5E5E5] dark:border-slate-800 rounded-xl shadow-xl py-1.5 w-40 z-50">
                <Link href="/favorites" className="px-3.5 py-2 text-xs font-semibold text-[#171717] dark:text-slate-100 hover:bg-[#F3ECFA] dark:hover:bg-slate-800 hover:text-[#6425A6]">
                  {t('nav.favorites', 'Favorites')}
                </Link>
                <Link href="/about" className="px-3.5 py-2 text-xs font-semibold text-[#171717] dark:text-slate-100 hover:bg-[#F3ECFA] dark:hover:bg-slate-800 hover:text-[#6425A6]">
                  {locale === 'ar' ? 'من نحن' : 'About Us'}
                </Link>
                <Link href="/contact" className="px-3.5 py-2 text-xs font-semibold text-[#171717] dark:text-slate-100 hover:bg-[#F3ECFA] dark:hover:bg-slate-800 hover:text-[#6425A6]">
                  {locale === 'ar' ? 'اتصل بنا' : 'Contact'}
                </Link>
              </div>
            </div>
          </nav>

          {/* Search Bar — desktop rounded pill */}
          <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2 gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3 rtl:left-auto rtl:right-3 text-[#6425A6] dark:text-slate-400 pointer-events-none" style={{ fontSize: 16 }}>search</span>
              <input
                value={internalQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  if (internalQuery.trim().length >= 2) setIsOpen(true)
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#F5F5F5] dark:bg-[#0e1626] border border-[#E5E5E5] dark:border-[#1e2a40] rounded-full pl-9 pr-10 rtl:pl-10 rtl:pr-9 py-1.5 font-inter text-xs text-[#171717] dark:text-white placeholder:text-[#6B7280] dark:placeholder:text-slate-400 focus:outline-none focus:border-[#6425A6] focus:bg-white dark:focus:bg-[#0e1626] transition-colors text-left rtl:text-right"
                placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
                type="search"
                aria-label={t('common.search_placeholder', 'Search')}
              />
              <kbd className="absolute right-3 rtl:right-auto rtl:left-3 px-1.5 py-0.5 rounded bg-[#152033] font-geist text-[10px] text-slate-400 border border-slate-700">/</kbd>
            </div>

            {/* Instant Search Results Dropdown — Desktop */}
            {isOpen && internalQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container border border-surface-bright/70 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
                {isSearching && (
                  <div className="p-3 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary animate-spin">sports_soccer</span>
                    <span>{t('common.searching', 'Searching...')}</span>
                  </div>
                )}

                {!isSearching &&
                  searchResults.players.length === 0 &&
                  searchResults.teams.length === 0 &&
                  searchResults.leagues.length === 0 && (
                    <div className="p-4 text-center text-xs text-on-surface-variant">
                      {t('common.noSearchResults', 'No results found for')} &quot;{internalQuery}&quot;
                    </div>
                  )}

                {/* PLAYERS RESULTS */}
                {searchResults.players.length > 0 && (
                  <div className="p-2 border-b border-surface-bright/40">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center justify-between">
                      <span>{t('common.players', 'PLAYERS')}</span>
                      <span className="text-[9px] text-on-surface-variant font-normal">Headshots</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.players.map((p) => (
                        <Link
                          key={p.id}
                          href={`/player/${p.slug || p.id}`}
                          onClick={() => {
                            setIsOpen(false)
                            setIsMobileSearchOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                        >
                          <PlayerImage
                            playerId={p.id}
                            photo={p.photo}
                            name={p.name}
                            size="sm"
                            className="border border-surface-bright/60 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                {p.name}
                              </span>
                              {p.number && (
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1 rounded">
                                  #{p.number}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant truncate block">
                              {p.position} • {p.teamName}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* TEAMS RESULTS */}
                {searchResults.teams.length > 0 && (
                  <div className="p-2 border-b border-surface-bright/40">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t('common.teams', 'TEAMS')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.teams.map((tItem) => (
                        <Link
                          key={tItem.id}
                          href={`/team/${tItem.slug || tItem.id}`}
                          onClick={() => {
                            setIsOpen(false)
                            setIsMobileSearchOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                        >
                          <TeamLogo name={tItem.name} abbreviation={tItem.abbreviation} logo={tItem.logo} size="xs" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate block">
                              {tItem.name}
                            </span>
                            <span className="text-[10px] text-on-surface-variant truncate block">{tItem.country}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* LEAGUES RESULTS */}
                {searchResults.leagues.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t('common.competitions', 'COMPETITIONS')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.leagues.map((lItem) => (
                        <Link
                          key={lItem.id}
                          href={`/league/${lItem.id || lItem.slug}`}
                          prefetch={false}
                          onClick={() => {
                            setIsOpen(false)
                            setIsMobileSearchOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                        >
                          <CompetitionLogo
                            logo={lItem.logo}
                            competitionId={lItem.id}
                            name={lItem.name}
                            country={lItem.country}
                            countryFlag={lItem.countryFlag}
                            slug={lItem.slug}
                            size={18}
                            showBackground={false}
                          />
                          <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                            {lItem.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View all results footer */}
                <div className="p-2 bg-surface-container-high/40 border-t border-surface-bright/40 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(internalQuery.trim())}`}
                    onClick={() => {
                      trackSearch(internalQuery.trim())
                      setIsOpen(false)
                      setIsMobileSearchOpen(false)
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline block py-0.5"
                  >
                    {t('common.viewAllResults', 'View all results for')} &quot;{internalQuery}&quot; →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Actions & Utilities Matching Reference Image Header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language picker pill */}
            <div className="relative group flex">
              <button
                className="h-8 px-2 sm:px-2.5 rounded-full bg-[#F5F5F5] dark:bg-[#121c2d] hover:bg-[#F3ECFA] dark:hover:bg-[#19273f] text-xs font-bold text-[#171717] dark:text-slate-200 flex items-center gap-0.5 sm:gap-1 transition-colors border border-[#E5E5E5] dark:border-slate-800"
                aria-label="Select Language"
              >
                <span className="uppercase text-[11px] sm:text-xs">{label}</span>
                <span className="material-symbols-outlined text-[#6B7280] dark:text-slate-400" style={{ fontSize: 13 }}>expand_more</span>
              </button>
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-9 hidden group-hover:flex flex-col bg-white dark:bg-[#0f1728] border border-[#E5E5E5] dark:border-slate-800 rounded-xl shadow-xl z-50 min-w-[110px] overflow-hidden py-1">
                {LOCALES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLocale(l.code)}
                    className={`px-3 py-1.5 text-left rtl:text-right font-geist text-xs font-semibold hover:bg-[#F3ECFA] dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2 ${
                      l.code === locale ? 'text-[#6425A6] dark:text-amber-500 font-bold' : 'text-[#171717] dark:text-slate-300'
                    }`}
                  >
                    <span>{l.name}</span>
                    {l.code === locale && (
                      <span className="material-symbols-outlined text-[#6425A6] dark:text-amber-500" style={{ fontSize: 14 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] dark:bg-slate-800 text-[#171717] dark:text-slate-200 transition-colors border border-[#E5E5E5] dark:border-slate-700"
              title="Search"
              aria-label="Toggle mobile search"
            >
              <span className="material-symbols-outlined text-base">
                {isMobileSearchOpen ? 'close' : 'search'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="xl:hidden w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] dark:bg-slate-800 text-[#171717] dark:text-slate-200 transition-colors border border-[#E5E5E5] dark:border-slate-700"
              title={t('common.more', 'Menu')}
              aria-label="Open navigation drawer"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar — exact visual parity with desktop */}
        <nav className="xl:hidden flex items-center justify-around px-2 border-t border-[#E5E5E5] dark:border-[#182335] bg-white dark:bg-[#0c121e] overflow-x-auto scrollbar-none" aria-label="Mobile main navigation">
          <Link
            href="/"
            className={`text-xs font-bold transition-all py-2 px-2 relative whitespace-nowrap ${
              pathname === '/'
                ? 'text-[#6425A6] dark:text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-[#6425A6] dark:after:bg-primary after:rounded-full'
                : 'text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white'
            }`}
          >
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <Link
            href="/#matches"
            className="text-xs font-semibold text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white transition-colors py-2 px-2 whitespace-nowrap"
          >
            {locale === 'ar' ? 'المباريات' : 'Matches'}
          </Link>
          <Link
            href="/competitions"
            className={`text-xs font-semibold transition-all py-2 px-2 whitespace-nowrap relative ${
              pathname === '/competitions'
                ? 'text-[#6425A6] dark:text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-[#6425A6] dark:after:bg-primary after:rounded-full'
                : 'text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white'
            }`}
          >
            {locale === 'ar' ? 'الدوريات' : 'Leagues'}
          </Link>
          <Link
            href="/news"
            className={`text-xs font-semibold transition-all py-2 px-2 whitespace-nowrap relative ${
              pathname === '/news'
                ? 'text-[#6425A6] dark:text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-[#6425A6] dark:after:bg-primary after:rounded-full'
                : 'text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white'
            }`}
          >
            {locale === 'ar' ? 'الأخبار' : 'News'}
          </Link>
          <Link
            href="/favorites"
            className={`text-xs font-semibold transition-all py-2 px-2 whitespace-nowrap relative ${
              pathname === '/favorites'
                ? 'text-[#6425A6] dark:text-white after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[2px] after:bg-[#6425A6] dark:after:bg-primary after:rounded-full'
                : 'text-[#6B7280] dark:text-slate-200 hover:text-[#6425A6] dark:hover:text-white'
            }`}
          >
            {t('nav.favorites', 'Favorites')}
          </Link>
        </nav>

        {/* Mobile Search Bar Expansion */}
        {isMobileSearchOpen && (
          <div ref={mobileSearchRef} className="md:hidden px-3 py-2 bg-surface-container border-b border-surface-bright/60 relative">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 rtl:left-auto rtl:right-2.5 text-on-surface-variant pointer-events-none" style={{ fontSize: 16 }}>search</span>
              <input
                autoFocus
                value={internalQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-surface-container-low border border-surface-bright/40 rounded-lg pl-8 pr-8 rtl:pl-8 rtl:pr-8 py-2 font-inter text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors text-left rtl:text-right"
                placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
                type="search"
                aria-label={t('common.search_placeholder', 'Search')}
              />
            </div>

            {/* Mobile Instant Search Results Dropdown */}
            {isOpen && internalQuery.trim().length >= 2 && (
              <div className="mt-2 bg-surface-container border border-surface-bright/60 rounded-xl shadow-2xl overflow-hidden max-h-[360px] overflow-y-auto">
                {isSearching && (
                  <div className="p-3 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary animate-spin">sports_soccer</span>
                    <span>{t('common.searching', 'Searching...')}</span>
                  </div>
                )}

                {!isSearching &&
                  searchResults.players.length === 0 &&
                  searchResults.teams.length === 0 &&
                  searchResults.leagues.length === 0 && (
                    <div className="p-4 text-center text-xs text-on-surface-variant">
                      {t('common.noSearchResults', 'No results found for')} &quot;{internalQuery}&quot;
                    </div>
                  )}

                {/* Mobile Players */}
                {searchResults.players.length > 0 && (
                  <div className="p-2 border-b border-surface-bright/40">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t('common.players', 'PLAYERS')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.players.map((p) => (
                        <Link
                          key={p.id}
                          href={`/player/${p.slug || p.id}`}
                          onClick={() => {
                            setIsOpen(false)
                            setIsMobileSearchOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                        >
                          <PlayerImage
                            playerId={p.id}
                            photo={p.photo}
                            name={p.name}
                            size="sm"
                            className="border border-surface-bright/60 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                {p.name}
                              </span>
                              {p.number && (
                                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1 rounded">
                                  #{p.number}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant truncate block">
                              {p.position} • {p.teamName}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Teams */}
                {searchResults.teams.length > 0 && (
                  <div className="p-2 border-b border-surface-bright/40">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t('common.teams', 'TEAMS')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.teams.map((tItem) => (
                        <Link
                          key={tItem.id}
                          href={`/team/${tItem.slug || tItem.id}`}
                          onClick={() => {
                            setIsOpen(false)
                            setIsMobileSearchOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                        >
                          <TeamLogo name={tItem.name} abbreviation={tItem.abbreviation} logo={tItem.logo} size="xs" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate block">
                              {tItem.name}
                            </span>
                            <span className="text-[10px] text-on-surface-variant truncate block">{tItem.country}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Leagues */}
                {searchResults.leagues.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {t('common.competitions', 'COMPETITIONS')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.leagues.map((lItem) => (
                        <Link
                          key={lItem.id}
                          href={`/league/${lItem.id || lItem.slug}`}
                          prefetch={false}
                          onClick={() => {
                            setIsOpen(false)
                            setIsMobileSearchOpen(false)
                          }}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                        >
                          <CompetitionLogo
                            logo={lItem.logo}
                            competitionId={lItem.id}
                            name={lItem.name}
                            country={lItem.country}
                            countryFlag={lItem.countryFlag}
                            slug={lItem.slug}
                            size={18}
                            showBackground={false}
                          />
                          <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                            {lItem.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile View All */}
                <div className="p-2 bg-surface-container-high/40 border-t border-surface-bright/40 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(internalQuery.trim())}`}
                    onClick={() => {
                      trackSearch(internalQuery.trim())
                      setIsOpen(false)
                      setIsMobileSearchOpen(false)
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline block py-0.5"
                  >
                    {t('common.viewAllResults', 'View all results for')} &quot;{internalQuery}&quot; →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Settings & Options Drawer Modal */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
      />

      {/* Match Alert Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  )
}
