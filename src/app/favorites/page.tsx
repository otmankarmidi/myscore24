'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import CompetitionGroup from '@/components/match/CompetitionGroup'
import SkeletonMatchRow from '@/components/common/SkeletonLoader'
import EmptyState from '@/components/common/EmptyState'
import AdvertisementPlaceholder from '@/components/common/AdvertisementPlaceholder'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/context/LanguageContext'
import { Match } from '@/types/match'
import { League } from '@/types/league'

export default function FavoritesPage() {
  const { favorites, totalFavorites } = useFavorites()
  const { t } = useLanguage()

  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadMatches() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/matches/today')
        const json = await res.json()
        setAllMatches(json.data || [])
      } catch (err) {
        console.error('Error loading favorites matches:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadMatches()
  }, [])

  // Filter matches that are in favorites.matches, favorites.leagues, or where a team is favorited
  const favoritedMatchesList = useMemo(() => {
    const list = (allMatches || []).filter(Boolean)
    const favMatches = Array.isArray(favorites?.matches) ? favorites.matches : []
    const favLeagues = Array.isArray(favorites?.leagues) ? favorites.leagues : []
    const favTeams = Array.isArray(favorites?.teams) ? favorites.teams : []

    return list.filter(
      m =>
        favMatches.includes(m.id) ||
        (m.league?.slug && favLeagues.includes(m.league.slug)) ||
        (m.league?.id && favLeagues.includes(m.league.id)) ||
        (m.homeTeam?.id && favTeams.includes(m.homeTeam.id)) ||
        (m.homeTeam?.slug && favTeams.includes(m.homeTeam.slug)) ||
        (m.awayTeam?.id && favTeams.includes(m.awayTeam.id)) ||
        (m.awayTeam?.slug && favTeams.includes(m.awayTeam.slug))
    )
  }, [allMatches, favorites])

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return favoritedMatchesList
    const q = searchQuery.toLowerCase()
    return favoritedMatchesList.filter(
      m =>
        (m.homeTeam?.name || '').toLowerCase().includes(q) ||
        (m.awayTeam?.name || '').toLowerCase().includes(q) ||
        (m.league?.name || '').toLowerCase().includes(q)
    )
  }, [favoritedMatchesList, searchQuery])

  const groupedByLeague = useMemo(() => {
    const map = new Map<string, { league: League; matches: Match[] }>()
    filteredMatches.forEach(match => {
      if (!match?.league) return
      const leagueId = match.league.id || match.league.slug || 'league'
      if (!map.has(leagueId)) {
        map.set(leagueId, { league: match.league, matches: [] })
      }
      map.get(leagueId)!.matches.push(match)
    })
    return Array.from(map.values())
  }, [filteredMatches])

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-3">
          <AdvertisementPlaceholder variant="banner" />

          {/* Section Banner */}
          <div className="flex items-center justify-between bg-surface-container border border-surface-bright/70 rounded-xl p-4 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">star</span>
                {t('common.yourFavorited', 'Your Favorited Matches & Leagues')}
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t('common.yourFavoritedDesc', 'Quick access to your pinned matches, clubs, and favorite competitions')}
              </p>
            </div>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-geist border border-primary/20">
              {totalFavorites} {t('common.saved', 'SAVED')}
            </span>
          </div>

          {/* Content States */}
          {isLoading ? (
            <div className="space-y-3 bg-surface-container rounded-lg p-3">
              <SkeletonMatchRow />
            </div>
          ) : favoritedMatchesList.length === 0 ? (
            <EmptyState
              title={t('common.noFavorites', 'No Favorites Saved Yet')}
              description={t('common.noFavoritesDesc', 'Click the star icon on any match or league row across the app to pin it here for instant access.')}
            />
          ) : (
            <div className="space-y-3">
              {groupedByLeague.map(({ league, matches: leagueMatches }) => (
                <CompetitionGroup key={league.id} league={league} matches={leagueMatches} />
              ))}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>

      <MobileBottomNavigation />
    </div>
  )
}
