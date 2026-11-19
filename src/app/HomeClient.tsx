'use client'

import { useEffect, useMemo, useState } from 'react'
import TopBar from '@/components/glass/TopBar'
import TabBar from '@/components/glass/TabBar'
import LeagueSidebar from '@/components/glass/LeagueSidebar'
import { DateBar, StatusFilter, TournamentGroup } from '@/components/glass/MatchList'
import MatchPanel from '@/components/glass/MatchPanel'
import NewsCard from '@/components/glass/NewsCard'
import { isFinished, isLive, isUpcoming, leagueKey, pickFeatured } from '@/components/glass/matchUtils'
import ErrorState from '@/components/common/ErrorState'
import { sportsService } from '@/services/sports/sportsService'
import { useLanguage } from '@/context/LanguageContext'
import { Match } from '@/types/match'
import { League } from '@/types/league'
import { NewsArticle } from '@/types/news'
import { isApprovedCompetition, getCompetitionPriority } from '@/config/competitions'
import { isToday } from '@/lib/utils'

interface HomeClientProps {
  initialTrendingMatches?: Match[]
  latestArticles?: NewsArticle[]
  latestArticlesAr?: NewsArticle[]
}

export default function HomeClient({
  initialTrendingMatches = [],
  latestArticles = [],
  latestArticlesAr = [],
}: HomeClientProps) {
  const { t, locale } = useLanguage()
  const ar = locale === 'ar'

  // ── News (server-rendered, refreshed on refocus / after 2 min) ─────────
  const [articlesEn, setArticlesEn] = useState<NewsArticle[]>(latestArticles)
  const [articlesAr, setArticlesAr] = useState<NewsArticle[]>(latestArticlesAr)

  useEffect(() => {
    let cancelled = false
    async function refreshNews() {
      try {
        const [en, arRes] = await Promise.all([
          fetch('/api/news?language=en&limit=16').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/news?language=ar&limit=16').then((r) => (r.ok ? r.json() : null)),
        ])
        if (cancelled) return
        if (en?.articles?.length) setArticlesEn(en.articles)
        if (arRes?.articles?.length) setArticlesAr(arRes.articles)
      } catch {
        // keep server-rendered articles
      }
    }
    const onVisible = () => document.visibilityState === 'visible' && !cancelled && refreshNews()
    document.addEventListener('visibilitychange', onVisible)
    const timer = setTimeout(refreshNews, 120000)
    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  const articles = ar && articlesAr.length > 0 ? articlesAr : articlesEn

  // ── Matches for the selected day (polled every 15s for today) ──────────
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [matches, setMatches] = useState<Match[]>(initialTrendingMatches)
  const [isLoading, setIsLoading] = useState(initialTrendingMatches.length === 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await sportsService.getMatchesByDateWithSource(selectedDate)
        if (cancelled) return
        setMatches(result.matches || [])
        if (result.error && !(result.matches || []).length) setError(result.error)
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch match data')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    if (!isToday(selectedDate)) return () => { cancelled = true }

    const refresh = () =>
      sportsService
        .getMatchesByDateWithSource(selectedDate, true)
        .then((fresh) => {
          if (!cancelled && fresh.matches?.length) setMatches(fresh.matches)
        })
        .catch(() => {})
    const poll = setInterval(refresh, 15000)
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [selectedDate])

  // ── Filters & grouping ────────────────────────────────────────────────
  const [status, setStatus] = useState<StatusFilter>('all')
  const [activeLeague, setActiveLeague] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const approved = useMemo(() => matches.filter((m) => isApprovedCompetition(m.league)), [matches])

  const counts = useMemo(
    () => ({
      all: approved.length,
      live: approved.filter(isLive).length,
      upcoming: approved.filter(isUpcoming).length,
      finished: approved.filter(isFinished).length,
    }),
    [approved]
  )

  const todaysLeagues = useMemo(() => {
    const map = new Map<string, { league: League; count: number }>()
    approved.forEach((m) => {
      const k = leagueKey(m)
      const e = map.get(k)
      if (e) e.count++
      else map.set(k, { league: m.league, count: 1 })
    })
    return [...map.values()].sort((a, b) => getCompetitionPriority(a.league) - getCompetitionPriority(b.league))
  }, [approved])

  const groups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const map = new Map<string, { league: League; matches: Match[] }>()
    approved.forEach((m) => {
      if (status === 'live' && !isLive(m)) return
      if (status === 'upcoming' && !isUpcoming(m)) return
      if (status === 'finished' && !isFinished(m)) return
      if (activeLeague && leagueKey(m) !== activeLeague) return
      if (q && !`${m.homeTeam?.name} ${m.awayTeam?.name} ${m.league?.name}`.toLowerCase().includes(q)) return
      const k = leagueKey(m)
      if (!map.has(k)) map.set(k, { league: m.league, matches: [] })
      map.get(k)!.matches.push(m)
    })
    const statusRank = (m: Match) => (isLive(m) ? 0 : isUpcoming(m) ? 1 : 2)
    return [...map.values()]
      .map((g) => ({
        ...g,
        matches: g.matches.sort((a, b) => statusRank(a) - statusRank(b) || new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
      }))
      .sort((a, b) => {
        const p = getCompetitionPriority(a.league) - getCompetitionPriority(b.league)
        return p !== 0 ? p : (a.league.name || '').localeCompare(b.league.name || '')
      })
  }, [approved, status, activeLeague, searchQuery])

  // Right panel shows the clicked match, else the featured one; kept fresh by polling
  const pool = approved.length ? approved : matches
  const selectedMatch = useMemo(
    () => pool.find((m) => m.id === selectedId) || pickFeatured(pool),
    [pool, selectedId]
  )

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-5 pt-4 sm:pt-5 pb-28 lg:pb-10">
        <h1 className="sr-only">
          {ar
            ? 'موقع MyScore24 - نتائج المباريات المباشرة وأحدث أخبار كرة القدم العالمية'
            : 'MyScore24 - Live Football Scores, Results & Latest Football News'}
        </h1>

        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_380px] xl:grid-cols-[260px_minmax(0,1fr)_420px] items-start">
          {/* Left — leagues */}
          <div className="hidden lg:block sticky top-[124px] max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-none">
            <LeagueSidebar todaysLeagues={todaysLeagues} activeLeague={activeLeague} onLeagueChange={setActiveLeague} />
          </div>

          {/* Center — matches */}
          <main className="min-w-0 space-y-3" id="matches">
            <DateBar selectedDate={selectedDate} onSelectDate={setSelectedDate} status={status} onStatusChange={setStatus} counts={counts} />

            {/* Phone/tablet league chips (sidebar is desktop-only) */}
            {todaysLeagues.length > 0 && (
              <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-none -mx-3 px-3">
                <button onClick={() => setActiveLeague(null)} className={`shrink-0 h-9 px-4 rounded-full text-[12.5px] font-semibold ${activeLeague === null ? 'gl-chip-active' : 'gl-chip'}`}>
                  {ar ? 'الكل' : 'All'}
                </button>
                {todaysLeagues.map(({ league, count }) => {
                  const key = String(league.id || league.slug)
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveLeague(activeLeague === key ? null : key)}
                      className={`shrink-0 h-9 px-3.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap ${activeLeague === key ? 'gl-chip-active' : 'gl-chip'}`}
                    >
                      {league.name} <span className="opacity-60 tabular-nums">{count}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {isLoading && groups.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="gl-panel rounded-2xl p-3 space-y-2">
                    <div className="h-8 w-48 skeleton" />
                    <div className="h-14 skeleton" />
                    <div className="h-14 skeleton" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorState
                title={t('common.errorLive', 'Live football data is temporarily unavailable.')}
                description={error}
                onRetry={() => setSelectedDate(new Date(selectedDate))}
              />
            ) : groups.length === 0 ? (
              <div className="gl-panel rounded-2xl py-14 px-6 text-center">
                <span className="material-symbols-outlined text-[40px] text-white/25">sports_soccer</span>
                <p className="mt-3 text-[15px] font-semibold text-white">
                  {searchQuery
                    ? t('common.noSearchResults', 'No matches for that search')
                    : status === 'live'
                    ? t('common.noLiveMatches', 'Nothing live right now')
                    : t('common.noMatchesFound', 'No matches on this day')}
                </p>
                <p className="mt-1 text-[13px] text-white/45">{t('common.selectAnotherDate', 'Try another date or filter.')}</p>
              </div>
            ) : (
              groups.map(({ league, matches: ms }) => (
                <TournamentGroup
                  key={String(league.id || league.slug)}
                  league={league}
                  matches={ms}
                  selectedId={selectedMatch?.id ?? null}
                  onSelect={(m) => setSelectedId(m.id)}
                />
              ))
            )}

            {/* News for phones/tablets (desktop shows it in the right column) */}
            <div className="lg:hidden pt-2">
              <NewsCard articles={articles} />
            </div>
          </main>

          {/* Right — match detail + news */}
          <div className="hidden lg:block sticky top-[124px] max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-none space-y-4 rounded-3xl">
            <MatchPanel match={selectedMatch} />
            <NewsCard articles={articles} />
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  )
}
