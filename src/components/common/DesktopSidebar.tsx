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
    <aside className="w-[245px] shrink-0 h-[calc(100vh-4.5rem)] sticky top-[72px] py-4 overflow-y-auto border-r rtl:border-r-0 rtl:border-l border-white/40 dark:border-white/10 pr-3 rtl:pr-0 rtl:pl-3 hidden md:block">
      {/* Main Navigation */}
      <nav className="flex flex-col gap-1.5 mb-6" aria-label={t('nav.scores', 'Main navigation')}>
        {navItems.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'apple-glass border-purple-500/40 text-purple-700 dark:text-purple-300 font-bold scale-[1.02] shadow-[0_4px_16px_rgba(139,92,246,0.12)]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    color: isActive ? undefined : 'currentColor',
                  }}
                >
                  {item.icon}
                </span>
                <span className="font-inter text-[13.5px]">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-geist text-[10px] font-black tracking-widest uppercase shadow-2xs">
                  {item.badge}
                </span>
              )}
              {item.liveBadge && (
                <span className="flex items-center gap-1.5 font-geist text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse-live inline-block" />
                  {liveCount > 0 ? liveCount : ''}
                </span>
              )}
              {item.favBadge && totalFavorites > 0 && (
                <span className="font-geist text-[11px] font-bold text-purple-700 dark:text-purple-300 apple-glass px-2 py-0.5 rounded-full">
                  {totalFavorites}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Favorite Leagues */}
      <div className="mb-6">
        <div className="px-3.5 py-1 font-geist text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>{t('common.favorite_leagues', 'Favorite Leagues')}</span>
          <span className="material-symbols-outlined text-[15px]">tune</span>
        </div>
        <div className="flex flex-col gap-1 mt-1.5">
          {favoriteLeagues.map(league => (
            <div
              key={league.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-all group"
            >
              <Link
                href={`/league/${league.id || league.slug}`}
                prefetch={false}
                className="flex items-center gap-2.5 min-w-0 flex-1 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors"
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
                <span className="truncate text-[13px] font-medium">
                  {league.name}
                </span>
              </Link>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-geist text-[10px] font-bold text-purple-700 dark:text-purple-300 apple-segmented-track px-1.5 py-0.5 rounded-full">
                  {league.countryCode}
                </span>
                <button
                  onClick={() => toggleLeague(league.slug)}
                  className="p-1 rounded-full text-slate-400 hover:text-amber-500 transition-colors cursor-pointer hover:scale-110 active:scale-95"
                  aria-label={`${isFavoriteLeague(league.slug) ? 'Remove' : 'Add'} ${league.name} from favorites`}
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{
                      fontVariationSettings: isFavoriteLeague(league.slug) ? "'FILL' 1" : "'FILL' 0",
                      color: isFavoriteLeague(league.slug) ? '#F59E0B' : undefined,
                    }}
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
        <div className="px-3.5 py-1 font-geist text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>{t('common.countries', 'Countries')}</span>
          <span className="material-symbols-outlined text-[15px]">expand_more</span>
        </div>
        <div className="flex flex-col gap-1 mt-1.5">
          {COUNTRIES.map(c => (
            <Link
              key={c.name}
              href={`/competitions?country=${c.name.toLowerCase()}`}
              className="flex items-center justify-between px-3 py-2 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <CountryFlag
                  country={c.name}
                  width={22}
                  height={15}
                  className="shrink-0 rounded-xs"
                />
                <span className="truncate text-[13px] font-medium group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                  {t(`countries.${c.name}`, c.name)}
                </span>
              </div>
              <span className="font-geist text-[11px] font-bold text-slate-500 dark:text-slate-400 apple-segmented-track px-2 py-0.5 rounded-full tabular-nums shrink-0">
                {c.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
