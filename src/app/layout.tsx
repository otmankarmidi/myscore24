import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LiveAlertManager } from '@/components/common/LiveAlertManager'
import { TimezoneProvider } from '@/context/TimezoneContext'
import { LanguageProvider } from '@/context/LanguageContext'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import CookieConsentBanner from '@/components/common/CookieConsentBanner'
import Footer from '@/components/common/Footer'
import PwaManager from '@/components/pwa/PwaManager'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c1321' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.myscore24.com'),
  applicationName: 'MyScore24',
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
    statusBarStyle: 'black-translucent',
    title: 'MyScore24',
  },
  alternates: {
    canonical: 'https://www.myscore24.com',
  },
  openGraph: {
    title: 'Football Live Scores, Results & Fixtures | MyScore24',
    description:
      'Fastest real-time live football scores, match statistics, lineups, head-to-head records, and league standings on MyScore24.',
    url: 'https://www.myscore24.com',
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
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="/fonts/material-symbols.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4887048867840632"
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
                var t = localStorage.getItem('myscore24_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
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
            <PwaManager />
          </TimezoneProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
