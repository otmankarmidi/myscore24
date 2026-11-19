'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TeamLogo from '@/components/common/TeamLogo'
import CompetitionLogo from '@/components/common/CompetitionLogo'
import PlayerImage from '@/components/common/PlayerImage'
import { useLanguage } from '@/context/LanguageContext'
import { trackSearch } from '@/lib/analytics'

interface SearchResults {
  players: Array<{ id: string; slug: string; name: string; position: string; teamName: string; photo?: string }>
  teams: Array<{ id: string; slug: string; name: string; abbreviation: string; logo?: string; country: string }>
  leagues: Array<{ id: string; slug: string; name: string; logo?: string; country?: string; countryFlag?: string }>
}

const EMPTY: SearchResults = { players: [], teams: [], leagues: [] }

const SHORTCUTS = [
  { href: '/league/39', label: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { href: '/league/140', label: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { href: '/league/2', label: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { href: '/league/135', label: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { href: '/league/200', label: 'Botola Pro', logo: 'https://media.api-sports.io/football/leagues/200.png' },
]

interface SearchPaletteProps {
  open: boolean
  onClose: () => void
  initialQuery?: string
  onQueryChange?: (q: string) => void
}

export default function SearchPalette({ open, onClose, initialQuery = '', onQueryChange }: SearchPaletteProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        if (res.ok) {
          const data = await res.json()
          setResults({ players: data.players || [], teams: data.teams || [], leagues: data.leagues || [] })
        }
      } catch {
        // network errors leave previous results visible
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  if (!open) return null

  const q = query.trim()
  const hasQuery = q.length >= 2
  const visible = hasQuery ? results : EMPTY
  const nothing = hasQuery && !loading && !visible.players.length && !visible.teams.length && !visible.leagues.length

  const submit = () => {
    if (!q) return
    trackSearch(q)
    onClose()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const row = 'ui-press flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-hover transition-colors'

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <button className="absolute inset-0 bg-ink/40 cursor-default ui-fade" aria-label="Close search" onClick={onClose} />
      <div className="relative w-full max-w-[620px] ui-popover rounded-2xl overflow-hidden ui-sheet">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-line">
          <span className="material-symbols-outlined text-[22px] text-brand">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onQueryChange?.(e.target.value)
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={t('common.search_placeholder', 'Search teams, players, leagues...')}
            className="flex-1 bg-transparent text-[17px] text-ink placeholder:text-ink-3 focus:outline-none"
            type="search"
            aria-label="Search"
          />
          <kbd className="hidden sm:inline-flex h-6 px-2 items-center rounded-md bg-hover border border-line text-[11px] font-medium text-ink-3">esc</kbd>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-2">
          {!hasQuery && (
            <div className="p-3">
              <p className="ui-eyebrow mb-3">{t('common.competitions', 'Jump to')}</p>
              <div className="flex flex-wrap gap-2">
                {SHORTCUTS.map((s) => (
                  <Link key={s.href} href={s.href} prefetch={false} onClick={onClose} className="ui-press h-9 ps-1.5 pe-3.5 rounded-full inline-flex items-center gap-2 text-[13px] font-medium bg-hover border border-line hover:border-brand hover:text-brand-ink">
                    <span className="w-6 h-6 rounded-full bg-white border border-line flex items-center justify-center">
                      <CompetitionLogo logo={s.logo} name={s.label} size={16} showBackground={false} />
                    </span>
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {loading && <p className="p-4 text-center text-[13px] text-ink-3">{t('common.searching', 'Searching...')}</p>}
          {nothing && (
            <p className="p-6 text-center text-[13px] text-ink-3">
              {t('common.noSearchResults', 'No results for')} &ldquo;{q}&rdquo;
            </p>
          )}

          {visible.teams.length > 0 && (
            <section className="p-1">
              <p className="ui-eyebrow px-3 py-2">{t('common.teams', 'Teams')}</p>
              {visible.teams.map((item) => (
                <Link key={item.id} href={`/team/${item.slug || item.id}`} onClick={onClose} className={row}>
                  <span className="w-9 h-9 rounded-full bg-hover border border-line flex items-center justify-center">
                    <TeamLogo name={item.name} abbreviation={item.abbreviation} logo={item.logo} size="sm" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink truncate">{item.name}</span>
                    <span className="block text-[12px] text-ink-3 truncate">{item.country}</span>
                  </span>
                </Link>
              ))}
            </section>
          )}

          {visible.players.length > 0 && (
            <section className="p-1">
              <p className="ui-eyebrow px-3 py-2">{t('common.players', 'Players')}</p>
              {visible.players.map((p) => (
                <Link key={p.id} href={`/player/${p.slug || p.id}`} onClick={onClose} className={row}>
                  <PlayerImage playerId={p.id} photo={p.photo} name={p.name} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink truncate">{p.name}</span>
                    <span className="block text-[12px] text-ink-3 truncate">{p.position} · {p.teamName}</span>
                  </span>
                </Link>
              ))}
            </section>
          )}

          {visible.leagues.length > 0 && (
            <section className="p-1">
              <p className="ui-eyebrow px-3 py-2">{t('common.competitions', 'Competitions')}</p>
              {visible.leagues.map((l) => (
                <Link key={l.id} href={`/league/${l.id || l.slug}`} prefetch={false} onClick={onClose} className={row}>
                  <span className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center">
                    <CompetitionLogo logo={l.logo} competitionId={l.id} name={l.name} country={l.country} countryFlag={l.countryFlag} slug={l.slug} size={20} showBackground={false} />
                  </span>
                  <span className="text-[14px] font-semibold text-ink truncate">{l.name}</span>
                </Link>
              ))}
            </section>
          )}
        </div>

        {hasQuery && (
          <button onClick={submit} className="w-full h-12 border-t border-line text-[13px] font-semibold text-brand hover:bg-brand-soft transition-colors">
            {t('common.viewAllResults', 'See all results for')} &ldquo;{q}&rdquo; →
          </button>
        )}
      </div>
    </div>
  )
}
