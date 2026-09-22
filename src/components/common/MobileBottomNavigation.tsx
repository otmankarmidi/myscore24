'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export default function MobileBottomNavigation() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const tabs = [
    { href: '/',             label: t('nav.scores', 'Scores'),             icon: 'sports_soccer' },
    { href: '/live',         label: t('nav.live', 'Live'),                 icon: 'radar',        live: true },
    { href: '/favorites',    label: t('nav.favorites', 'Favorites'),       icon: 'star' },
    { href: '/competitions', label: t('nav.competitions', 'Competitions'), icon: 'trophy' },
    { href: '/news',         label: t('nav.news', 'News'),                 icon: 'newspaper' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden h-14 bg-surface/95 backdrop-blur-md border-t border-surface-bright/40 flex items-stretch pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      {tabs.map(tab => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] touch-manipulation ${
              isActive ? 'text-primary-container' : 'text-on-surface-variant'
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.live && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error border-2 border-surface" />
              )}
            </div>
            <span className={`font-geist text-[9px] sm:text-[10px] font-${isActive ? '700' : '500'} tracking-tight truncate max-w-full px-0.5`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
