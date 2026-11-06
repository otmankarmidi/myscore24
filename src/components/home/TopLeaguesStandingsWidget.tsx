'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TeamLogo from '@/components/common/TeamLogo'
import { mockStandings, getStandingsByLeagueId } from '@/data/mockStandings'
import { useLanguage } from '@/context/LanguageContext'

interface LeagueTab {
  id: string
  nameAr: string
  nameEn: string
  logo: string
  slug: string
}

const TOP_5_LEAGUES: LeagueTab[] = [
  {
    id: 'epl',
    nameAr: 'الدوري الإنجليزي الممتاز',
    nameEn: 'Premier League',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    slug: 'premier-league',
  },
  {
    id: 'laliga',
    nameAr: 'الدوري الإسباني - لا ليغا',
    nameEn: 'La Liga',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    slug: 'la-liga',
  },
  {
    id: 'seriea',
    nameAr: 'الدوري الإيطالي - سيري آ',
    nameEn: 'Serie A',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    slug: 'serie-a',
  },
  {
    id: 'bundesliga',
    nameAr: 'الدوري الألماني - بوندسليغا',
    nameEn: 'Bundesliga',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    slug: 'bundesliga',
  },
  {
    id: 'ligue1',
    nameAr: 'الدوري الفرنسي - ليغ 1',
    nameEn: 'Ligue 1',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    slug: 'ligue-1',
  },
]

export default function TopLeaguesStandingsWidget() {
  const { locale } = useLanguage()
  const isAr = locale === 'ar'

  const [activeLeagueId, setActiveLeagueId] = useState<string>('epl')

  const activeLeague = useMemo(() => {
    return TOP_5_LEAGUES.find((l) => l.id === activeLeagueId) || TOP_5_LEAGUES[0]
  }, [activeLeagueId])

  const standingsData = useMemo(() => {
    const found = getStandingsByLeagueId(activeLeagueId)
    return found ? found.standings.slice(0, 6) : []
  }, [activeLeagueId])

  return (
    <section
      aria-label="Top 5 Leagues Standings"
      className="w-full rounded-3xl apple-glass p-5 select-none space-y-4 transition-all duration-300"
    >
      {/* Header Row: Title on primary side, League Switcher in center, More link on secondary side */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/60 dark:border-white/10 pb-3.5">
        {/* Primary Side: Section Title with Trophy Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl apple-segmented-track flex items-center justify-center text-[#6425A6] dark:text-purple-300 shadow-xs">
            <span className="material-symbols-outlined text-lg">emoji_events</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-[#171717] dark:text-white">
            {isAr ? 'ترتيب أحسن 5 دوريات' : 'Top 5 Leagues Standings'}
          </h2>
        </div>

        {/* Center: Circular League Selectors */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 apple-segmented-track rounded-full p-1">
          {TOP_5_LEAGUES.map((league) => {
            const isActive = league.id === activeLeagueId
            return (
              <button
                key={league.id}
                type="button"
                onClick={() => setActiveLeagueId(league.id)}
                title={isAr ? league.nameAr : league.nameEn}
                aria-label={isAr ? league.nameAr : league.nameEn}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full p-1.5 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                  isActive
                    ? 'apple-segmented-active scale-105 shadow-md'
                    : 'hover:bg-white/40 dark:hover:bg-white/10 opacity-75 hover:opacity-100 hover:scale-102'
                }`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={league.logo}
                    alt={league.nameEn}
                    width={26}
                    height={26}
                    className={`object-contain filter transition-transform duration-300 ${
                      league.id === 'epl' || league.id === 'ligue1' ? 'filter brightness-0 dark:invert' : 'brightness-105'
                    }`}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Secondary Side: View More Standings Pill Button */}
        <Link
          href={`/league/${activeLeague.slug}`}
          className="px-4 py-1.5 rounded-full apple-glass text-[#6425A6] dark:text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-[#6425A6] hover:to-[#9333ea] font-bold text-xs transition-all duration-300 flex items-center gap-1 shadow-xs shrink-0 cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>{isAr ? 'المزيد' : 'More'}</span>
          <span className="material-symbols-outlined text-[15px] rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>

      {/* Subheader: Active League Display Name */}
      <div className={`${isAr ? 'text-end' : 'text-start'} px-1`}>
        <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-white tracking-tight">
          {isAr ? activeLeague.nameAr : activeLeague.nameEn}
        </h3>
      </div>

      {/* Standings Table (Top 6 Teams - Matching Image 2) */}
      <div className="w-full overflow-x-auto scrollbar-none">
        <table className="w-full text-xs text-[#6B7280] dark:text-slate-300 text-center border-collapse">
          <thead>
            <tr className="text-[#6B7280] dark:text-slate-400 font-semibold border-b border-white/60 dark:border-white/10 text-[11px] sm:text-xs">
              {isAr ? (
                <>
                  <th className="py-2.5 px-2 text-start font-bold text-[#171717] dark:text-white">الفريق</th>
                  <th className="py-2.5 px-2 font-bold text-[#171717] dark:text-white">#</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-2 font-bold text-[#171717] dark:text-white">#</th>
                  <th className="py-2.5 px-2 text-start font-bold text-[#171717] dark:text-white">Team</th>
                </>
              )}
              <th className="py-2.5 px-1.5 sm:px-2 font-medium">{isAr ? 'ل' : 'P'}</th>
              <th className="py-2.5 px-2 font-medium hidden sm:table-cell">{isAr ? 'ف' : 'W'}</th>
              <th className="py-2.5 px-2 font-medium hidden sm:table-cell">{isAr ? 'ت' : 'D'}</th>
              <th className="py-2.5 px-2 font-medium hidden sm:table-cell">{isAr ? 'خ' : 'L'}</th>
              <th className="py-2.5 px-2 font-medium hidden sm:table-cell">{isAr ? 'له' : 'GF'}</th>
              <th className="py-2.5 px-2 font-medium hidden sm:table-cell">{isAr ? 'عليه' : 'GA'}</th>
              <th className="py-2.5 px-1.5 sm:px-2 font-medium">{isAr ? 'الفرق' : 'GD'}</th>
              <th className="py-2.5 px-1.5 sm:px-2 font-bold text-[#6425A6] dark:text-purple-400">{isAr ? 'ن' : 'Pts'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 dark:divide-white/5">
            {standingsData.map((row) => (
              <tr
                key={row.position}
                className="hover:bg-white/60 dark:hover:bg-white/10 transition-colors duration-200 rounded-lg group"
              >
                {isAr ? (
                  <>
                    {/* Team Column (Name + Logo in RTL) */}
                    <td className="py-2.5 px-2 text-start">
                      <div className="flex items-center gap-2 min-w-[110px] sm:min-w-[140px]">
                        <TeamLogo
                          logo={row.team?.logo}
                          name={row.team?.name || ''}
                          size="xs"
                        />
                        <span className="font-bold text-[#171717] dark:text-white group-hover:text-[#6425A6] dark:group-hover:text-amber-400 transition-colors truncate">
                          {row.team?.name}
                        </span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-2.5 px-1.5 sm:px-2 font-black text-[#171717] dark:text-white tabular-nums">
                      {row.position}
                    </td>
                  </>
                ) : (
                  <>
                    {/* Position */}
                    <td className="py-2.5 px-1.5 sm:px-2 font-black text-[#171717] dark:text-white tabular-nums">
                      {row.position}
                    </td>

                    {/* Team Column (Name + Logo in LTR) */}
                    <td className="py-2.5 px-2 text-start">
                      <div className="flex items-center gap-2 min-w-[110px] sm:min-w-[140px]">
                        <TeamLogo
                          logo={row.team?.logo}
                          name={row.team?.name || ''}
                          size="xs"
                        />
                        <span className="font-bold text-[#171717] dark:text-white group-hover:text-[#6425A6] dark:group-hover:text-amber-400 transition-colors truncate">
                          {row.team?.name}
                        </span>
                      </div>
                    </td>
                  </>
                )}

                {/* Played */}
                <td className="py-2.5 px-1.5 sm:px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium">
                  {row.played}
                </td>

                {/* Won */}
                <td className="py-2.5 px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium hidden sm:table-cell">
                  {row.won}
                </td>

                {/* Drawn */}
                <td className="py-2.5 px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium hidden sm:table-cell">
                  {row.drawn}
                </td>

                {/* Lost */}
                <td className="py-2.5 px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium hidden sm:table-cell">
                  {row.lost}
                </td>

                {/* Goals For */}
                <td className="py-2.5 px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium hidden sm:table-cell">
                  {row.goalsFor}
                </td>

                {/* Goals Against */}
                <td className="py-2.5 px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium hidden sm:table-cell">
                  {row.goalsAgainst}
                </td>

                {/* Goal Difference */}
                <td className="py-2.5 px-1.5 sm:px-2 tabular-nums text-[#6B7280] dark:text-slate-300 font-medium">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>

                {/* Points */}
                <td className="py-2.5 px-1.5 sm:px-2 font-black text-[#6425A6] dark:text-purple-400 tabular-nums text-sm">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
