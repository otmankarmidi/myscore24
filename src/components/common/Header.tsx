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
      <header className="sticky top-0 left-0 right-0 z-30 bg-white/72 dark:bg-black/60 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-slate-900/[0.07] dark:border-white/[0.08] pt-[env(safe-area-inset-top,0px)] transition-all">
        <div className="max-w-[1480px] mx-auto h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <picture className="shrink-0">
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="MyScore24 Logo"
                  width={42}
                  height={42}
                  fetchPriority="high"
                  decoding="async"
                  className="h-8 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-2deg] filter brightness-0 dark:filter-none drop-shadow-xs"
                />
              </picture>
              <div className="flex flex-col leading-none">
                <span className="font-geist font-extrabold text-[18px] sm:text-[20px] tracking-[-0.03em] text-slate-900 dark:text-white flex items-center">
                  MyScore<span className="apple-gradient-text ml-0.5">24</span>
                </span>
                <span className="hidden sm:block font-geist font-semibold text-[9px] tracking-[0.22em] text-slate-400 dark:text-slate-500 uppercase mt-1">
                  Scores • Stats • Live
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center Navigation Links — Apple Capsule Segmented Bar */}
          <nav className="hidden xl:flex items-center gap-0.5 p-1 rounded-full apple-segmented-track" aria-label="Main navigation">
            <Link
              href="/"
              className={`text-[13px] font-semibold transition-all px-4 py-1.5 rounded-full relative ${
                pathname === '/'
                  ? 'apple-segmented-active font-bold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/#matches"
              className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 transition-all px-4 py-1.5 rounded-full"
            >
              {locale === 'ar' ? 'المباريات' : 'Matches'}
            </Link>
            <Link
              href="/competitions"
              className={`text-[13px] font-semibold transition-all px-4 py-1.5 rounded-full ${
                pathname === '/competitions'
                  ? 'apple-segmented-active font-bold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              {locale === 'ar' ? 'الدوريات' : 'Leagues'}
            </Link>
            <Link
              href="/news"
              className={`text-[13px] font-semibold transition-all px-4 py-1.5 rounded-full ${
                pathname === '/news'
                  ? 'apple-segmented-active font-bold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              {locale === 'ar' ? 'الأخبار' : 'News'}
            </Link>
            <Link
              href="/favorites"
              className={`text-[13px] font-semibold transition-all px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
                pathname === '/favorites'
                  ? 'apple-segmented-active font-bold scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
              }`}
            >
              <span>{t('nav.favorites', 'Favorites')}</span>
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 transition-all px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer"
              >
                <span>{locale === 'ar' ? 'المزيد' : 'More'}</span>
                <span className="material-symbols-outlined text-[15px] opacity-60 group-hover:opacity-100 transition-opacity">expand_more</span>
              </button>
              <div className="absolute top-11 right-0 rtl:right-auto rtl:left-0 hidden group-hover:flex flex-col apple-glass rounded-2xl shadow-2xl py-2 w-44 z-50 animate-scale-spring">
                <Link href="/favorites" className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                  {t('nav.favorites', 'Favorites')}
                </Link>
                <Link href="/about" className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                  {locale === 'ar' ? 'من نحن' : 'About Us'}
                </Link>
                <Link href="/contact" className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                  {locale === 'ar' ? 'اتصل بنا' : 'Contact'}
                </Link>
              </div>
            </div>
          </nav>

          {/* Search Bar — Apple Spotlight Glass Capsule */}
          <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md mx-2 gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 rtl:left-auto rtl:right-3.5 text-slate-400 pointer-events-none" style={{ fontSize: 18 }}>search</span>
              <input
                value={internalQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  if (internalQuery.trim().length >= 2) setIsOpen(true)
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] border border-transparent rounded-full pl-10 pr-11 rtl:pl-11 rtl:pr-10 h-9 font-inter text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500/50 dark:focus:border-brand-400/50 focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-4 focus:ring-brand-500/15 focus:shadow-[0_0_20px_rgba(10,108,255,0.15)] transition-all text-left rtl:text-right"
                placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
                type="search"
                aria-label={t('common.search_placeholder', 'Search')}
              />
              <kbd className="absolute right-3.5 rtl:right-auto rtl:left-3.5 px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 font-mono text-[10px] text-slate-400 border border-slate-200/60 dark:border-slate-700 shadow-2xs">/</kbd>
            </div>

            {/* Instant Search Results Dropdown — Desktop */}
            {isOpen && internalQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 apple-floating-island rounded-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto animate-scale-spring">
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
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language picker pill */}
            <div className="relative group flex">
              <button
                className="h-9 px-3 rounded-full bg-[rgba(118,118,128,0.12)] hover:bg-[rgba(118,118,128,0.2)] dark:bg-[rgba(118,118,128,0.24)] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                aria-label="Select Language"
              >
                <span className="uppercase text-[11px] font-bold tracking-wider">{label}</span>
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 15 }}>expand_more</span>
              </button>
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-10 hidden group-hover:flex flex-col apple-floating-island rounded-2xl z-50 min-w-[140px] overflow-hidden py-1.5 animate-scale-spring">
                {LOCALES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLocale(l.code)}
                    className={`px-3.5 py-2 text-left rtl:text-right font-geist text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      l.code === locale ? 'text-[#0A6CFF] dark:text-[#5EB0FF] font-bold bg-brand-50/50 dark:bg-brand-950/20' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{l.name}</span>
                    {l.code === locale && (
                      <span className="material-symbols-outlined text-[#0A6CFF] dark:text-[#5EB0FF]" style={{ fontSize: 16 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden w-8.5 h-8.5 rounded-full flex items-center justify-center bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-90"
              title="Search"
              aria-label="Toggle mobile search"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isMobileSearchOpen ? 'close' : 'search'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="xl:hidden w-8.5 h-8.5 rounded-full flex items-center justify-center bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-90"
              title={t('common.more', 'Menu')}
              aria-label="Open navigation drawer"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Bar — Minimalist pill tabs with smooth bottom line */}
        <nav className="xl:hidden flex items-center justify-start sm:justify-center px-3 py-1.5 border-t border-slate-900/[0.05] dark:border-white/[0.06] overflow-x-auto scrollbar-none gap-1" aria-label="Mobile main navigation">
          <Link
            href="/"
            className={`text-xs font-bold transition-all py-1.5 px-3.5 rounded-full relative whitespace-nowrap ${
              pathname === '/'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <Link
            href="/#matches"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors py-1.5 px-3.5 rounded-full whitespace-nowrap"
          >
            {locale === 'ar' ? 'المباريات' : 'Matches'}
          </Link>
          <Link
            href="/competitions"
            className={`text-xs font-semibold transition-all py-1.5 px-3.5 rounded-full whitespace-nowrap relative ${
              pathname === '/competitions'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {locale === 'ar' ? 'الدوريات' : 'Leagues'}
          </Link>
          <Link
            href="/news"
            className={`text-xs font-semibold transition-all py-1.5 px-3.5 rounded-full whitespace-nowrap relative ${
              pathname === '/news'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {locale === 'ar' ? 'الأخبار' : 'News'}
          </Link>
          <Link
            href="/favorites"
            className={`text-xs font-semibold transition-all py-1.5 px-3.5 rounded-full whitespace-nowrap relative ${
              pathname === '/favorites'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {t('nav.favorites', 'Favorites')}
          </Link>
        </nav>

        {/* Mobile Search Bar Expansion */}
        {isMobileSearchOpen && (
          <div ref={mobileSearchRef} className="md:hidden px-3 py-2 border-t border-slate-900/[0.05] dark:border-white/[0.06] relative">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 rtl:left-auto rtl:right-2.5 text-on-surface-variant pointer-events-none" style={{ fontSize: 16 }}>search</span>
              <input
                autoFocus
                value={internalQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-[rgba(118,118,128,0.12)] dark:bg-[rgba(118,118,128,0.24)] border border-transparent rounded-full pl-8 pr-8 rtl:pl-8 rtl:pr-8 py-2 font-inter text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors text-left rtl:text-right"
                placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
                type="search"
                aria-label={t('common.search_placeholder', 'Search')}
              />
            </div>

            {/* Mobile Instant Search Results Dropdown */}
            {isOpen && internalQuery.trim().length >= 2 && (
              <div className="mt-2 apple-floating-island rounded-2xl overflow-hidden max-h-[360px] overflow-y-auto">
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
