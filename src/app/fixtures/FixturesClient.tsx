'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import DateSelector from '@/components/common/DateSelector'
import CompetitionGroup from '@/components/match/CompetitionGroup'
import SkeletonMatchRow from '@/components/common/SkeletonLoader'
import EmptyState from '@/components/common/EmptyState'
import AdvertisementPlaceholder from '@/components/common/AdvertisementPlaceholder'
import { useLanguage } from '@/context/LanguageContext'
import { Match } from '@/types/match'
import { League } from '@/types/league'
import { sportsService } from '@/services/sports/sportsService'
import { getCompetitionPriority } from '@/config/competitions'

export default function FixturesClient() {
  const { t } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadFixtures() {
      try {
        setIsLoading(true)
        const raw = await sportsService.getMatchesByDate(selectedDate)
        const scheduled = raw.filter((m: Match) => m.status === 'scheduled')
        setMatches(scheduled.length > 0 ? scheduled : raw)
      } catch (err) {
        console.error('Error fetching fixtures:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadFixtures()
  }, [selectedDate])

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
    const groups = Array.from(map.values())
    groups.sort((a, b) => getCompetitionPriority(a.league) - getCompetitionPriority(b.league))
    return groups
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
            <div>
              <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container" aria-hidden="true">calendar_month</span>
                Football Fixtures & Upcoming Matches
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Complete match schedule and kickoff times across top global leagues
              </p>
            </div>
            <span className="bg-primary-container/10 text-primary-container px-3 py-1 rounded-full text-xs font-bold font-geist border border-primary-container/20">
              {matches.length} {t('common.fixturesCount', 'FIXTURES')}
            </span>
          </div>

          {/* Date Selector Strip */}
          <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

          {/* Matches List */}
          {isLoading ? (
            <div className="space-y-3 bg-surface-container rounded-lg p-3">
              <SkeletonMatchRow />
              <SkeletonMatchRow />
              <SkeletonMatchRow />
            </div>
          ) : groupedByLeague.length === 0 ? (
            <EmptyState
              title={t('common.noMatchesScheduled', 'No matches scheduled for this date')}
              description={t('common.selectAnotherDate', 'Select another date on the calendar above to view upcoming fixtures.')}
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
