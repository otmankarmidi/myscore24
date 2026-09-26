'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/context/LanguageContext'
import { mockLeagues } from '@/data/mockLeagues'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import CountryFlag from '@/components/common/CountryFlag'

const COUNTRIES = [
  { name: 'Morocco',      count: 3 },
  { name: 'England',      count: 5 },
  { name: 'Spain',        count: 4 },
  { name: 'France',       count: 3 },
  { name: 'Italy',        count: 3 },
  { name: 'Germany',      count: 3 },
  { name: 'Saudi Arabia', count: 2 },
  { name: 'Portugal',     count: 2 },
  { name: 'Netherlands',  count: 2 },
  { name: 'USA',          count: 2 },
]

export default function DesktopSidebar() {
  const pathname = usePathname()
  const { totalFavorites, isFavoriteLeague, toggleLeague } = useFavorites()
  const { t } = useLanguage()
  const [liveCount, setLiveCount] = useState<number>(0)

  const navItems = [
    { href: '/',             key: 'scores',       label: t('nav.scores', 'Scores'),             icon: 'sports_soccer',  badge: t('common.today', 'TODAY') },
    { href: '/live',         key: 'live',         label: t('nav.live', 'Live'),                 icon: 'radar',          liveBadge: true },
    { href: '/fixtures',     key: 'fixtures',     label: t('nav.fixtures', 'Fixtures'),         icon: 'calendar_month' },
    { href: '/results',      key: 'results',      label: t('nav.results', 'Results'),           icon: 'event_available' },
    { href: '/competitions', key: 'competitions', label: t('nav.competitions', 'Competitions'), icon: 'trophy' },
    { href: '/favorites',    key: 'favorites',    label: t('nav.favorites', 'Favorites'),       icon: 'star',           favBadge: true },
    { href: '/news',         key: 'news',         label: t('nav.news', 'Football News'),        icon: 'newspaper' },
  ]

  useEffect(() => {
    async function fetchLiveCount() {
      try {
        const res = await fetch('/api/matches/live', { cache: 'no-store' })
        const json = await res.json()
        setLiveCount((json.data || []).length)
      } catch {
        setLiveCount(0)
      }
    }

    let id: NodeJS.Timeout
    const initialTimer = setTimeout(() => {
      fetchLiveCount()
      id = setInterval(fetchLiveCount, 30000)
    }, 4000)

    return () => {
      clearTimeout(initialTimer)
      if (id) clearInterval(id)
    }
  }, [])

  const favoriteLeagues = mockLeagues.slice(0, 6)

  return (
    <aside className="w-[230px] shrink-0 h-[calc(100vh-3.5rem)] sticky top-14 py-3 overflow-y-auto border-r rtl:border-r-0 rtl:border-l border-surface-bright/30 pr-2 rtl:pr-0 rtl:pl-2 hidden md:block">
      {/* Main Navigation */}
      <nav className="flex flex-col gap-0.5 mb-4" aria-label={t('nav.scores', 'Main navigation')}>
        {navItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
                isActive ? 'bg-surface-container-high text-primary font-semibold' : 'nav-item'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0", color: isActive ? 'var(--color-primary)' : undefined }}
                >
                  {item.icon}
                </span>
                <span className="font-inter text-[13px]">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary-container font-geist text-[10px] font-bold tracking-widest uppercase">
                  {item.badge}
                </span>
              )}
              {item.liveBadge && (
                <span className="flex items-center gap-1 font-geist text-[10px] font-bold text-error">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse-live inline-block" />
                  {liveCount > 0 ? liveCount : ''}
                </span>
              )}
              {item.favBadge && totalFavorites > 0 && (
                <span className="font-geist text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {totalFavorites}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Favorite Leagues */}
      <div className="mb-4">
        <div className="px-2.5 py-1 font-geist text-[10px] font-bold uppercase tracking-widest text-outline flex items-center justify-between">
          <span>{t('common.favorite_leagues', 'Favorite Leagues')}</span>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>tune</span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {favoriteLeagues.map(league => (
            <div
              key={league.id}
              className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded font-inter text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group"
            >
              <Link
                href={`/competition/${league.id || league.slug}`}
                prefetch={false}
                className="flex items-center gap-2 min-w-0 flex-1 hover:text-primary transition-colors"
              >
                <CompetitionLogo
                  logo={league.logo}
                  competitionName={league.name}
                  country={league.country}
                  countryFlag={league.countryFlag}
                  providerId={league.id}
                  slug={league.slug}
                  size={20}
                  showBackground={true}
                />
                <span className="truncate text-on-surface group-hover:text-primary transition-colors text-[12px] font-medium">
                  {league.name}
                </span>
              </Link>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-geist text-[10px] font-bold text-outline">{league.countryCode}</span>
                <button
                  onClick={() => toggleLeague(league.slug)}
                  className="text-outline hover:text-primary transition-colors"
                  aria-label={`${isFavoriteLeague(league.slug) ? 'Remove' : 'Add'} ${league.name} from favorites`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 14, fontVariationSettings: isFavoriteLeague(league.slug) ? "'FILL' 1" : "'FILL' 0", color: isFavoriteLeague(league.slug) ? 'var(--color-primary)' : undefined }}
                  >
                    star
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div>
        <div className="px-2.5 py-1 font-geist text-[10px] font-bold uppercase tracking-widest text-outline flex items-center justify-between">
          <span>{t('common.countries', 'Countries')}</span>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>expand_more</span>
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          {COUNTRIES.map(c => (
            <Link
              key={c.name}
              href={`/competitions?country=${c.name.toLowerCase()}`}
              className="flex items-center justify-between px-2 py-1.5 rounded font-inter text-[13px] text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CountryFlag
                  country={c.name}
                  width={22}
                  height={15}
                  className="shrink-0"
                />
                <span className="truncate text-[12px] font-medium text-on-surface group-hover:text-primary transition-colors">
                  {t(`countries.${c.name}`, c.name)}
                </span>
              </div>
              <span className="font-geist text-[11px] font-semibold text-outline tabular-nums shrink-0">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
