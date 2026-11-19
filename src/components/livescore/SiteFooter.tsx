'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { openCookieSettings } from '@/lib/analytics'
import { useLanguage } from '@/context/LanguageContext'

export default function SiteFooter() {
  const pathname = usePathname()
  const { locale } = useLanguage()
  const isAr = locale === 'ar'
  const isFr = locale === 'fr'

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) return null

  const columns = [
    {
      title: isAr ? 'النتائج' : 'Scores',
      links: [
        { href: '/', label: isAr ? 'النتائج المباشرة' : 'Live scores' },
        { href: '/fixtures', label: isAr ? 'المباريات القادمة' : 'Fixtures' },
        { href: '/results', label: isAr ? 'النتائج' : 'Results' },
        { href: '/favorites', label: isAr ? 'المفضلة' : 'Favorites' },
      ],
    },
    {
      title: isAr ? 'البطولات' : 'Competitions',
      links: [
        { href: '/league/39', label: 'Premier League' },
        { href: '/league/140', label: 'La Liga' },
        { href: '/league/2', label: 'Champions League' },
        { href: '/league/135', label: 'Serie A' },
        { href: '/league/78', label: 'Bundesliga' },
      ],
    },
    {
      title: isAr ? 'الشركة' : 'Company',
      links: [
        { href: '/news', label: isAr ? 'الأخبار' : 'News' },
        { href: '/about', label: isAr ? 'من نحن' : 'About' },
        { href: '/contact', label: isAr ? 'اتصل بنا' : 'Contact' },
      ],
    },
    {
      title: isAr ? 'قانوني' : 'Legal',
      links: [
        { href: '/privacy-policy', label: isAr ? 'سياسة الخصوصية' : 'Privacy' },
        { href: '/cookie-policy', label: isAr ? 'ملفات الارتباط' : 'Cookies' },
        { href: '/terms', label: isAr ? 'الشروط' : 'Terms' },
      ],
    },
  ]

  return (
    <footer className="relative mt-auto px-3 sm:px-5 pb-28 lg:pb-8 pt-16" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-[1440px] mx-auto">
        {/* Oversized wordmark — the stadium sign */}
        <div className="relative overflow-hidden rounded-2xl bg-ink text-white px-6 sm:px-10 pt-10 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <p className="font-geist text-[22px] font-extrabold tracking-[-0.03em] text-white">
                MyScore<span className="text-[#C9FF3D]">24</span>
              </p>
              <p className="text-[13px] leading-relaxed text-white/50 max-w-[280px]">
                {isAr
                  ? 'نتائج مباشرة وإحصائيات وأخبار كرة القدم من أكبر البطولات في العالم.'
                  : isFr
                  ? 'Scores en direct, statistiques et actualités des plus grandes compétitions.'
                  : 'Live scores, stats and stories from the biggest competitions in world football.'}
              </p>
              <a href="mailto:contact@myscore24.com" className="inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-[#C9FF3D] transition-colors">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                contact@myscore24.com
              </a>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-white/45 mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} prefetch={false} className="text-[13.5px] text-white/70 hover:text-white transition-colors inline-block hover:translate-x-0.5 rtl:hover:-translate-x-0.5 duration-200">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  {col.title === (isAr ? 'قانوني' : 'Legal') && (
                    <li>
                      <button onClick={openCookieSettings} className="text-[13.5px] text-white/70 hover:text-white transition-colors inline-block hover:translate-x-0.5 rtl:hover:-translate-x-0.5 duration-200">
                        {isAr ? 'إعدادات الكوكيز' : 'Cookie settings'}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <p
            aria-hidden="true"
            className="select-none pointer-events-none font-geist font-extrabold tracking-[-0.06em] leading-[0.8] text-[22vw] md:text-[180px] text-white/[0.06] mt-10 -mb-12 text-center"
          >
            MYSCORE24
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 px-2 text-[12px] text-ink-3">
          <p>© {new Date().getFullYear()} MyScore24</p>
          <p className="text-center sm:text-end">
            {isAr
              ? 'منصة مستقلة لنتائج كرة القدم. الجهات المنظمة هي المرجع الرسمي.'
              : 'Independent football data platform. Official organisers remain authoritative.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
