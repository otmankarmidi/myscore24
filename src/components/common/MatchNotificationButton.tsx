'use client'

import React, { memo } from 'react'
import { useMatchNotifications } from '@/hooks/useMatchNotifications'

interface MatchNotificationButtonProps {
  matchId: string | number
  matchLabel?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const MatchNotificationButton = memo(function MatchNotificationButton({
  matchId,
  matchLabel,
  size = 'sm',
  className = '',
}: MatchNotificationButtonProps) {
  const { isMatchNotified, toggleMatchNotification } = useMatchNotifications()
  const active = isMatchNotified(matchId)

  const sizeStyles = {
    sm: 'w-6 h-6 text-[15px]',
    md: 'w-8 h-8 text-[18px]',
    lg: 'w-9 h-9 text-[20px]',
  }[size]

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 20,
  }[size]

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleMatchNotification(matchId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={
        active
          ? `Mute notifications for ${matchLabel || 'match'}`
          : `Turn on live notifications for ${matchLabel || 'match'}`
      }
      title={
        active
          ? 'Live alerts active (goals, cards, penalties) - click to turn off'
          : 'Turn on live match alerts'
      }
      className={`relative inline-flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer ${sizeStyles} ${
        active
          ? 'text-primary bg-primary/10 hover:bg-primary/20 ring-1 ring-primary/40 shadow-sm'
          : 'text-outline hover:text-primary hover:bg-surface-container-high'
      } ${className}`}
    >
      <span
        className="material-symbols-outlined select-none transition-transform active:scale-90"
        style={{
          fontSize: `${iconSizes}px`,
          fontVariationSettings: active ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
        }}
        aria-hidden="true"
      >
        {active ? 'notifications_active' : 'notifications'}
      </span>
      {active && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface"
          aria-hidden="true"
        />
      )}
    </button>
  )
})
