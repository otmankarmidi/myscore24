'use client'
import { Theme } from '@/types/common'

export function useTheme() {
  return {
    theme: 'dark' as Theme,
    toggle: () => {},
    isDark: true,
  }
}
