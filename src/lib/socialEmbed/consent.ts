/**
 * External Media Consent Management
 * ─────────────────────────────────
 * Integrates social embed third-party request permissions with the existing
 * MyScore24 cookie consent system.
 */

import { CONSENT_STORAGE_KEY } from '@/lib/analytics'

export const EXTERNAL_MEDIA_STORAGE_KEY = 'myscore24_external_media_consent'
export const EXTERNAL_MEDIA_CONSENT_EVENT = 'myscore24_external_media_consent_changed'

/**
 * Checks whether user has persistently consented to external media.
 */
export function hasPersistentExternalMediaConsent(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const explicitMediaConsent = localStorage.getItem(EXTERNAL_MEDIA_STORAGE_KEY)
    if (explicitMediaConsent === 'granted') {
      return true
    }
    if (explicitMediaConsent === 'denied') {
      return false
    }

    // Check existing global cookie banner consent
    const globalConsent = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (globalConsent === 'accepted' || globalConsent === 'granted') {
      return true
    }
    if (globalConsent === 'denied') {
      return false
    }

    // Default to false until user interacts
    return false
  } catch {
    return false
  }
}

/**
 * Persistently grants consent for all external media embeds.
 */
export function grantPersistentExternalMediaConsent(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(EXTERNAL_MEDIA_STORAGE_KEY, 'granted')
    window.dispatchEvent(new CustomEvent(EXTERNAL_MEDIA_CONSENT_EVENT, { detail: { allowed: true } }))
  } catch {
    // Non-fatal
  }
}

/**
 * Revokes persistent consent for external media embeds.
 */
export function revokePersistentExternalMediaConsent(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(EXTERNAL_MEDIA_STORAGE_KEY, 'denied')
    window.dispatchEvent(new CustomEvent(EXTERNAL_MEDIA_CONSENT_EVENT, { detail: { allowed: false } }))
  } catch {
    // Non-fatal
  }
}
