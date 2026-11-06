'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { openCookieSettings } from '@/lib/analytics'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const pathname = usePathname()
  const { locale, t } = useLanguage()
  const isAr = locale === 'ar'

  // Do not render public consumer footer on CMS / admin portal pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
    return null
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer
      className="w-full bg-[#0B0F19] text-slate-300 mt-auto pt-14 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-slate-800/80 shadow-2xl"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-10">
        {/* Brand Info */}
        <div className="space-y-4 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-mark.png"
              alt="MyScore24 Logo"
              width={34}
              height={34}
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain shrink-0 brightness-0 invert drop-shadow"
            />
            <span className="text-xl font-black font-geist text-white tracking-tight uppercase">
              MyScore<span className="text-purple-400">24</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            {isAr
              ? 'نتائج كرة القدم المباشرة والترتيب وجدول المباريات والإحصائيات والأخبار الموثوقة لجميع البطولات العالمية.'
              : 'Real-time live football scores, standings, fixtures, results, top scorers, match statistics, and verified football news across global competitions.'}
          </p>
          <div className="pt-1">
            <a
              href="mailto:contact@myscore24.com"
              className="text-xs text-slate-400 hover:text-white font-mono transition-colors inline-flex items-center gap-2 hover:underline"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>contact@myscore24.com</span>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-slate-800">
            {t('nav.scores', 'Scores')}
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'النتائج المباشرة' : 'Live Scores'}
              </Link>
            </li>
            <li>
              <Link href="/fixtures" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'جدول المباريات' : 'Fixtures'}
              </Link>
            </li>
            <li>
              <Link href="/results" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'النتائج النهائية' : 'Results'}
              </Link>
            </li>
            <li>
              <Link href="/competitions" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'البطولات' : 'Competitions'}
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'أخبار كرة القدم' : 'Football News'}
              </Link>
            </li>
            <li>
              <Link href="/fantasy" className="hover:text-purple-300 font-semibold hover:underline transition-colors inline-flex items-center gap-1.5">
                <span>{isAr ? 'فانتازي بريميرليغ' : 'Fantasy Football'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 font-bold">NEW</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Top Leagues */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-slate-800">
            {isAr ? 'أبرز الدوريات' : 'Top Leagues'}
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/league/39" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'الدوري الإنجليزي الممتاز' : 'Premier League'}
              </Link>
            </li>
            <li>
              <Link href="/league/140" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'الدوري الإسباني' : 'La Liga'}
              </Link>
            </li>
            <li>
              <Link href="/league/2" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'دوري أبطال أوروبا' : 'UEFA Champions League'}
              </Link>
            </li>
            <li>
              <Link href="/league/135" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'الدوري الإيطالي' : 'Serie A'}
              </Link>
            </li>
            <li>
              <Link href="/league/78" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'الدوري الألماني' : 'Bundesliga'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-slate-800">
            {isAr ? 'عن المنصة' : 'Company'}
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/about" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'من نحن' : 'About Us'}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'اتصل بنا' : 'Contact Us'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-slate-800">
            {isAr ? 'قانوني' : 'Legal'}
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/privacy-policy" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'سياسة ملفات الارتباط' : 'Cookie Policy'}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white hover:underline transition-colors block">
                {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openCookieSettings}
                className="hover:text-white text-left rtl:text-right transition-colors cursor-pointer inline-flex items-center gap-1 hover:underline text-slate-400"
              >
                <span>{isAr ? 'إعدادات ملفات الارتباط' : 'Cookie Settings'}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <button
          type="button"
          onClick={scrollToTop}
          className="group inline-flex items-center gap-1.5 text-slate-300 font-semibold hover:text-white transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span>{isAr ? 'الرجوع إلى البداية' : locale === 'fr' ? 'Haut de page' : 'Back to top'}</span>
        </button>

        <p className="font-geist">© 2026 MyScore24. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
        <p className="text-center sm:text-right rtl:sm:text-left text-slate-500">
          {isAr
            ? 'منصة رياضية مستقلة للنتائج والمعلومات الرياضية.'
            : 'Independent football scores & information platform. Official competition organizers remain authoritative for official records.'}
        </p>
      </div>
    </footer>
  )
}
