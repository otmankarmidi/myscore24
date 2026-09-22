'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="w-full bg-surface-container border-t border-surface-bright mt-auto py-8 px-4 text-on-surface-variant">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Info */}
        <div className="space-y-3">
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
            Real-time live football scores, standings, fixtures, results, top scorers, and match statistics from leagues worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">Navigation</h3>
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

        {/* Popular Competitions */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">Top Leagues</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/league/premier-league" className="hover:text-primary transition-colors">
                Premier League
              </Link>
            </li>
            <li>
              <Link href="/league/la-liga" className="hover:text-primary transition-colors">
                La Liga
              </Link>
            </li>
            <li>
              <Link href="/league/champions-league" className="hover:text-primary transition-colors">
                UEFA Champions League
              </Link>
            </li>
            <li>
              <Link href="/league/serie-a" className="hover:text-primary transition-colors">
                Serie A
              </Link>
            </li>
            <li>
              <Link href="/league/bundesliga" className="hover:text-primary transition-colors">
                Bundesliga
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Info */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface mb-3">Information</h3>
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
            <li>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto pt-6 border-t border-surface-bright/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant/70">
        <p>© {new Date().getFullYear()} MyScore24. All rights reserved.</p>
        <p>Data updated live in real time.</p>
      </div>
    </footer>
  )
}
