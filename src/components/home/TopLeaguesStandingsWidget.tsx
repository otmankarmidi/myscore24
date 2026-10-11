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
    id: 'botola',
    nameAr: 'الدوري المغربي الإحترافي إنوي',
    nameEn: 'Botola Pro Inwi',
    logo: 'https://media.api-sports.io/football/leagues/200.png',
    slug: 'botola-pro',
  },
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
    id: 'ligue1',
    nameAr: 'الدوري الفرنسي - ليغ 1',
    nameEn: 'Ligue 1',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    slug: 'ligue-1',
  },
  {
    id: 'seriea',
    nameAr: 'الدوري الإيطالي - سيري آ',
    nameEn: 'Serie A',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    slug: 'serie-a',
  },
]

export default function TopLeaguesStandingsWidget() {
  const { locale } = useLanguage()
  const isAr = locale === 'ar'

  const [activeLeagueId, setActiveLeagueId] = useState<string>('botola')

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
      className="w-full rounded-2xl bg-[#0d121c] border border-[#1b2334] p-4 sm:p-5 select-none shadow-lg space-y-4"
    >
      {/* Header Row: Title on primary side, League Switcher in center, More link on secondary side */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/70 pb-3.5">
        {/* Primary Side: Section Title with Trophy Icon */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-base">emoji_events</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white">
            {isAr ? 'ترتيب أحسن 5 دوريات' : 'Top 5 Leagues Standings'}
          </h2>
        </div>

        {/* Center: Circular League Selectors */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1">
          {TOP_5_LEAGUES.map((league) => {
            const isActive = league.id === activeLeagueId
            return (
              <button
                key={league.id}
                type="button"
                onClick={() => setActiveLeagueId(league.id)}
                title={isAr ? league.nameAr : league.nameEn}
                aria-label={isAr ? league.nameAr : league.nameEn}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full p-1.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1e2538] ring-2 ring-purple-500/80 shadow-lg scale-105'
                    : 'bg-[#141926] hover:bg-[#1c2234] border border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={league.logo}
                    alt={league.nameEn}
                    width={28}
                    height={28}
                    className={`object-contain filter ${
                      league.id === 'epl' || league.id === 'ligue1' ? 'brightness-0 invert' : 'brightness-110'
                    }`}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Secondary Side: View More Standings Pill Button */}
        <Link
          href={`/competitions`}
          className="px-3.5 py-1.5 rounded-full bg-[#101e30] border border-sky-800/50 hover:border-sky-600 text-sky-400 hover:text-sky-300 font-bold text-xs transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
        >
          <span>{isAr ? 'المزيد' : 'More'}</span>
          <span className="material-symbols-outlined text-[15px] rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>

      {/* Subheader: Active League Display Name */}
      <div className={`${isAr ? 'text-end' : 'text-start'} px-1`}>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {isAr ? activeLeague.nameAr : activeLeague.nameEn}
        </h3>
      </div>

      {/* Standings Table (Top 6 Teams - Matching Image 2) */}
      <div className="w-full overflow-x-auto scrollbar-none">
        <table className="w-full text-xs text-slate-300 text-center border-collapse">
          <thead>
            <tr className="text-slate-400 font-semibold border-b border-slate-800/60 text-[11px] sm:text-xs">
              {isAr ? (
                <>
                  <th className="py-2.5 px-2 text-start font-bold">الفريق</th>
                  <th className="py-2.5 px-2 font-bold">#</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-2 font-bold">#</th>
                  <th className="py-2.5 px-2 text-start font-bold">Team</th>
                </>
              )}
              <th className="py-2.5 px-2 font-medium">{isAr ? 'ل' : 'P'}</th>
              <th className="py-2.5 px-2 font-medium">{isAr ? 'ف' : 'W'}</th>
              <th className="py-2.5 px-2 font-medium">{isAr ? 'ت' : 'D'}</th>
              <th className="py-2.5 px-2 font-medium">{isAr ? 'خ' : 'L'}</th>
              <th className="py-2.5 px-2 font-medium">{isAr ? 'له' : 'GF'}</th>
              <th className="py-2.5 px-2 font-medium">{isAr ? 'عليه' : 'GA'}</th>
              <th className="py-2.5 px-2 font-medium">{isAr ? 'الفرق' : 'GD'}</th>
              <th className="py-2.5 px-2 font-bold text-white">{isAr ? 'ن' : 'Pts'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {standingsData.map((row) => (
              <tr
                key={row.position}
                className="hover:bg-[#141a27] transition-colors rounded-lg group"
              >
                {isAr ? (
                  <>
                    {/* Team Column (Name + Logo in RTL) */}
                    <td className="py-2.5 px-2 text-start">
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <TeamLogo
                          logo={row.team?.logo}
                          name={row.team?.name || ''}
                          size="xs"
                        />
                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {row.team?.name}
                        </span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-2.5 px-2 font-black text-white tabular-nums">
                      {row.position}
                    </td>
                  </>
                ) : (
                  <>
                    {/* Position */}
                    <td className="py-2.5 px-2 font-black text-white tabular-nums">
                      {row.position}
                    </td>

                    {/* Team Column (Name + Logo in LTR) */}
                    <td className="py-2.5 px-2 text-start">
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <TeamLogo
                          logo={row.team?.logo}
                          name={row.team?.name || ''}
                          size="xs"
                        />
                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {row.team?.name}
                        </span>
                      </div>
                    </td>
                  </>
                )}

                {/* Played */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.played}
                </td>

                {/* Won */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.won}
                </td>

                {/* Drawn */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.drawn}
                </td>

                {/* Lost */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.lost}
                </td>

                {/* Goals For */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.goalsFor}
                </td>

                {/* Goals Against */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.goalsAgainst}
                </td>

                {/* Goal Difference */}
                <td className="py-2.5 px-2 tabular-nums text-slate-300 font-medium">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>

                {/* Points */}
                <td className="py-2.5 px-2 font-black text-white tabular-nums text-sm">
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
