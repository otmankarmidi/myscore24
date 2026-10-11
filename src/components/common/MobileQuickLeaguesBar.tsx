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
    <div className="md:hidden w-full space-y-3 px-1 my-2">
      {/* Favorite Leagues Card */}
      <div className="bg-white dark:bg-[#0c121e] rounded-xl border border-[#E5E5E5] dark:border-[#182335] p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#E5E5E5] dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#6425A6]">star</span>
            <span className="font-geist text-xs font-black uppercase tracking-wider text-[#6425A6]">
              {t('common.favorite_leagues', 'Favorite Leagues')}
            </span>
          </div>
          <Link
            href="/competitions"
            className="text-[11px] font-bold text-[#6425A6] hover:underline flex items-center gap-0.5"
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F5F5F5] dark:bg-[#121a29] border border-[#E5E5E5] dark:border-[#1b263b] shrink-0 text-xs hover:bg-[#F3ECFA] transition-colors"
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
                  <span className="font-bold text-[#171717] dark:text-white truncate max-w-[100px]">
                    {league.name}
                  </span>
                </Link>
                <span className="font-geist text-[9px] font-extrabold text-[#6425A6] bg-[#F3ECFA] px-1 rounded">
                  {league.countryCode}
                </span>
                <button
                  onClick={() => toggleLeague(league.slug)}
                  className="text-[#9CA3AF] hover:text-[#6425A6] transition-colors"
                  aria-label={`${isFav ? 'Remove' : 'Add'} ${league.name}`}
                >
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{
                      fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                      color: isFav ? '#6425A6' : undefined,
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
        <div className="mt-2.5 pt-2 border-t border-[#F5F5F5] dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-slate-400 shrink-0">
            {isAr ? 'روابط سريعة:' : 'Quick:'}
          </span>
          {QUICK_LEAGUES.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#F9FAFB] dark:bg-[#101726] border border-[#E5E5E5] dark:border-slate-800 text-[11px] font-semibold text-[#171717] dark:text-slate-200 hover:text-[#6425A6] hover:bg-[#F3ECFA] shrink-0 transition-colors"
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
