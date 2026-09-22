'use client'

import { useState } from 'react'

interface PlayerImageProps {
  playerId?: string | number
  photo?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  className?: string
  priority?: boolean
}

const SIZES = {
  xs: 'w-5 h-5 min-w-[20px]',
  sm: 'w-7 h-7 min-w-[28px]',
  md: 'w-9 h-9 min-w-[36px]',
  lg: 'w-12 h-12 min-w-[48px]',
  xl: 'w-24 h-24 md:w-32 md:h-32',
  custom: '',
}

const KNOWN_API_PLAYER_IDS: Record<string, string> = {
  'lamine-yamal': '273005',
  'erling-haaland': '249168',
  'kylian-mbappe': '230020',
  'bukayo-saka': '260053',
  'raphinha': '234479',
  'mohamed-salah': '173896',
  'vinicius-junior': '249309',
  'jude-bellingham': '282643',
  'achraf-hakimi': '247738',
  'cole-palmer': '287579',
}

/**
 * Resolves player headshot URL using the player's unique API ID.
 * Never constructs or queries images by player name.
 */
export function getPlayerImageUrl(playerId?: string | number, photo?: string): string {
  if (photo && typeof photo === 'string' && photo.startsWith('http')) {
    return photo
  }
  if (!playerId) return ''
  const idStr = String(playerId).trim().toLowerCase()
  if (!idStr) return ''

  // Known slug to API athlete ID mapping
  const resolvedId = KNOWN_API_PLAYER_IDS[idStr] || idStr

  // Numeric ID (e.g. ESPN athlete ID "273005" or API athlete ID)
  if (/^\d+$/.test(resolvedId)) {
    return `https://a.espncdn.com/i/headshots/soccer/players/full/${resolvedId}.png`
  }

  // If ID has numeric part like "espn-12345" or "athlete-12345"
  const digits = resolvedId.match(/\d+/)
  if (digits) {
    return `https://a.espncdn.com/i/headshots/soccer/players/full/${digits[0]}.png`
  }

  return ''
}

function PlayerSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-full h-full p-1 text-on-surface-variant/70 ${className}`}
      aria-hidden="true"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

export default function PlayerImage({
  playerId,
  photo,
  name,
  size = 'md',
  className = '',
  priority = false,
}: PlayerImageProps) {
  const [hasError, setHasError] = useState(false)
  const resolvedUrl = getPlayerImageUrl(playerId, photo)
  const sizeClass = SIZES[size] || SIZES.md

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-surface-container-high border border-surface-bright/60 flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
      aria-label={name ? `${name} profile picture` : 'Player photo'}
    >
      {resolvedUrl && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedUrl}
          alt={name || 'Player'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          crossOrigin="anonymous"
          className="w-full h-full object-cover object-top"
          onError={() => setHasError(true)}
        />
      ) : (
        <PlayerSilhouette />
      )}
    </div>
  )
}
