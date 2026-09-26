'use client'

import { useState } from 'react'
import { getLocalLeagueLogo } from '@/config/competitions'
import { getOptimizedImageUrl } from '@/lib/image'
import CountryFlag from '@/components/common/CountryFlag'

interface CompetitionLogoProps {
  logo?: string | null
  competitionName?: string
  name?: string
  countryFlag?: string | null
  country?: string | null
  providerId?: string | number | null
  competitionId?: string | number | null
  slug?: string | null
  size?: number // default 24px
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
  competitionName,
  name,
  countryFlag,
  country,
  providerId,
  competitionId,
  slug,
  size = 24,
  className = '',
  showBackground = false,
}: CompetitionLogoProps) {
  // Fallback step: 0 = primary logo, 1 = local logo, 2 = country flag, 3 = generic icon
  const [fallbackStep, setFallbackStep] = useState<number>(0)

  const actualName = competitionName || name || 'Competition'
  const actualId = providerId || competitionId
  const numericId = actualId ? Number(actualId) : null
  const localFallback = getLocalLeagueLogo({ id: actualId, name: actualName, slug })

  // If primary logo is missing but numeric providerId exists, construct API-Sports logo URL
  const primaryLogo = (logo && isUrlString(logo))
    ? logo
    : (numericId && !isNaN(numericId) && numericId > 0)
    ? `https://media.api-sports.io/football/leagues/${numericId}.png`
    : null

  // Optional subtle neutral container for contrast on both dark and light modes
  const bgWrapperClass = showBackground
    ? 'bg-surface-container-high/60 border border-surface-bright/70 rounded-md p-0.5 inline-flex items-center justify-center'
    : 'inline-flex items-center justify-center'

  // Step 0: Try primary competition logo
  if (fallbackStep === 0 && primaryLogo) {
    const src = getOptimizedImageUrl(primaryLogo, size)
    return (
      <span className={`${bgWrapperClass} shrink-0`} style={{ width: `${size}px`, height: `${size}px` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${actualName} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFallbackStep(1)}
          className={`object-contain max-h-full max-w-full ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </span>
    )
  }

  // Step 1: Try local logo fallback
  if (fallbackStep <= 1 && localFallback) {
    return (
      <span className={`${bgWrapperClass} shrink-0`} style={{ width: `${size}px`, height: `${size}px` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={localFallback}
          alt={`${actualName} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFallbackStep(2)}
          className={`object-contain max-h-full max-w-full ${className}`}
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </span>
    )
  }

  // Step 2: Try country flag image
  if (fallbackStep <= 2 && (countryFlag || country)) {
    return (
      <span className={`${bgWrapperClass} shrink-0`} style={{ width: `${size}px`, height: `${size}px` }}>
        <CountryFlag
          country={country}
          flagUrl={countryFlag}
          width={size}
          height={Math.round(size * 0.75)}
          className={className}
        />
      </span>
    )
  }

  // Step 3: Generic competition trophy icon fallback (NEVER text abbreviation!)
  return (
    <span
      className={`${bgWrapperClass} shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={actualName}
    >
      <span
        className="material-symbols-outlined text-primary inline-flex items-center justify-center leading-none"
        style={{ fontSize: `${Math.max(14, size - 4)}px` }}
        aria-hidden="true"
      >
        trophy
      </span>
    </span>
  )
}
