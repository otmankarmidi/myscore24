'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useSlidingIndicator } from './useSlidingIndicator'

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

  const { ref, style } = useSlidingIndicator<HTMLDivElement>(pathname)

  return (
    <nav
      className="lg:hidden fixed z-40 inset-x-0 bottom-0 bg-card border-t border-line pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      <div ref={ref} className="relative h-16 max-w-[520px] mx-auto px-2 flex items-center">
      <span className="absolute top-0 left-0 h-[3px] rounded-b-full bg-brand pointer-events-none" style={style} aria-hidden="true" />
      {tabs.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={active}
            aria-current={active ? 'page' : undefined}
            className={`ui-press relative flex-1 h-full flex flex-col items-center justify-center gap-1 touch-manipulation transition-colors ${
              active ? 'text-brand' : 'text-ink-3'
            }`}
          >
            <span className={`relative w-12 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${active ? 'bg-brand-soft' : ''}`}>
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.live && <span className="absolute top-0.5 end-2.5 ui-live-dot !w-1.5 !h-1.5" />}
            </span>
            <span className={`text-[10px] tracking-tight ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
          </Link>
        )
      })}
      </div>
    </nav>
  )
}
