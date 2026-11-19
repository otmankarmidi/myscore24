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
      className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-40 md:hidden h-[62px] apple-floating-island rounded-[28px] flex items-center px-1.5"
      aria-label="Mobile navigation"
    >
      <div className="w-full h-full flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 min-h-[48px] touch-manipulation px-1 py-1 rounded-[22px] relative ${
                isActive
                  ? 'bg-brand-500/12 text-brand-600 dark:text-brand-300 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[22px] shrink-0 transition-transform duration-200"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {tab.icon}
                </span>
                {tab.live && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-white dark:border-[#1C1C1E] animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                )}
              </div>
              <span
                className={`font-geist text-[9.5px] sm:text-[10.5px] ${
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
