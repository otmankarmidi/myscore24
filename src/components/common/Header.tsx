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
      <header className="sticky top-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-b border-surface-bright/70">
        <div className="max-w-[1480px] mx-auto h-14 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="MyScore24 Logo"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
              />
              <div className="flex flex-col leading-none">
                <span className="font-geist font-bold text-[15px] sm:text-[16px] tracking-tight text-on-surface">
                  MyScore<span className="text-primary">24</span>
                </span>
                <span className="font-geist font-bold text-[8px] sm:text-[9px] tracking-widest text-on-surface-variant uppercase mt-0.5">
                  Scores. Stats. Live.
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar — desktop */}
          <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-xl mx-4 gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 rtl:left-auto rtl:right-2.5 text-outline pointer-events-none" style={{ fontSize: 16 }}>search</span>
              <input
                value={internalQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                  if (internalQuery.trim().length >= 2) setIsOpen(true)
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-surface-container-high/60 border border-surface-bright/70 rounded-lg pl-8 pr-12 rtl:pl-12 rtl:pr-8 py-1.5 font-inter text-[12px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors text-left rtl:text-right"
                placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
                type="search"
                aria-label={t('common.search_placeholder', 'Search')}
              />
              <kbd className="absolute right-2 rtl:right-auto rtl:left-2 px-1.5 py-0.5 rounded bg-surface-container-high font-geist text-[10px] text-on-surface-variant border border-surface-bright/50">/</kbd>
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

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Desktop-only secondary controls: Language, Timezone, Theme */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Language picker */}
              <div className="relative group">
                <button
                  className="h-8 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-geist text-[11px] font-semibold text-on-surface flex items-center gap-1 transition-colors border border-surface-bright/70"
                  aria-label="Select Language"
                >
                  <span className="uppercase">{label}</span>
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                <div className="absolute right-0 rtl:right-auto rtl:left-0 top-9 hidden group-hover:flex flex-col bg-surface-container border border-surface-bright/70 rounded-lg shadow-xl z-50 min-w-[110px] overflow-hidden py-1">
                  {LOCALES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => changeLocale(l.code)}
                      className={`px-3 py-1.5 text-left rtl:text-right font-geist text-[11px] font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-between gap-2 ${
                        l.code === locale ? 'text-primary bg-primary/10' : 'text-on-surface'
                      }`}
                    >
                      <span>{l.name}</span>
                      {l.code === locale && (
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone picker */}
              <div className="relative group">
                <button className="h-8 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-geist text-[11px] font-semibold text-on-surface flex items-center gap-1 transition-colors border border-surface-bright/70">
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 15 }}>schedule</span>
                  <span className="max-w-[70px] md:max-w-[100px] truncate">
                    {selectedTimezone === 'auto' ? t('common.timezoneAuto', 'Auto') : selectedTimezone.split('/')[1] || selectedTimezone}
                  </span>
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: 14 }}>expand_more</span>
                </button>
                <div className="absolute right-0 rtl:right-auto rtl:left-0 top-9 hidden group-hover:flex flex-col bg-surface-container border border-surface-bright/70 rounded-xl shadow-xl z-50 min-w-[200px] overflow-hidden p-1 space-y-0.5">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-outline border-b border-surface-bright/70 text-left rtl:text-right">
                    {t('common.displayTimezone', 'Display Timezone')}
                  </div>
                  {TIMEZONE_OPTIONS.map(tz => (
                    <button
                      key={tz.value}
                      onClick={() => setTimezonePreference(tz.value)}
                      className={`px-3 py-1.5 text-left rtl:text-right font-geist text-[11px] font-semibold rounded hover:bg-surface-container-high transition-colors flex items-center justify-between ${
                        tz.value === selectedTimezone ? 'text-primary bg-primary/10' : 'text-on-surface'
                      }`}
                    >
                      <span className="truncate">{tz.value === 'auto' ? `Auto (${t('common.timezoneAuto', 'Local')})` : tz.label}</span>
                      {tz.value === selectedTimezone && (
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 14 }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border border-surface-bright/70"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border border-surface-bright/70 min-w-[36px] min-h-[36px]"
              title="Search"
              aria-label="Toggle mobile search"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {isMobileSearchOpen ? 'close' : 'search'}
              </span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface relative transition-colors border border-surface-bright/70 min-w-[36px] min-h-[36px]"
              title={t('common.notifications', 'Match Alerts')}
              aria-label={t('common.notifications', 'Match Alerts')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications</span>
              <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 w-2 h-2 rounded-full bg-primary border border-surface animate-pulse" />
            </button>

            {/* Mobile Menu Button (opens Settings/More Drawer) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border border-surface-bright/70 min-w-[36px] min-h-[36px]"
              title={t('common.more', 'Menu')}
              aria-label="Open navigation drawer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
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
