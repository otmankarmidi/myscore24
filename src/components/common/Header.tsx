'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/hooks/useTheme'
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
  const { toggle, isDark } = useTheme()
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
      <header className="sticky top-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-b border-surface-bright/70 pt-[env(safe-area-inset-top,0px)] shadow-sm">
        <div className="max-w-[1480px] mx-auto h-16 sm:h-[70px] px-3 sm:px-5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Animated logo (transparent WebP, plays once and holds final frame).
                  Users with reduced-motion preference get the static final frame. */}
              <picture className="shrink-0">
                <source srcSet="/logo-mark.png" media="(prefers-reduced-motion: reduce)" />
                <img
                  src="/logo-animated.webp"
                  alt="MyScore24 Logo"
                  width={56}
                  height={44}
                  className="site-logo-anim h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </picture>
              <div className="flex flex-col leading-none">
                <span className="font-geist font-extrabold text-[17px] sm:text-[19px] tracking-tight text-on-surface">
                  MyScore<span className="text-primary">24</span>
                </span>
                <span className="font-geist font-bold text-[9px] sm:text-[10px] tracking-widest text-on-surface-variant uppercase mt-1">
                  Scores. Stats. Live.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center Navigation Links (Matching Reference Image) */}
          <nav className="hidden xl:flex items-center gap-6 mx-2 shrink-0" aria-label="Main navigation">
            <Link
              href="/"
              className={`text-sm font-bold transition-all py-1 relative ${
                pathname === '/'
                  ? 'text-slate-900 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-400 after:rounded-full'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/#matches"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {locale === 'ar' ? 'المباريات' : 'Matches'}
            </Link>
            <Link
              href="/competitions"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {locale === 'ar' ? 'الدوريات' : 'Leagues'}
            </Link>
            <Link
              href="/news"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {locale === 'ar' ? 'الأخبار' : 'News'}
            </Link>
            <Link
              href="/competitions"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {locale === 'ar' ? 'الفرق' : 'Teams'}
            </Link>
            <Link
              href="/news"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {locale === 'ar' ? 'اللاعبون' : 'Players'}
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{locale === 'ar' ? 'المزيد' : 'More'}</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="absolute top-7 right-0 rtl:right-auto rtl:left-0 hidden group-hover:flex flex-col bg-white dark:bg-[#0f1728] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 w-40 z-50">
                <Link href="/favorites" className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {t('nav.favorites', 'Favorites')}
                </Link>
                <Link href="/about" className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {locale === 'ar' ? 'من نحن' : 'About Us'}
                </Link>
                <Link href="/contact" className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {locale === 'ar' ? 'اتصل بنا' : 'Contact'}
                </Link>
              </div>
            </div>
          </nav>

          {/* Search Bar — desktop rounded pill */}
          <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2 gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3 rtl:left-auto rtl:right-3 text-slate-400 pointer-events-none" style={{ fontSize: 16 }}>search</span>
              <input
                value={internalQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  if (internalQuery.trim().length >= 2) setIsOpen(true)
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-100 dark:bg-[#0e1626] border border-slate-200 dark:border-[#1e2a40] rounded-full pl-9 pr-10 rtl:pl-10 rtl:pr-9 py-1.5 font-inter text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors text-left rtl:text-right"
                placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
                type="search"
                aria-label={t('common.search_placeholder', 'Search')}
              />
              <kbd className="absolute right-3 rtl:right-auto rtl:left-3 px-1.5 py-0.5 rounded bg-white dark:bg-[#152033] font-geist text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700">/</kbd>
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
                          href={`/competition/${lItem.id || lItem.slug}`}
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
            <div className="relative group hidden sm:block">
              <button
                className="h-8 px-2.5 rounded-full bg-slate-100 dark:bg-[#121c2d] hover:bg-slate-200 dark:hover:bg-[#19273f] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-800"
                aria-label="Select Language"
              >
                <span className="uppercase">{label}</span>
                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 14 }}>expand_more</span>
              </button>
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-9 hidden group-hover:flex flex-col bg-white dark:bg-[#0f1728] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 min-w-[110px] overflow-hidden py-1">
                {LOCALES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLocale(l.code)}
                    className={`px-3 py-1.5 text-left rtl:text-right font-geist text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2 ${
                      l.code === locale ? 'text-amber-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{l.name}</span>
                    {l.code === locale && (
                      <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 14 }}>check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sun / Moon Theme Toggle Icons matching image */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-[#121c2d] p-1 rounded-full border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  if (isDark) toggle()
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  !isDark ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-amber-400'
                }`}
                title="Light mode"
                aria-label="Light mode"
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
              </button>
              <button
                onClick={() => {
                  if (!isDark) toggle()
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  isDark ? 'bg-[#1e293b] text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dark mode"
                aria-label="Dark mode"
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
              </button>
            </div>

            {/* Sign in Button Matching Image */}
            <Link
              href="/admin/login"
              className="h-8 px-4 rounded-full bg-slate-900 hover:bg-black dark:bg-[#121c2d] dark:hover:bg-[#1c2c46] dark:border dark:border-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              <span>{locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</span>
            </Link>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
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
              className="xl:hidden w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              title={t('common.more', 'Menu')}
              aria-label="Open navigation drawer"
            >
              <span className="material-symbols-outlined text-lg">menu</span>
            </button>
          </div>
        </div>

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
                          href={`/competition/${lItem.id || lItem.slug}`}
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
