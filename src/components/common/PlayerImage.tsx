'use client'

import { useState } from 'react'
import { matchLocalPlayerImage, resolvePlayerImagePath } from '@/lib/playerMatcher'
import { getOptimizedImageUrl } from '@/lib/image'

interface PlayerImageProps {
  playerId?: string | number
  photo?: string
  image?: string
  name?: string
  teamName?: string
  squadNumber?: number
  slug?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  className?: string
  priority?: boolean
}

const SIZES = {
  xs: 'w-6 h-6 min-w-[24px]',
  sm: 'w-8 h-8 min-w-[32px]',
  md: 'w-10 h-10 min-w-[40px]',
  lg: 'w-14 h-14 min-w-[56px]',
  xl: 'w-28 h-28 md:w-36 md:h-36 min-w-[112px]',
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

  // Numeric ID (e.g. API athlete ID)
  if (/^\d+$/.test(resolvedId)) {
    return `https://media.api-sports.io/football/players/${resolvedId}.png`
  }

  // If ID has numeric part like "player-12345" or "athlete-12345"
  const digits = resolvedId.match(/\d+/)
  if (digits) {
    return `https://media.api-sports.io/football/players/${digits[0]}.png`
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
  image,
  name,
  teamName,
  squadNumber,
  slug,
  size = 'md',
  className = '',
  priority = false,
}: PlayerImageProps) {
  // Step 1: Check passed `image` prop or match via local manifest
  let localSrc = image ? resolvePlayerImagePath(image) || '' : ''
  if (!localSrc && (teamName || name || slug)) {
    const matched = matchLocalPlayerImage(teamName || '', name, playerId, slug)
    if (matched?.imagePath) {
      localSrc = matched.imagePath
    }
  }

  // Step 2: External API photo fallback
  const rawApiSrc = getPlayerImageUrl(playerId, photo)
  const apiSrc = rawApiSrc ? getOptimizedImageUrl(rawApiSrc, 80) : ''

  // Level 0: Try local image first
  // Level 1: Try API image
  // Level 2: Show default silhouette
  const [attemptLevel, setAttemptLevel] = useState<number>(localSrc ? 0 : apiSrc ? 1 : 2)

  const currentSrc = attemptLevel === 0 ? localSrc : attemptLevel === 1 ? apiSrc : ''

  const handleError = () => {
    if (attemptLevel === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Local player image failed', {
          playerName: name || slug || playerId,
          attemptedPath: localSrc,
        })
      }
      if (apiSrc) {
        setAttemptLevel(1) // fall back to API image
      } else {
        setAttemptLevel(2) // fall back to silhouette
      }
    } else {
      setAttemptLevel(2) // fall back to silhouette
    }
  }

  const sizeClass = SIZES[size] || SIZES.md

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-surface-container-high border border-surface-bright/60 flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
      aria-label={name ? `${name} photo` : 'Player photo'}
    >
      {currentSrc && attemptLevel < 2 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentSrc}
          alt={name || 'Player'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-contain object-center transition-opacity duration-200"
          onError={handleError}
        />
      ) : (
        <PlayerSilhouette />
      )}
    </div>
  )
}
