'use client'

import React from 'react'
import Link from 'next/link'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { mockLeagues } from '@/data/mockLeagues'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/hooks/useFavorites'

const QUICK_LEAGUES = [
  { name: 'Premier League', href: '/league/39', icon: '/leagues/premier-league.png' },
  { name: 'LaLiga', href: '/league/140', icon: '/leagues/laliga.png' },
  { name: 'Bundesliga', href: '/league/78', icon: '/leagues/bundesliga.png' },
  { name: 'Serie A', href: '/league/135', icon: '/leagues/serie-a.png' },
  { name: 'Ligue 1', href: '/league/61', icon: '/leagues/ligue-1.png' },
  { name: 'Champions League', href: '/league/2', icon: '/leagues/champions-league.png' },
]

export default function MobileQuickLeaguesBar() {
  const { t, locale } = useLanguage()
  const { isFavoriteLeague, toggleLeague } = useFavorites()
  const isAr = locale === 'ar'

  const favoriteLeagues = mockLeagues.slice(0, 6)

  return (
    <div className="md:hidden w-full space-y-3 px-1 my-3">
      {/* Favorite Leagues Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
            <span className="font-geist text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('common.favorite_leagues', 'Favorite Leagues')}
            </span>
          </div>
          <Link
            href="/competitions"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
          >
            <span>{isAr ? 'عرض الكل' : 'View All'}</span>
            <span className="material-symbols-outlined text-xs rtl:rotate-180">chevron_right</span>
          </Link>
        </div>

        {/* Horizontal scrollable pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {favoriteLeagues.map((league) => {
            const isFav = isFavoriteLeague(league.slug)
            return (
              <div
                key={league.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shrink-0 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Link
                  href={`/league/${league.id || league.slug}`}
                  prefetch={false}
                  className="flex items-center gap-1.5 min-w-0"
                >
                  <CompetitionLogo
                    logo={league.logo}
                    name={league.name}
                    country={league.country}
                    countryFlag={league.countryFlag}
                    providerId={league.id}
                    slug={league.slug}
                    size={18}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {league.name}
                  </span>
                </Link>
                <span className="font-geist text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1 rounded border border-purple-200/50 dark:border-purple-800/40">
                  {league.countryCode}
                </span>
                <button
                  onClick={() => toggleLeague(league.slug)}
                  className="text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                  aria-label={`${isFav ? 'Remove' : 'Add'} ${league.name}`}
                >
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{
                      fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                      color: isFav ? '#F59E0B' : undefined,
                    }}
                  >
                    star
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Quick Links Row */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
            {isAr ? 'روابط سريعة:' : 'Quick:'}
          </span>
          {QUICK_LEAGUES.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors"
            >
              <img
                src={item.icon}
                alt={item.name}
                width={14}
                height={14}
                className="w-3.5 h-3.5 object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.visibility = 'hidden'
                }}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
