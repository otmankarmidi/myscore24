'use client'

import { useState } from 'react'
import { matchLocalPlayerImage, resolvePlayerImagePath } from '@/lib/playerMatcher'
import { getOptimizedImageUrl } from '@/lib/image'
import { resolveApiFootballPlayerId, KNOWN_API_PLAYER_IDS } from '@/data/knownPlayerIds'

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

/**
 * Resolves player headshot URL using the player's unique API ID.
 */
export function getPlayerImageUrl(playerId?: string | number, photo?: string): string {
  if (photo && typeof photo === 'string' && (photo.startsWith('http://') || photo.startsWith('https://'))) {
    return photo
  }
  if (!playerId) return ''
  const resolvedId = resolveApiFootballPlayerId(playerId)
  if (resolvedId) {
    return `https://media.api-sports.io/football/players/${resolvedId}.png`
  }

  const idStr = String(playerId).trim()
  const digits = idStr.match(/\d+/)
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
  // Direct remote photo from API or external source
  const directRemote =
    photo && typeof photo === 'string' && photo.startsWith('http')
      ? photo
      : image && typeof image === 'string' && image.startsWith('http')
      ? image
      : ''

  // Step 1: Check passed local `image` prop or match via local manifest
  let localSrc = ''
  if (!directRemote && image) {
    localSrc = resolvePlayerImagePath(image) || ''
  }
  if (!directRemote && !localSrc && (teamName || name || slug || playerId)) {
    const matched = matchLocalPlayerImage(teamName || '', name, playerId, slug)
    if (matched?.imagePath) {
      localSrc = matched.imagePath
    }
  }

  // Step 2: External API photo fallback
  const rawApiSrc = directRemote || getPlayerImageUrl(playerId || slug, photo)
  const apiProxySrc = rawApiSrc && rawApiSrc.startsWith('http') ? getOptimizedImageUrl(rawApiSrc, 120) : ''

  // Fallback levels:
  // Level 0: Local player headshot (if present)
  // Level 1: Optimized API proxy image (/api/image?url=...)
  // Level 2: Direct CDN image (https://media.api-sports.io/...)
  // Level 3: Fallback silhouette SVG
  const initialLevel = directRemote
    ? apiProxySrc
      ? 1
      : 2
    : localSrc
    ? 0
    : apiProxySrc
    ? 1
    : rawApiSrc
    ? 2
    : 3

  const [attemptLevel, setAttemptLevel] = useState<number>(initialLevel)

  const currentSrc =
    attemptLevel === 0
      ? localSrc
      : attemptLevel === 1
      ? apiProxySrc
      : attemptLevel === 2
      ? rawApiSrc
      : ''

  const handleError = () => {
    if (attemptLevel === 0) {
      if (apiProxySrc) setAttemptLevel(1)
      else if (rawApiSrc) setAttemptLevel(2)
      else setAttemptLevel(3)
    } else if (attemptLevel === 1) {
      if (rawApiSrc && rawApiSrc !== apiProxySrc) {
        setAttemptLevel(2) // fall back to direct CDN URL
      } else {
        setAttemptLevel(3) // fall back to silhouette
      }
    } else {
      setAttemptLevel(3) // fall back to silhouette
    }
  }

  const sizeClass = SIZES[size] || SIZES.md

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-surface-container-high border border-surface-bright/60 flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
      aria-label={name ? `${name} photo` : 'Player photo'}
    >
      {currentSrc && attemptLevel < 3 ? (
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
        <div className="w-full h-full flex flex-col items-center justify-center relative bg-surface-container-highest">
          <PlayerSilhouette />
          {squadNumber && (
            <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-on-surface-variant/80 font-mono">
              {squadNumber}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
