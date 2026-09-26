'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import DesktopSidebar from '@/components/common/DesktopSidebar'
import RightSidebar from '@/components/common/RightSidebar'
import MobileBottomNavigation from '@/components/common/MobileBottomNavigation'
import FavoriteButton from '@/components/common/FavoriteButton'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import CountryFlag from '@/components/common/CountryFlag'
import { sportsService } from '@/services/sports/sportsService'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/context/LanguageContext'
import { League } from '@/types/league'

export default function CompetitionsClient() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRegion, setFilterRegion] = useState<string>('all')

  const { isLeagueFavorite, toggleFavoriteLeague } = useFavorites()
  const { t } = useLanguage()

  useEffect(() => {
    async function loadCompetitions() {
      setIsLoading(true)
      try {
        const data = await sportsService.getTopLeagues()
        setLeagues(data)
      } catch (err) {
        console.error('Failed to load leagues:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCompetitions()
  }, [])

  const filteredLeagues = leagues.filter((l) => {
    if (filterRegion === 'europe') return l.continent === 'Europe' || ['England', 'Spain', 'Germany', 'Italy', 'France'].includes(l.country)
    if (filterRegion === 'international') return l.type === 'international'
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-20 md:pb-6">
      <Header />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-2 md:px-4 py-4 flex gap-4">
        <DesktopSidebar />

        <main className="flex-1 min-w-0 space-y-4">
          <div className="bg-surface-container rounded-xl border border-surface-bright p-4 md:p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-base" aria-hidden="true">trophy</span>
              <span>All Football Competitions</span>
            </div>
            <h1 className="text-headline-xl text-on-surface font-extrabold">
              Football Competitions & Leagues
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Browse top football leagues, international cups, and national championships worldwide.
            </p>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2 bg-surface-container p-1.5 rounded-lg border border-surface-bright overflow-x-auto">
            {[
              { id: 'all', label: t('filters.all', 'All') },
              { id: 'europe', label: t('countries.Europe', 'Europe') },
              { id: 'international', label: t('countries.International', 'International') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterRegion(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filterRegion === tab.id
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Competitions Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-container rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLeagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-surface-container hover:bg-surface-container-high border border-surface-bright p-4 rounded-xl flex items-center justify-between transition-colors group"
                >
                  <Link href={`/league/${league.slug}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high/60 border border-surface-bright/70 flex items-center justify-center p-1.5 shrink-0">
                      <CompetitionLogo
                        logo={league.logo}
                        competitionName={league.name}
                        country={league.country}
                        countryFlag={league.countryFlag}
                        providerId={league.id}
                        slug={league.slug}
                        size={36}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-body-md text-on-surface group-hover:text-primary transition-colors truncate">
                        {league.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate mt-0.5">
                        <CountryFlag country={league.country} flagUrl={league.countryFlag} width={16} height={12} />
                        <span>{league.country} • {league.type}</span>
                      </div>
                    </div>
                  </Link>

                  <FavoriteButton
                    isFavorited={isLeagueFavorite(league.id)}
                    onToggle={() => toggleFavoriteLeague(league.id)}
                    size="sm"
                  />
                </div>
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
