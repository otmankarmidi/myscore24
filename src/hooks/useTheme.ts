'use client'
import { useState, useEffect } from 'react'
import { Theme } from '@/types/common'

const STORAGE_KEY = 'myscore24_theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initial = stored ?? 'dark'
    setTheme(initial)
    applyTheme(initial)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(t)
  }

  function toggle() {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return next
    })
  }

  return { theme, toggle, isDark: theme === 'dark' }
}
