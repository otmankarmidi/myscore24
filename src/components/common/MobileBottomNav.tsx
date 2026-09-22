'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/hooks/useFavorites'

interface MobileBottomNavProps {
  onOpenMore: () => void
  liveCount?: number
}

export default function MobileBottomNav({ onOpenMore, liveCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { totalFavorites } = useFavorites()

  const items = [
    { href: '/', key: 'scores', label: t('nav.scores', 'Matches'), icon: 'sports_soccer' },
    { href: '/live', key: 'live', label: t('nav.live', 'Live'), icon: 'radar', liveBadge: true },
    { href: '/competitions', key: 'competitions', label: t('nav.competitions', 'Competitions'), icon: 'trophy' },
    { href: '/favorites', key: 'favorites', label: t('nav.favorites', 'Favorites'), icon: 'star', favBadge: true },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container/95 backdrop-blur-md border-t border-surface-bright/40 pb-[env(safe-area-inset-bottom)] md:hidden shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {items.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative active:scale-95 touch-manipulation ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>

                {item.liveBadge && liveCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-error text-on-error text-[9px] font-bold font-mono animate-pulse">
                    {liveCount}
                  </span>
                )}

                {item.favBadge && totalFavorites > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-primary text-on-primary text-[9px] font-bold font-mono flex items-center justify-center">
                    {totalFavorites}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-medium font-inter mt-0.5 truncate max-w-[60px]">
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* More / Settings Button */}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-on-surface-variant hover:text-on-surface active:scale-95 transition-colors touch-manipulation"
          aria-label={t('common.more', 'More Settings')}
        >
          <span className="material-symbols-outlined text-[22px]">tune</span>
          <span className="text-[10px] font-medium font-inter mt-0.5 truncate max-w-[60px]">
            {t('common.more', 'More')}
          </span>
        </button>
      </div>
    </nav>
  )
}
