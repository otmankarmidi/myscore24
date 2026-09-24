'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { openCookieSettings } from '@/lib/analytics'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Do not render public consumer footer on CMS / admin portal pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
    return null
  }

  return (
    <footer className="w-full bg-surface-container border-t border-surface-bright mt-auto pt-10 pb-24 md:pb-10 px-4 text-on-surface-variant relative z-10">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
        {/* Brand Info */}
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MyScore24 Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="text-lg font-extrabold text-on-surface tracking-tight">
              MyScore<span className="text-primary">24</span>
            </span>
          </div>
          <p className="text-xs text-on-surface-variant/80 leading-relaxed">
            Real-time live football scores, standings, fixtures, results, top scorers, match statistics, and verified football news across global competitions.
          </p>
          <div className="pt-1">
            <a
              href="mailto:contact@myscore24.com"
              className="text-xs text-primary hover:text-primary-container font-mono transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">mail</span>
              <span>contact@myscore24.com</span>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
            {t('nav.scores', 'Scores')}
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Live Scores
              </Link>
            </li>
            <li>
              <Link href="/fixtures" className="hover:text-primary transition-colors">
                Fixtures
              </Link>
            </li>
            <li>
              <Link href="/results" className="hover:text-primary transition-colors">
                Results
              </Link>
            </li>
            <li>
              <Link href="/competitions" className="hover:text-primary transition-colors">
                Competitions
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-primary transition-colors">
                Football News
              </Link>
            </li>
          </ul>
        </div>

        {/* Top Leagues */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
            Top Leagues
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/league/39" className="hover:text-primary transition-colors">
                Premier League
              </Link>
            </li>
            <li>
              <Link href="/league/140" className="hover:text-primary transition-colors">
                La Liga
              </Link>
            </li>
            <li>
              <Link href="/league/2" className="hover:text-primary transition-colors">
                UEFA Champions League
              </Link>
            </li>
            <li>
              <Link href="/league/135" className="hover:text-primary transition-colors">
                Serie A
              </Link>
            </li>
            <li>
              <Link href="/league/78" className="hover:text-primary transition-colors">
                Bundesliga
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
            Company
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">
            Legal
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Use
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openCookieSettings}
                className="hover:text-primary text-left transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>Cookie Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto pt-6 border-t border-surface-bright/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant/70">
        <p>© {new Date().getFullYear()} MyScore24. All rights reserved.</p>
        <p className="text-center sm:text-right">
          Independent football scores & information platform. Official competition organizers remain authoritative for official records.
        </p>
      </div>
    </footer>
  )
}
