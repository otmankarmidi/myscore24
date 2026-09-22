'use client'

import { useState } from 'react'

interface TeamLogoProps {
  name: string
  abbreviation: string
  logo?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizes = {
  xs: { container: 'w-4 h-4', text: 'text-[8px]', img: 16 },
  sm: { container: 'w-6 h-6', text: 'text-[9px]', img: 24 },
  md: { container: 'w-8 h-8', text: 'text-[11px]', img: 32 },
  lg: { container: 'w-12 h-12', text: 'text-[13px]', img: 48 },
}

export default function TeamLogo({ name, abbreviation, logo, size = 'sm' }: TeamLogoProps) {
  const [imgError, setImgError] = useState(false)
  const s = sizes[size]

  if (logo && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`${name} badge`}
        width={s.img}
        height={s.img}
        className={`${s.container} object-contain`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <span
      className={`${s.container} rounded-full bg-surface-bright flex items-center justify-center font-geist font-bold text-on-surface shrink-0 ${s.text}`}
      aria-label={name}
      title={name}
    >
      {(abbreviation || name || 'FC').slice(0, 3).toUpperCase()}
    </span>
  )
}
