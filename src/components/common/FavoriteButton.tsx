'use client'

interface FavoriteButtonProps {
  isFavorited: boolean
  onToggle: () => void
  label?: string
  size?: 'sm' | 'md'
}

export default function FavoriteButton({ isFavorited, onToggle, label = 'Toggle favorite', size = 'sm' }: FavoriteButtonProps) {
  const iconSize = size === 'sm' ? 17 : 20
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle() }}
      aria-label={isFavorited ? `Remove from favorites: ${label}` : `Add to favorites: ${label}`}
      aria-pressed={isFavorited}
      className="text-outline hover:text-primary transition-colors flex items-center justify-center p-0.5 rounded hover:bg-surface-container-high/60"
    >
      <span
        className="material-symbols-outlined transition-all"
        style={{
          fontSize: iconSize,
          fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
          color: isFavorited ? 'var(--color-primary)' : undefined,
        }}
      >
        star
      </span>
    </button>
  )
}
