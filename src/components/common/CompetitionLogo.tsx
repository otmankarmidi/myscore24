'use client'

import { useState } from 'react'
import { getLocalLeagueLogo } from '@/config/competitions'
import { getOptimizedImageUrl } from '@/lib/image'

interface CompetitionLogoProps {
  logo?: string | null
  name?: string
  countryFlag?: string | null
  providerId?: string | number | null
  competitionId?: string | number | null
  slug?: string | null
  size?: number // default 20px
  className?: string
  showBackground?: boolean
}

function isUrlString(val: string | null | undefined): boolean {
  if (!val) return false
  const trimmed = val.trim().toLowerCase()
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.endsWith('.svg') ||
    trimmed.endsWith('.png') ||
    trimmed.endsWith('.webp') ||
    trimmed.endsWith('.jpg')
  )
}

export default function CompetitionLogo({
  logo,
  name = 'Competition',
  countryFlag,
  providerId,
  competitionId,
  slug,
  size = 20,
  className = '',
}: CompetitionLogoProps) {
  // Step in fallback chain: 0 = primary logo, 1 = local logo, 2 = country flag image, 3 = final generic icon
  const [fallbackStep, setFallbackStep] = useState<number>(0)

  const actualId = providerId || competitionId
  const localFallback = getLocalLeagueLogo({ id: actualId, name, slug })
  const flagIsUrl = isUrlString(countryFlag)

  // Step 0: Try primary competition logo if valid URL
  if (fallbackStep === 0) {
    if (logo && isUrlString(logo)) {
      const src = getOptimizedImageUrl(logo, size)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFallbackStep(1)}
          className={`object-contain shrink-0 rounded-sm ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )
    }
  }

  // Step 1: Try local logo fallback
  if (fallbackStep <= 1) {
    if (localFallback) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={localFallback}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFallbackStep(2)}
          className={`object-contain shrink-0 rounded-sm ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )
    }
  }

  // Step 2: Try country flag (if image URL, render as img; if text/emoji, render as span)
  if (fallbackStep <= 2) {
    if (countryFlag) {
      if (flagIsUrl) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={countryFlag}
            alt=""
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            onError={() => setFallbackStep(3)}
            className={`object-contain shrink-0 rounded-sm ${className}`}
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        )
      } else {
        // Safe emoji or text string (e.g. 🏴󠁧󠁢󠁥󠁮󠁧󠁿, 🇪🇸)
        return (
          <span
            className={`text-[14px] leading-none shrink-0 inline-flex items-center justify-center ${className}`}
            aria-hidden="true"
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            {countryFlag}
          </span>
        )
      }
    }
  }

  // Step 3: Generic competition trophy icon fallback
  return (
    <span
      className={`material-symbols-outlined text-primary shrink-0 inline-flex items-center justify-center ${className}`}
      aria-hidden="true"
      style={{ fontSize: `${Math.max(16, size - 2)}px`, width: `${size}px`, height: `${size}px` }}
      title={name}
    >
      trophy
    </span>
  )
}
