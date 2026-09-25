'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Match } from '@/types/match'
import { LeagueStanding } from '@/types/standing'
import { useLanguage } from '@/context/LanguageContext'
import { useTimezone } from '@/context/TimezoneContext'
import { formatDate } from '@/lib/utils'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import { sportsService } from '@/services/sports/sportsService'
import {
  BROADCASTER_COUNTRIES,
  BroadcasterCountry,
  BroadcasterItem,
  getMatchBroadcasters,
  getRefereeProfile,
  getTeamFifaRanking,
  getClubPosition,
  isNationalTeamMatch,
} from '@/lib/matchBroadcastersData'

interface MatchBroadcastAndInfoProps {
  match: Match
  standings?: LeagueStanding[]
}

export default function MatchBroadcastAndInfo({ match, standings }: MatchBroadcastAndInfoProps) {
  const { locale, t } = useLanguage()
  const { activeTimezone } = useTimezone()

  // Selected Country for Broadcasters (default to Morocco 'MA')
  const [selectedCountry, setSelectedCountry] = useState<BroadcasterCountry>(
    BROADCASTER_COUNTRIES[0]
  )
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)

  // Channels for the current match & selected country
  const [channels, setChannels] = useState<BroadcasterItem[]>([])

  useEffect(() => {
    const list = getMatchBroadcasters(match, selectedCountry.code)
    setChannels(list)
  }, [match, selectedCountry.code])

  // Referee & Card Stats
  const refereeProfile = getRefereeProfile(match.referee, match.league?.country)

  // Rankings Logic
  const isNational = isNationalTeamMatch(match)
  const homeFifa = isNational ? getTeamFifaRanking(match.homeTeam?.name) : { rank: null, isFifa: false }
  const awayFifa = isNational ? getTeamFifaRanking(match.awayTeam?.name) : { rank: null, isFifa: false }

  // Live FIFA rankings fetched from /api/fifa-rankings
  const [apiFifaRanks, setApiFifaRanks] = useState<{
    home: number | null
    away: number | null
  } | null>(null)

  useEffect(() => {
    if (!isNational) return
    let isMounted = true

    sportsService
      .getFifaRankings(match.homeTeam?.name, match.awayTeam?.name)
      .then((res) => {
        if (isMounted && (res.homeRank !== null || res.awayRank !== null)) {
          setApiFifaRanks({
            home: res.homeRank,
            away: res.awayRank,
          })
        }
      })
      .catch((err) => {
        console.warn('FIFA ranking API fetch warning:', err)
      })

    return () => {
      isMounted = false
    }
  }, [match.homeTeam?.name, match.awayTeam?.name, isNational])

  const homeClubPos = !isNational ? getClubPosition(match.homeTeam?.name, match.homeTeam?.id, standings) : null
  const awayClubPos = !isNational ? getClubPosition(match.awayTeam?.name, match.awayTeam?.id, standings) : null

  const homeFifaRank = apiFifaRanks?.home ?? homeFifa.rank
  const awayFifaRank = apiFifaRanks?.away ?? awayFifa.rank

  const hasRankingData = isNational
    ? (homeFifaRank !== null || awayFifaRank !== null)
    : (homeClubPos !== null || awayClubPos !== null)

  const homeRankDisplay = isNational
    ? (homeFifaRank ? `#${homeFifaRank}` : '#--')
    : (homeClubPos ? `#${homeClubPos}` : '#--')

  const awayRankDisplay = isNational
    ? (awayFifaRank ? `#${awayFifaRank}` : '#--')
    : (awayClubPos ? `#${awayClubPos}` : '#--')

  // Formatted date & time (e.g. 19:00 • 2026/9/25)
  const formattedTime = formatDate(match.kickoff, 'HH:mm', activeTimezone, locale)
  const formattedDate = formatDate(match.kickoff, 'yyyy/M/d', activeTimezone, locale)

  // Translated labels
  const isRtl = locale === 'ar'
  const whereToWatchTitle = isRtl ? 'مكان المشاهدة' : locale === 'fr' ? 'Où regarder' : 'Where to Watch'
  const fullScheduleTitle = isRtl ? 'تقويم كامل' : locale === 'fr' ? 'Programme complet' : 'Full Schedule'
  const dateTimeTitle = isRtl ? 'التاريخ و الوقت' : locale === 'fr' ? 'Date et heure' : 'Date & Time'
  const competitionTitle = isRtl ? 'المنافسة' : locale === 'fr' ? 'Compétition' : 'Competition'
  const refereeTitle = isRtl ? 'الحكم' : locale === 'fr' ? 'Arbitre' : 'Referee'
  const cardsAvgTitle = isRtl ? 'متوسط البطاقات' : locale === 'fr' ? 'Moyenne de cartons' : 'Cards average'
  const rankingTitle = isNational
    ? isRtl
      ? 'FIFA ترتيب'
      : locale === 'fr'
      ? 'Classement FIFA'
      : 'FIFA Ranking'
    : isRtl
    ? 'ترتيب الدوري'
    : locale === 'fr'
    ? 'Classement'
    : 'League Standing'
  const venueTitle = isRtl ? 'الملعب' : locale === 'fr' ? 'Stade' : 'Venue'

  // Competition breadcrumb / details text
  const sportName = isRtl ? 'كرة القدم' : locale === 'fr' ? 'Football' : 'Football'
  const compDetails = `${sportName}، ${match.league?.name || 'Competition'}${
    match.round ? `، ${match.round}` : ''
  }`

  return (
    <div className="space-y-4 font-inter text-on-surface select-none">
      {/* ── CARD 1: WHERE TO WATCH ("مكان المشاهدة") ── */}
      <div className="bg-[#121824] rounded-2xl border border-surface-bright/70 p-4 shadow-xl overflow-hidden relative">
        {/* Header & Country Selector */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-bright/50">
          <h3 className="font-bold text-base md:text-lg text-on-surface">
            {whereToWatchTitle}
          </h3>

          {/* Country Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-surface-bright/80 hover:bg-surface-bright transition-colors cursor-pointer"
              aria-label="Select broadcast country"
            >
              <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
              <span className="text-xs font-semibold text-on-surface hidden sm:inline">
                {isRtl ? selectedCountry.nameAr : selectedCountry.name}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                arrow_drop_down
              </span>
            </button>

            {/* Country Dropdown Menu */}
            {isCountryDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCountryDropdownOpen(false)}
                />
                <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-52 bg-surface-container-high rounded-xl border border-surface-bright shadow-2xl p-1 z-50 max-h-64 overflow-y-auto">
                  {BROADCASTER_COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country)
                        setIsCountryDropdownOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        selectedCountry.code === country.code
                          ? 'bg-primary/20 text-primary'
                          : 'text-on-surface hover:bg-surface-bright'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{country.flag}</span>
                        <span>{isRtl ? country.nameAr : country.name}</span>
                      </span>
                      {selectedCountry.code === country.code && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* TV Channels & Streaming List (Clean list without voting buttons) */}
        <div className="divide-y divide-surface-bright/40 py-1">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-surface-container-high/30 rounded-lg transition-colors"
            >
              {/* Quality & Free Badges on Left */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider ${
                    channel.quality === '4K'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : channel.type === 'stream'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-surface-container-highest text-on-surface-variant border border-surface-bright/60'
                  }`}
                >
                  {channel.quality || (channel.type === 'stream' ? 'STREAM' : 'HD')}
                </span>
                {channel.isFree && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isRtl ? 'مجاني' : 'FREE'}
                  </span>
                )}
              </div>

              {/* Channel Name & TV / Stream Icon on Right */}
              <div className="flex items-center gap-2.5 min-w-0 justify-end">
                <span className="font-bold text-sm md:text-base text-on-surface truncate">
                  {channel.name}
                </span>
                <span
                  className="material-symbols-outlined text-[20px] text-primary shrink-0"
                  aria-hidden="true"
                >
                  {channel.type === 'stream' ? 'play_circle' : 'tv'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Full Schedule Link */}
        <div className="pt-2.5 text-center border-t border-surface-bright/40">
          <Link
            href="/fixtures"
            className="inline-flex items-center justify-center gap-1.5 text-xs md:text-sm font-bold text-primary hover:underline transition-all"
          >
            <span>{fullScheduleTitle}</span>
            <span className="material-symbols-outlined text-[16px] rtl:rotate-180">
              arrow_forward_ios
            </span>
          </Link>
        </div>
      </div>

      {/* ── CARD 2: MATCH INFO ("معلومات المباراة") ── */}
      <div className="bg-[#121824] rounded-2xl border border-surface-bright/70 p-4 md:p-5 shadow-xl space-y-4">
        {/* Row 1: Date & Time */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-surface-bright/40">
          <div className="flex items-center gap-2 font-mono font-bold text-sm md:text-base text-on-surface">
            <span>{formattedTime}</span>
            <span className="text-on-surface-variant font-light">•</span>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1 text-on-surface-variant text-xs">
            <span className="font-medium">{dateTimeTitle}</span>
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
        </div>

        {/* Row 2: Competition */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-surface-bright/40">
          <Link
            href={`/competition/${match.league?.id || match.league?.slug}`}
            className="flex items-center gap-1 text-on-surface hover:text-primary transition-colors text-left rtl:text-right"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant rtl:rotate-180">
              arrow_back_ios
            </span>
            <span className="font-semibold text-xs md:text-sm text-on-surface line-clamp-1">
              {compDetails}
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs shrink-0">
            <span className="font-medium">{competitionTitle}</span>
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-surface-container">
              <CompetitionLogo
                logo={match.league?.logo}
                name={match.league?.name || 'League'}
                size={18}
              />
            </div>
          </div>
        </div>

        {/* Row 3: Referee */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-surface-bright/40">
          <div className="flex flex-col items-start rtl:items-end gap-1">
            <div className="flex items-center gap-1.5 font-bold text-sm text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant rtl:rotate-180">
                arrow_back_ios
              </span>
              <span>{isRtl ? refereeProfile.nameAr || refereeProfile.name : refereeProfile.name}</span>
              <span className="text-base leading-none select-none">{refereeProfile.flag}</span>
            </div>

            {/* Disciplinary Card Averages */}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
              <span className="font-sans text-[11px]">{cardsAvgTitle}</span>
              <span className="flex items-center gap-1 font-bold text-error">
                <span>{refereeProfile.redAvg.toFixed(2)}</span>
                <span className="w-2.5 h-3.5 bg-red-600 rounded-[1px] inline-block shadow-sm" />
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <span>{refereeProfile.yellowAvg.toFixed(2)}</span>
                <span className="w-2.5 h-3.5 bg-amber-400 rounded-[1px] inline-block shadow-sm" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs shrink-0">
            <span className="font-medium">{refereeTitle}</span>
            <span className="material-symbols-outlined text-[18px]">sports</span>
          </div>
        </div>

        {/* Row 4: Team Rankings (Real FIFA Ranking or Real League Position) */}
        {hasRankingData && (
          <div className="space-y-2 pb-2">
            <div className="flex justify-end text-xs font-bold text-on-surface-variant tracking-wider uppercase">
              <span>{rankingTitle}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Away Team Rank */}
              <div className="flex items-center gap-3 bg-surface-container-high/40 p-2.5 rounded-xl border border-surface-bright/50">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-surface-bright/80 bg-surface-container flex items-center justify-center">
                  <TeamLogo
                    name={match.awayTeam.name}
                    abbreviation={match.awayTeam.abbreviation}
                    logo={match.awayTeam.logo}
                    size="sm"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-mono font-extrabold text-lg text-primary block leading-none">
                    {awayRankDisplay}
                  </span>
                  <span className="text-xs text-on-surface font-semibold truncate block mt-0.5">
                    {match.awayTeam.name}
                  </span>
                </div>
              </div>

              {/* Home Team Rank */}
              <div className="flex items-center gap-3 bg-surface-container-high/40 p-2.5 rounded-xl border border-surface-bright/50">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-surface-bright/80 bg-surface-container flex items-center justify-center">
                  <TeamLogo
                    name={match.homeTeam.name}
                    abbreviation={match.homeTeam.abbreviation}
                    logo={match.homeTeam.logo}
                    size="sm"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-mono font-extrabold text-lg text-primary block leading-none">
                    {homeRankDisplay}
                  </span>
                  <span className="text-xs text-on-surface font-semibold truncate block mt-0.5">
                    {match.homeTeam.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional Stadium / Venue Info */}
        {match.venue && (
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-bright/40">
            <span className="font-bold text-on-surface truncate">{match.venue}</span>
            <div className="flex items-center gap-1 shrink-0">
              <span>{venueTitle}</span>
              <span className="material-symbols-outlined text-[16px]">stadium</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
