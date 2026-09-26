'use client'

import { useState } from 'react'
import { getCountryFlagUrl, getCountryInfo, getCountryCode, isFlagUrl } from '@/lib/countries'
import { getOptimizedImageUrl } from '@/lib/image'

interface CountryFlagProps {
  country?: string | null
  countryCode?: string | null
  flagUrl?: string | null
  width?: number
  height?: number
  className?: string
}

export default function CountryFlag({
  country,
  countryCode,
  flagUrl,
  width = 20,
  height = 14,
  className = '',
}: CountryFlagProps) {
  // Fallback step: 0 = image, 1 = emoji, 2 = icon
  const [step, setStep] = useState<number>(0)

  const resolvedUrl = getCountryFlagUrl(country || countryCode, flagUrl)
  const info = getCountryInfo(country || countryCode)
  const code = getCountryCode(country, countryCode)

  // Step 0: Real flag image (SVG / PNG optimized)
  if (step === 0 && resolvedUrl && isFlagUrl(resolvedUrl)) {
    const src = resolvedUrl.endsWith('.svg')
      ? resolvedUrl
      : getOptimizedImageUrl(resolvedUrl, width)

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${country || code} flag`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onError={() => setStep(1)}
        className={`object-contain shrink-0 rounded-xs shadow-xs ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          aspectRatio: `${width}/${height}`,
        }}
      />
    )
  }

  // Step 1: Emoji fallback if available
  if (step <= 1 && info?.emoji) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 leading-none select-none text-[14px] ${className}`}
        aria-hidden="true"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {info.emoji}
      </span>
    )
  }

  // Step 2: Neutral globe or flag icon fallback
  return (
    <span
      className={`material-symbols-outlined text-outline shrink-0 inline-flex items-center justify-center ${className}`}
      aria-hidden="true"
      style={{
        fontSize: `${Math.max(12, Math.min(width, height))}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      title={country || code}
    >
      public
    </span>
  )
}
