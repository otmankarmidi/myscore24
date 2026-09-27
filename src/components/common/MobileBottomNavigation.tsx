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
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] bg-surface-container/95 backdrop-blur-md border-t border-surface-bright/70 flex items-start pb-[env(safe-area-inset-bottom,0px)] shadow-lg"
      aria-label="Mobile navigation"
    >
      <div className="w-full h-14 flex items-stretch">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] touch-manipulation px-0.5 ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                {tab.live && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error border-2 border-surface animate-pulse" />
                )}
              </div>
              <span
                className={`font-geist text-[9px] sm:text-[10px] ${
                  isActive ? 'font-bold' : 'font-medium'
                } tracking-tight truncate max-w-full block text-center`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
