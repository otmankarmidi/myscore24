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
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden h-[calc(3.75rem+env(safe-area-inset-bottom,0px))] bg-white/90 dark:bg-[#080C14]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 flex items-start pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      aria-label="Mobile navigation"
    >
      <div className="w-full h-15 flex items-center px-1">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[48px] touch-manipulation px-1 py-1 rounded-xl relative ${
                isActive
                  ? 'text-purple-700 dark:text-purple-300 font-bold bg-purple-50/70 dark:bg-purple-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[21px] shrink-0 transition-transform duration-200 group-active:scale-95"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {tab.icon}
                </span>
                {tab.live && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-600 border-2 border-white dark:border-[#080C14] animate-pulse" />
                )}
              </div>
              <span
                className={`font-geist text-[10px] sm:text-[11px] ${
                  isActive ? 'font-bold text-purple-700 dark:text-purple-300' : 'font-medium'
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
