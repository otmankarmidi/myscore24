'use client'

import { useState, useEffect, useCallback } from 'react'
import { Theme } from '@/types/common'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem('myscore24_theme') as Theme | null
      if (saved === 'dark') {
        setTheme('dark')
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
      } else {
        setTheme('light')
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    } catch {
      // ignore localStorage errors
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('myscore24_theme', next)
        if (next === 'dark') {
          document.documentElement.classList.remove('light')
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
          document.documentElement.classList.add('light')
        }
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return {
    theme,
    toggle,
    isDark: theme === 'dark',
    mounted,
  }
}
