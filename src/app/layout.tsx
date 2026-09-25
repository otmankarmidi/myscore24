import type { Metadata } from 'next'
import { Geist, Inter } from 'next/font/google'
import './globals.css'
import { LiveAlertManager } from '@/components/common/LiveAlertManager'
import { TimezoneProvider } from '@/context/TimezoneContext'
import { LanguageProvider } from '@/context/LanguageContext'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import CookieConsentBanner from '@/components/common/CookieConsentBanner'
import Footer from '@/components/common/Footer'

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-geist',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://myscore24.com'),
  title: {
    default: 'Football Live Scores, Results & Fixtures | MyScore24',
    template: '%s',
  },
  description:
    'Fastest real-time live football scores, match statistics, lineups, head-to-head records, league standings, and sports news across major global leagues.',
  keywords: [
    'live scores',
    'football scores',
    'soccer live',
    'premier league',
    'champions league',
    'match statistics',
    'lineups',
    'standings',
  ],
  authors: [{ name: 'MyScore24 Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyScore24',
  },
  alternates: {
    canonical: 'https://myscore24.com',
  },
  openGraph: {
    title: 'Football Live Scores, Results & Fixtures | MyScore24',
    description:
      'Fastest real-time live football scores, match statistics, lineups, head-to-head records, and league standings on MyScore24.',
    url: 'https://myscore24.com',
    siteName: 'MyScore24',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyScore24 Live Football Scores',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football Live Scores, Results & Fixtures | MyScore24',
    description:
      'Fastest real-time live football scores, match statistics, lineups, and league standings.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark scroll-smooth ${geist.variable} ${inter.variable}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/material-symbols.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var l = localStorage.getItem('myscore24_locale');
                if (l === 'ar') {
                  document.documentElement.lang = 'ar';
                  document.documentElement.dir = 'rtl';
                } else if (l === 'fr') {
                  document.documentElement.lang = 'fr';
                  document.documentElement.dir = 'ltr';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface font-inter antialiased flex flex-col">
        <GoogleAnalytics />
        <LanguageProvider>
          <TimezoneProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
            <LiveAlertManager />
            <CookieConsentBanner />
          </TimezoneProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
