import { Locale } from '@/types/common'
import en from './en.json'
import fr from './fr.json'
import ar from './ar.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  fr,
  ar,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en
}

/** Resolve a dot-separated key path, e.g. t(dict, 'match.status.live'), with fallback to English, then defaultVal, then key */
export function t(dict: Dictionary, key: string, fallback = ''): string {
  const val = key.split('.').reduce((obj: any, k: string) => (obj && typeof obj === 'object' ? obj[k] : undefined), dict as any)
  if (typeof val === 'string' && val.trim().length > 0) return val

  // Fallback to English dictionary if key wasn't found in current dictionary
  const enVal = key.split('.').reduce((obj: any, k: string) => (obj && typeof obj === 'object' ? obj[k] : undefined), dictionaries.en as any)
  if (typeof enVal === 'string' && enVal.trim().length > 0) return enVal

  return fallback || key
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fr: 'ltr',
  ar: 'rtl',
}

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

export const localeShortLabels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  ar: 'AR',
}
