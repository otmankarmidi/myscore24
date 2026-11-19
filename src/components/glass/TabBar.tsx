'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

/** iOS-style floating tab bar for phones. */
export default function TabBar() {
  const pathname = usePathname()
  const { locale } = useLanguage()
  const ar = locale === 'ar'
  const fr = locale === 'fr'

  const tabs = [
    { href: '/', label: ar ? 'النتائج' : 'Scores', icon: 'sports_soccer' },
    { href: '/live', label: ar ? 'مباشر' : fr ? 'Direct' : 'Live', icon: 'live_tv', live: true },
    { href: '/competitions', label: ar ? 'البطولات' : fr ? 'Ligues' : 'Leagues', icon: 'trophy' },
    { href: '/news', label: ar ? 'الأخبار' : fr ? 'Infos' : 'News', icon: 'newspaper' },
    { href: '/favorites', label: ar ? 'المفضلة' : fr ? 'Favoris' : 'Saved', icon: 'star' },
  ]

  return (
    <nav
      className="lg:hidden fixed z-40 left-1/2 -translate-x-1/2 bottom-[max(12px,env(safe-area-inset-bottom))] w-[calc(100%-24px)] max-w-[440px] h-16 px-1.5 rounded-full gl-panel-strong flex items-center"
      aria-label="Mobile navigation"
    >
      {tabs.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`relative flex-1 h-[52px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-all duration-300 touch-manipulation ${
              active ? 'bg-white/[0.1] text-accent-cyan' : 'text-white/55 active:scale-95'
            }`}
          >
            <span className="relative">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.live && <span className="absolute -top-0.5 -end-1 gl-live-dot !w-1.5 !h-1.5" />}
            </span>
            <span className={`text-[10px] tracking-tight ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
