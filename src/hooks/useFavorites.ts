'use client'
import { useState, useEffect, useCallback } from 'react'

interface Favorites {
  matches: string[]
  teams: string[]
  leagues: string[]
}

const STORAGE_KEY = 'myscore24_favorites'
const EVENT_KEY = 'myscore24_favorites_changed'

function loadFavorites(): Favorites {
  if (typeof window === 'undefined') return { matches: [], teams: [], leagues: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { matches: [], teams: [], leagues: [] }
}

function saveFavorites(fav: Favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fav))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: fav }))
    }
  } catch {
    // ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>({ matches: [], teams: [], leagues: [] })

  useEffect(() => {
    setFavorites(loadFavorites())

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Favorites>
      if (customEvent.detail) {
        setFavorites(customEvent.detail)
      } else {
        setFavorites(loadFavorites())
      }
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(loadFavorites())
      }
    }

    window.addEventListener(EVENT_KEY, handleCustomEvent)
    window.addEventListener('storage', handleStorageEvent)

    return () => {
      window.removeEventListener(EVENT_KEY, handleCustomEvent)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [])

  const toggleMatch = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.matches.includes(id)
        ? { ...prev, matches: prev.matches.filter(m => m !== id) }
        : { ...prev, matches: [...prev.matches, id] }
      saveFavorites(next)
      return next
    })
  }, [])

  const toggleTeam = useCallback((slug: string) => {
    setFavorites(prev => {
      const next = prev.teams.includes(slug)
        ? { ...prev, teams: prev.teams.filter(t => t !== slug) }
        : { ...prev, teams: [...prev.teams, slug] }
      saveFavorites(next)
      return next
    })
  }, [])

  const toggleLeague = useCallback((slug: string) => {
    setFavorites(prev => {
      const next = prev.leagues.includes(slug)
        ? { ...prev, leagues: prev.leagues.filter(l => l !== slug) }
        : { ...prev, leagues: [...prev.leagues, slug] }
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavoriteMatch = useCallback((id: string) => favorites.matches.includes(id), [favorites])
  const isFavoriteTeam = useCallback((slug: string) => favorites.teams.includes(slug), [favorites])
  const isFavoriteLeague = useCallback((slug: string) => favorites.leagues.includes(slug), [favorites])

  return {
    favorites,
    toggleMatch,
    toggleTeam,
    toggleLeague,
    toggleFavoriteMatch: toggleMatch,
    toggleFavoriteTeam: toggleTeam,
    toggleFavoriteLeague: toggleLeague,
    isFavoriteMatch,
    isFavoriteTeam,
    isFavoriteLeague,
    isMatchFavorite: isFavoriteMatch,
    isTeamFavorite: isFavoriteTeam,
    isLeagueFavorite: isFavoriteLeague,
    totalFavorites: favorites.matches.length + favorites.teams.length + favorites.leagues.length,
  }
}
