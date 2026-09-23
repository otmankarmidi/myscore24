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
import { useLanguage } from '@/context/LanguageContext'
import { Match } from '@/types/match'
import { League } from '@/types/league'

export default function LiveClient() {
  const { t } = useLanguage()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchLiveMatches = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/matches/live')
      const json = await res.json()
      setMatches(json.data || [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Error fetching live matches:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveMatches()
    const interval = setInterval(fetchLiveMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredMatches = useMemo(() => {
    const list = (matches || []).filter(Boolean)
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      m =>
        (m.homeTeam?.name || '').toLowerCase().includes(q) ||
        (m.awayTeam?.name || '').toLowerCase().includes(q) ||
        (m.league?.name || '').toLowerCase().includes(q)
    )
  }, [matches, searchQuery])

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
          <div className="flex items-center justify-between bg-surface-container border border-surface-bright/40 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-error animate-pulse" aria-hidden="true" />
              <div>
                <h1 className="text-xl font-bold text-on-surface">
                  Live Football Scores Today
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Real-time live scores, in-play match statistics, and goal updates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="bg-error/10 text-error px-2.5 py-1 rounded-full font-bold border border-error/20">
                {matches.length} {t('match.status.live', 'LIVE')}
              </span>
              {lastUpdated && (
                <span className="text-on-surface-variant hidden sm:inline">
                  {lastUpdated}
                </span>
              )}
            </div>
          </div>

          {/* Matches List */}
          {isLoading ? (
            <div className="space-y-3 bg-surface-container rounded-lg p-3">
              <SkeletonMatchRow />
              <SkeletonMatchRow />
              <SkeletonMatchRow />
            </div>
          ) : groupedByLeague.length === 0 ? (
            <EmptyState
              title={t('common.noLiveMatches', 'No live matches right now')}
              description={t('common.checkUpcoming', 'Check the upcoming tab to see scheduled kickoff times.')}
            />
          ) : (
            <div className="space-y-4">
              {groupedByLeague.map(({ league, matches }) => (
                <CompetitionGroup
                  key={league.id || league.slug}
                  league={league}
                  matches={matches}
                />
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
