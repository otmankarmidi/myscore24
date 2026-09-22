'use client'

import { MatchStatus } from '@/types/match'
import { getStatusBgClass, getStatusLabel, isLiveStatus } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

interface MatchStatusBadgeProps {
  status: MatchStatus
  minute?: number
  size?: 'sm' | 'md'
}

export default function MatchStatusBadge({ status, minute, size = 'sm' }: MatchStatusBadgeProps) {
  const { locale } = useLanguage()
  const label = getStatusLabel(status, locale)
  const bgClass = getStatusBgClass(status)
  const live = isLiveStatus(status) && status !== 'half_time'
  const isHT = status === 'half_time'

  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[13px]'

  if (status === 'scheduled') return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-geist font-bold tabular-nums ${textSize} ${bgClass}`}
      role="status"
      aria-label={`Match status: ${label}${minute ? ` ${minute} minutes` : ''}`}
    >
      {live && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: 'var(--color-error)', animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }}
          />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-error)' }} />
        </span>
      )}
      {live && minute ? `${minute}'` : label}
    </span>
  )
}
